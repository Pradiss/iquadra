import type { ReactNode } from "react";

import { PainelRoleGuard } from "@/components/painel/guards/PainelRoleGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <PainelRoleGuard expectedRole="admin">{children}</PainelRoleGuard>;
}
