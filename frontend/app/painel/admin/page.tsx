import { AdminDashboardView } from "@/components/admin/AdminDashboardView";
import { AdminPage } from "@/components/admin/AdminPage";

export default function PainelAdminPage() {
  return (
    <AdminPage
      title="Gerenciar academia"
      description="Cadastre quadras, organize horarios e acompanhe os agendamentos."
    >
      <AdminDashboardView />
    </AdminPage>
  );
}
