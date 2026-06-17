import { AdminPage } from "@/components/admin/AdminPage";
import { AdminHorariosForm } from "@/components/admin/AdminHorariosForm";

export default function AdminHorariosPage() {
  return (
    <AdminPage
      title="Horarios"
      description="Configure os horarios fixos das quadras em slots de 90 minutos."
    >
      <AdminHorariosForm />
    </AdminPage>
  );
}
