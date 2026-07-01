import { AdminPage } from "@/components/admin/AdminPage";
import { ConfigAdmin } from "@/components/painel/admin/config";

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
