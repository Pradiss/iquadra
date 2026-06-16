import { LayoutPainel } from "@/components/painel/layout-painel";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";

export default function PainelAdminPage() {
  return (
    <LayoutPainel>
      <AdminPage
        title="Gerenciar academia"
        description="Cadastre quadras, organize horários e acompanhe os agendamentos."
      >
        <AdminDashboardView />
      </AdminPage>
    </LayoutPainel>
  );
}