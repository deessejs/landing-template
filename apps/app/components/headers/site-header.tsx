"use client"

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { APP_NAME } from "@workspace/ui/lib/config"

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-semibold text-lg">
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-2">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
