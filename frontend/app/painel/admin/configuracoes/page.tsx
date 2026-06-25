import { AdminPage } from "@/components/admin/AdminPage";
import { ConfigAdmin } from "@/components/configuracoes/config-admin";

export default function AdminConfiguracoesPage() {
  return (
    <AdminPage
      title="Configuracoes"
      description="Ajustes da academia e do painel administrativo."
    >
      <ConfigAdmin />
    </AdminPage>
  );
}
