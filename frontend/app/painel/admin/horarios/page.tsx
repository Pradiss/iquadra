import { LayoutPainel } from "@/components/painel/layout-painel";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminHorariosForm } from "@/components/admin/AdminHorariosForm";

export default function AdminHorariosPage() {
  return (
    <LayoutPainel>
      <AdminPage
        title="Horários"
        description="Configure os horários fixos das quadras em slots de 90 minutos."
      >
        <AdminHorariosForm />
      </AdminPage>
    </LayoutPainel>
  );
}