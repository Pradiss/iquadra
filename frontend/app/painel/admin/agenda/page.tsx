import { LayoutPainel } from "@/components/painel/layout-painel";
import { AdminPage } from "@/components/admin/AdminPage";

export default function AdminAgendaPage() {
  return (
    <LayoutPainel>
      <AdminPage
        title="Agenda"
        description="Veja os horários do dia e faça agendamentos manuais."
      >
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          Agenda em construção.
        </div>
      </AdminPage>
    </LayoutPainel>
  );
}