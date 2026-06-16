"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { getUsuario } from "@/lib/auth-storage";
import { buscarUltimaAcademia, salvarUltimaAcademia } from "@/lib/last-academia";
import { maskCep, maskPhone, onlyNumbers } from "@/lib/masks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  atualizarAcademiaAdmin,
  atualizarStatusQuadra,
  bloquearHorario,
  buscarAcademiaAdmin,
  buscarAgendaAdmin,
  buscarDashboardAdmin,
  cancelarReservaAdmin,
  criarQuadra,
  criarReservaAdmin,
  gerarHorarios,
  listarBloqueiosQuadra,
  listarHorariosQuadra,
  listarQuadras,
  listarReservasAdmin,
  obterDisponibilidadeQuadraAdmin,
  removerBloqueio,
  type AcademiaAdmin,
  type AgendaAdmin,
  type BloqueioAdmin,
  type DashboardAdmin,
  type DisponibilidadeQuadraAdmin,
  type HorarioQuadraAdmin,
  type QuadraAdmin,
  type ReservaAdmin,
  type TipoPiso,
} from "@/services/admin.service";

type Feedback = {
  type: "success" | "error";
  message: string;
};

type AcademiaPainel = {
  id: string;
  nome?: string;
};

type UsuarioAcademia = {
  academia_id?: string;
  status?: string;
  academia?: {
    id?: string;
    nome?: string;
  };
};

type UsuarioAdmin = {
  academias?: UsuarioAcademia[];
};

const todayInput = new Date().toISOString().slice(0, 10);

const diasSemana = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terca" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sabado" },
  { value: 0, label: "Domingo" },
];

const tiposPiso: { value: TipoPiso; label: string }[] = [
  { value: "SAIBRO", label: "Saibro" },
  { value: "HARD", label: "Hard" },
  { value: "GRAMA", label: "Grama" },
  { value: "SINTETICA", label: "Sintetica" },
  { value: "AREIA", label: "Areia" },
  { value: "OUTRO", label: "Outro" },
];

function escolherAcademia(usuario: UsuarioAdmin | null): AcademiaPainel | null {
  const vinculos = Array.isArray(usuario?.academias) ? usuario.academias : [];

  if (vinculos.length === 0) {
    return null;
  }

  const ultimaAcademiaId = buscarUltimaAcademia();

  const normalizar = (vinculo?: UsuarioAcademia): AcademiaPainel | null => {
    const id = vinculo?.academia_id ?? vinculo?.academia?.id;

    if (!id) {
      return null;
    }

    return {
      id,
      nome: vinculo?.academia?.nome,
    };
  };

  const academiaSalva = normalizar(
    vinculos.find(
      (vinculo) =>
        vinculo.academia_id === ultimaAcademiaId ||
        vinculo.academia?.id === ultimaAcademiaId
    )
  );

  if (academiaSalva) {
    return academiaSalva;
  }

  const academiaAtiva = normalizar(
    vinculos.find((vinculo) => vinculo.status === "ATIVO")
  );

  return academiaAtiva ?? normalizar(vinculos[0]);
}

function useAdminAcademia() {
  const [academia] = useState<AcademiaPainel | null>(() => {
    const academiaAtual = escolherAcademia(getUsuario() as UsuarioAdmin | null);

    if (academiaAtual) {
      salvarUltimaAcademia(academiaAtual.id);
    }

    return academiaAtual;
  });

  return academia;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string; errors?: { message?: string }[] }>(
    error
  )) {
    return (
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      fallback
    );
  }

  return fallback;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function isPeriodoValido(inicio: string, fim: string) {
  return Boolean(inicio && fim && timeToMinutes(fim) > timeToMinutes(inicio));
}

