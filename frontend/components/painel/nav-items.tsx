import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CircleUserRound,
  Clock,
  LayoutGrid,
  Settings,
  Trophy,
  Volleyball,
} from "lucide-react";

export type PainelNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const painelJogadorNavItems: PainelNavItem[] = [
  { href: "/painel/jogador", label: "Início", icon: LayoutGrid },
  { href: "/painel/jogador/meus-jogos", label: "Meus jogos", icon: Trophy },
  { href: "/painel/jogador/perfil", label: "Perfil", icon: CircleUserRound },
];

export const painelAdminNavItems: PainelNavItem[] = [
  { href: "/painel/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/painel/admin/quadras", label: "Quadras", icon: Volleyball },
  { href: "/painel/admin/horarios", label: "Horários", icon: Clock },
  { href: "/painel/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/painel/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function isPainelLinkActive(pathname: string, href: string) {
  return pathname === href;
}