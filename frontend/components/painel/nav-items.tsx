import type { LucideIcon } from "lucide-react";
import {
  CircleUserRound,
  LayoutGrid,
  Trophy,
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

export function isPainelLinkActive(pathname: string, href: string) {
  return pathname === href;
}