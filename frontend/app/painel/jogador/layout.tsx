import type { ReactNode } from "react";

import { PainelRoleGuard } from "@/components/painel/guards/PainelRoleGuard";

export default function JogadorLayout({ children }: { children: ReactNode }) {
  return <PainelRoleGuard expectedRole="jogador">{children}</PainelRoleGuard>;
}
