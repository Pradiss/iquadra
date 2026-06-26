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
  obterDisponibilidadeAcademia,
} from "@/services/jogador.service";
import { salvarUltimaAcademia } from "@/lib/last-academia";

type Academia = AcademiaBusca;
type DuracaoReserva = 60 | 90 | 120;

type EventoOcupado = {
  tipo: "JOGO" | "AULA" | "BLOQUEIO";
  id: string;
  inicio: string;
  fim: string;
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
  aberta?: boolean;
  motivo?: string | null;
  abre_as?: string | null;
  fecha_as?: string | null;
  intervalo_entre_reservas_minutos?: number;
  granularidade_agendamento_minutos?: number;
  duracoes_reserva_minutos?: DuracaoReserva[];
  duracao_slot_minutos?: number | null;
  eventos_ocupados?: EventoOcupado[];
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
  duracaoMinutos?: DuracaoReserva;
  duracoesDisponiveis?: DuracaoReserva[];
};

type HorarioSelecionado = {
  id: string;
  hora: string;
  fim?: string;
  duracaoMinutos?: DuracaoReserva;
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
  quadra?: Partial<Quadra>;
  aberta?: boolean;
  motivo?: string | null;
  abre_as?: string | null;
  fecha_as?: string | null;
  intervalo_entre_reservas_minutos?: number;
  granularidade_agendamento_minutos?: number;
  duracoes_reserva_minutos?: DuracaoReserva[];
  duracao_slot_minutos?: number | null;
  eventos_ocupados?: EventoOcupado[];
  slots?: SlotDisponibilidade[];
};

type DisponibilidadeAcademiaResponse = {
  academia?: Academia;
  quadras?: DisponibilidadeResponse[];
};

type AgendaCacheSnapshot = {
  academia: Academia | null;
  quadras: Quadra[];
  horarios: HorarioAgenda[];
  savedAt: number;
};

const AGENDA_CACHE_PREFIX = "playfy_agenda_snapshot_v3";
const AGENDA_CACHE_MAX_AGE_MS = 60 * 1000;
const MAX_DIAS_AGENDAMENTO = 1;
const DURACOES_PADRAO: DuracaoReserva[] = [60, 90, 120];
const GRANULARIDADE_PADRAO_MINUTOS = 5;
const INTERVALO_PADRAO_MINUTOS = 0;

function getAgendaCacheKey(academiaId: string, data: string) {
  return `${AGENDA_CACHE_PREFIX}:${academiaId}:${data}`;
}

function safeStorageGet(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

function safeStorageRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

function timeToMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const remainingMinutes = (minutes % 60).toString().padStart(2, "0");

  return `${hours}:${remainingMinutes}`;
}

function addMinutesToTime(time: string, minutes: number) {
  return minutesToTime(timeToMinutes(time) + minutes);
}

function roundUpToGranularity(minutes: number, granularity: number) {
  return Math.ceil(minutes / granularity) * granularity;
}

function getMinutosAgora(granularity: number) {
  const agora = new Date();
  return roundUpToGranularity(
    agora.getHours() * 60 + agora.getMinutes() + 1,
    granularity,
  );
}

function getMinHoraParaData(data: string, granularity: number) {
  if (data !== format(new Date(), "yyyy-MM-dd")) return null;

  const minutos = getMinutosAgora(granularity);
  return minutos >= 24 * 60 ? null : minutesToTime(minutos);
}

function normalizarDuracoes(duracoes?: number[] | null): DuracaoReserva[] {
  const permitidas = new Set(DURACOES_PADRAO);
  const normalizadas = (duracoes ?? []).filter((duracao) =>
    permitidas.has(duracao as DuracaoReserva),
  ) as DuracaoReserva[];

  return normalizadas.length > 0 ? normalizadas : DURACOES_PADRAO;
}

function validarSobreposicaoLocal(
  eventos: EventoOcupado[],
  horaInicio: string,
  horaFim: string,
) {
  const inicioMinutos = timeToMinutes(horaInicio);
  const fimMinutos = timeToMinutes(horaFim);

  return eventos.find((evento) => {
    const eventoInicio = timeToMinutes(evento.inicio);
    const eventoFim = timeToMinutes(evento.fim);

    return eventoInicio < fimMinutos && eventoFim > inicioMinutos;
  });
}

