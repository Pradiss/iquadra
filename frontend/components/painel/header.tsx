"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import {
  AUTH_CHANGE_EVENT,
  clearAuthStorage,
  getSession,
  getToken,
} from "../../lib/auth-storage"
import { getPerfilLabel } from "../../lib/perfis"
import type { AuthSessionSnapshot, Usuario } from "../../types/auth"
import { getPainelSidebarNavItems, isPainelLinkActive } from "./nav-items"

function getInitials(nome?: string) {
  if (!nome) {
    return "IQ"
  }

  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("")
}

function getFirstName(nome?: string) {
  return nome?.trim().split(" ")[0] || "Jogador"
}

export function PainelHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [session, setSession] = useState<AuthSessionSnapshot | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function syncSession() {
      const currentSession = getSession()
      setSession(currentSession)
      setUsuario(currentSession?.usuario ?? null)
    }

    syncSession()
    window.addEventListener("storage", syncSession)
    window.addEventListener(AUTH_CHANGE_EVENT, syncSession)

    return () => {
      window.removeEventListener("storage", syncSession)
      window.removeEventListener(AUTH_CHANGE_EVENT, syncSession)
    }
  }, [])

  useEffect(() => {
    const token = getToken()
    const storedSession = getSession()

    if (!token || !storedSession) {
      clearAuthStorage()
      router.replace("/login")
    }
  }, [router])

  function handleLogout() {
    clearAuthStorage()
    setUsuario(null)
    setMenuOpen(false)
    router.push("/login")
  }

  const items = getPainelSidebarNavItems(session)
  const subtitle = session?.academiaAtual
    ? `${getPerfilLabel(session.perfilAtual)} em ${session.academiaAtual.nome}`
    : getPerfilLabel(session?.perfilAtual)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f4f1e8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-700 shadow-sm lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>

            <Link href="/painel" className="flex items-center">
              <Image
                src="/logo.png"
                alt="IQuadra"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center justify-end gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-zinc-900">
                Ola, {getFirstName(usuario?.nome)}
              </p>
              <p className="text-xs font-semibold text-green-700">{subtitle}</p>
            </div>

            <Avatar usuario={usuario} />
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          />

          <aside className="relative flex h-full w-[82%] max-w-[320px] flex-col bg-[#f4f1e8] shadow-2xl">
            <div className="flex h-14 items-center justify-end border-b border-black/5 px-4">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 hover:bg-black/5"
                aria-label="Fechar menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-black/5 px-5 py-5">
              <div>
                <Image
                  src="/logo.png"
                  alt="IQuadra"
                  width={120}
                  height={32}
                  className="h-9 w-auto"
                />
                <p className="mt-2 text-xs font-semibold text-green-700">{subtitle}</p>
              </div>

              <Avatar usuario={usuario} />
            </div>

            <nav className="flex-1 space-y-2 px-4 py-4">
              {items.map((item) => {
                const Icon = item.icon
                const active = isPainelLinkActive(pathname, item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      "flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-bold transition",
                      active
                        ? "bg-green-100 text-green-700"
                        : "text-zinc-600 hover:bg-white",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        active ? "bg-green-200/60" : "bg-white",
                      ].join(" ")}
                    >
                      <Icon size={18} />
                    </span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-black/5 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-red-50 text-sm font-bold text-red-600"
              >
                Sair da conta
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

function Avatar({ usuario }: { usuario: Usuario | null }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-black text-green-800 ring-2 ring-green-50 sm:h-11 sm:w-11">
      {getInitials(usuario?.nome)}
    </div>
  )
}
