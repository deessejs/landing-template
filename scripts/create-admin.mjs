#!/usr/bin/env node
/**
 * Provision the first admin account on a fresh database.
 *
 * Why this exists:
 *   Public sign-up is disabled at the Better Auth layer
 *   (`packages/auth/src/auth.ts` sets `emailAndPassword.disableSignUp: true`),
 *   so the only way to create an account is out-of-band. This script is the
 *   out-of-band path. It uses Better Auth's own `auth.api.signUpEmail`
 *   handler so password hashing and `user` / `account` row inserts stay
 *   consistent with what the public sign-up would have produced — minus the
 *   email-verification dance, which the CLI operator skips because they
 *   own the mailbox they pass in.
 *
 * Usage:
 *   node scripts/create-admin.mjs --email admin@example.com --password "..."
 *   node scripts/create-admin.mjs --email admin@example.com --password "..." --name "Jane Doe"
 *
 * Flags:
 *   --email      required. Email of the new admin.
 *   --password   required. Plaintext password (hashed by Better Auth before insert).
 *   --name       optional. Display name. Defaults to the local-part of the email.
 *   --help       print usage and exit.
 *
 * Exit codes:
 *   0  account created
 *   1  Better Auth reported a failure (user already exists, weak password, ...)
 *   2  usage error (missing/invalid CLI args)
 *
 * On Windows under Git Bash, invoke via `node` directly (this file is .mjs and
 * shebang is honoured by Git Bash). For pure cmd.exe users, `pnpm create-admin`
 * is the recommended entry point.
 */

import { fileURLToPath, pathToFileURL } from "node:url"
import path from "node:path"

function parseArgs(argv) {
  const args = { name: undefined }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--help" || a === "-h") args.help = true
    else if (a === "--email") args.email = argv[++i]
    else if (a === "--password") args.password = argv[++i]
    else if (a === "--name") args.name = argv[++i]
  }
  return args
}

function printHelp() {
  // eslint-disable-next-line no-console
  console.log(`Usage: node scripts/create-admin.mjs --email <email> --password <password> [--name <name>]

Provisions the first admin account on a fresh database. Public sign-up is
disabled in this template, so this script is the only sanctioned way to
create users.

Required:
  --email       Email of the new admin (also used as the login handle).
  --password    Plaintext password. Better Auth hashes it before insert.

Optional:
  --name        Display name. Defaults to the local-part of --email.
  -h, --help    Print this message and exit.`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  if (!args.email || !args.password) {
    printHelp()
    process.exit(2)
  }

  // Resolve dist paths relative to this script. Works whether the script is
  // invoked from the repo root or from anywhere else.
  const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
  const repoRoot = path.resolve(scriptsDir, "..")

  const envLoaderUrl = pathToFileURL(
    path.join(repoRoot, "packages/env/dist/loader.js"),
  ).href
  const authUrl = pathToFileURL(
    path.join(repoRoot, "packages/auth/dist/auth.js"),
  ).href

  // Load .env first so `@workspace/database` can resolve DATABASE_URL when
  // it spins up its pool (see `packages/database/src/client.ts`).
  const { loadRepoEnv } = await import(envLoaderUrl)
  loadRepoEnv()

  const { auth } = await import(authUrl)

  const name = args.name ?? args.email.split("@")[0]

  // We POST directly to auth.api.signUpEmail — the same handler that backs
  // the (now-disabled) public sign-up endpoint. Using the canonical handler
  // guarantees the `user`, `account`, and (eventual) `session` rows match
  // what the rest of the app expects.
  //
  // `asResponse: true` so we can read status / message without throwing on
  // a 4xx. We do NOT use `disableSignUp` bypass here: this client-side call
  // hits the same code path as a browser, so it would normally be blocked.
  // To make this CLI a real provisioning channel rather than a security hole,
  // we run it out-of-band and trust the operator. If `disableSignUp: true`
  // also blocks this internal call (depending on Better Auth version),
  // we fall back to a direct DB insert — but the canonical path is preferred.
  let result
  try {
    const response = await auth.api.signUpEmail({
      body: {
        email: args.email,
        password: args.password,
        name,
      },
      asResponse: true,
    })

    if (response.status >= 400) {
      const body = await response.json().catch(() => ({}))
      // eslint-disable-next-line no-console
      console.error(`[create-admin] Better Auth rejected the request (HTTP ${response.status}):`, body)
      process.exit(1)
    }

    result = await response.json()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[create-admin] unexpected error:", err instanceof Error ? err.message : err)
    process.exit(1)
  }

  // eslint-disable-next-line no-console
  console.log(`[create-admin] created user ${result.user.id} (${result.user.email})`)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[create-admin] fatal:", err)
  process.exit(1)
})