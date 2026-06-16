"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { getUsuario } from "@/lib/auth-storage";
import { buscarUltimaAcademia, salvarUltimaAcademia } from "@/lib/last-academia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  bloquearHorario,
  criarQuadra,
  gerarHorarios,
  listarBloqueiosQuadra,
  listarHorariosQuadra,
  listarQuadras,
  type TipoPiso,
} from "@/services/admin.service";

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

type UsuarioComAcademias = {
  academias?: UsuarioAcademia[];
};

type Quadra = {
  id: string;
  nome: string;
  descricao?: string | null;
  tipo_piso?: TipoPiso;
  coberta?: boolean;
  ativa?: boolean;
};

type HorarioQuadra = {
  id: string;
  quadra_id: string;
  dia_semana: number;
  abre_as: string;
  fecha_as: string;
  duracao_slot_minutos: number;
  ativo: boolean;
};

type BloqueioQuadra = {
  id: string;
  quadra_id: string;
  inicio_em: string;
  fim_em: string;
  motivo: string;
};

type Feedback = {
  tipo: "success" | "error";
  mensagem: string;
};

type QuadraForm = {
  nome: string;
  descricao: string;
  tipo_piso: TipoPiso;
  coberta: boolean;
  capacidade_minima: string;
  capacidade_maxima: string;
  permite_simples: boolean;
  permite_dupla: boolean;
};

type HorarioForm = {
  quadra_id: string;
  dias_semana: number[];
  hora_inicio: string;
  hora_fim: string;
};

type BloqueioForm = {
  quadra_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  motivo: string;
};

const initialQuadraForm: QuadraForm = {
  nome: "",
  descricao: "",
  tipo_piso: "SINTETICA",
  coberta: false,
  capacidade_minima: "2",
  capacidade_maxima: "4",
  permite_simples: true,
  permite_dupla: true,
};

const initialHorarioForm: HorarioForm = {
  quadra_id: "",
  dias_semana: [],
  hora_inicio: "08:00",
  hora_fim: "22:00",
};

const initialBloqueioForm: BloqueioForm = {
  quadra_id: "",
  data: "",
  hora_inicio: "",
  hora_fim: "",
  motivo: "",
};

const diasSemana = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

