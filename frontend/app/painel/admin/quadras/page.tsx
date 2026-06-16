import { LayoutPainel } from "@/components/painel/layout-painel";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminQuadrasForm } from "@/components/admin/AdminQuadrasForm";

export default function AdminQuadrasPage() {
  return (
    <LayoutPainel>
      <AdminPage
        title="Quadras"
        description="Cadastre quadras e controle quais aparecem para agendamento."
      >
        <AdminQuadrasForm />
      </AdminPage>
    </LayoutPainel>
  );
}