function getDuracaoSlotMinutos(
  quadra: Quadra,
  response: DisponibilidadeResponse,
) {
  const duracao = Number(
    response.duracao_slot_minutos ?? quadra.duracao_slot_minutos ?? 90,
  );

  return Number.isFinite(duracao) && duracao > 0 ? duracao : 90;
}

function getDuracaoPreferida(
  duracoes: DuracaoReserva[],
  duracaoPreferida?: number | null,
) {
  if (duracaoPreferida && duracoes.includes(duracaoPreferida as DuracaoReserva)) {
    return duracaoPreferida as DuracaoReserva;
  }

  return duracoes[0] ?? DURACOES_PADRAO[0];
}

function getDuracoesValidasParaInicio(
  quadra: Quadra,
  data: string,
  horaInicio: string,
) {
  if (!quadra.aberta || !quadra.abre_as || !quadra.fecha_as) return [];

  const granularidade =
    quadra.granularidade_agendamento_minutos ?? GRANULARIDADE_PADRAO_MINUTOS;
  const inicioMinutos = timeToMinutes(horaInicio);
  const abreMinutos = timeToMinutes(quadra.abre_as);
  const fechaMinutos = timeToMinutes(quadra.fecha_as);
  const minHoraHoje = getMinHoraParaData(data, granularidade);

  if (inicioMinutos % granularidade !== 0) return [];
  if (inicioMinutos < abreMinutos) return [];
  if (minHoraHoje && inicioMinutos < timeToMinutes(minHoraHoje)) return [];

  return normalizarDuracoes(quadra.duracoes_reserva_minutos).filter(
    (duracao) => {
      const fimMinutos = inicioMinutos + duracao;

      if (fimMinutos > fechaMinutos) return false;

      return !validarSobreposicaoLocal(
        quadra.eventos_ocupados ?? [],
        horaInicio,
        minutesToTime(fimMinutos),
      );
    },
  );
}

function montarHorarioJogo(
  quadra: Quadra,
  response: DisponibilidadeResponse,
  evento: EventoOcupado,
): HorarioAgenda {
  const participantes = evento.jogo?.participantes ?? [];
  const capacidadeMaxima = Number(
    evento.jogo?.maximo_participantes ??
      response.quadra?.capacidade_maxima ??
      quadra.capacidade_maxima ??
      4,
  );
  const jogadoresConfirmados = Number(
    evento.jogo?.jogadores_confirmados ?? participantes.length,
  );

  return {
    id: `${quadra.id}-${evento.id}`,
    hora: evento.inicio,
    horaFim: evento.fim,
    quadraId: quadra.id,
    quadraNome: quadra.nome,
    disponivel: false,
    motivo: "JOGO",
    capacidadeMinima: Number(
      response.quadra?.capacidade_minima ?? quadra.capacidade_minima ?? 2,
    ),
    capacidadeMaxima,
    permiteSimples: Boolean(
      response.quadra?.permite_simples ?? quadra.permite_simples ?? true,
    ),
    permiteDupla: Boolean(
      response.quadra?.permite_dupla ?? quadra.permite_dupla ?? true,
    ),
    jogadoresConfirmados,
    vagasDisponiveis: Number(
      evento.jogo?.vagas_disponiveis ??
        Math.max(capacidadeMaxima - jogadoresConfirmados, 0),
    ),
    jogo: evento.jogo
      ? {
          id: evento.jogo.id,
          criador_usuario_id: evento.jogo.criador_usuario_id,
          tipo_jogo: evento.jogo.tipo_jogo,
          status: evento.jogo.status,
          maximo_participantes: evento.jogo.maximo_participantes,
          jogadores_confirmados: jogadoresConfirmados,
          vagas_disponiveis: evento.jogo.vagas_disponiveis,
          observacoes: evento.jogo.observacoes,
          participantes,
        }
      : null,
  };
}