const tiposPiso: { value: TipoPiso; label: string }[] = [
  { value: "SAIBRO", label: "Saibro" },
  { value: "HARD", label: "Hard" },
  { value: "GRAMA", label: "Grama" },
  { value: "SINTETICA", label: "Sintética" },
  { value: "AREIA", label: "Areia" },
  { value: "OUTRO", label: "Outro" },
];

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string; errors?: { message?: string }[] }>(
    error
  )) {
    const apiMessage = error.response?.data?.message;
    const firstError = error.response?.data?.errors?.[0]?.message;
    return firstError || apiMessage || fallback;
  }

  return fallback;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function escolherAcademia(usuario: UsuarioComAcademias | null): AcademiaPainel | null {
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

function isPeriodoValido(inicio: string, fim: string) {
  const inicioMinutos = timeToMinutes(inicio);
  const fimMinutos = timeToMinutes(fim);

  if (inicioMinutos === null || fimMinutos === null) {
    return false;
  }

  return fimMinutos > inicioMinutos;
}

export default function FormAdminQuadra() {
  const [academia] = useState<AcademiaPainel | null>(() =>
    escolherAcademia(getUsuario() as UsuarioComAcademias | null)
  );
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [horariosPorQuadra, setHorariosPorQuadra] = useState<
    Record<string, HorarioQuadra[]>
  >({});
  const [bloqueiosPorQuadra, setBloqueiosPorQuadra] = useState<
    Record<string, BloqueioQuadra[]>
  >({});

  const [loadingDados, setLoadingDados] = useState(Boolean(academia));
  const [loadingQuadra, setLoadingQuadra] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loadingBloqueio, setLoadingBloqueio] = useState(false);
  const [erroGeral, setErroGeral] = useState(
    academia ? "" : "Nenhuma academia foi encontrada para este usuário."
  );
  const [referenciaBloqueios, setReferenciaBloqueios] = useState(0);

  const [quadraForm, setQuadraForm] = useState<QuadraForm>(initialQuadraForm);
  const [horarioForm, setHorarioForm] =
    useState<HorarioForm>(initialHorarioForm);
  const [bloqueioForm, setBloqueioForm] =
    useState<BloqueioForm>(initialBloqueioForm);

  const [quadraFeedback, setQuadraFeedback] = useState<Feedback | null>(null);
  const [horarioFeedback, setHorarioFeedback] = useState<Feedback | null>(null);
  const [bloqueioFeedback, setBloqueioFeedback] = useState<Feedback | null>(
    null
  );

  const carregarDados = useCallback(async (academiaId: string) => {
    setLoadingDados(true);
    setErroGeral("");

    try {
      const quadrasResponse = (await listarQuadras(academiaId)) as Quadra[];
      const quadrasList = Array.isArray(quadrasResponse) ? quadrasResponse : [];

      const [horariosEntries, bloqueiosEntries] = await Promise.all([
        Promise.all(
          quadrasList.map(async (quadra) => {
            const horarios = (await listarHorariosQuadra(
              quadra.id
            )) as HorarioQuadra[];

            return [quadra.id, Array.isArray(horarios) ? horarios : []] as const;
          })
        ),
        Promise.all(
          quadrasList.map(async (quadra) => {
            const bloqueios = (await listarBloqueiosQuadra(
              quadra.id
            )) as BloqueioQuadra[];

            return [
              quadra.id,
              Array.isArray(bloqueios) ? bloqueios : [],
            ] as const;
          })
        ),
      ]);

      const quadrasIds = new Set(quadrasList.map((quadra) => quadra.id));

      setQuadras(quadrasList);
      setHorariosPorQuadra(Object.fromEntries(horariosEntries));
      setBloqueiosPorQuadra(Object.fromEntries(bloqueiosEntries));
      setReferenciaBloqueios(Date.now());
      setHorarioForm((current) => ({
        ...current,
        quadra_id: quadrasIds.has(current.quadra_id) ? current.quadra_id : "",
      }));
      setBloqueioForm((current) => ({
        ...current,
        quadra_id: quadrasIds.has(current.quadra_id) ? current.quadra_id : "",
      }));
    } catch (error) {
      setErroGeral(
        getErrorMessage(error, "Não foi possível carregar os dados do painel.")
      );
    } finally {
      setLoadingDados(false);
    }
  }, []);

  useEffect(() => {
    if (!academia) {
      return;
    }

    salvarUltimaAcademia(academia.id);

    const timer = window.setTimeout(() => {
      void carregarDados(academia.id);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [academia, carregarDados]);

  const resumo = useMemo(() => {
    const horariosCadastrados = Object.values(horariosPorQuadra).reduce(
      (total, horarios) => total + horarios.length,
      0
    );

    const bloqueiosAtivos = Object.values(bloqueiosPorQuadra).reduce(
      (total, bloqueios) =>
        total +
        bloqueios.filter((bloqueio) => {
          const fim = new Date(bloqueio.fim_em).getTime();
          return Number.isFinite(fim) && fim >= referenciaBloqueios;
        }).length,
      0
    );

    return {
      totalQuadras: quadras.length,
      horariosCadastrados,
      bloqueiosAtivos,
    };
  }, [
    bloqueiosPorQuadra,
    horariosPorQuadra,
    quadras.length,
    referenciaBloqueios,
  ]);

  async function handleCriarQuadra(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuadraFeedback(null);

    if (!academia) {
      setQuadraFeedback({
        tipo: "error",
        mensagem: "Não foi possível identificar a academia.",
      });
      return;
    }

    if (quadraForm.nome.trim().length < 2) {
      setQuadraFeedback({
        tipo: "error",
        mensagem: "Informe o nome da quadra.",
      });
      return;
    }

    const capacidadeMinima = Number(quadraForm.capacidade_minima);
    const capacidadeMaxima = Number(quadraForm.capacidade_maxima);

    if (
      !Number.isInteger(capacidadeMinima) ||
      !Number.isInteger(capacidadeMaxima) ||
      capacidadeMinima < 2 ||
      capacidadeMaxima > 4 ||
      capacidadeMaxima < capacidadeMinima
    ) {
      setQuadraFeedback({
        tipo: "error",
        mensagem: "Informe uma capacidade entre 2 e 4 jogadores.",
      });
      return;
    }

    try {
      setLoadingQuadra(true);

      const novaQuadra = (await criarQuadra(academia.id, {
        nome: quadraForm.nome.trim(),
        descricao: quadraForm.descricao.trim() || undefined,
        tipo_piso: quadraForm.tipo_piso,
        coberta: quadraForm.coberta,
        capacidade_minima: capacidadeMinima,
        capacidade_maxima: capacidadeMaxima,
        permite_simples: quadraForm.permite_simples,
        permite_dupla: quadraForm.permite_dupla,
      })) as Quadra;

      setQuadraForm(initialQuadraForm);
      setQuadraFeedback({
        tipo: "success",
        mensagem: "Quadra cadastrada com sucesso.",
      });

      if (novaQuadra?.id) {
        setHorarioForm((current) => ({ ...current, quadra_id: novaQuadra.id }));
        setBloqueioForm((current) => ({ ...current, quadra_id: novaQuadra.id }));
      }

      await carregarDados(academia.id);
    } catch (error) {
      setQuadraFeedback({
        tipo: "error",
        mensagem: getErrorMessage(error, "Não foi possível cadastrar a quadra."),
      });
    } finally {
      setLoadingQuadra(false);
    }
  }

  async function handleGerarHorarios(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHorarioFeedback(null);

    if (!academia) {
      setHorarioFeedback({
        tipo: "error",
        mensagem: "Não foi possível identificar a academia.",
      });
      return;
    }

    if (!horarioForm.quadra_id) {
      setHorarioFeedback({
        tipo: "error",
        mensagem: "Escolha a quadra que receberá os horários.",
      });
      return;
    }

    if (horarioForm.dias_semana.length === 0) {
      setHorarioFeedback({
        tipo: "error",
        mensagem: "Escolha pelo menos um dia da semana.",
      });
      return;
    }

    if (!isPeriodoValido(horarioForm.hora_inicio, horarioForm.hora_fim)) {
      setHorarioFeedback({
        tipo: "error",
        mensagem: "A hora final precisa ser maior que a hora inicial.",
      });
      return;
    }

    const inicioMinutos = timeToMinutes(horarioForm.hora_inicio);
    const fimMinutos = timeToMinutes(horarioForm.hora_fim);

    if (
      inicioMinutos === null ||
      fimMinutos === null ||
      fimMinutos - inicioMinutos < 90
    ) {
      setHorarioFeedback({
        tipo: "error",
        mensagem: "O período precisa ter pelo menos 90 minutos.",
      });
      return;
    }

    try {
      setLoadingHorarios(true);

      await gerarHorarios({
        quadra_id: horarioForm.quadra_id,
        dias_semana: horarioForm.dias_semana,
        hora_inicio: horarioForm.hora_inicio,
        hora_fim: horarioForm.hora_fim,
        duracao_minutos: 90,
      });

      setHorarioFeedback({
        tipo: "success",
        mensagem: "Horários de 90 minutos gerados com sucesso.",
      });
      await carregarDados(academia.id);
    } catch (error) {
      setHorarioFeedback({
        tipo: "error",
        mensagem: getErrorMessage(error, "Não foi possível gerar os horários."),
      });
    } finally {
      setLoadingHorarios(false);
    }
  }

  async function handleBloquearHorario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBloqueioFeedback(null);

    if (!academia) {
      setBloqueioFeedback({
        tipo: "error",
        mensagem: "Não foi possível identificar a academia.",
      });
      return;
    }

    if (!bloqueioForm.quadra_id) {
      setBloqueioFeedback({
        tipo: "error",
        mensagem: "Escolha a quadra que será bloqueada.",
      });
      return;
    }

    if (!bloqueioForm.data) {
      setBloqueioFeedback({
        tipo: "error",
        mensagem: "Informe a data do bloqueio.",
      });
      return;
    }

    if (!isPeriodoValido(bloqueioForm.hora_inicio, bloqueioForm.hora_fim)) {
      setBloqueioFeedback({
        tipo: "error",
        mensagem: "A hora final precisa ser maior que a hora inicial.",
      });
      return;
    }

    if (bloqueioForm.motivo.trim().length < 3) {
      setBloqueioFeedback({
        tipo: "error",
        mensagem: "Informe um motivo para o bloqueio.",
      });
      return;
    }

    try {
      setLoadingBloqueio(true);

      await bloquearHorario({
        quadra_id: bloqueioForm.quadra_id,
        data: bloqueioForm.data,
        hora_inicio: bloqueioForm.hora_inicio,
        hora_fim: bloqueioForm.hora_fim,
        motivo: bloqueioForm.motivo.trim(),
      });

      setBloqueioForm((current) => ({
        ...initialBloqueioForm,
        quadra_id: current.quadra_id,
      }));
      setBloqueioFeedback({
        tipo: "success",
        mensagem: "Horário bloqueado com sucesso.",
      });
      await carregarDados(academia.id);
    } catch (error) {
      setBloqueioFeedback({
        tipo: "error",
        mensagem: getErrorMessage(error, "Não foi possível bloquear o horário."),
      });
    } finally {
      setLoadingBloqueio(false);
    }
  }

  function toggleDiaSemana(dia: number) {
    setHorarioForm((current) => {
      const selecionado = current.dias_semana.includes(dia);

      return {
        ...current,
        dias_semana: selecionado
          ? current.dias_semana.filter((item) => item !== dia)
          : [...current.dias_semana, dia],
      };
    });
  }

  return (
    <div className="grid gap-5">
      {academia?.nome && (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-600 shadow-sm">
          Academia selecionada:{" "}
          <span className="text-zinc-950">{academia.nome}</span>
        </p>
      )}

      {erroGeral && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {erroGeral}
        </p>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <ResumoCard
          label="Total de quadras"
          value={loadingDados ? "..." : resumo.totalQuadras}
          description="Quadras cadastradas na academia"
        />
        <ResumoCard
          label="Horários cadastrados"
          value={loadingDados ? "..." : resumo.horariosCadastrados}
          description="Regras de agenda por dia da semana"
        />
        <ResumoCard
          label="Bloqueios ativos"
          value={loadingDados ? "..." : resumo.bloqueiosAtivos}
          description="Períodos que impedem novas reservas"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <FormCard
          title="Cadastrar quadra"
          description="Adicione uma quadra para que ela apareça nos agendamentos."
        >
          <FeedbackMessage feedback={quadraFeedback} />

          <form onSubmit={handleCriarQuadra} className="grid gap-3">
            <Campo label="Nome da quadra">
              <Input
                value={quadraForm.nome}
                onChange={(event) =>
                  setQuadraForm((current) => ({
                    ...current,
                    nome: event.target.value,
                  }))
                }
                placeholder="Ex: Quadra 1"
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="Descrição curta">
              <Textarea
                value={quadraForm.descricao}
                onChange={(event) =>
                  setQuadraForm((current) => ({
                    ...current,
                    descricao: event.target.value,
                  }))
                }
                placeholder="Ex: Quadra coberta próxima à recepção"
                className="min-h-20 rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="Tipo de piso">
              <select
                value={quadraForm.tipo_piso}
                onChange={(event) =>
                  setQuadraForm((current) => ({
                    ...current,
                    tipo_piso: event.target.value as TipoPiso,
                  }))
                }
                className="h-[50px] w-full rounded-xl border border-input bg-gray-50 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {tiposPiso.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </Campo>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Campo label="Capacidade mínima">
                <Input
                  type="number"
                  min={2}
                  max={4}
                  value={quadraForm.capacidade_minima}
                  onChange={(event) =>
                    setQuadraForm((current) => ({
                      ...current,
                      capacidade_minima: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Campo>

              <Campo label="Capacidade máxima">
                <Input
                  type="number"
                  min={2}
                  max={4}
                  value={quadraForm.capacidade_maxima}
                  onChange={(event) =>
                    setQuadraForm((current) => ({
                      ...current,
                      capacidade_maxima: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Campo>
            </div>

            <div className="grid gap-2 rounded-2xl bg-gray-50 p-3">
              <CheckboxField
                checked={quadraForm.coberta}
                label="Quadra coberta"
                onChange={(checked) =>
                  setQuadraForm((current) => ({
                    ...current,
                    coberta: checked,
                  }))
                }
              />
              <CheckboxField
                checked={quadraForm.permite_simples}
                label="Permite jogo simples"
                onChange={(checked) =>
                  setQuadraForm((current) => ({
                    ...current,
                    permite_simples: checked,
                  }))
                }
              />
              <CheckboxField
                checked={quadraForm.permite_dupla}
                label="Permite jogo em dupla"
                onChange={(checked) =>
                  setQuadraForm((current) => ({
                    ...current,
                    permite_dupla: checked,
                  }))
                }
              />
            </div>

            <Button
              type="submit"
              disabled={loadingQuadra || loadingDados}
              className="mt-2 h-[50px] rounded-xl bg-gray-900 text-white hover:bg-black disabled:opacity-60"
            >
              {loadingQuadra ? "Salvando..." : "Cadastrar quadra"}
            </Button>
          </form>
        </FormCard>

        <FormCard
          title="Gerar horários fixos"
          description="Crie a agenda semanal da quadra. Cada slot sempre terá 90 minutos."
        >
          <FeedbackMessage feedback={horarioFeedback} />

          <form onSubmit={handleGerarHorarios} className="grid gap-3">
            <Campo label="Quadra">
              <QuadraSelect
                value={horarioForm.quadra_id}
                quadras={quadras}
                disabled={quadras.length === 0}
                onChange={(value) =>
                  setHorarioForm((current) => ({
                    ...current,
                    quadra_id: value,
                  }))
                }
              />
            </Campo>

            <div>
              <p className="mb-2 text-xs font-semibold text-gray-700">
                Dias da semana
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
                {diasSemana.map((dia) => (
                  <label
                    key={dia.value}
                    className={[
                      "flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition",
                      horarioForm.dias_semana.includes(dia.value)
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-gray-50 text-gray-700",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={horarioForm.dias_semana.includes(dia.value)}
                      onChange={() => toggleDiaSemana(dia.value)}
                      className="h-4 w-4"
                    />
                    {dia.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Campo label="Hora inicial">
                <Input
                  type="time"
                  value={horarioForm.hora_inicio}
                  onChange={(event) =>
                    setHorarioForm((current) => ({
                      ...current,
                      hora_inicio: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Campo>

              <Campo label="Hora final">
                <Input
                  type="time"
                  value={horarioForm.hora_fim}
                  onChange={(event) =>
                    setHorarioForm((current) => ({
                      ...current,
                      hora_fim: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Campo>
            </div>

            <p className="rounded-2xl bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800">
              O sistema vai gerar automaticamente os horários entre a hora
              inicial e a hora final, sempre em slots de 90 minutos.
            </p>

            <Button
              type="submit"
              disabled={loadingHorarios || loadingDados || quadras.length === 0}
              className="mt-2 h-[50px] rounded-xl bg-gray-900 text-white hover:bg-black disabled:opacity-60"
            >
              {loadingHorarios ? "Gerando..." : "Gerar horários fixos"}
            </Button>
          </form>
        </FormCard>

        <FormCard
          title="Bloquear horário"
          description="Impeça reservas em uma quadra durante um período específico."
        >
          <FeedbackMessage feedback={bloqueioFeedback} />

          <form onSubmit={handleBloquearHorario} className="grid gap-3">
            <Campo label="Quadra">
              <QuadraSelect
                value={bloqueioForm.quadra_id}
                quadras={quadras}
                disabled={quadras.length === 0}
                onChange={(value) =>
                  setBloqueioForm((current) => ({
                    ...current,
                    quadra_id: value,
                  }))
                }
              />
            </Campo>

            <Campo label="Data">
              <Input
                type="date"
                value={bloqueioForm.data}
                onChange={(event) =>
                  setBloqueioForm((current) => ({
                    ...current,
                    data: event.target.value,
                  }))
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Campo label="Hora inicial">
                <Input
                  type="time"
                  value={bloqueioForm.hora_inicio}
                  onChange={(event) =>
                    setBloqueioForm((current) => ({
                      ...current,
                      hora_inicio: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Campo>

              <Campo label="Hora final">
                <Input
                  type="time"
                  value={bloqueioForm.hora_fim}
                  onChange={(event) =>
                    setBloqueioForm((current) => ({
                      ...current,
                      hora_fim: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </Campo>
            </div>

            <Campo label="Motivo">
              <Textarea
                value={bloqueioForm.motivo}
                onChange={(event) =>
                  setBloqueioForm((current) => ({
                    ...current,
                    motivo: event.target.value,
                  }))
                }
                placeholder="Ex: manutenção, evento interno ou feriado"
                className="min-h-24 rounded-xl bg-gray-50"
              />
            </Campo>

            <Button
              type="submit"
              disabled={loadingBloqueio || loadingDados || quadras.length === 0}
              className="mt-2 h-[50px] rounded-xl bg-gray-900 text-white hover:bg-black disabled:opacity-60"
            >
              {loadingBloqueio ? "Bloqueando..." : "Bloquear horário"}
            </Button>
          </form>
        </FormCard>
      </section>
    </div>
  );
}

function ResumoCard({
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

function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-zinc-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
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
  if (!feedback) {
    return null;
  }

  const color =
    feedback.tipo === "success"
      ? "bg-lime-50 text-lime-800"
      : "bg-red-50 text-red-700";

  return (
    <p className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${color}`}>
      {feedback.mensagem}
    </p>
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

function QuadraSelect({
  value,
  quadras,
  disabled,
  onChange,
}: {
  value: string;
  quadras: Quadra[];
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
