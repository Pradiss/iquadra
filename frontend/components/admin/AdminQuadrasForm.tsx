"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  Ban,
  Clock,
  Copy,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";

import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  atualizarHorarioQuadra,
  atualizarQuadra,
  atualizarStatusQuadra,
  criarQuadra,
  excluirQuadra,
  gerarHorarioQuadra,
  listarHorariosQuadra,
  listarQuadras,
  removerHorarioQuadra,
  type HorarioQuadraAdmin,
  type ModalidadeQuadra,
  type QuadraAdmin,
  type TipoPiso,
} from "@/services/admin.service";
import {
  diasSemana,
  getErrorMessage,
  isPeriodoValido,
  type Feedback,
  useAdminAcademia,
} from "@/components/admin/admin-helpers";

type ModoTela = "lista" | "form";
type StatusFiltro = "TODAS" | "ATIVAS" | "INATIVAS";
type DuracaoReserva = "60" | "90" | "120";

type HorarioDiaForm = {
  dia_semana: number;
  ativo: boolean;
  abre_as: string;
  fecha_as: string;
};

type QuadraFormState = {
  nome: string;
  descricao: string;
  tipo_piso: TipoPiso | "";
  modalidade: ModalidadeQuadra | "";
  valor_hora: string;
  coberta: boolean;
  ativa: boolean;
  capacidade_minima: string;
  capacidade_maxima: string;
  permite_simples: boolean;
  permite_dupla: boolean;
  duracao_slot_minutos: DuracaoReserva;
  horarios: HorarioDiaForm[];
};

const tiposPiso: { value: TipoPiso; label: string }[] = [
  { value: "SAIBRO", label: "Saibro" },
  { value: "HARD", label: "Hard" },
  { value: "GRAMA", label: "Grama" },
  { value: "SINTETICA", label: "Sintética" },
  { value: "AREIA", label: "Areia" },
  { value: "OUTRO", label: "Outro" },
];

const modalidades: { value: ModalidadeQuadra; label: string }[] = [
  { value: "TENIS", label: "Tênis" },
  { value: "BEACH_TENNIS", label: "Beach Tennis" },
  { value: "PADEL", label: "Padel" },
  { value: "PICKLEBALL", label: "Pickleball" },
  { value: "OUTRO", label: "Outro" },
];

const horariosPadrao: HorarioDiaForm[] = [
  { dia_semana: 1, ativo: true, abre_as: "06:00", fecha_as: "22:00" },
  { dia_semana: 2, ativo: true, abre_as: "06:00", fecha_as: "22:00" },
  { dia_semana: 3, ativo: true, abre_as: "06:00", fecha_as: "22:00" },
  { dia_semana: 4, ativo: true, abre_as: "06:00", fecha_as: "22:00" },
  { dia_semana: 5, ativo: true, abre_as: "06:00", fecha_as: "22:00" },
  { dia_semana: 6, ativo: true, abre_as: "07:00", fecha_as: "18:00" },
  { dia_semana: 0, ativo: false, abre_as: "07:00", fecha_as: "18:00" },
];

const formInicial: QuadraFormState = {
  nome: "",
  descricao: "",
  tipo_piso: "",
  modalidade: "",
  valor_hora: "",
  coberta: true,
  ativa: true,
  capacidade_minima: "2",
  capacidade_maxima: "4",
  permite_simples: true,
  permite_dupla: true,
  duracao_slot_minutos: "90",
  horarios: horariosPadrao,
};

function clonarHorariosPadrao() {
  return horariosPadrao.map((horario) => ({ ...horario }));
}

function getModalidadeLabel(value?: string | null) {
  return (
    modalidades.find((modalidade) => modalidade.value === value)?.label ??
    "Sem modalidade"
  );
}

function getPisoLabel(value?: string | null) {
  return tiposPiso.find((tipo) => tipo.value === value)?.label ?? "Sem piso";
}

function getDiaSemanaLabel(value: number) {
  return diasSemana.find((dia) => dia.value === value)?.label ?? String(value);
}

function getDuracaoFromHorarios(horarios: HorarioQuadraAdmin[]) {
  const duracao = horarios.find((horario) => horario.duracao_slot_minutos)
    ?.duracao_slot_minutos;

  return duracao === 60 || duracao === 90 || duracao === 120
    ? String(duracao) as DuracaoReserva
    : "90";
}