function montarHorarioSlot(
  quadra: Quadra,
  response: DisponibilidadeResponse,
  data: string,
  slot: SlotDisponibilidade,
  slotIndex: number,
): HorarioAgenda {
  const duracaoSlot = Math.max(
    timeToMinutes(slot.fim) - timeToMinutes(slot.inicio),
    0,
  );
  const duracoesValidas = getDuracoesValidasParaInicio(
    quadra,
    data,
    slot.inicio,
  );
  const duracaoMinutos = getDuracaoPreferida(
    duracoesValidas.length > 0
      ? duracoesValidas
      : normalizarDuracoes(quadra.duracoes_reserva_minutos),
    duracaoSlot,
  );
  const slotEstaLivre =
    slot.disponivel !== false && !slot.motivo && duracoesValidas.length > 0;
  const participantes = slot.jogo?.participantes ?? [];

  const capacidadeMinima = Number(
    slot.capacidade_minima ??
      response.quadra?.capacidade_minima ??
      quadra.capacidade_minima ??
      2,
  );

  const capacidadeMaxima = Number(
    slot.capacidade_maxima ??
      response.quadra?.capacidade_maxima ??
      quadra.capacidade_maxima ??
      4,
  );

  const jogadoresConfirmados = Number(
    slot.jogadores_confirmados ??
      slot.jogo?.jogadores_confirmados ??
      participantes.length,
  );

  const maximoParticipantesJogo =
    slot.jogo?.maximo_participantes ?? capacidadeMaxima;

  return {
    id: `${quadra.id}-${slot.inicio}-${slot.fim}-${slotIndex}`,
    hora: slot.inicio,
    horaFim: slotEstaLivre ? addMinutesToTime(slot.inicio, duracaoMinutos) : slot.fim,
    quadraId: quadra.id,
    quadraNome: quadra.nome,
    disponivel: slotEstaLivre,
    motivo: slotEstaLivre ? null : (slot.motivo ?? "BLOQUEADO"),
    capacidadeMinima,
    capacidadeMaxima,
    permiteSimples: Boolean(
      slot.permite_simples ??
        response.quadra?.permite_simples ??
        quadra.permite_simples ??
        true,
    ),
    permiteDupla: Boolean(
      slot.permite_dupla ??
        response.quadra?.permite_dupla ??
        quadra.permite_dupla ??
        true,
    ),
    jogadoresConfirmados,
    vagasDisponiveis: Number(
      slot.vagas_disponiveis ??
        slot.jogo?.vagas_disponiveis ??
        Math.max(maximoParticipantesJogo - jogadoresConfirmados, 0),
    ),
    jogo: slot.jogo
      ? {
          ...slot.jogo,
          participantes,
        }
      : null,
    duracaoMinutos: slotEstaLivre ? duracaoMinutos : undefined,
    duracoesDisponiveis: duracoesValidas,
  };
}

function gerarSlotsVisuais(
  quadra: Quadra,
  response: DisponibilidadeResponse,
): SlotDisponibilidade[] {
  if (!quadra.aberta || !quadra.abre_as || !quadra.fecha_as) return [];

  const duracaoSlot = getDuracaoSlotMinutos(quadra, response);
  const duracoes = normalizarDuracoes(quadra.duracoes_reserva_minutos);
  const menorDuracao = Math.min(...duracoes);
  const eventos = quadra.eventos_ocupados ?? [];
  const slots: SlotDisponibilidade[] = [];

  let atual = timeToMinutes(quadra.abre_as);
  const fechamento = timeToMinutes(quadra.fecha_as);

  while (atual + menorDuracao <= fechamento) {
    const inicio = minutesToTime(atual);
    const fim = minutesToTime(Math.min(atual + duracaoSlot, fechamento));
    const eventoSobreposto = validarSobreposicaoLocal(eventos, inicio, fim);

    slots.push({
      inicio,
      fim,
      disponivel: !eventoSobreposto,
      motivo: eventoSobreposto
        ? eventoSobreposto.tipo === "BLOQUEIO"
          ? "BLOQUEADO"
          : eventoSobreposto.tipo
        : null,
      jogo: eventoSobreposto?.jogo ?? null,
    });

    atual += duracaoSlot;
  }

  return slots;
}

