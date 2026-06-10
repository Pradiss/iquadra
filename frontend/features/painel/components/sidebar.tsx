"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AUTH_CHANGE_EVENT, getSession } from "@/shared/lib/auth-storage"
import type { AuthSessionSnapshot } from "@/shared/types/auth"
import { LogoutButton } from "./logout-button"
import { getPainelSidebarNavItems, isPainelLinkActive } from "./nav-items"

export function PainelSidebar() {
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

  const items = getPainelSidebarNavItems(session)

  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-120px)] w-[296px] shrink-0 flex-col border-r border-black/6 bg-[#f6f1e6]/90 pr-3 backdrop-blur-sm lg:flex">
      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {items.map((item) => {
          const active = isPainelLinkActive(pathname, item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition",
                active
                  ? "bg-white text-[#203246]"
                  : "text-[#556377] hover:bg-white/75 hover:text-[#1d2f42]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition",
                  active
                    ? "bg-[#dff2e1] text-[#2e7c49]"
                    : "bg-[#ebe5d9] text-[#536273] group-hover:bg-[#e4f4e7] group-hover:text-[#2e7c49]",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
              </span>

              <span className="truncate text-[15px] font-semibold">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-2 pb-2 pt-4">
        {session?.usuario.nome && (
          <p className="mb-3 px-2 text-xs font-medium text-[#788597]">
            {session.usuario.nome}
          </p>
        )}

        <LogoutButton
          className="w-full rounded-2xl bg-[#62c081] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(98,192,129,0.28)] transition hover:bg-[#54b473]"
        />
      </div>
    </aside>
  )
}