function montarHorariosParaEditar(horarios: HorarioQuadraAdmin[]) {
  if (horarios.length === 0) return clonarHorariosPadrao();

  return horariosPadrao.map((padrao) => {
    const horario = horarios.find(
      (item) => item.dia_semana === padrao.dia_semana,
    );

    if (!horario) {
      return {
        ...padrao,
        ativo: false,
      };
    }

    return {
      dia_semana: padrao.dia_semana,
      ativo: true,
      abre_as: horario.abre_as,
      fecha_as: horario.fecha_as,
    };
  });
}

function normalizarValorHora(value: string) {
  if (value.trim() === "") return undefined;
  return Number(value.replace(",", "."));
}

function montarPayloadQuadra(form: QuadraFormState) {
  return {
    nome: form.nome.trim(),
    descricao: form.descricao.trim() || undefined,
    tipo_piso: form.tipo_piso as TipoPiso,
    modalidade: form.modalidade as ModalidadeQuadra,
    valor_hora: normalizarValorHora(form.valor_hora),
    coberta: form.coberta,
    capacidade_minima: Number(form.capacidade_minima),
    capacidade_maxima: Number(form.capacidade_maxima),
    permite_simples: form.permite_simples,
    permite_dupla: form.permite_dupla,
  };
}

function getStatusClass(ativa: boolean) {
  return ativa ? "bg-lime-100 text-lime-700" : "bg-rose-100 text-rose-700";
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
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-xs font-bold text-zinc-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 outline-none transition focus:border-zinc-400"
      >
        {children}
      </select>
    </label>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "relative h-6 w-11 rounded-full transition",
        checked ? "bg-green-600" : "bg-zinc-300",
      ].join(" ")}
      aria-pressed={checked}
    >
      <span
        className={[
          "absolute top-1 h-4 w-4 rounded-full bg-white transition",
          checked ? "left-6" : "left-1",
        ].join(" ")}
      />
    </button>
  );
}

