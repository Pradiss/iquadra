"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AUTH_CHANGE_EVENT, getSession } from "../../lib/auth-storage"
import type { AuthSessionSnapshot } from "../../types/auth"
import { getPainelBottomNavItems, isPainelLinkActive } from "./nav-items"

export function PainelBottomNav() {
  const pathname = usePathname()
  const [session, setSession] = useState<AuthSessionSnapshot | null>(null)

  useEffect(() => {
    function syncSession() {
      setSession(getSession())
    }

    syncSession()
    window.addEventListener("storage", syncSession)
    window.addEventListener(AUTH_CHANGE_EVENT, syncSession)

    return () => {
      window.removeEventListener("storage", syncSession)
      window.removeEventListener(AUTH_CHANGE_EVENT, syncSession)
    }
  }, [])

  const items = getPainelBottomNavItems(session)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/96 px-2 py-2 shadow-[0_-12px_40px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div
        className="mx-auto grid max-w-3xl gap-1"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item) => {
          const active = isPainelLinkActive(pathname, item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-center text-[10px] font-black uppercase tracking-[0.14em] transition",
                active
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-500 hover:bg-green-50 hover:text-green-700",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
