<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/banner-ds.jpg">
    <source media="(prefers-color-scheme: light)" srcset="public/banner-ds.jpg">
    <img src="public/banner-ds.jpg" alt="landing-template banner" width="900">
  </picture>
</p>

<h1 align="center">landing-template</h1>

<p align="center">
  <strong>Minimal Next.js 16 monorepo with a public landing page and a closed-beta admin interface.</strong>
  Better Auth · Drizzle · Tailwind v4 · Deploy in minutes.
</p>

<p align="center">
  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/your-org/landing-template" alt="License">
  </a>
  <a href="./.github/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/your-org/landing-template/ci.yml?label=CI" alt="CI">
  </a>
</p>

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-org%2Flanding-template">
    <img src="https://vercel.com/button" alt="Deploy with Vercel">
  </a>
  <a href="https://github.com/codespaces/new?repo=your-org/landing-template">
    <img src="https://github.com/codespaces/badge.svg" alt="Open in GitHub Codespaces">
  </a>
</p>

---

## What's included

| Layer | What you get | Why it matters |
|---|---|---|
| **Apps** | `apps/web` (landing page — the public offering), `apps/app` (authenticated admin) | Two deployable surfaces: one public, one gated. |
| **Auth** | `packages/auth` ( Better Auth + Drizzle adapter, email verification, password reset | Real auth, not a demo. Production gating in `apps/app/proxy.ts`. |
| **API** | `packages/api` ( Hono + oRPC, end-to-end typed routes | Type-safe RPC without GraphQL. |
| **Database** | `packages/database` ( Drizzle ORM, Postgres, in-memory test runner (pg-mem) | Single source of truth for schema; tests run without a DB. |
| **UI** | `packages/ui` ( shadcn/ui + Tailwind v4, centralized design tokens | One component library, every app reuses it. |
| **Tooling** | pnpm 11 workspaces, Turbo v2, strict catalogs, shared ESLint + TS configs | One command rebuilds, lints, types, tests the whole monorepo. |
| **Single-tenant** | No organization plugin, no org schema, no org client | One user = one workspace. Multi-tenant is opt-in. |

## Why this template

- **Modern, but boring where it matters.** Next.js 16, Tailwind v4, React 19, TypeScript 6. Chosen because they're the default for new web projects in 2026.
- **Lockfile-clean pnpm catalogs.** All shared versions live in `pnpm-workspace.yaml` with `catalogMode: strict`. No drift between apps.
- **Real auth flow.** Email verification is enforced in the proxy. No "demo" auth.
- **Real database.** Postgres locally (Docker) or in the cloud. Schema is generated, not hand-written.
- **Two apps, one repo.** Public landing + authenticated admin. Each deployable independently to Vercel.

## Quick start

> [!TIP]
> Don't want to install anything locally? [Open in GitHub Codespaces](https://github.com/codespaces/new?repo=your-org/landing-template). PostgreSQL is pre-configured in the dev container.

### Prerequisites

- Node.js **22.0.0+** (`engines.node: ">=22.0.0"` enforced)
- pnpm **11+** (`corepack enable` if not installed)
- Docker (for local Postgres). Skip if you point `DATABASE_URL` at a remote DB

### Install and run

```bash
# 1. Clone
git clone https://github.com/your-org/landing-template.git
cd landing-template

# 2. Install dependencies
pnpm install

# 3. Copy environment defaults
cp .env.example .env.local

# 4. Generate the auth schema and push it to your database
pnpm auth:generate
pnpm db:push

# 5. Provision the first admin account
pnpm create-admin --email you@example.com --password "your-strong-password"

# 6. Start every app in dev mode
pnpm dev
```

Each app's default port is in its own `README.md` (under `apps/*/`). `apps/app` proxies trust `localhost:3000` and `localhost:3001` by default. See `packages/auth/src/auth.ts`.

> **Sign-up is closed.** There is no public registration flow on this template. Admin accounts are created out-of-band via `pnpm create-admin`. See `scripts/create-admin.mjs`.

## Available commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start every app in dev mode |
| `pnpm build` | Build every workspace |
| `pnpm lint` | Lint every workspace |
| `pnpm typecheck` | Type-check every workspace |
| `pnpm test` | Run unit tests (pg-mem, no DB needed) |
| `pnpm db:generate` | Diff schema → write SQL migration |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:push` | Sync schema directly (dev only. Never in prod) |
| `pnpm db:studio` | Open Drizzle Studio in the browser |
| `pnpm auth:generate` | Regenerate Better Auth schema in `packages/database/src/schema/auth.ts` |
| `pnpm create-admin` | Provision a new admin account (sign-up is closed to the public) |
| `pnpm env:check` | Validate that all required env vars are present |
| `pnpm dedupe:check` | Detect duplicated dependencies |

## Environment variables

| Variable | Required | Where | Purpose |
|---|---|---|---|
| `BETTER_AUTH_URL` | Yes | server | Public URL where auth runs |
| `BETTER_AUTH_SECRET` | Yes | server | Min 32 chars. Generate: `openssl rand -base64 32` |
| `DATABASE_URL` | Yes | server | Postgres connection string |
| `ALLOWED_ORIGINS` | No | server | CSV of trusted origins for CSRF |
| `MAIL_TRANSPORT` | No | server | `console` (default) or `resend` |
| `RESEND_API_KEY` | Prod only | server | Required when `MAIL_TRANSPORT=resend` |
| `RESEND_FROM_EMAIL` | Prod only | server | Verified sender on Resend |
| `NEXT_PUBLIC_APP_NAME` | No | client | Marketing site brand |
| `NEXT_PUBLIC_APP_URL` | No | client | Public URL of `apps/app` |

Copy `.env.example` to `.env.local` to start; defaults work for local Docker Postgres.

## Project structure

```
.
├── apps/
│   ├── web/        # Next.js 16 (landing page, public, no auth)
│   └── app/        # Next.js 16 (admin interface, proxy.ts guard)
├── packages/
│   ├── auth/       # Better Auth setup (single source of truth)
│   ├── database/   # Drizzle ORM + schema (CLI-generated for auth tables)
│   ├── api/        # Hono + oRPC router
│   ├── email/      # React Email templates (Console dev / Resend prod)
│   ├── ui/         # shadcn/ui + Tailwind v4 design system
│   ├── env/        # Zod-validated env (server + client)
│   ├── cookies/    # Cookie consent UI
│   ├── utils/      # General utilities
│   ├── eslint-config/
│   └── typescript-config/
├── pnpm-workspace.yaml  # catalogs (strict)
├── turbo.json           # pipelines
└── .env.example
```

## Deployment

### One-click

Click the **Deploy with Vercel** button at the top. The monorepo is detected automatically; you will need to create two Vercel projects (one per app) and configure env vars per project.

### Per-app mapping

| App | Production URL |
|---|---|
| `apps/web` | `https://yourdomain.com` |
| `apps/app` | `https://app.yourdomain.com` |

## Customization

This template is **single-tenant by design**. The lock-ins are:

- No `organization(...)` plugin in `packages/auth/src/auth.ts`.
- No `databaseHooks.session.create.before` for org auto-create.
- No `organizationClient()` on the client.
- Email verification is enforced in `apps/app/proxy.ts` (unverified users redirect to `/verify-email`).

If you need multi-tenant, start from Better Auth's `organizationPlugin` separately. This template will not graft it in cleanly.

## Architecture notes

- **Proxy, not middleware.** Next.js 16 renamed `middleware.ts` to `proxy.ts`. The auth guard lives at `apps/app/proxy.ts`.
- **Catalogs, not manual pins.** All shared versions are centralized in `pnpm-workspace.yaml` with `catalogMode: strict`.
- **Schema ownership.** `packages/database/src/schema/auth.ts` is owned by the Better Auth CLI. Never hand-edit.
- **Single source of truth for auth config.** Everything lives in `packages/auth/src/auth.ts`; routes and components import from `@workspace/auth`.
- **Closed sign-up.** `emailAndPassword.disableSignUp: true` is the default. Account provisioning happens via `pnpm create-admin` (see `scripts/create-admin.mjs`).

## Contributing

Open an issue to discuss larger changes. For typos, broken links, and small fixes, PRs are welcome.

## License

[MIT](./LICENSE). See the LICENSE file for details.

## Support

- Issues: [github.com/your-org/landing-template/issues](https://github.com/your-org/landing-template/issues)
- Discussions: [github.com/your-org/landing-template/discussions](https://github.com/your-org/landing-template/discussions)
- Email: [you@example.com](mailto:you@example.com)