export function AdminQuadrasForm() {
  const academia = useAdminAcademia();

  const [modo, setModo] = useState<ModoTela>("lista");
  const [quadras, setQuadras] = useState<QuadraAdmin[]>([]);
  const [loading, setLoading] = useState(Boolean(academia));
  const [saving, setSaving] = useState(false);
  const [acaoQuadraId, setAcaoQuadraId] = useState<string | null>(null);
  const [quadraEditandoId, setQuadraEditandoId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busca, setBusca] = useState("");
  const [modalidadeFiltro, setModalidadeFiltro] = useState("TODAS");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("TODAS");
  const [form, setForm] = useState<QuadraFormState>(() => ({
    ...formInicial,
    horarios: clonarHorariosPadrao(),
  }));

  const quadrasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return quadras.filter((quadra) => {
      const passaBusca =
        termo.length === 0 || quadra.nome.toLowerCase().includes(termo);
      const passaModalidade =
        modalidadeFiltro === "TODAS" ||
        quadra.modalidade === modalidadeFiltro;
      const passaStatus =
        statusFiltro === "TODAS" ||
        (statusFiltro === "ATIVAS" && quadra.ativa) ||
        (statusFiltro === "INATIVAS" && !quadra.ativa);

      return passaBusca && passaModalidade && passaStatus;
    });
  }, [busca, modalidadeFiltro, quadras, statusFiltro]);

  const carregar = useCallback(async () => {
    if (!academia) return;

    setLoading(true);

    try {
      const data = await listarQuadras(academia.id);
      setQuadras(Array.isArray(data) ? data : []);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Não foi possível carregar as quadras."),
      });
    } finally {
      setLoading(false);
    }
  }, [academia]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregar();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregar]);

  function limparFormulario() {
    setQuadraEditandoId(null);
    setForm({
      ...formInicial,
      horarios: clonarHorariosPadrao(),
    });
  }

  function abrirCadastro() {
    limparFormulario();
    setFeedback(null);
    setModo("form");
  }

  function voltarParaLista() {
    limparFormulario();
    setModo("lista");
  }

  async function preencherFormularioParaEditar(quadra: QuadraAdmin) {
    setFeedback(null);
    setAcaoQuadraId(quadra.id);
    setModo("form");
    setQuadraEditandoId(quadra.id);

    try {
      const horarios = await listarHorariosQuadra(quadra.id);
      const horariosArray = Array.isArray(horarios)
        ? horarios as HorarioQuadraAdmin[]
        : [];

      setForm({
        nome: quadra.nome ?? "",
        descricao: quadra.descricao ?? "",
        tipo_piso: (quadra.tipo_piso ?? "") as TipoPiso | "",
        modalidade: (quadra.modalidade ?? "") as ModalidadeQuadra | "",
        valor_hora:
          quadra.valor_hora !== null && quadra.valor_hora !== undefined
            ? String(quadra.valor_hora)
            : "",
        coberta: Boolean(quadra.coberta),
        ativa: quadra.ativa,
        capacidade_minima: String(quadra.capacidade_minima ?? 2),
        capacidade_maxima: String(quadra.capacidade_maxima ?? 4),
        permite_simples: quadra.permite_simples ?? true,
        permite_dupla: quadra.permite_dupla ?? true,
        duracao_slot_minutos: getDuracaoFromHorarios(horariosArray),
        horarios: montarHorariosParaEditar(horariosArray),
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Não foi possível carregar horários."),
      });
    } finally {
      setAcaoQuadraId(null);
    }
  }

  function atualizarHorarioDia(
    diaSemana: number,
    patch: Partial<HorarioDiaForm>,
  ) {
    setForm((current) => ({
      ...current,
      horarios: current.horarios.map((horario) =>
        horario.dia_semana === diaSemana ? { ...horario, ...patch } : horario,
      ),
    }));
  }

  function copiarHorarioParaDiasAtivos() {
    const origem = form.horarios.find((horario) => horario.ativo);

    if (!origem) {
      setFeedback({
        type: "error",
        message: "Ative pelo menos um dia para copiar o horário.",
      });
      return;
    }

    setForm((current) => ({
      ...current,
      horarios: current.horarios.map((horario) =>
        horario.ativo
          ? {
              ...horario,
              abre_as: origem.abre_as,
              fecha_as: origem.fecha_as,
            }
          : horario,
      ),
    }));
  }

  function validarFormulario() {
    if (!form.nome.trim()) return "Informe o nome da quadra.";
    if (!form.tipo_piso) return "Selecione o tipo de piso.";
    if (!form.modalidade) return "Selecione a modalidade.";
    if (!form.valor_hora.trim()) return "Informe o valor da quadra.";

    const valorHora = normalizarValorHora(form.valor_hora);
    if (Number.isNaN(valorHora)) return "Informe um valor de quadra válido.";

    const capacidadeMinima = Number(form.capacidade_minima);
    const capacidadeMaxima = Number(form.capacidade_maxima);

    if (Number.isNaN(capacidadeMinima) || Number.isNaN(capacidadeMaxima)) {
      return "Informe as capacidades da quadra.";
    }

    if (capacidadeMinima > capacidadeMaxima) {
      return "A capacidade mínima não pode ser maior que a máxima.";
    }

    if (!form.permite_simples && !form.permite_dupla) {
      return "Permita jogo simples, dupla ou ambos.";
    }

    const horariosAtivos = form.horarios.filter((horario) => horario.ativo);
    if (horariosAtivos.length === 0) {
      return "Ative pelo menos um dia de funcionamento.";
    }

    const horarioInvalido = horariosAtivos.find(
      (horario) => !isPeriodoValido(horario.abre_as, horario.fecha_as),
    );

    if (horarioInvalido) {
      return `Revise o horário de ${getDiaSemanaLabel(
        horarioInvalido.dia_semana,
      )}.`;
    }

    return "";
  }

  async function sincronizarHorariosQuadra(
    quadraId: string,
    horariosExistentes: HorarioQuadraAdmin[],
  ) {
    const horariosPorDia = new Map<number, HorarioQuadraAdmin[]>();

    for (const horario of horariosExistentes) {
      const atuais = horariosPorDia.get(horario.dia_semana) ?? [];
      horariosPorDia.set(horario.dia_semana, [...atuais, horario]);
    }

    const duracao = Number(form.duracao_slot_minutos);

    for (const horarioDia of form.horarios) {
      const existentesDia = horariosPorDia.get(horarioDia.dia_semana) ?? [];
      const [principal, ...extras] = existentesDia;

      if (!horarioDia.ativo) {
        await Promise.all(
          existentesDia.map((horario) => removerHorarioQuadra(horario.id)),
        );
        continue;
      }

      const payload = {
        dia_semana: horarioDia.dia_semana,
        abre_as: horarioDia.abre_as,
        fecha_as: horarioDia.fecha_as,
        duracao_slot_minutos: duracao,
        ativo: true,
      };

      if (principal) {
        await atualizarHorarioQuadra(principal.id, payload);
      } else {
        await gerarHorarioQuadra(quadraId, payload);
      }

      if (extras.length > 0) {
        await Promise.all(
          extras.map((horario) => removerHorarioQuadra(horario.id)),
        );
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!academia) return;

    setFeedback(null);

    const erroValidacao = validarFormulario();
    if (erroValidacao) {
      setFeedback({ type: "error", message: erroValidacao });
      return;
    }

    try {
      setSaving(true);

      const payload = montarPayloadQuadra(form);
      let quadraId = quadraEditandoId;
      let quadraSalva: QuadraAdmin | undefined;

      if (quadraEditandoId) {
        quadraSalva = await atualizarQuadra(quadraEditandoId, payload);
      } else {
        quadraSalva = await criarQuadra(academia.id, payload);
        quadraId = quadraSalva.id;
      }

      if (!quadraId) {
        throw new Error("Não foi possível identificar a quadra salva.");
      }

      const horariosExistentes = quadraEditandoId
        ? await listarHorariosQuadra(quadraId)
        : [];

      await sincronizarHorariosQuadra(
        quadraId,
        Array.isArray(horariosExistentes)
          ? horariosExistentes as HorarioQuadraAdmin[]
          : [],
      );

      const ativaAtual =
        quadraSalva?.ativa ??
        quadras.find((quadra) => quadra.id === quadraId)?.ativa ??
        true;

      if (ativaAtual !== form.ativa) {
        await atualizarStatusQuadra(quadraId, form.ativa);
      }

      setFeedback({
        type: "success",
        message: quadraEditandoId
          ? "Quadra e horários atualizados com sucesso."
          : "Quadra cadastrada com horários semanais.",
      });

      limparFormulario();
      setModo("lista");
      await carregar();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          error,
          quadraEditandoId
            ? "Não foi possível atualizar a quadra."
            : "Não foi possível cadastrar a quadra.",
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(quadra: QuadraAdmin) {
    setFeedback(null);
    setAcaoQuadraId(quadra.id);

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
        message: getErrorMessage(error, "Não foi possível alterar a quadra."),
      });
    } finally {
      setAcaoQuadraId(null);
    }
  }

  async function excluirQuadraSelecionada(quadra: QuadraAdmin) {
    const confirmou = window.confirm(
      `Excluir a quadra "${quadra.nome}"? Se ela tiver jogos ou aulas vinculados, use Inativar.`,
    );

    if (!confirmou) return;

    setFeedback(null);
    setAcaoQuadraId(quadra.id);

    try {
      await excluirQuadra(quadra.id);

      setFeedback({
        type: "success",
        message: "Quadra excluída com sucesso.",
      });

      await carregar();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Não foi possível excluir a quadra."),
      });
    } finally {
      setAcaoQuadraId(null);
    }
  }

  if (!academia) {
    return (
      <div className="rounded-xl bg-white p-5 text-sm font-semibold text-zinc-500">
        Nenhuma academia vinculada ao usuário.
      </div>
    );
  }

  if (modo === "form") {
    return (
      <section className="grid gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={voltarParaLista}
              className="h-9 w-fit gap-2 rounded-lg bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para quadras
            </Button>

            <div>
              <p className="text-sm font-semibold text-green-700">Admin</p>
              <h2 className="text-3xl font-black text-zinc-950">
                {quadraEditandoId ? "Editar quadra" : "Cadastrar quadra"}
              </h2>
              <p className="mt-2 text-sm font-medium text-zinc-400">
                Cadastre uma nova quadra e defina sua disponibilidade.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={voltarParaLista}
            className="h-11 rounded-lg bg-white px-6"
          >
            Ver quadras
          </Button>
        </div>

        <AdminFeedback feedback={feedback} />

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_1.18fr]">
            <section className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black text-zinc-950">
                Dados da quadra
              </h3>

              <div className="mt-5 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold text-zinc-700">
                    Nome da quadra *
                    <Input
                      value={form.nome}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          nome: event.target.value,
                        }))
                      }
                      placeholder="Ex: Quadra 1"
                      className="h-12 rounded-lg bg-zinc-50"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-bold text-zinc-700">
                    Descrição curta
                    <Textarea
                      value={form.descricao}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          descricao: event.target.value,
                        }))
                      }
                      placeholder="Ex: Quadra de beach tennis com areia fofa"
                      className="min-h-24 rounded-lg bg-zinc-50"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold text-zinc-700">
                    Tipo de piso *
                    <select
                      value={form.tipo_piso}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          tipo_piso: event.target.value as TipoPiso | "",
                        }))
                      }
                      className="h-12 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700"
                    >
                      <option value="">Selecione o tipo de piso</option>
                      {tiposPiso.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-bold text-zinc-700">
                    Modalidade *
                    <select
                      value={form.modalidade}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          modalidade: event.target.value as ModalidadeQuadra | "",
                        }))
                      }
                      className="h-12 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700"
                    >
                      <option value="">Selecione a modalidade</option>
                      {modalidades.map((modalidade) => (
                        <option key={modalidade.value} value={modalidade.value}>
                          {modalidade.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-2 text-sm font-bold text-zinc-700">
                    Valor da quadra (R$) *
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.valor_hora}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            valor_hora: event.target.value,
                          }))
                        }
                        placeholder="Ex: 80,00"
                        className="h-12 rounded-lg bg-zinc-50 pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-500">
                        R$
                      </span>
                    </div>
                  </label>

                  <label className="grid gap-2 text-sm font-bold text-zinc-700">
                    Capacidade mínima *
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
                      className="h-12 rounded-lg bg-zinc-50"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-bold text-zinc-700">
                    Capacidade máxima *
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
                      className="h-12 rounded-lg bg-zinc-50"
                    />
                  </label>
                </div>

                <div className="grid gap-4">
                  <label className="flex items-start gap-3 text-sm font-bold text-zinc-800">
                    <input
                      type="checkbox"
                      checked={form.coberta}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          coberta: event.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 accent-green-700"
                    />
                    <span>
                      Quadra coberta
                      <small className="block font-semibold text-zinc-500">
                        Marque se a quadra for coberta.
                      </small>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm font-bold text-zinc-800">
                    <input
                      type="checkbox"
                      checked={form.permite_simples}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          permite_simples: event.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 accent-green-700"
                    />
                    <span>
                      Permite simples
                      <small className="block font-semibold text-zinc-500">
                        A quadra aceita jogos com 2 jogadores.
                      </small>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm font-bold text-zinc-800">
                    <input
                      type="checkbox"
                      checked={form.permite_dupla}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          permite_dupla: event.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 accent-green-700"
                    />
                    <span>
                      Permite dupla
                      <small className="block font-semibold text-zinc-500">
                        A quadra aceita jogos com 4 jogadores.
                      </small>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm font-bold text-zinc-800">
                    <input
                      type="checkbox"
                      checked={form.ativa}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          ativa: event.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 accent-green-700"
                    />
                    <span>
                      Ativa
                      <small className="block font-semibold text-zinc-500">
                        A quadra ficará visível para reservas.
                      </small>
                    </span>
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black text-zinc-950">
                Disponibilidade semanal
              </h3>
              <p className="mt-1 text-sm font-medium text-zinc-400">
                Configure os horários de funcionamento da quadra.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                <label className="grid gap-2 text-sm font-bold text-zinc-700">
                  Tempo de reserva
                  <select
                    value={form.duracao_slot_minutos}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        duracao_slot_minutos: event.target.value as DuracaoReserva,
                      }))
                    }
                    className="h-12 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700"
                  >
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-bold text-zinc-700">
                  Copiar horário
                  <select
                    value="ativos"
                    onChange={() => undefined}
                    className="h-12 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700"
                  >
                    <option value="ativos">Para dias selecionados</option>
                  </select>
                </label>

                <Button
                  type="button"
                  variant="outline"
                  onClick={copiarHorarioParaDiasAtivos}
                  className="mt-auto h-12 gap-2 rounded-lg bg-white"
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </Button>
              </div>

              <div className="mt-5 overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-[1.2fr_0.7fr_1fr_1fr] border-b border-zinc-100 px-1 pb-3 text-xs font-black text-zinc-500">
                    <span>Dia da semana</span>
                    <span>Ativa</span>
                    <span>Início</span>
                    <span>Fim</span>
                  </div>

                  {form.horarios.map((horario) => (
                    <div
                      key={horario.dia_semana}
                      className="grid grid-cols-[1.2fr_0.7fr_1fr_1fr] items-center border-b border-zinc-100 py-2"
                    >
                      <span className="text-sm font-bold text-zinc-700">
                        {getDiaSemanaLabel(horario.dia_semana)}
                      </span>

                      <ToggleSwitch
                        checked={horario.ativo}
                        onChange={(checked) =>
                          atualizarHorarioDia(horario.dia_semana, {
                            ativo: checked,
                          })
                        }
                      />

                      <div className="relative pr-4">
                        <Input
                          type="time"
                          value={horario.ativo ? horario.abre_as : ""}
                          disabled={!horario.ativo}
                          onChange={(event) =>
                            atualizarHorarioDia(horario.dia_semana, {
                              abre_as: event.target.value,
                            })
                          }
                          className="h-11 rounded-lg bg-zinc-50 pr-9 disabled:bg-zinc-200"
                        />
                        <Clock className="absolute right-7 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      </div>

                      <div className="relative pr-4">
                        <Input
                          type="time"
                          value={horario.ativo ? horario.fecha_as : ""}
                          disabled={!horario.ativo}
                          onChange={(event) =>
                            atualizarHorarioDia(horario.dia_semana, {
                              fecha_as: event.target.value,
                            })
                          }
                          className="h-11 rounded-lg bg-zinc-50 pr-9 disabled:bg-zinc-200"
                        />
                        <Clock className="absolute right-7 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <section className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm md:flex-row">
            <Button
              disabled={saving}
              className="h-12 flex-1 gap-2 rounded-lg bg-slate-950 text-white hover:bg-slate-800 md:max-w-[420px]"
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar quadra"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={voltarParaLista}
              className="h-12 rounded-lg bg-white md:w-48"
            >
              Cancelar
            </Button>
          </section>
        </form>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-green-700">Admin</p>
          <h2 className="text-3xl font-black text-zinc-950">Quadras</h2>
          <p className="mt-2 text-sm font-medium text-zinc-400">
            Visualize e gerencie as quadras cadastradas.
          </p>
        </div>

        <Button
          type="button"
          onClick={abrirCadastro}
          className="h-12 gap-2 rounded-lg bg-slate-950 px-6 text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Cadastrar quadra
        </Button>
      </div>

      <AdminFeedback feedback={feedback} />

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr]">
          <label className="grid gap-1 text-xs font-bold text-zinc-500">
            Buscar
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome da quadra"
                className="h-12 rounded-lg bg-zinc-50 pl-11"
              />
            </div>
          </label>

          <FilterSelect
            label="Modalidade"
            value={modalidadeFiltro}
            onChange={setModalidadeFiltro}
          >
            <option value="TODAS">Todas</option>
            {modalidades.map((modalidade) => (
              <option key={modalidade.value} value={modalidade.value}>
                {modalidade.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Status"
            value={statusFiltro}
            onChange={(value) => setStatusFiltro(value as StatusFiltro)}
          >
            <option value="TODAS">Todas</option>
            <option value="ATIVAS">Ativas</option>
            <option value="INATIVAS">Inativas</option>
          </FilterSelect>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        {loading ? (
          <p className="p-5 text-sm font-semibold text-zinc-500">
            Carregando quadras...
          </p>
        ) : quadrasFiltradas.length === 0 ? (
          <p className="p-5 text-sm font-semibold text-zinc-500">
            Nenhuma quadra encontrada.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[780px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs font-black text-zinc-600">
                  <th className="px-5 py-4">Quadra</th>
                  <th className="px-5 py-4">Modalidade</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {quadrasFiltradas.map((quadra) => (
                  <tr
                    key={quadra.id}
                    className="border-b border-zinc-100 last:border-b-0"
                  >
                    <td className="px-5 py-3">
                      <p className="font-black text-zinc-950">{quadra.nome}</p>
                      <p className="text-xs font-semibold text-zinc-400">
                        {getPisoLabel(quadra.tipo_piso)}
                        {quadra.coberta ? " - Coberta" : ""}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-semibold text-zinc-700">
                      {getModalidadeLabel(quadra.modalidade)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={[
                          "inline-flex rounded-md px-3 py-1 text-xs font-black",
                          getStatusClass(quadra.ativa),
                        ].join(" ")}
                      >
                        {quadra.ativa ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={acaoQuadraId === quadra.id}
                          onClick={() => void preencherFormularioParaEditar(quadra)}
                          className="h-9 gap-2 rounded-lg bg-white"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          disabled={acaoQuadraId === quadra.id}
                          onClick={() => void toggleStatus(quadra)}
                          className="h-9 gap-2 rounded-lg bg-white"
                        >
                          {quadra.ativa ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          {quadra.ativa ? "Inativar" : "Ativar"}
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              disabled={acaoQuadraId === quadra.id}
                              className="h-9 w-9 rounded-full"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => void excluirQuadraSelecionada(quadra)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
