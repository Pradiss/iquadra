"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { MapPin, Search } from "lucide-react";

import {
  AgendaFilterBar,
  agendaFiltroInicial,
  type AgendaFiltros,
} from "@/components/jogador/painel/agenda-filter-bar";
import {
  AcademiaSearchModal,
  type AcademiaBusca,
} from "@/components/jogador/painel/academia-search-modal";
import { AgendaList } from "@/components/jogador/painel/agenda-list";
import { AgendarJogoDialog } from "@/components/jogador/painel/agendar-jogo-dialog";
import { AgendaCalendar } from "@/components/jogador/painel/agenda-calendar";

import {
  listarAcademias,
  listarQuadrasDaAcademia,
  obterDisponibilidadeQuadra,
} from "@/services/jogador.service";
import api from "@/services/api";
import { salvarUltimaAcademia } from "@/lib/last-academia";

type Academia = AcademiaBusca;

type Quadra = {
  id: string;
  nome: string;
  tipo_piso?: string | null;
  modalidade?: string | null;
  valor_hora?: number | null;
  coberta?: boolean | null;
  capacidade_minima?: number;
  capacidade_maxima?: number;
  permite_simples?: boolean;
  permite_dupla?: boolean;
};

type Participante = {
  id: string;
  nome: string;
  foto_perfil?: string | null;
  categoria?: string | null;
};

type HorarioAgenda = {
  id: string;
  hora: string;
  horaFim: string;
  quadraId: string;
  quadraNome: string;
  disponivel: boolean;
  motivo: "JOGO" | "AULA" | "BLOQUEADO" | null;
  capacidadeMinima: number;
  capacidadeMaxima: number;
  permiteSimples: boolean;
  permiteDupla: boolean;
  jogadoresConfirmados: number;
  vagasDisponiveis: number;
  jogo?: {
    id: string;
    criador_usuario_id?: string;
    tipo_jogo?: "SIMPLES" | "DUPLA";
    status?: string;
    maximo_participantes?: number;
    jogadores_confirmados?: number;
    vagas_disponiveis?: number;
    observacoes?: string | null;
    participantes: Participante[];
  } | null;
};

type HorarioSelecionado = {
  id: string;
  hora: string;
  fim?: string;
  quadraId: string;
  quadraNome: string;
  capacidadeMaxima: number;
  permiteSimples: boolean;
  permiteDupla: boolean;
  jogoId?: string;
  criadorUsuarioId?: string;
  status?: string;
  tipoJogo?: "SIMPLES" | "DUPLA";
  maximoParticipantes?: number;
  jogadoresConfirmados?: number;
  vagasDisponiveis?: number;
  participantes?: Participante[];
};

type SlotDisponibilidade = {
  inicio: string;
  fim: string;
  disponivel: boolean;
  motivo: "JOGO" | "AULA" | "BLOQUEADO" | null;
  capacidade_minima?: number;
  capacidade_maxima?: number;
  permite_simples?: boolean;
  permite_dupla?: boolean;
  jogadores_confirmados?: number;
  vagas_disponiveis?: number;
  jogo?: {
    id: string;
    criador_usuario_id?: string;
    tipo_jogo?: "SIMPLES" | "DUPLA";
    status?: string;
    maximo_participantes?: number;
    jogadores_confirmados?: number;
    vagas_disponiveis?: number;
    observacoes?: string | null;
    participantes?: Participante[];
  } | null;
};

type DisponibilidadeResponse = {
  quadra?: {
    capacidade_minima?: number;
    capacidade_maxima?: number;
    permite_simples?: boolean;
    permite_dupla?: boolean;
  };
  slots?: SlotDisponibilidade[];
};

function montarHorariosDaQuadra(
  quadra: Quadra,
  response: DisponibilidadeResponse
): HorarioAgenda[] {
  const slots = Array.isArray(response.slots) ? response.slots : [];

  return slots.map((slot): HorarioAgenda => {
    const participantes = slot.jogo?.participantes ?? [];

    const capacidadeMinima = Number(
      slot.capacidade_minima ??
        response.quadra?.capacidade_minima ??
        quadra.capacidade_minima ??
        2
    );

    const capacidadeMaxima = Number(
      slot.capacidade_maxima ??
        response.quadra?.capacidade_maxima ??
        quadra.capacidade_maxima ??
        4
    );

    const jogadoresConfirmados = Number(
      slot.jogadores_confirmados ??
        slot.jogo?.jogadores_confirmados ??
        participantes.length
    );

    const maximoParticipantesJogo =
      slot.jogo?.maximo_participantes ?? capacidadeMaxima;

    return {
      id: `${quadra.id}-${slot.inicio}`,
      hora: slot.inicio,
      horaFim: slot.fim,
      quadraId: quadra.id,
      quadraNome: quadra.nome,
      disponivel: slot.disponivel,
      motivo: slot.motivo,
      capacidadeMinima,
      capacidadeMaxima,
      permiteSimples: Boolean(
        slot.permite_simples ??
          response.quadra?.permite_simples ??
          quadra.permite_simples ??
          true
      ),
      permiteDupla: Boolean(
        slot.permite_dupla ??
          response.quadra?.permite_dupla ??
          quadra.permite_dupla ??
          true
      ),
      jogadoresConfirmados,
      vagasDisponiveis: Number(
        slot.vagas_disponiveis ??
          slot.jogo?.vagas_disponiveis ??
          Math.max(maximoParticipantesJogo - jogadoresConfirmados, 0)
      ),
      jogo: slot.jogo
        ? {
            ...slot.jogo,
            participantes,
          }
        : null,
    };
  });
}

