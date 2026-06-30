"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  X,
} from "lucide-react";

import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getUsuario } from "@/lib/auth-storage";
import { getAdminAcademias } from "@/lib/user-role";
import {
  buscarDisponibilidadeAdmin,
  buscarUsuariosAdminAgenda,
  cancelarAgendamentoAdmin,
  cancelarAulaAdmin,
  criarAgendamentoAdmin,
  criarAulaAdmin,
  criarEventoAdmin,
  listarQuadrasAdminAgenda,
  removerBloqueioAdmin,
  type DisponibilidadeAdmin,
  type QuadraAgenda,
  type TipoJogoAgenda,
  type UsuarioBusca,
} from "@/services/admin-agenda";
import type { AcademiaBusca } from "@/components/jogador/painel/academia-search-modal";

type TipoLinha = "LIVRE" | "JOGO" | "AULA" | "BLOQUEIO" | "PENDENTE";
type FiltroTipo = "TODOS" | TipoLinha;
type FiltroStatus =
  | "TODOS"
  | "DISPONIVEL"
  | "CONFIRMADO"
  | "PENDENTE"
  | "BLOQUEADO";
type TipoNovoEvento = "PARTIDA" | "AULA" | "EVENTO";
type BuscaUsuarioModo = "PARTICIPANTE" | "PROFESSOR" | "CLIENTE" | null;

type LinhaAgenda = {
  id: string;
  tipo: TipoLinha;
  status: FiltroStatus;
  quadraId: string;
  quadraNome: string;
  modalidade?: string | null;
  inicio: string;
  fim: string;
  titulo: string;
  subtitulo: string;
  etiqueta: string;
  participantes: string[];
  jogoId?: string;
  aulaId?: string;
  bloqueioId?: string;
};

type FormEvento = {
  tipo: TipoNovoEvento;
  quadraId: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipoJogo: TipoJogoAgenda;
  participantes: UsuarioBusca[];
  professor?: UsuarioBusca;
  cliente?: UsuarioBusca;
  observacoes: string;
  motivo: string;
};

const tipoOptions: { value: FiltroTipo; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "LIVRE", label: "Horário livre" },
  { value: "JOGO", label: "Jogo" },
  { value: "AULA", label: "Aula" },
  { value: "BLOQUEIO", label: "Bloqueio/Evento" },
  { value: "PENDENTE", label: "Reserva pendente" },
];

const statusOptions: { value: FiltroStatus; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "CONFIRMADO", label: "Confirmado" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "BLOQUEADO", label: "Bloqueado" },
];

function getHoje() {
  return formatDateOnly(new Date());
}

function formatDateOnly(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseDateOnly(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: string, days: number) {
  const parsed = parseDateOnly(date);
  parsed.setDate(parsed.getDate() + days);
  return formatDateOnly(parsed);
}

function getWeekDays(date: string) {
  const selected = parseDateOnly(date);
  const start = new Date(selected);
  start.setDate(selected.getDate() - selected.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const item = new Date(start);
    item.setDate(start.getDate() + index);
    return formatDateOnly(item);
  });
}

function timeToMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const remaining = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${remaining}`;
}

function formatModalidade(value?: string | null) {
  if (!value) return "";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMonth(date: string) {
  return parseDateOnly(date)
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "")
    .toUpperCase();
}

function formatWeekday(date: string) {
  return parseDateOnly(date)
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "")
    .slice(0, 1)
    .toUpperCase();
}

function getErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return "Não foi possível concluir a ação.";
  }

  const maybeApiError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return (
    maybeApiError.response?.data?.message ||
    maybeApiError.message ||
    "Não foi possível concluir a ação."
  );
}

function montarAcademiasAdmin() {
  const usuario = getUsuario();
  const vinculos = getAdminAcademias(usuario);

  return vinculos
    .map((vinculo, index): AcademiaBusca => {
      const academia = vinculo.academia;

      return {
        id:
          vinculo.academia_id ||
          academia?.id ||
          vinculo.id ||
          `academia-admin-${index}`,
        nome: academia?.nome || `Academia ${index + 1}`,
        cidade: academia?.cidade,
        estado: academia?.estado,
      };
    })
    .filter((academia) => Boolean(academia.id));
}

function normalizarPessoa(participante: unknown) {
  const item = participante as {
    nome?: string;
    usuario?: {
      nome?: string;
    } | null;
  };

  return item.usuario?.nome || item.nome || "Cliente";
}

function montarLinhasDisponibilidade(disponibilidade?: DisponibilidadeAdmin) {
  const linhas: LinhaAgenda[] = [];

  for (const item of disponibilidade?.quadras ?? []) {
    const quadra = item.quadra;
    if (!quadra?.id) continue;

    const modalidade = quadra.modalidade || quadra.tipo_piso || null;

    for (const evento of item.eventos_ocupados ?? []) {
      if (evento.tipo === "JOGO" && evento.jogo) {
        const participantes = (evento.jogo.participantes ?? []).map((p) =>
          normalizarPessoa(p),
        );
        const status = evento.jogo.status === "PENDENTE" ? "PENDENTE" : "CONFIRMADO";

        linhas.push({
          id: `jogo-${evento.id}`,
          tipo: status === "PENDENTE" ? "PENDENTE" : "JOGO",
          status,
          quadraId: quadra.id,
          quadraNome: quadra.nome,
          modalidade,
          inicio: evento.inicio,
          fim: evento.fim,
          titulo: status === "PENDENTE" ? participantes[0] || "Reserva pendente" : "Jogo",
          subtitulo:
            status === "PENDENTE"
              ? "Aguardando confirmação"
              : participantes.length > 0
                ? participantes.join(" x ")
                : "Partida agendada",
          etiqueta: status === "PENDENTE" ? "Reserva pendente" : "Jogo",
          participantes,
          jogoId: evento.jogo.id,
        });
      }

      if (evento.tipo === "AULA" && evento.aula) {
        linhas.push({
          id: `aula-${evento.id}`,
          tipo: "AULA",
          status: "CONFIRMADO",
          quadraId: quadra.id,
          quadraNome: quadra.nome,
          modalidade,
          inicio: evento.inicio,
          fim: evento.fim,
          titulo: evento.aula.observacoes || "Aula particular",
          subtitulo: evento.aula.professor?.nome
            ? `Instrutor: ${evento.aula.professor.nome}`
            : evento.aula.cliente?.nome
              ? `Cliente: ${evento.aula.cliente.nome}`
              : "Aula confirmada",
          etiqueta: "Aula",
          participantes: [
            evento.aula.cliente?.nome,
            evento.aula.professor?.nome,
          ].filter(Boolean) as string[],
          aulaId: evento.aula.id,
        });
      }

      if (evento.tipo === "BLOQUEIO" && evento.bloqueio) {
        linhas.push({
          id: `bloqueio-${evento.id}`,
          tipo: "BLOQUEIO",
          status: "BLOQUEADO",
          quadraId: quadra.id,
          quadraNome: quadra.nome,
          modalidade,
          inicio: evento.inicio,
          fim: evento.fim,
          titulo: evento.bloqueio.motivo || "Bloqueado",
          subtitulo: "Horário indisponível",
          etiqueta:
            evento.bloqueio.tipo_bloqueio === "EVENTO"
              ? "Evento"
              : "Bloqueio",
          participantes: [],
          bloqueioId: evento.bloqueio.id,
        });
      }
    }

    for (const slot of item.slots ?? []) {
      if (!slot.disponivel || slot.motivo || slot.jogo) continue;

      linhas.push({
        id: `livre-${quadra.id}-${slot.inicio}-${slot.fim}`,
        tipo: "LIVRE",
        status: "DISPONIVEL",
        quadraId: quadra.id,
        quadraNome: quadra.nome,
        modalidade,
        inicio: slot.inicio,
        fim: slot.fim,
        titulo: "Horário livre",
        subtitulo: "Disponível para reserva",
        etiqueta: "Livre",
        participantes: [],
      });
    }
  }

  return linhas.sort((a, b) => {
    const porHora = timeToMinutes(a.inicio) - timeToMinutes(b.inicio);
    return porHora !== 0 ? porHora : a.quadraNome.localeCompare(b.quadraNome);
  });
}

function getLinhaClasses(tipo: TipoLinha) {
  if (tipo === "JOGO") return "bg-blue-100 text-blue-950";
  if (tipo === "AULA") return "bg-green-100 text-green-950";
  if (tipo === "BLOQUEIO") return "bg-red-100 text-red-950";
  if (tipo === "PENDENTE") return "bg-yellow-100 text-yellow-950";
  return "bg-zinc-200 text-zinc-950";
}

function getEtiquetaClasses(tipo: TipoLinha) {
  if (tipo === "JOGO") return "bg-blue-200 text-blue-800";
  if (tipo === "AULA") return "bg-green-200 text-green-800";
  if (tipo === "BLOQUEIO") return "bg-red-200 text-red-800";
  if (tipo === "PENDENTE") return "bg-yellow-200 text-yellow-800";
  return "bg-white/70 text-zinc-700";
}

function createInitialForm(data: string, quadraId = ""): FormEvento {
  return {
    tipo: "PARTIDA",
    quadraId,
    data,
    horaInicio: "08:00",
    horaFim: "09:00",
    tipoJogo: "SIMPLES",
    participantes: [],
    observacoes: "",
    motivo: "Evento",
  };
}

function setFormEndByDuration(form: FormEvento, duration: number) {
  return {
    ...form,
    horaFim: minutesToTime(timeToMinutes(form.horaInicio) + duration),
  };
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm">
      <span className="text-xs font-semibold text-zinc-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-36 bg-transparent text-sm font-black text-zinc-950 outline-none"
      >
        {children}
      </select>
    </label>
  );
}

function WeekSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  const days = getWeekDays(value);

  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm font-black text-zinc-950">
        <span>{formatMonth(value)}</span>
        <button
          type="button"
          onClick={() => onChange(addDays(value, -7))}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="grid min-w-0 flex-1 grid-cols-7 gap-2">
        {days.map((day) => {
          const selected = day === value;
          const parsed = parseDateOnly(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => onChange(day)}
              className={[
                "grid h-12 place-items-center rounded-xl text-xs font-black transition",
                selected
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-500 hover:bg-white/70",
              ].join(" ")}
            >
              <span>{formatWeekday(day)}</span>
              <span>{String(parsed.getDate()).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange(addDays(value, 7))}
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function EventActions({
  linha,
  loading,
  onAction,
}: {
  linha: LinhaAgenda;
  loading: boolean;
  onAction: (linha: LinhaAgenda) => void;
}) {
  if (linha.tipo === "LIVRE") {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => onAction(linha)}
        className="h-10 w-10 rounded-full bg-white/80"
      >
        <Plus className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={loading}
          className="h-9 w-9 rounded-full"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onAction(linha)}
        >
          {linha.tipo === "BLOQUEIO" ? "Remover evento" : "Cancelar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AgendaRow({
  linha,
  loading,
  onAction,
}: {
  linha: LinhaAgenda;
  loading: boolean;
  onAction: (linha: LinhaAgenda) => void;
}) {
  return (
    <div
      className={[
        "grid min-h-16 grid-cols-[76px_1fr_auto] items-center overflow-hidden rounded-xl",
        getLinhaClasses(linha.tipo),
      ].join(" ")}
    >
      <div className="flex h-full flex-col justify-center bg-black/5 px-3">
        <span className="text-sm font-black">{linha.inicio}</span>
        <span className="text-xs font-semibold opacity-70">até {linha.fim}</span>
      </div>

      <div className="grid gap-1 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {linha.tipo !== "LIVRE" && (
            <span
              className={[
                "rounded-md px-2 py-1 text-xs font-black",
                getEtiquetaClasses(linha.tipo),
              ].join(" ")}
            >
              {linha.etiqueta}
            </span>
          )}

          <span className="text-sm font-black">{linha.titulo}</span>

          {linha.participantes.length >= 2 && (
            <span className="text-sm font-black">X</span>
          )}
        </div>

        <p className="text-xs font-semibold opacity-75">{linha.subtitulo}</p>
      </div>

      <div className="px-3">
        <EventActions linha={linha} loading={loading} onAction={onAction} />
      </div>
    </div>
  );
}

function UserSearch({
  value,
  results,
  loading,
  onChange,
  onPick,
  onClear,
  placeholder,
}: {
  value: string;
  results: UsuarioBusca[];
  loading: boolean;
  onChange: (value: string) => void;
  onPick: (usuario: UsuarioBusca) => void;
  onClear: () => void;
  placeholder: string;
}) {
  return (
    <div className="grid gap-2">
      <div className="relative">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 pr-9"
        />
        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        )}
      </div>

      {value.trim().length >= 2 && (
        <div className="max-h-36 overflow-y-auto rounded-lg border bg-white p-1">
          {loading ? (
            <p className="px-2 py-2 text-sm text-zinc-500">Buscando...</p>
          ) : results.length === 0 ? (
            <p className="px-2 py-2 text-sm text-zinc-500">
              Nenhum usuário encontrado.
            </p>
          ) : (
            results.map((usuario) => (
              <button
                key={usuario.id}
                type="button"
                onClick={() => onPick(usuario)}
                className="block w-full rounded-md px-2 py-2 text-left text-sm font-semibold hover:bg-zinc-50"
              >
                {usuario.nome}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AddEventDialog({
  open,
  form,
  quadras,
  saving,
  error,
  busca,
  buscaModo,
  usuarios,
  buscandoUsuarios,
  onOpenChange,
  onFormChange,
  onSearch,
  onPickUser,
  onRemoveParticipant,
  onSubmit,
}: {
  open: boolean;
  form: FormEvento;
  quadras: QuadraAgenda[];
  saving: boolean;
  error: string;
  busca: string;
  buscaModo: BuscaUsuarioModo;
  usuarios: UsuarioBusca[];
  buscandoUsuarios: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: FormEvento) => void;
  onSearch: (modo: BuscaUsuarioModo, value: string) => void;
  onPickUser: (usuario: UsuarioBusca) => void;
  onRemoveParticipant: (usuarioId: string) => void;
  onSubmit: () => void;
}) {
  const maxParticipantes = form.tipoJogo === "SIMPLES" ? 1 : 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Adicionar evento</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["PARTIDA", "Partida"],
              ["AULA", "Aula"],
              ["EVENTO", "Evento"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  onFormChange({ ...form, tipo: value as TipoNovoEvento })
                }
                className={[
                  "h-10 rounded-lg border text-sm font-black",
                  form.tipo === value
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-700",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-bold">
              Quadra
              <select
                value={form.quadraId}
                onChange={(event) =>
                  onFormChange({ ...form, quadraId: event.target.value })
                }
                className="h-10 rounded-lg border border-zinc-200 bg-white px-3"
              >
                {quadras.map((quadra) => (
                  <option key={quadra.id} value={quadra.id}>
                    {quadra.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-bold">
              Data
              <Input
                type="date"
                value={form.data}
                onChange={(event) =>
                  onFormChange({ ...form, data: event.target.value })
                }
              />
            </label>

            <label className="grid gap-1.5 text-sm font-bold">
              Início
              <Input
                type="time"
                value={form.horaInicio}
                onChange={(event) =>
                  onFormChange({ ...form, horaInicio: event.target.value })
                }
              />
            </label>

            <label className="grid gap-1.5 text-sm font-bold">
              Fim
              <Input
                type="time"
                value={form.horaFim}
                onChange={(event) =>
                  onFormChange({ ...form, horaFim: event.target.value })
                }
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[60, 90, 120].map((duration) => (
              <Button
                key={duration}
                type="button"
                variant="outline"
                onClick={() => onFormChange(setFormEndByDuration(form, duration))}
              >
                {duration} min
              </Button>
            ))}
          </div>

          {form.tipo === "PARTIDA" && (
            <div className="grid gap-3">
              <label className="grid gap-1.5 text-sm font-bold">
                Tipo de jogo
                <select
                  value={form.tipoJogo}
                  onChange={(event) =>
                    onFormChange({
                      ...form,
                      tipoJogo: event.target.value as TipoJogoAgenda,
                      participantes: form.participantes.slice(
                        0,
                        event.target.value === "SIMPLES" ? 1 : 3,
                      ),
                    })
                  }
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-3"
                >
                  <option value="SIMPLES">Simples</option>
                  <option value="DUPLA">Dupla</option>
                </select>
              </label>

              <div className="grid gap-2">
                <p className="text-sm font-bold">
                  Participantes opcionais ({form.participantes.length}/
                  {maxParticipantes})
                </p>
                <UserSearch
                  value={buscaModo === "PARTICIPANTE" ? busca : ""}
                  results={usuarios}
                  loading={buscandoUsuarios}
                  placeholder="Buscar cliente"
                  onChange={(value) => onSearch("PARTICIPANTE", value)}
                  onClear={() => onSearch(null, "")}
                  onPick={onPickUser}
                />
                <div className="flex flex-wrap gap-2">
                  {form.participantes.map((participante) => (
                    <span
                      key={participante.id}
                      className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-black"
                    >
                      {participante.nome}
                      <button
                        type="button"
                        onClick={() => onRemoveParticipant(participante.id)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {form.tipo === "AULA" && (
            <div className="grid gap-3">
              <div className="grid gap-2">
                <p className="text-sm font-bold">Professor</p>
                <UserSearch
                  value={buscaModo === "PROFESSOR" ? busca : ""}
                  results={usuarios}
                  loading={buscandoUsuarios}
                  placeholder={form.professor?.nome || "Buscar professor"}
                  onChange={(value) => onSearch("PROFESSOR", value)}
                  onClear={() => onSearch(null, "")}
                  onPick={onPickUser}
                />
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-bold">Cliente</p>
                <UserSearch
                  value={buscaModo === "CLIENTE" ? busca : ""}
                  results={usuarios}
                  loading={buscandoUsuarios}
                  placeholder={form.cliente?.nome || "Buscar cliente"}
                  onChange={(value) => onSearch("CLIENTE", value)}
                  onClear={() => onSearch(null, "")}
                  onPick={onPickUser}
                />
              </div>

              <label className="grid gap-1.5 text-sm font-bold">
                Observação
                <Textarea
                  value={form.observacoes}
                  onChange={(event) =>
                    onFormChange({ ...form, observacoes: event.target.value })
                  }
                  placeholder="Aula particular"
                />
              </label>
            </div>
          )}

          {form.tipo === "EVENTO" && (
            <label className="grid gap-1.5 text-sm font-bold">
              Motivo do evento
              <Textarea
                value={form.motivo}
                onChange={(event) =>
                  onFormChange({ ...form, motivo: event.target.value })
                }
                placeholder="Evento"
              />
            </label>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={onSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminAgendaPage() {
  const [dataSelecionada, setDataSelecionada] = useState(getHoje);
  const [academias, setAcademias] = useState<AcademiaBusca[]>([]);
  const [academiaSelecionada, setAcademiaSelecionada] =
    useState<AcademiaBusca | null>(null);
  const [quadras, setQuadras] = useState<QuadraAgenda[]>([]);
  const [quadraFiltro, setQuadraFiltro] = useState("TODAS");
  const [tipoFiltro, setTipoFiltro] = useState<FiltroTipo>("TODOS");
  const [statusFiltro, setStatusFiltro] = useState<FiltroStatus>("TODOS");
  const [disponibilidade, setDisponibilidade] =
    useState<DisponibilidadeAdmin>();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<FormEvento>(() =>
    createInitialForm(getHoje()),
  );
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [buscaModo, setBuscaModo] = useState<BuscaUsuarioModo>(null);
  const [usuariosBusca, setUsuariosBusca] = useState<UsuarioBusca[]>([]);
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);

  const linhas = useMemo(
    () => montarLinhasDisponibilidade(disponibilidade),
    [disponibilidade],
  );

  const linhasFiltradas = useMemo(() => {
    return linhas.filter((linha) => {
      const passaQuadra =
        quadraFiltro === "TODAS" || linha.quadraId === quadraFiltro;
      const passaTipo = tipoFiltro === "TODOS" || linha.tipo === tipoFiltro;
      const passaStatus =
        statusFiltro === "TODOS" || linha.status === statusFiltro;

      return passaQuadra && passaTipo && passaStatus;
    });
  }, [linhas, quadraFiltro, statusFiltro, tipoFiltro]);

  const quadraAtual = useMemo(() => {
    if (quadraFiltro === "TODAS") return null;
    return quadras.find((quadra) => quadra.id === quadraFiltro) ?? null;
  }, [quadraFiltro, quadras]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const academiasAdmin = montarAcademiasAdmin();
      setAcademias(academiasAdmin);
      setAcademiaSelecionada(academiasAdmin[0] ?? null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let active = true;
    const termo = buscaUsuario.trim();

    const timeoutId = window.setTimeout(() => {
      if (!dialogOpen || !buscaModo || termo.length < 2) {
        setUsuariosBusca([]);
        setBuscandoUsuarios(false);
        return;
      }

      setBuscandoUsuarios(true);

      buscarUsuariosAdminAgenda(termo)
        .then((usuarios) => {
          if (active) setUsuariosBusca(usuarios);
        })
        .catch(() => {
          if (active) setUsuariosBusca([]);
        })
        .finally(() => {
          if (active) setBuscandoUsuarios(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [buscaModo, buscaUsuario, dialogOpen]);

  async function carregarAgenda() {
    if (!academiaSelecionada?.id) {
      setLoading(false);
      setQuadras([]);
      setDisponibilidade(undefined);
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const [quadrasData, disponibilidadeData] = await Promise.all([
        listarQuadrasAdminAgenda(academiaSelecionada.id),
        buscarDisponibilidadeAdmin({
          academiaId: academiaSelecionada.id,
          data: dataSelecionada,
        }),
      ]);

      setQuadras(quadrasData);
      setDisponibilidade(disponibilidadeData);

      if (
        quadraFiltro !== "TODAS" &&
        !quadrasData.some((quadra) => quadra.id === quadraFiltro)
      ) {
        setQuadraFiltro("TODAS");
      }
    } catch (error) {
      setErro(getErrorMessage(error));
      setQuadras([]);
      setDisponibilidade(undefined);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarAgenda();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academiaSelecionada?.id, dataSelecionada]);

  function abrirNovoEvento(linha?: LinhaAgenda) {
    const quadraId = linha?.quadraId || quadraAtual?.id || quadras[0]?.id || "";
    const inicio = linha?.inicio || "08:00";
    const fim = linha?.fim || minutesToTime(timeToMinutes(inicio) + 60);

    setForm({
      ...createInitialForm(dataSelecionada, quadraId),
      horaInicio: inicio,
      horaFim: fim,
    });
    setFormError("");
    setBuscaModo(null);
    setBuscaUsuario("");
    setUsuariosBusca([]);
    setDialogOpen(true);
  }

  function handleSearch(modo: BuscaUsuarioModo, value: string) {
    setBuscaModo(modo);
    setBuscaUsuario(value);
  }

  function handlePickUser(usuario: UsuarioBusca) {
    if (buscaModo === "PARTICIPANTE") {
      const max = form.tipoJogo === "SIMPLES" ? 1 : 3;

      if (!form.participantes.some((item) => item.id === usuario.id)) {
        setForm({
          ...form,
          participantes: [...form.participantes, usuario].slice(0, max),
        });
      }
    }

    if (buscaModo === "PROFESSOR") {
      setForm({ ...form, professor: usuario });
    }

    if (buscaModo === "CLIENTE") {
      setForm({ ...form, cliente: usuario });
    }

    setBuscaModo(null);
    setBuscaUsuario("");
    setUsuariosBusca([]);
  }

  function removerParticipante(usuarioId: string) {
    setForm({
      ...form,
      participantes: form.participantes.filter(
        (participante) => participante.id !== usuarioId,
      ),
    });
  }

  async function salvarEvento() {
    if (!academiaSelecionada?.id || !form.quadraId) {
      setFormError("Selecione uma academia e uma quadra.");
      return;
    }

    if (!form.data || !form.horaInicio || !form.horaFim) {
      setFormError("Informe data, início e fim.");
      return;
    }

    if (timeToMinutes(form.horaFim) <= timeToMinutes(form.horaInicio)) {
      setFormError("O horário final deve ser maior que o inicial.");
      return;
    }

    if (form.tipo === "EVENTO" && !form.motivo.trim()) {
      setFormError("Informe o motivo do evento.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (form.tipo === "PARTIDA") {
        await criarAgendamentoAdmin({
          academia_id: academiaSelecionada.id,
          quadra_id: form.quadraId,
          data: form.data,
          hora_inicio: form.horaInicio,
          hora_fim: form.horaFim,
          tipo_jogo: form.tipoJogo,
          participantes: form.participantes.map((participante) => ({
            usuario_id: participante.id,
            nome: participante.nome,
          })),
        });
      }

      if (form.tipo === "AULA") {
        await criarAulaAdmin({
          academia_id: academiaSelecionada.id,
          quadra_id: form.quadraId,
          data: form.data,
          hora_inicio: form.horaInicio,
          hora_fim: form.horaFim,
          professor_id: form.professor?.id,
          cliente_id: form.cliente?.id,
          observacoes: form.observacoes.trim() || undefined,
        });
      }

      if (form.tipo === "EVENTO") {
        await criarEventoAdmin({
          quadra_id: form.quadraId,
          data: form.data,
          hora_inicio: form.horaInicio,
          hora_fim: form.horaFim,
          motivo: form.motivo.trim(),
          tipo_bloqueio: "EVENTO",
        });
      }

      setDialogOpen(false);
      await carregarAgenda();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function executarAcaoLinha(linha: LinhaAgenda) {
    if (linha.tipo === "LIVRE") {
      abrirNovoEvento(linha);
      return;
    }

    const confirmed = window.confirm(
      linha.tipo === "BLOQUEIO"
        ? "Remover este evento?"
        : "Cancelar este agendamento?",
    );

    if (!confirmed) return;

    setActionLoadingId(linha.id);
    setErro("");

    try {
      if (linha.jogoId) await cancelarAgendamentoAdmin(linha.jogoId);
      if (linha.aulaId) await cancelarAulaAdmin(linha.aulaId);
      if (linha.bloqueioId) await removerBloqueioAdmin(linha.bloqueioId);

      await carregarAgenda();
    } catch (error) {
      setErro(getErrorMessage(error));
    } finally {
      setActionLoadingId("");
    }
  }

  const linhasPorQuadra = useMemo(() => {
    const grouped = new Map<string, LinhaAgenda[]>();

    for (const linha of linhasFiltradas) {
      const key = linha.quadraId;
      grouped.set(key, [...(grouped.get(key) ?? []), linha]);
    }

    return Array.from(grouped.entries()).map(([quadraId, items]) => ({
      quadra:
        quadras.find((quadra) => quadra.id === quadraId) ??
        ({
          id: quadraId,
          nome: items[0]?.quadraNome ?? "Quadra",
          tipo_piso: items[0]?.modalidade,
        } as QuadraAgenda),
      items,
    }));
  }, [linhasFiltradas, quadras]);

  return (
    <AdminPage
      title="Agenda"
      description="Veja os horários do dia e organize partidas, aulas e eventos."
    >
      <section className="grid gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {academias.length > 1 && (
              <FilterSelect
                label="Academia"
                value={academiaSelecionada?.id ?? ""}
                onChange={(id) =>
                  setAcademiaSelecionada(
                    academias.find((academia) => academia.id === id) ?? null,
                  )
                }
              >
                {academias.map((academia) => (
                  <option key={academia.id} value={academia.id}>
                    {academia.nome}
                  </option>
                ))}
              </FilterSelect>
            )}

            <FilterSelect
              label="Quadra"
              value={quadraFiltro}
              onChange={setQuadraFiltro}
            >
              <option value="TODAS">Todas as quadras</option>
              {quadras.map((quadra) => (
                <option key={quadra.id} value={quadra.id}>
                  {quadra.nome}
                  {quadra.tipo_piso ? ` - ${formatModalidade(quadra.tipo_piso)}` : ""}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Tipo de evento"
              value={tipoFiltro}
              onChange={(value) => setTipoFiltro(value as FiltroTipo)}
            >
              {tipoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Status"
              value={statusFiltro}
              onChange={(value) => setStatusFiltro(value as FiltroStatus)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </div>

          <Button
            type="button"
            onClick={() => abrirNovoEvento()}
            disabled={quadras.length === 0}
            className="h-12 shrink-0 gap-2 rounded-lg bg-slate-950 px-6 text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Adicionar evento
          </Button>
        </div>

        <WeekSelector value={dataSelecionada} onChange={setDataSelecionada} />

        {erro && (
          <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
            {erro}
          </p>
        )}

        {!academiaSelecionada ? (
          <p className="rounded-xl bg-white p-4 text-sm font-semibold text-zinc-600">
            Nenhuma academia admin encontrada para este usuário.
          </p>
        ) : loading ? (
          <div className="flex items-center gap-2 rounded-xl bg-white p-4 text-sm font-semibold text-zinc-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando agenda...
          </div>
        ) : linhasPorQuadra.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm font-semibold text-zinc-600">
            Nenhum evento encontrado para os filtros selecionados.
          </p>
        ) : (
          <div className="grid gap-6">
            {linhasPorQuadra.map(({ quadra, items }) => (
              <section key={quadra.id} className="grid gap-3">
                <div>
                  <h2 className="text-xl font-black text-zinc-950">
                    {quadra.nome}
                  </h2>
                  <p className="text-sm font-semibold text-zinc-500">
                    {formatModalidade(quadra.tipo_piso || quadra.modalidade)}
                  </p>
                </div>

                <div className="grid gap-2">
                  {items.map((linha) => (
                    <AgendaRow
                      key={linha.id}
                      linha={linha}
                      loading={actionLoadingId === linha.id}
                      onAction={executarAcaoLinha}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <AddEventDialog
        open={dialogOpen}
        form={form}
        quadras={quadras}
        saving={saving}
        error={formError}
        busca={buscaUsuario}
        buscaModo={buscaModo}
        usuarios={usuariosBusca}
        buscandoUsuarios={buscandoUsuarios}
        onOpenChange={setDialogOpen}
        onFormChange={setForm}
        onSearch={handleSearch}
        onPickUser={handlePickUser}
        onRemoveParticipant={removerParticipante}
        onSubmit={salvarEvento}
      />
    </AdminPage>
  );
}
