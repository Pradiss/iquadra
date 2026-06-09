import type { LucideIcon } from "lucide-react"
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleUserRound,
  LayoutGrid,
  Search,
  Trophy,
} from "lucide-react"
import type { AuthSessionSnapshot } from "../../types/auth"
import { getUserExperience } from "../../lib/perfis"

export type PainelNavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export function getPainelSidebarNavItems(
  session?: AuthSessionSnapshot | null
): PainelNavItem[] {
  const experience = getUserExperience(session?.perfilAtual)

  if (experience === "COMPANY_ADMIN") {
    return [
      { href: "/painel", label: "Inicio", icon: LayoutGrid },
      { href: "/painel/admin", label: "Admin", icon: BriefcaseBusiness },
      { href: "/painel/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/painel/buscar", label: "Academias", icon: Search },
      { href: "/painel/perfil", label: "Perfil", icon: CircleUserRound },
    ]
  }

  if (experience === "PROFESSOR") {
    return [
      { href: "/painel", label: "Inicio", icon: LayoutGrid },
      { href: "/painel/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/painel/buscar", label: "Academias", icon: Search },
      { href: "/painel/perfil", label: "Perfil", icon: CircleUserRound },
    ]
  }

  return [
    { href: "/painel", label: "Inicio", icon: LayoutGrid },
    { href: "/painel/buscar", label: "Buscar", icon: Search },
    { href: "/painel/agenda", label: "Agenda", icon: CalendarDays },
    { href: "/painel/meus-jogos", label: "Reservas", icon: Trophy },
    { href: "/painel/perfil", label: "Perfil", icon: CircleUserRound },
  ]
}

export function getPainelBottomNavItems(
  session?: AuthSessionSnapshot | null
): PainelNavItem[] {
  const experience = getUserExperience(session?.perfilAtual)

  if (experience === "COMPANY_ADMIN") {
    return [
      { href: "/painel", label: "Inicio", icon: LayoutGrid },
      { href: "/painel/admin", label: "Admin", icon: BriefcaseBusiness },
      { href: "/painel/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/painel/perfil", label: "Perfil", icon: CircleUserRound },
    ]
  }

  if (experience === "PROFESSOR") {
    return [
      { href: "/painel", label: "Inicio", icon: LayoutGrid },
      { href: "/painel/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/painel/buscar", label: "Academias", icon: Search },
      { href: "/painel/perfil", label: "Perfil", icon: CircleUserRound },
    ]
  }

  return [
    { href: "/painel", label: "Inicio", icon: LayoutGrid },
    { href: "/painel/buscar", label: "Buscar", icon: Search },
    { href: "/painel/meus-jogos", label: "Reservas", icon: Trophy },
    { href: "/painel/perfil", label: "Perfil", icon: CircleUserRound },
  ]
}

export function isPainelLinkActive(pathname: string, href: string) {
  if (href === "/painel") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