function formatarAcademiaAtual(academia?: Academia | null) {
  if (!academia) return "Selecionar academia";

  const cidade = academia.cidade?.trim();
  const estado = academia.estado?.trim();
  const local = cidade && estado ? `${cidade} - ${estado}` : cidade || estado;

  return local ? `${academia.nome} • ${local}` : academia.nome;
}

export default function AcademiaAgendaPage() {
  const params = useParams<{ id?: string }>();
  const agendaRequestIdRef = useRef(0);

  const [modalAcademiasOpen, setModalAcademiasOpen] = useState(false);
  const [academias, setAcademias] = useState<Academia[]>([]);

  const [academia, setAcademia] = useState<Academia | null>(null);
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [horarios, setHorarios] = useState<HorarioAgenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [filtrosQuadra, setFiltrosQuadra] =
    useState<AgendaFiltros>(agendaFiltroInicial);

  const [dataSelecionada, setDataSelecionada] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] =
    useState<HorarioSelecionado | null>(null);

  const academiaId = academia?.id ?? params.id ?? "";

  const quadrasFiltradas = useMemo(() => {
    return quadras.filter((quadra) => {
      const filtroPiso =
        filtrosQuadra.piso === "TODOS" || quadra.tipo_piso === filtrosQuadra.piso;

      const filtroCobertura =
        filtrosQuadra.cobertura === "TODAS" ||
        (filtrosQuadra.cobertura === "COBERTA" && quadra.coberta) ||
        (filtrosQuadra.cobertura === "DESCOBERTA" && !quadra.coberta);

      const filtroJogadores =
        filtrosQuadra.jogadores === "TODOS" ||
        (filtrosQuadra.jogadores === "2" && quadra.permite_simples) ||
        (filtrosQuadra.jogadores === "4" && quadra.permite_dupla);

      const filtroModalidade =
        filtrosQuadra.modalidade === "TODAS" ||
        quadra.modalidade === filtrosQuadra.modalidade;

      const valorHora = quadra.valor_hora ?? null;
      const filtroPreco =
        filtrosQuadra.preco === "TODOS" ||
        (valorHora !== null &&
          ((filtrosQuadra.preco === "ATE_50" && valorHora <= 50) ||
            (filtrosQuadra.preco === "50_100" &&
              valorHora > 50 &&
              valorHora <= 100) ||
            (filtrosQuadra.preco === "ACIMA_100" && valorHora > 100)));

      return (
        filtroPiso &&
        filtroCobertura &&
        filtroJogadores &&
        filtroModalidade &&
        filtroPreco
      );
    });
  }, [quadras, filtrosQuadra]);

  const horariosFiltrados = useMemo(() => {
    if (quadrasFiltradas.length === 0) return [];

    const idsPermitidos = new Set(quadrasFiltradas.map((quadra) => quadra.id));

    return horarios.filter((horario) => idsPermitidos.has(horario.quadraId));
  }, [horarios, quadrasFiltradas]);

  useEffect(() => {
    async function carregarAcademias() {
      try {
        const data = await listarAcademias();
        setAcademias(Array.isArray(data) ? data : []);
      } catch {
        setAcademias([]);
      }
    }

    void carregarAcademias();
  }, []);

  const carregarAgenda = useCallback(async () => {
    if (!academiaId || !dataSelecionada) return;

    const requestId = agendaRequestIdRef.current + 1;
    agendaRequestIdRef.current = requestId;
    setLoading(true);
    setErro("");

    try {
      const [academiaResponse, quadrasResponse] = await Promise.all([
        api.get(`/academias/${academiaId}`),
        listarQuadrasDaAcademia(academiaId),
      ]);

      const academiaApi = academiaResponse.data.data ?? academiaResponse.data;
      const quadrasApi = Array.isArray(quadrasResponse)
        ? (quadrasResponse as Quadra[])
        : [];

      if (quadrasApi.length === 0) {
        if (requestId !== agendaRequestIdRef.current) return;

        salvarUltimaAcademia(academiaApi?.id ?? academiaId);
        setAcademia(academiaApi);
        setQuadras(quadrasApi);
        setHorarios([]);
        return;
      }

      const resultados = await Promise.allSettled(
        quadrasApi.map(async (quadra) => {
          const response = (await obterDisponibilidadeQuadra(
            quadra.id,
            dataSelecionada
          )) as DisponibilidadeResponse;

          return montarHorariosDaQuadra(quadra, response);
        })
      );

      const agenda = resultados
        .filter((resultado) => resultado.status === "fulfilled")
        .flatMap((resultado) => resultado.value)
        .sort((a, b) => {
          const porHora = a.hora.localeCompare(b.hora);
          if (porHora !== 0) return porHora;

          return a.quadraNome.localeCompare(b.quadraNome);
        });

      if (requestId !== agendaRequestIdRef.current) return;

      salvarUltimaAcademia(academiaApi?.id ?? academiaId);
      setAcademia(academiaApi);
      setQuadras(quadrasApi);

      const teveErro = resultados.some(
        (resultado) => resultado.status === "rejected"
      );

      if (teveErro) {
        setErro("Alguns horários não puderam ser carregados.");
      }

      setHorarios(agenda);
    } catch {
      if (requestId !== agendaRequestIdRef.current) return;

      setAcademia(null);
      setQuadras([]);
      setHorarios([]);
      setErro("Não foi possível carregar a agenda.");
    } finally {
      if (requestId === agendaRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [academiaId, dataSelecionada]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarAgenda();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarAgenda]);

  function trocarAcademia(item: Academia) {
    salvarUltimaAcademia(item.id);
    setAcademia(item);
    setQuadras([]);
    setHorarios([]);
    setHorarioSelecionado(null);
    setDialogOpen(false);
    setErro("");
    setFiltrosQuadra(agendaFiltroInicial);
  }

  function selecionarHorario(horario: HorarioAgenda) {
    setHorarioSelecionado({
      id: horario.id,
      hora: horario.hora,
      fim: horario.horaFim,
      quadraId: horario.quadraId,
      quadraNome: horario.quadraNome,
      capacidadeMaxima: horario.capacidadeMaxima,
      permiteSimples: horario.permiteSimples,
      permiteDupla: horario.permiteDupla,
      jogoId: horario.jogo?.id,
      criadorUsuarioId: horario.jogo?.criador_usuario_id,
      status: horario.jogo?.status,
      tipoJogo: horario.jogo?.tipo_jogo,
      maximoParticipantes: horario.jogo?.maximo_participantes,
      jogadoresConfirmados: horario.jogadoresConfirmados,
      vagasDisponiveis: horario.vagasDisponiveis,
      participantes: horario.jogo?.participantes ?? [],
    });

    setDialogOpen(true);
  }

  function fecharDialog(open: boolean) {
    setDialogOpen(open);

    if (!open) {
      setHorarioSelecionado(null);
    }
  }

  return (
    <>
      <section className="max-w-5xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setModalAcademiasOpen(true)}
            className="flex h-16 w-full items-center gap-3 rounded-[28px] border border-zinc-200 bg-white px-5 text-left shadow-sm transition hover:border-zinc-300"
          >
            <MapPin className="h-6 w-6 shrink-0 text-green-700" />

            <span className="min-w-0 flex-1 truncate text-base font-black text-zinc-950 sm:text-lg">
              {formatarAcademiaAtual(academia)}
            </span>

            <Search className="h-6 w-6 shrink-0 text-green-700" />
          </button>

          <div className="mt-4">
            <AgendaFilterBar
              filtros={filtrosQuadra}
              onChange={setFiltrosQuadra}
            />
          </div>
        </div>

        <section>
          <AgendaCalendar
            dataSelecionada={dataSelecionada}
            onSelectData={setDataSelecionada}
          />

          {erro && (
            <p className="mb-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              {erro}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-zinc-500">Carregando agenda...</p>
          ) : horariosFiltrados.length === 0 ? (
            <p className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500">
              Nenhum horário encontrado para os filtros selecionados.
            </p>
          ) : (
            <AgendaList
              horarios={horariosFiltrados}
              onSelect={selecionarHorario}
            />
          )}
        </section>
      </section>

      <AcademiaSearchModal
        open={modalAcademiasOpen}
        academias={academias}
        selectedAcademia={academia}
        onOpenChange={setModalAcademiasOpen}
        onSelect={trocarAcademia}
      />

      <AgendarJogoDialog
        open={dialogOpen}
        onOpenChange={fecharDialog}
        horario={horarioSelecionado}
        data={dataSelecionada}
        academiaId={academiaId}
        onSuccess={carregarAgenda}
      />
    </>
  );
}
