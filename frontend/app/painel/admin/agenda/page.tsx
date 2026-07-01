"use client";

import { AdminPage } from "@/components/admin/AdminPage";

import { AddEventDialog } from "@/components/admin/agenda/components/AddEventDialog";
import { AgendaSection } from "@/components/admin/agenda/components/AgendaSection";
import { AgendaToolbar } from "@/components/admin/agenda/components/AgendaToolbar";
import { WeekSelector } from "@/components/admin/agenda/components/WeekSelector";
import { useAdminAgenda } from "@/components/admin/hooks/useAdminAgenda";

export default function AdminAgendaPage() {
  const agenda = useAdminAgenda();

  return (
    <AdminPage
      title="Agenda"
      description="Veja os horários do dia e organize partidas, aulas e eventos."
    >
      <section className="grid gap-6">
        <AgendaToolbar
          academias={agenda.academias}
          academiaSelecionada={agenda.academiaSelecionada}
          quadras={agenda.quadras}
          quadraFiltro={agenda.quadraFiltro}
          tipoFiltro={agenda.tipoFiltro}
          statusFiltro={agenda.statusFiltro}
          onAcademiaChange={agenda.setAcademiaSelecionada}
          onQuadraChange={agenda.setQuadraFiltro}
          onTipoChange={agenda.setTipoFiltro}
          onStatusChange={agenda.setStatusFiltro}
          onAddEvent={() => agenda.abrirNovoEvento()}
        />

        <WeekSelector
          value={agenda.dataSelecionada}
          onChange={agenda.setDataSelecionada}
        />

        {agenda.erro && (
          <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
            {agenda.erro}
          </p>
        )}

        <AgendaSection
          academiaSelecionada={agenda.academiaSelecionada}
          loading={agenda.loading}
          linhasPorQuadra={agenda.linhasPorQuadra}
          actionLoadingId={agenda.actionLoadingId}
          onAction={agenda.executarAcaoLinha}
        />
      </section>

      <AddEventDialog
        open={agenda.dialogOpen}
        form={agenda.form}
        quadras={agenda.quadras}
        saving={agenda.saving}
        error={agenda.formError}
        busca={agenda.buscaUsuario}
        buscaModo={agenda.buscaModo}
        usuarios={agenda.usuariosBusca}
        buscandoUsuarios={agenda.buscandoUsuarios}
        onOpenChange={agenda.setDialogOpen}
        onFormChange={agenda.setForm}
        onSearch={agenda.handleSearch}
        onPickUser={agenda.handlePickUser}
        onRemoveParticipant={agenda.removerParticipante}
        onSubmit={agenda.salvarEvento}
      />
    </AdminPage>
  );
}