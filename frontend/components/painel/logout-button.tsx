"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { clearAuthStorage } from "../../lib/auth-storage"

type LogoutButtonProps = {
  className?: string
  collapsed?: boolean
}

export function LogoutButton({
  className,
  collapsed = false,
}: LogoutButtonProps) {
  const router = useRouter()

  function handleLogout() {
    clearAuthStorage()
    router.push("/login")
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ??
        "w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
      }
      aria-label="Sair da conta"
      title="Sair da conta"
    >
      <span className="inline-flex items-center justify-center gap-2">
        <LogOut className="h-4 w-4" />
        {!collapsed && <span>Sair</span>}
      </span>
    </button>
  )
}