function readAgendaSnapshot(academiaId: string, data: string) {
  const raw = safeStorageGet(getAgendaCacheKey(academiaId, data));
  if (!raw) return null;

  try {
    const snapshot = JSON.parse(raw) as AgendaCacheSnapshot;
    const expired = Date.now() - snapshot.savedAt > AGENDA_CACHE_MAX_AGE_MS;

    if (
      expired ||
      !Array.isArray(snapshot.quadras) ||
      !Array.isArray(snapshot.horarios)
    ) {
      safeStorageRemove(getAgendaCacheKey(academiaId, data));
      return null;
    }

    return snapshot;
  } catch {
    safeStorageRemove(getAgendaCacheKey(academiaId, data));
    return null;
  }
}

function saveAgendaSnapshot(
  academiaId: string,
  data: string,
  snapshot: Omit<AgendaCacheSnapshot, "savedAt">,
) {
  safeStorageSet(
    getAgendaCacheKey(academiaId, data),
    JSON.stringify({
      ...snapshot,
      savedAt: Date.now(),
    }),
  );
}

function invalidateAgendaSnapshot(academiaId: string, data: string) {
  safeStorageRemove(getAgendaCacheKey(academiaId, data));
}

function montarHorariosDaQuadra(
  quadra: Quadra,
  response: DisponibilidadeResponse,
  data: string,
): HorarioAgenda[] {
  const eventos = Array.isArray(response.eventos_ocupados)
    ? response.eventos_ocupados
    : [];
  const horarios: HorarioAgenda[] = [];
  const jogosAdicionados = new Set<string>();

  eventos
    .filter((evento) => evento.tipo === "JOGO" && evento.jogo)
    .forEach((evento) => {
      horarios.push(montarHorarioJogo(quadra, response, evento));
      jogosAdicionados.add(evento.jogo?.id ?? evento.id);
    });

  const slots =
    Array.isArray(response.slots) && response.slots.length > 0
      ? response.slots
      : gerarSlotsVisuais(quadra, response);

  slots.forEach((slot, slotIndex) => {
    if (slot.jogo?.id && jogosAdicionados.has(slot.jogo.id)) return;

    horarios.push(montarHorarioSlot(quadra, response, data, slot, slotIndex));

    if (slot.jogo?.id) {
      jogosAdicionados.add(slot.jogo.id);
    }
  });

  return horarios;
}

function formatarAcademiaAtual(academia?: Academia | null) {
  if (!academia) return "Selecionar academia";

  const cidade = academia.cidade?.trim();
  const estado = academia.estado?.trim();
  const local = cidade && estado ? `${cidade} - ${estado}` : cidade || estado;

  return local ? `${academia.nome} • ${local}` : academia.nome;
}

function montarAgenda(disponibilidade: DisponibilidadeAcademiaResponse, data: string) {
  const quadrasDisponibilidade = Array.isArray(disponibilidade.quadras)
    ? disponibilidade.quadras
    : [];

  const quadras = quadrasDisponibilidade
    .filter((item) => Boolean(item.quadra))
    .map((item) => {
      const quadra = item.quadra;

      return {
      id: String(quadra?.id ?? ""),
      nome: String(quadra?.nome ?? "Quadra"),
      tipo_piso: quadra?.tipo_piso ?? null,
      modalidade: quadra?.modalidade ?? null,
      valor_hora: quadra?.valor_hora ?? null,
      coberta: quadra?.coberta ?? null,
      capacidade_minima: quadra?.capacidade_minima,
      capacidade_maxima: quadra?.capacidade_maxima,
      permite_simples: quadra?.permite_simples,
      permite_dupla: quadra?.permite_dupla,
      aberta: item.aberta ?? false,
      motivo: item.motivo ?? null,
      abre_as: item.abre_as ?? null,
      fecha_as: item.fecha_as ?? null,
      intervalo_entre_reservas_minutos:
        item.intervalo_entre_reservas_minutos ?? INTERVALO_PADRAO_MINUTOS,
      granularidade_agendamento_minutos:
        item.granularidade_agendamento_minutos ??
        GRANULARIDADE_PADRAO_MINUTOS,
      duracoes_reserva_minutos: normalizarDuracoes(
        item.duracoes_reserva_minutos,
      ),
      duracao_slot_minutos: item.duracao_slot_minutos ?? null,
      eventos_ocupados: Array.isArray(item.eventos_ocupados)
        ? item.eventos_ocupados
        : [],
      };
    })
    .filter((quadra) => Boolean(quadra.id)) as Quadra[];

  const quadrasById = new Map(quadras.map((quadra) => [quadra.id, quadra]));

  const horarios = quadrasDisponibilidade
    .flatMap((item) => {
      const quadraId = item.quadra?.id;
      const quadra = quadraId ? quadrasById.get(quadraId) : null;

      return quadra ? montarHorariosDaQuadra(quadra, item, data) : [];
    })
    .sort((a, b) => {
      const porHora = a.hora.localeCompare(b.hora);
      return porHora !== 0 ? porHora : a.quadraNome.localeCompare(b.quadraNome);
    });

  return {
    academia: disponibilidade.academia ?? null,
    quadras,
    horarios,
  };
}