function addMinutes(time: string, minutesToAdd: number) {
  const total = timeToMinutes(time) + minutesToAdd;
  const hours = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (total % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function toDateTimeIso(data: string, hora: string) {
  return new Date(`${data}T${hora}:00`).toISOString();
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(value: string) {
  if (value.includes("T")) {
    return new Date(value).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return value;
}

function getDiaSemanaLabel(value: number) {
  return diasSemana.find((dia) => dia.value === value)?.label ?? String(value);
}

function ordenarHorarios(horarios: HorarioQuadraAdmin[]) {
  return [...horarios].sort((a, b) => {
    if (a.dia_semana !== b.dia_semana) {
      return a.dia_semana - b.dia_semana;
    }

    return a.abre_as.localeCompare(b.abre_as);
  });
}

function getSlotStatus(slot: {
  disponivel: boolean;
  motivo?: string | null;
}) {
  if (slot.disponivel) {
    return {
      label: "Disponivel",
      className: "bg-lime-50 text-lime-700",
    };
  }

  if (slot.motivo === "BLOQUEADO") {
    return {
      label: "Bloqueado",
      className: "bg-red-50 text-red-700",
    };
  }

  return {
    label: "Reservado",
    className: "bg-amber-50 text-amber-700",
  };
}

function AdminPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="max-w-6xl">
      <section className="mb-6">
        <p className="text-sm font-semibold text-green-700">Admin</p>
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-950">
          {title}
        </h1>
        <p className="mt-3 text-sm text-zinc-500">{description}</p>
      </section>

      {children}
    </section>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      {(title || description) && (
        <div className="mb-5">
          {title && <h2 className="text-lg font-bold text-zinc-950">{title}</h2>}
          {description && (
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-zinc-500">{label}</p>
      <strong className="mt-3 block text-3xl font-bold tracking-[-0.03em] text-zinc-950">
        {value}
      </strong>
      <p className="mt-2 text-xs font-medium text-zinc-500">{description}</p>
    </article>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function FeedbackMessage({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;

  const color =
    feedback.type === "success"
      ? "bg-lime-50 text-lime-800"
      : "bg-red-50 text-red-700";

  return (
    <p className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${color}`}>
      {feedback.message}
    </p>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-gray-50 px-4 py-4 text-sm font-medium text-zinc-500">
      {children}
    </p>
  );
}

function QuadraSelect({
  value,
  quadras,
  disabled,
  onChange,
}: {
  value: string;
  quadras: QuadraAdmin[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-[50px] w-full rounded-xl border border-input bg-gray-50 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="">
        {quadras.length === 0 ? "Cadastre uma quadra primeiro" : "Selecione"}
      </option>
      {quadras.map((quadra) => (
        <option key={quadra.id} value={quadra.id}>
          {quadra.nome}
        </option>
      ))}
    </select>
  );
}

function CheckboxField({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}

function NoAcademia() {
  return (
    <AdminPage
      title="Painel admin"
      description="Nao foi possivel encontrar uma academia vinculada a este usuario."
    >
      <EmptyState>Nenhuma academia encontrada para este usuario.</EmptyState>
    </AdminPage>
  );
}

async function carregarBloqueiosDasQuadras(quadras: QuadraAdmin[]) {
  const entries = await Promise.all(
    quadras.map(async (quadra) => {
      const bloqueios = await listarBloqueiosQuadra(quadra.id);
      return bloqueios.map((bloqueio) => ({ ...bloqueio, quadra }));
    })
  );

  return entries.flat();
}

export function AdminDashboardView() {
  const academia = useAdminAcademia();
  const [dashboard, setDashboard] = useState<DashboardAdmin | null>(null);
  const [agenda, setAgenda] = useState<AgendaAdmin | null>(null);
  const [loading, setLoading] = useState(Boolean(academia));
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const carregar = useCallback(async () => {
    if (!academia) return;

    setLoading(true);
    setFeedback(null);

    try {
      const [dashboardData, agendaData] = await Promise.all([
        buscarDashboardAdmin(academia.id),
        buscarAgendaAdmin(academia.id, todayInput),
      ]);

      setDashboard(dashboardData);
      setAgenda(agendaData);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel carregar o painel."),
      });
    } finally {
      setLoading(false);
    }
  }, [academia]);

  useEffect(() => {
    const timer = window.setTimeout(() => void carregar(), 0);
    return () => window.clearTimeout(timer);
  }, [carregar]);

  if (!academia) return <NoAcademia />;

  return (
    <AdminPage
      title="Dashboard"
      description="Resumo rapido da academia e dos agendamentos de hoje."
    >
      <div className="grid gap-5">
        <FeedbackMessage feedback={feedback} />
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total de quadras"
            value={loading ? "..." : dashboard?.total_quadras ?? 0}
            description="Quadras cadastradas"
          />
          <SummaryCard
            label="Horarios cadastrados"
            value={loading ? "..." : dashboard?.horarios_cadastrados ?? 0}
            description="Regras de funcionamento"
          />
          <SummaryCard
            label="Bloqueios ativos"
            value={loading ? "..." : dashboard?.bloqueios_ativos ?? 0}
            description="Periodos indisponiveis"
          />
          <SummaryCard
            label="Agendamentos do dia"
            value={loading ? "..." : dashboard?.agendamentos_hoje ?? 0}
            description="Jogos, aulas e reservas"
          />
        </section>

        <Card
          title="Agenda de hoje"
          description="Veja rapidamente o que esta ocupado na academia."
        >
          {loading ? (
            <EmptyState>Carregando agenda...</EmptyState>
          ) : !agenda || agenda.eventos.length === 0 ? (
            <EmptyState>Nenhum agendamento para hoje.</EmptyState>
          ) : (
            <div className="grid gap-2">
              {agenda.eventos.map((evento) => (
                <div
                  key={`${evento.tipo}-${evento.id}`}
                  className="flex flex-col gap-2 rounded-2xl bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-950">
                      {evento.quadra} - {evento.tipo}
                    </p>
                    <p className="text-xs font-medium text-zinc-500">
                      {formatTime(evento.inicio_em)} ate{" "}
                      {formatTime(evento.fim_em)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-600">
                    {evento.nome_pessoa || evento.motivo || evento.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminPage>
  );
}

export function AdminQuadrasView() {
  const academia = useAdminAcademia();
  const [quadras, setQuadras] = useState<QuadraAdmin[]>([]);
  const [loading, setLoading] = useState(Boolean(academia));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    tipo_piso: "SINTETICA" as TipoPiso,
    coberta: false,
    capacidade_minima: "2",
    capacidade_maxima: "4",
    permite_simples: true,
    permite_dupla: true,
  });

  const carregar = useCallback(async () => {
    if (!academia) return;

    setLoading(true);
    try {
      setQuadras(await listarQuadras(academia.id));
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel carregar as quadras."),
      });
    } finally {
      setLoading(false);
    }
  }, [academia]);

  useEffect(() => {
    const timer = window.setTimeout(() => void carregar(), 0);
    return () => window.clearTimeout(timer);
  }, [carregar]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!academia) return;

    setFeedback(null);

    if (form.nome.trim().length < 2) {
      setFeedback({ type: "error", message: "Informe o nome da quadra." });
      return;
    }

    try {
      setSaving(true);
      await criarQuadra(academia.id, {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        tipo_piso: form.tipo_piso,
        coberta: form.coberta,
        capacidade_minima: Number(form.capacidade_minima),
        capacidade_maxima: Number(form.capacidade_maxima),
        permite_simples: form.permite_simples,
        permite_dupla: form.permite_dupla,
      });
      setForm({
        nome: "",
        descricao: "",
        tipo_piso: "SINTETICA",
        coberta: false,
        capacidade_minima: "2",
        capacidade_maxima: "4",
        permite_simples: true,
        permite_dupla: true,
      });
      setFeedback({ type: "success", message: "Quadra cadastrada com sucesso." });
      await carregar();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel cadastrar a quadra."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(quadra: QuadraAdmin) {
    setFeedback(null);
    try {
      await atualizarStatusQuadra(quadra.id, !quadra.ativa);
      setFeedback({
        type: "success",
        message: quadra.ativa ? "Quadra inativada." : "Quadra ativada.",
      });
      await carregar();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel alterar a quadra."),
      });
    }
  }

  if (!academia) return <NoAcademia />;

  return (
    <AdminPage
      title="Quadras"
      description="Cadastre quadras e controle quais aparecem para agendamento."
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Card
          title="Cadastrar quadra"
          description="Adicione uma nova quadra da academia."
        >
          <FeedbackMessage feedback={feedback} />
          <form onSubmit={handleSubmit} className="grid gap-3">
            <Field label="Nome da quadra">
              <Input
                value={form.nome}
                onChange={(event) =>
                  setForm((current) => ({ ...current, nome: event.target.value }))
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Field>
            <Field label="Descricao curta">
              <Textarea
                value={form.descricao}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    descricao: event.target.value,
                  }))
                }
                className="min-h-20 rounded-xl bg-gray-50"
              />
            </Field>
            <Field label="Tipo de piso">
              <select
                value={form.tipo_piso}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tipo_piso: event.target.value as TipoPiso,
                  }))
                }
                className="h-[50px] w-full rounded-xl border border-input bg-gray-50 px-3 text-sm"
              >
                {tiposPiso.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Capacidade minima">
                <Input
                  type="number"
                  min={2}
                  max={4}
                  value={form.capacidade_minima}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      capacidade_minima: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="Capacidade maxima">
                <Input
                  type="number"
                  min={2}
                  max={4}
                  value={form.capacidade_maxima}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      capacidade_maxima: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
            </div>
            <div className="grid gap-2 rounded-2xl bg-gray-50 p-3">
              <CheckboxField
                checked={form.coberta}
                label="Quadra coberta"
                onChange={(checked) =>
                  setForm((current) => ({ ...current, coberta: checked }))
                }
              />
              <CheckboxField
                checked={form.permite_simples}
                label="Permite jogo simples"
                onChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    permite_simples: checked,
                  }))
                }
              />
              <CheckboxField
                checked={form.permite_dupla}
                label="Permite jogo em dupla"
                onChange={(checked) =>
                  setForm((current) => ({ ...current, permite_dupla: checked }))
                }
              />
            </div>
            <Button
              disabled={saving}
              className="h-[50px] rounded-xl bg-gray-900 text-white hover:bg-black"
            >
              {saving ? "Salvando..." : "Cadastrar quadra"}
            </Button>
          </form>
        </Card>

        <Card
          title="Quadras cadastradas"
          description="Ative ou inative quadras conforme a operacao."
        >
          {loading ? (
            <EmptyState>Carregando quadras...</EmptyState>
          ) : quadras.length === 0 ? (
            <EmptyState>Nenhuma quadra cadastrada.</EmptyState>
          ) : (
            <div className="grid gap-2">
              {quadras.map((quadra) => (
                <div
                  key={quadra.id}
                  className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-950">
                      {quadra.nome}
                    </p>
                    <p className="text-xs font-medium text-zinc-500">
                      {quadra.tipo_piso} - {quadra.coberta ? "Coberta" : "Aberta"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-bold",
                        quadra.ativa
                          ? "bg-lime-50 text-lime-700"
                          : "bg-red-50 text-red-700",
                      ].join(" ")}
                    >
                      {quadra.ativa ? "Ativa" : "Inativa"}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void toggleStatus(quadra)}
                      className="h-9 rounded-xl bg-white"
                    >
                      {quadra.ativa ? "Inativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminPage>
  );
}

export function AdminHorariosView() {
  const academia = useAdminAcademia();
  const [quadras, setQuadras] = useState<QuadraAdmin[]>([]);
  const [horarios, setHorarios] = useState<HorarioQuadraAdmin[]>([]);
  const [selectedQuadra, setSelectedQuadra] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(Boolean(academia));
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dias_semana: [] as number[],
    hora_inicio: "08:00",
    hora_fim: "22:00",
  });
  const [bloqueio, setBloqueio] = useState({
    data: todayInput,
    hora_inicio: "",
    hora_fim: "",
    motivo: "",
  });

  const carregarQuadras = useCallback(async () => {
    if (!academia) return;

    setLoading(true);
    try {
      const quadrasData = await listarQuadras(academia.id);
      setQuadras(quadrasData);
      setSelectedQuadra((current) => current || quadrasData[0]?.id || "");
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel carregar as quadras."),
      });
    } finally {
      setLoading(false);
    }
  }, [academia]);

  const carregarHorarios = useCallback(async () => {
    if (!selectedQuadra) {
      setHorarios([]);
      return;
    }

    try {
      setHorarios(await listarHorariosQuadra(selectedQuadra));
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel carregar os horarios."),
      });
    }
  }, [selectedQuadra]);

  useEffect(() => {
    const timer = window.setTimeout(() => void carregarQuadras(), 0);
    return () => window.clearTimeout(timer);
  }, [carregarQuadras]);

  useEffect(() => {
    const timer = window.setTimeout(() => void carregarHorarios(), 0);
    return () => window.clearTimeout(timer);
  }, [carregarHorarios]);

  function toggleDia(dia: number) {
    setForm((current) => {
      const selected = current.dias_semana.includes(dia);
      return {
        ...current,
        dias_semana: selected
          ? current.dias_semana.filter((item) => item !== dia)
          : [...current.dias_semana, dia],
      };
    });
  }

  async function handleGerar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!selectedQuadra) {
      setFeedback({ type: "error", message: "Selecione uma quadra." });
      return;
    }

    if (form.dias_semana.length === 0) {
      setFeedback({
        type: "error",
        message: "Escolha pelo menos um dia da semana.",
      });
      return;
    }

    if (!isPeriodoValido(form.hora_inicio, form.hora_fim)) {
      setFeedback({
        type: "error",
        message: "A hora final precisa ser maior que a hora inicial.",
      });
      return;
    }

    try {
      setSaving(true);
      await gerarHorarios({
        quadra_id: selectedQuadra,
        dias_semana: form.dias_semana,
        hora_inicio: form.hora_inicio,
        hora_fim: form.hora_fim,
        duracao_minutos: 90,
      });
      setFeedback({
        type: "success",
        message: "Horarios de 90 minutos gerados com sucesso.",
      });
      await carregarHorarios();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel gerar os horarios."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleBloquear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedQuadra) {
      setFeedback({ type: "error", message: "Selecione uma quadra." });
      return;
    }

    if (!isPeriodoValido(bloqueio.hora_inicio, bloqueio.hora_fim)) {
      setFeedback({
        type: "error",
        message: "Informe um periodo valido para bloquear.",
      });
      return;
    }

    try {
      setSaving(true);
      await bloquearHorario({
        quadra_id: selectedQuadra,
        data: bloqueio.data,
        hora_inicio: bloqueio.hora_inicio,
        hora_fim: bloqueio.hora_fim,
        motivo: bloqueio.motivo.trim() || "Bloqueio administrativo",
      });
      setBloqueio({
        data: todayInput,
        hora_inicio: "",
        hora_fim: "",
        motivo: "",
      });
      setFeedback({ type: "success", message: "Horario bloqueado." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel bloquear o horario."),
      });
    } finally {
      setSaving(false);
    }
  }

  if (!academia) return <NoAcademia />;

  return (
    <AdminPage
      title="Horarios"
      description="Configure os horarios fixos das quadras sempre em slots de 90 minutos."
    >
      <div className="grid gap-4">
        <FeedbackMessage feedback={feedback} />
        <Card>
          <Field label="Quadra">
            <QuadraSelect
              value={selectedQuadra}
              quadras={quadras}
              disabled={loading || quadras.length === 0}
              onChange={setSelectedQuadra}
            />
          </Field>
        </Card>
        <section className="grid gap-4 xl:grid-cols-2">
          <Card
            title="Gerar horarios fixos"
            description="Escolha os dias e o intervalo. O sistema cria slots de 90 minutos."
          >
            <form onSubmit={handleGerar} className="grid gap-3">
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-700">
                  Dias da semana
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {diasSemana.map((dia) => (
                    <label
                      key={dia.value}
                      className={[
                        "flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold",
                        form.dias_semana.includes(dia.value)
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-700",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={form.dias_semana.includes(dia.value)}
                        onChange={() => toggleDia(dia.value)}
                      />
                      {dia.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Hora inicial">
                  <Input
                    type="time"
                    value={form.hora_inicio}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        hora_inicio: event.target.value,
                      }))
                    }
                    className="h-[50px] rounded-xl bg-gray-50"
                  />
                </Field>
                <Field label="Hora final">
                  <Input
                    type="time"
                    value={form.hora_fim}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        hora_fim: event.target.value,
                      }))
                    }
                    className="h-[50px] rounded-xl bg-gray-50"
                  />
                </Field>
              </div>
              <p className="rounded-2xl bg-lime-50 px-4 py-3 text-sm font-semibold text-lime-800">
                Todos os slots gerados terao 90 minutos.
              </p>
              <Button
                disabled={saving || !selectedQuadra}
                className="h-[50px] rounded-xl bg-gray-900 text-white hover:bg-black"
              >
                {saving ? "Gerando..." : "Gerar horarios"}
              </Button>
            </form>
          </Card>
          <Card
            title="Bloquear horario"
            description="Bloqueie rapidamente um periodo desta quadra."
          >
            <form onSubmit={handleBloquear} className="grid gap-3">
              <Field label="Data">
                <Input
                  type="date"
                  value={bloqueio.data}
                  onChange={(event) =>
                    setBloqueio((current) => ({
                      ...current,
                      data: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Hora inicial">
                  <Input
                    type="time"
                    value={bloqueio.hora_inicio}
                    onChange={(event) =>
                      setBloqueio((current) => ({
                        ...current,
                        hora_inicio: event.target.value,
                      }))
                    }
                    className="h-[50px] rounded-xl bg-gray-50"
                  />
                </Field>
                <Field label="Hora final">
                  <Input
                    type="time"
                    value={bloqueio.hora_fim}
                    onChange={(event) =>
                      setBloqueio((current) => ({
                        ...current,
                        hora_fim: event.target.value,
                      }))
                    }
                    className="h-[50px] rounded-xl bg-gray-50"
                  />
                </Field>
              </div>
              <Field label="Motivo">
                <Textarea
                  value={bloqueio.motivo}
                  onChange={(event) =>
                    setBloqueio((current) => ({
                      ...current,
                      motivo: event.target.value,
                    }))
                  }
                  className="min-h-20 rounded-xl bg-gray-50"
                />
              </Field>
              <Button
                disabled={saving || !selectedQuadra}
                className="h-[50px] rounded-xl bg-gray-900 text-white hover:bg-black"
              >
                {saving ? "Bloqueando..." : "Bloquear horario"}
              </Button>
            </form>
          </Card>
        </section>
        <Card
          title="Horarios cadastrados"
          description="Lista de regras semanais da quadra selecionada."
        >
          {horarios.length === 0 ? (
            <EmptyState>Nenhum horario cadastrado para esta quadra.</EmptyState>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ordenarHorarios(horarios).map((horario) => (
                <div key={horario.id} className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-bold text-zinc-950">
                    {getDiaSemanaLabel(horario.dia_semana)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-600">
                    {horario.abre_as} ate {horario.fecha_as}
                  </p>
                  <p className="mt-1 text-xs font-bold text-green-700">
                    Slot de {horario.duracao_slot_minutos} minutos
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminPage>
  );
}

export function AdminAgendaView() {
  const academia = useAdminAcademia();
  const [quadras, setQuadras] = useState<QuadraAdmin[]>([]);
  const [data, setData] = useState(todayInput);
  const [disponibilidades, setDisponibilidades] = useState<
    DisponibilidadeQuadraAdmin[]
  >([]);
  const [selectedQuadra, setSelectedQuadra] = useState("");
  const [selectedHorario, setSelectedHorario] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(Boolean(academia));
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome_pessoa: "",
    telefone: "",
    observacao: "",
  });

  const quadrasAtivas = useMemo(
    () => quadras.filter((quadra) => quadra.ativa),
    [quadras]
  );

  const disponibilidadeSelecionada = disponibilidades.find(
    (item) => item.quadra.id === selectedQuadra
  );
  const slotsDisponiveis =
    disponibilidadeSelecionada?.slots.filter((slot) => slot.disponivel) ?? [];

  const carregar = useCallback(async () => {
    if (!academia) return;

    setLoading(true);
    setFeedback(null);
    try {
      const quadrasData = await listarQuadras(academia.id);
      const ativas = quadrasData.filter((quadra) => quadra.ativa);
      const disponibilidadeData = await Promise.all(
        ativas.map((quadra) => obterDisponibilidadeQuadraAdmin(quadra.id, data))
      );
      setQuadras(quadrasData);
      setDisponibilidades(disponibilidadeData);
      setSelectedQuadra((current) => current || ativas[0]?.id || "");
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel carregar a agenda."),
      });
    } finally {
      setLoading(false);
    }
  }, [academia, data]);

  useEffect(() => {
    const timer = window.setTimeout(() => void carregar(), 0);
    return () => window.clearTimeout(timer);
  }, [carregar]);

  async function handleReserva(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!academia || !selectedQuadra || !selectedHorario) {
      setFeedback({
        type: "error",
        message: "Selecione quadra e horario para agendar.",
      });
      return;
    }

    if (form.nome_pessoa.trim().length < 2) {
      setFeedback({ type: "error", message: "Informe o nome da pessoa." });
      return;
    }

    if (onlyNumbers(form.telefone).length < 10) {
      setFeedback({ type: "error", message: "Informe um telefone valido." });
      return;
    }

    try {
      setSaving(true);
      await criarReservaAdmin(academia.id, {
        quadra_id: selectedQuadra,
        nome_pessoa: form.nome_pessoa.trim(),
        telefone: onlyNumbers(form.telefone),
        inicio_em: toDateTimeIso(data, selectedHorario),
        fim_em: toDateTimeIso(data, addMinutes(selectedHorario, 90)),
        observacao: form.observacao.trim() || undefined,
      });
      setForm({ nome_pessoa: "", telefone: "", observacao: "" });
      setSelectedHorario("");
      setFeedback({ type: "success", message: "Reserva criada com sucesso." });
      await carregar();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel criar a reserva."),
      });
    } finally {
      setSaving(false);
    }
  }

  if (!academia) return <NoAcademia />;

  return (
    <AdminPage
      title="Agenda"
      description="Veja os horarios do dia por quadra e agende manualmente."
    >
      <div className="grid gap-4">
        <FeedbackMessage feedback={feedback} />
        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Data">
              <Input
                type="date"
                value={data}
                onChange={(event) => {
                  setData(event.target.value);
                  setSelectedHorario("");
                }}
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Field>
            <Field label="Quadra para agendar">
              <QuadraSelect
                value={selectedQuadra}
                quadras={quadrasAtivas}
                disabled={quadrasAtivas.length === 0}
                onChange={(value) => {
                  setSelectedQuadra(value);
                  setSelectedHorario("");
                }}
              />
            </Field>
          </div>
        </Card>
        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <Card
            title="Horarios do dia"
            description="Status por quadra: disponivel, reservado ou bloqueado."
          >
            {loading ? (
              <EmptyState>Carregando horarios...</EmptyState>
            ) : disponibilidades.length === 0 ? (
              <EmptyState>Nenhuma quadra ativa com horario nesta data.</EmptyState>
            ) : (
              <div className="grid gap-4">
                {disponibilidades.map((disponibilidade) => (
                  <div key={disponibilidade.quadra.id}>
                    <h3 className="mb-2 text-sm font-bold text-zinc-950">
                      {disponibilidade.quadra.nome}
                    </h3>
                    {!disponibilidade.aberta ? (
                      <EmptyState>
                        {disponibilidade.motivo || "Quadra fechada nesta data."}
                      </EmptyState>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {disponibilidade.slots.map((slot) => {
                          const status = getSlotStatus(slot);
                          return (
                            <div
                              key={`${disponibilidade.quadra.id}-${slot.inicio}`}
                              className="rounded-2xl bg-gray-50 p-3"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-bold text-zinc-950">
                                  {slot.inicio} - {slot.fim}
                                </p>
                                <span
                                  className={`rounded-full px-2 py-1 text-[11px] font-bold ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </div>
                              <p className="mt-2 text-xs font-medium text-zinc-500">
                                {slot.reserva?.nome_pessoa ||
                                  slot.bloqueio?.motivo ||
                                  slot.motivo ||
                                  "Livre para agendamento"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card
            title="Agendar quadra"
            description="Crie uma reserva manual de 90 minutos para uma pessoa."
          >
            <form onSubmit={handleReserva} className="grid gap-3">
              <Field label="Nome da pessoa">
                <Input
                  value={form.nome_pessoa}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nome_pessoa: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="Telefone">
                <Input
                  value={form.telefone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      telefone: maskPhone(event.target.value),
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="Horario">
                <select
                  value={selectedHorario}
                  onChange={(event) => setSelectedHorario(event.target.value)}
                  className="h-[50px] w-full rounded-xl border border-input bg-gray-50 px-3 text-sm"
                >
                  <option value="">Selecione um horario disponivel</option>
                  {slotsDisponiveis.map((slot) => (
                    <option key={slot.inicio} value={slot.inicio}>
                      {slot.inicio} - {slot.fim}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Observacao opcional">
                <Textarea
                  value={form.observacao}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      observacao: event.target.value,
                    }))
                  }
                  className="min-h-20 rounded-xl bg-gray-50"
                />
              </Field>
              <Button
                disabled={saving || slotsDisponiveis.length === 0}
                className="h-[50px] rounded-xl bg-gray-900 text-white hover:bg-black"
              >
                {saving ? "Agendando..." : "Agendar quadra"}
              </Button>
            </form>
          </Card>
        </section>
      </div>
    </AdminPage>
  );
}

export function AdminBloqueiosView() {
  const academia = useAdminAcademia();
  const [quadras, setQuadras] = useState<QuadraAdmin[]>([]);
  const [bloqueios, setBloqueios] = useState<BloqueioAdmin[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(Boolean(academia));
  const [saving, setSaving] = useState(false);
  const [referenciaTempo, setReferenciaTempo] = useState(0);
  const [form, setForm] = useState({
    quadra_id: "",
    data: todayInput,
    hora_inicio: "",
    hora_fim: "",
    motivo: "",
  });

  const bloqueiosAtivos = useMemo(() => {
    return bloqueios.filter((bloqueio) => {
      const fim = new Date(bloqueio.fim_em).getTime();
      return Number.isFinite(fim) && fim >= referenciaTempo;
    });
  }, [bloqueios, referenciaTempo]);

  const carregar = useCallback(async () => {
    if (!academia) return;

    setLoading(true);
    try {
      const quadrasData = await listarQuadras(academia.id);
      setQuadras(quadrasData);
      setForm((current) => ({
        ...current,
        quadra_id: current.quadra_id || quadrasData[0]?.id || "",
      }));
      setBloqueios(await carregarBloqueiosDasQuadras(quadrasData));
      setReferenciaTempo(Date.now());
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel carregar bloqueios."),
      });
    } finally {
      setLoading(false);
    }
  }, [academia]);

  useEffect(() => {
    const timer = window.setTimeout(() => void carregar(), 0);
    return () => window.clearTimeout(timer);
  }, [carregar]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!form.quadra_id) {
      setFeedback({ type: "error", message: "Selecione uma quadra." });
      return;
    }

    if (!isPeriodoValido(form.hora_inicio, form.hora_fim)) {
      setFeedback({
        type: "error",
        message: "Informe hora inicial e final validas.",
      });
      return;
    }

    try {
      setSaving(true);
      await bloquearHorario({
        quadra_id: form.quadra_id,
        data: form.data,
        hora_inicio: form.hora_inicio,
        hora_fim: form.hora_fim,
        motivo: form.motivo.trim() || "Bloqueio administrativo",
      });
      setForm((current) => ({
        ...current,
        hora_inicio: "",
        hora_fim: "",
        motivo: "",
      }));
      setFeedback({ type: "success", message: "Bloqueio criado com sucesso." });
      await carregar();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel criar o bloqueio."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(bloqueioId: string) {
    setFeedback(null);
    try {
      await removerBloqueio(bloqueioId);
      setFeedback({ type: "success", message: "Bloqueio removido." });
      await carregar();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel remover o bloqueio."),
      });
    }
  }

  if (!academia) return <NoAcademia />;

  return (
    <AdminPage
      title="Bloqueios"
      description="Impeca reservas em periodos especificos e acompanhe bloqueios ativos."
    >
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card
          title="Bloquear quadra"
          description="Informe quadra, data, horario e motivo."
        >
          <FeedbackMessage feedback={feedback} />
          <form onSubmit={handleSubmit} className="grid gap-3">
            <Field label="Quadra">
              <QuadraSelect
                value={form.quadra_id}
                quadras={quadras}
                disabled={quadras.length === 0}
                onChange={(value) =>
                  setForm((current) => ({ ...current, quadra_id: value }))
                }
              />
            </Field>
            <Field label="Data">
              <Input
                type="date"
                value={form.data}
                onChange={(event) =>
                  setForm((current) => ({ ...current, data: event.target.value }))
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Hora inicial">
                <Input
                  type="time"
                  value={form.hora_inicio}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      hora_inicio: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="Hora final">
                <Input
                  type="time"
                  value={form.hora_fim}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      hora_fim: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
            </div>
            <Field label="Motivo">
              <Textarea
                value={form.motivo}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    motivo: event.target.value,
                  }))
                }
                className="min-h-20 rounded-xl bg-gray-50"
              />
            </Field>
            <Button
              disabled={saving}
              className="h-[50px] rounded-xl bg-gray-900 text-white hover:bg-black"
            >
              {saving ? "Bloqueando..." : "Bloquear quadra"}
            </Button>
          </form>
        </Card>
        <Card
          title="Bloqueios ativos"
          description="Remova um bloqueio quando o periodo voltar a ficar disponivel."
        >
          {loading ? (
            <EmptyState>Carregando bloqueios...</EmptyState>
          ) : bloqueiosAtivos.length === 0 ? (
            <EmptyState>Nenhum bloqueio ativo.</EmptyState>
          ) : (
            <div className="grid gap-2">
              {bloqueiosAtivos.map((bloqueio) => (
                <div
                  key={bloqueio.id}
                  className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-950">
                      {bloqueio.quadra?.nome || "Quadra"}
                    </p>
                    <p className="text-xs font-medium text-zinc-500">
                      {formatDateTime(bloqueio.inicio_em)} ate{" "}
                      {formatDateTime(bloqueio.fim_em)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {bloqueio.motivo}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleRemove(bloqueio.id)}
                    className="h-9 rounded-xl bg-white"
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminPage>
  );
}

export function AdminConfiguracoesView() {
  const academiaPainel = useAdminAcademia();
  const [academia, setAcademia] = useState<AcademiaAdmin | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(Boolean(academiaPainel));
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    slug: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    horario_padrao_inicio: "08:00",
    horario_padrao_fim: "22:00",
  });

  const carregar = useCallback(async () => {
    if (!academiaPainel) return;

    setLoading(true);
    try {
      const data = await buscarAcademiaAdmin(academiaPainel.id);
      setAcademia(data);
      setForm({
        nome: data.nome ?? "",
        slug: data.slug ?? "",
        telefone: data.telefone ? maskPhone(data.telefone) : "",
        email: data.email ?? "",
        endereco: data.endereco ?? "",
        cidade: data.cidade ?? "",
        estado: data.estado ?? "",
        cep: data.cep ? maskCep(data.cep) : "",
        horario_padrao_inicio: data.horario_padrao_inicio ?? "08:00",
        horario_padrao_fim: data.horario_padrao_fim ?? "22:00",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel carregar a academia."),
      });
    } finally {
      setLoading(false);
    }
  }, [academiaPainel]);

  useEffect(() => {
    const timer = window.setTimeout(() => void carregar(), 0);
    return () => window.clearTimeout(timer);
  }, [carregar]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!academiaPainel) return;

    setFeedback(null);

    if (!isPeriodoValido(form.horario_padrao_inicio, form.horario_padrao_fim)) {
      setFeedback({
        type: "error",
        message: "Horario final precisa ser maior que o inicial.",
      });
      return;
    }

    try {
      setSaving(true);
      await atualizarAcademiaAdmin(academiaPainel.id, {
        nome: form.nome.trim(),
        slug: form.slug.trim(),
        telefone: onlyNumbers(form.telefone),
        email: form.email.trim().toLowerCase(),
        endereco: form.endereco.trim() || undefined,
        cidade: form.cidade.trim() || undefined,
        estado: form.estado.trim().toUpperCase() || undefined,
        cep: onlyNumbers(form.cep) || undefined,
        horario_padrao_inicio: form.horario_padrao_inicio,
        horario_padrao_fim: form.horario_padrao_fim,
        duracao_slot_minutos: 90,
      });
      setFeedback({
        type: "success",
        message: "Configuracoes salvas com sucesso.",
      });
      await carregar();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Nao foi possivel salvar as configuracoes."),
      });
    } finally {
      setSaving(false);
    }
  }

  if (!academiaPainel) return <NoAcademia />;

  return (
    <AdminPage
      title="Configuracoes"
      description="Edite dados basicos da academia e o funcionamento padrao."
    >
      <Card
        title="Dados da academia"
        description="A duracao do slot fica fixa em 90 minutos."
      >
        <FeedbackMessage feedback={feedback} />
        {loading && !academia ? (
          <EmptyState>Carregando configuracoes...</EmptyState>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nome da academia">
                <Input
                  value={form.nome}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, nome: event.target.value }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="Slug">
                <Input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: event.target.value.toLowerCase(),
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="Telefone">
                <Input
                  value={form.telefone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      telefone: maskPhone(event.target.value),
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="E-mail">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="Endereco">
                <Input
                  value={form.endereco}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      endereco: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="Cidade">
                <Input
                  value={form.cidade}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      cidade: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="Estado">
                <Input
                  maxLength={2}
                  value={form.estado}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      estado: event.target.value.toUpperCase(),
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="CEP">
                <Input
                  value={form.cep}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      cep: maskCep(event.target.value),
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="Horario padrao inicial">
                <Input
                  type="time"
                  value={form.horario_padrao_inicio}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      horario_padrao_inicio: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="Horario padrao final">
                <Input
                  type="time"
                  value={form.horario_padrao_fim}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      horario_padrao_fim: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
              <Field label="Duracao fixa do slot">
                <Input
                  value="90 minutos"
                  disabled
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Field>
            </div>
            <Button
              disabled={saving}
              className="mt-2 h-[50px] rounded-xl bg-gray-900 text-white hover:bg-black"
            >
              {saving ? "Salvando..." : "Salvar configuracoes"}
            </Button>
          </form>
        )}
      </Card>
    </AdminPage>
  );
}

export function AdminReservasAtivasView() {
  const academia = useAdminAcademia();
  const [reservas, setReservas] = useState<ReservaAdmin[]>([]);

  useEffect(() => {
    if (!academia) return;

    const timer = window.setTimeout(() => {
      void listarReservasAdmin(academia.id).then(setReservas).catch(() => {
        setReservas([]);
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [academia]);

  async function handleCancel(id: string) {
    await cancelarReservaAdmin(id);
    if (academia) {
      setReservas(await listarReservasAdmin(academia.id));
    }
  }

  if (!academia) return null;

  return (
    <div className="grid gap-2">
      {reservas.map((reserva) => (
        <div key={reserva.id} className="rounded-2xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-zinc-950">
            {reserva.nome_pessoa}
          </p>
          <p className="text-xs text-zinc-500">
            {reserva.quadra?.nome} - {formatDateTime(reserva.inicio_em)}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleCancel(reserva.id)}
            className="mt-3 h-8 rounded-xl bg-white"
          >
            Cancelar
          </Button>
        </div>
      ))}
    </div>
  );
}