export default function AcademiaAgendaPage() {
  const params = useParams<{ id?: string }>();
  const requestRef = useRef(0);

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
    format(new Date(), "yyyy-MM-dd"),
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
    let ativo = true;

    async function carregarAcademias() {
      try {
        const data = await listarAcademias();

        if (ativo) {
          setAcademias(Array.isArray(data) ? data : []);
        }
      } catch {
        if (ativo) {
          setAcademias([]);
        }
      }
    }

    void carregarAcademias();

    return () => {
      ativo = false;
    };
  }, []);

  const carregarAgenda = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (!academiaId || !dataSelecionada) return;

      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      if (force) {
        invalidateAgendaSnapshot(academiaId, dataSelecionada);
      }

      const snapshot = !force
        ? readAgendaSnapshot(academiaId, dataSelecionada)
        : null;

      if (snapshot) {
        setAcademia(snapshot.academia);
        setQuadras(snapshot.quadras);
        setHorarios(snapshot.horarios);
        setLoading(false);
      } else {
        setLoading(true);
      }

      setErro("");

      try {
        const disponibilidade = (await obterDisponibilidadeAcademia(
          academiaId,
          dataSelecionada,
        )) as DisponibilidadeAcademiaResponse;

        if (requestId !== requestRef.current) return;

        const agenda = montarAgenda(disponibilidade, dataSelecionada);

        salvarUltimaAcademia(agenda.academia?.id ?? academiaId);

        setAcademia(agenda.academia);
        setQuadras(agenda.quadras);
        setHorarios(agenda.horarios);

        saveAgendaSnapshot(academiaId, dataSelecionada, agenda);
      } catch {
        if (requestId !== requestRef.current) return;

        if (!snapshot) {
          setAcademia(null);
          setQuadras([]);
          setHorarios([]);
        }

        setErro("Não foi possível carregar a agenda.");
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
        }
      }
    },
    [academiaId, dataSelecionada],
  );

 useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void carregarAgenda();
  }, 0);

  return () => window.clearTimeout(timeoutId);
}, [carregarAgenda]);

  const handleAgendaMutationSuccess = useCallback(async () => {
    await carregarAgenda({ force: true });
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

  function selecionarData(data: string) {
    setDataSelecionada(data);
  }

  function selecionarHorario(horario: HorarioAgenda) {
    setHorarioSelecionado({
      id: horario.id,
      hora: horario.hora,
      fim: horario.horaFim,
      duracaoMinutos: horario.duracaoMinutos,
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
      <section>
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setModalAcademiasOpen(true)}
            className="flex h-12 w-full items-center gap-3 rounded-[30px] border border-zinc-200 bg-white px-5 text-left shadow-sm transition hover:border-zinc-300"
          >
            <MapPin className="h-6 w-6 shrink-0 text-green-700" />

            <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-zinc-950 sm:text-lg">
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
            onSelectData={selecionarData}
            maxDiasAgendamento={MAX_DIAS_AGENDAMENTO}
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
        quadras={quadrasFiltradas}
        data={dataSelecionada}
        academiaId={academiaId}
        onSuccess={handleAgendaMutationSuccess}
      />
    </>
  );
}
