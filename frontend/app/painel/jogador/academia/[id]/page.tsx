"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { Clock, MapPin, Search } from "lucide-react";

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
import { Button } from "@/components/ui/button";

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

const AGENDA_CACHE_PREFIX = "playfy_agenda_snapshot_v2";
const AGENDA_CACHE_MAX_AGE_MS = 60 * 1000;
const MAX_DIAS_AGENDAMENTO = 1;
const DURACOES_PADRAO: DuracaoReserva[] = [60, 90, 120];
const GRANULARIDADE_PADRAO_MINUTOS = 5;
const INTERVALO_PADRAO_MINUTOS = 10;

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

function validarConflitoLocal(
  eventos: EventoOcupado[],
  horaInicio: string,
  horaFim: string,
  intervaloMinutos: number,
) {
  const inicioMinutos = timeToMinutes(horaInicio);
  const fimMinutos = timeToMinutes(horaFim);

  return eventos.some((evento) => {
    const eventoInicio = timeToMinutes(evento.inicio);
    const eventoFim = timeToMinutes(evento.fim);

    return (
      eventoInicio < fimMinutos + intervaloMinutos &&
      eventoFim > inicioMinutos - intervaloMinutos
    );
  });
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
): HorarioAgenda[] {
  const eventos = Array.isArray(response.eventos_ocupados)
    ? response.eventos_ocupados
    : [];

  if (eventos.length > 0) {
    return eventos
      .filter((evento) => evento.tipo === "JOGO" && evento.jogo)
      .map((evento): HorarioAgenda => {
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
            response.quadra?.capacidade_minima ??
              quadra.capacidade_minima ??
              2,
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
          jogo: {
            id: evento.jogo!.id,
            criador_usuario_id: evento.jogo!.criador_usuario_id,
            tipo_jogo: evento.jogo!.tipo_jogo,
            status: evento.jogo!.status,
            maximo_participantes: evento.jogo!.maximo_participantes,
            jogadores_confirmados: jogadoresConfirmados,
            vagas_disponiveis: evento.jogo!.vagas_disponiveis,
            observacoes: evento.jogo!.observacoes,
            participantes,
          },
        };
      });
  }

  const slots = Array.isArray(response.slots) ? response.slots : [];

  return slots.filter((slot) => slot.jogo).map((slot): HorarioAgenda => {
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

function montarAgenda(disponibilidade: DisponibilidadeAcademiaResponse) {
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

      return quadra ? montarHorariosDaQuadra(quadra, item) : [];
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
  const [quadraReservaId, setQuadraReservaId] = useState("");
  const [horaInicioReserva, setHoraInicioReserva] = useState("");
  const [duracaoReserva, setDuracaoReserva] =
    useState<DuracaoReserva>(DURACOES_PADRAO[0]);
  const [erroReserva, setErroReserva] = useState("");

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

  const quadraReserva = useMemo(() => {
    return (
      quadrasFiltradas.find((quadra) => quadra.id === quadraReservaId) ??
      quadrasFiltradas[0] ??
      null
    );
  }, [quadrasFiltradas, quadraReservaId]);

  const duracoesReserva = useMemo(
    () => normalizarDuracoes(quadraReserva?.duracoes_reserva_minutos),
    [quadraReserva?.duracoes_reserva_minutos],
  );
  const duracaoReservaAtual = duracoesReserva.includes(duracaoReserva)
    ? duracaoReserva
    : duracoesReserva[0];

  const granularidadeReserva =
    quadraReserva?.granularidade_agendamento_minutos ??
    GRANULARIDADE_PADRAO_MINUTOS;
  const intervaloReserva =
    quadraReserva?.intervalo_entre_reservas_minutos ??
    INTERVALO_PADRAO_MINUTOS;
  const minHoraHoje = getMinHoraParaData(dataSelecionada, granularidadeReserva);
  const horaMinimaReserva =
    minHoraHoje && quadraReserva?.abre_as
      ? minutesToTime(
          Math.max(
            timeToMinutes(minHoraHoje),
            timeToMinutes(quadraReserva.abre_as),
          ),
        )
      : (minHoraHoje ?? quadraReserva?.abre_as ?? undefined);
  const horaInicioReservaAtual = useMemo(() => {
    const fallback = horaMinimaReserva ?? quadraReserva?.abre_as ?? "";

    if (!horaInicioReserva) return fallback;
    if (
      horaMinimaReserva &&
      timeToMinutes(horaInicioReserva) < timeToMinutes(horaMinimaReserva)
    ) {
      return horaMinimaReserva;
    }

    return horaInicioReserva;
  }, [horaInicioReserva, horaMinimaReserva, quadraReserva?.abre_as]);
  const horaFimReserva = horaInicioReservaAtual
    ? addMinutesToTime(horaInicioReservaAtual, duracaoReservaAtual)
    : "";

  const erroValidacaoReserva = useMemo(() => {
    if (!quadraReserva) return "Selecione uma quadra.";
    if (!quadraReserva.aberta) {
      return quadraReserva.motivo || "Quadra fechada nesta data.";
    }
    if (!quadraReserva.abre_as || !quadraReserva.fecha_as) {
      return "Quadra sem horário configurado para esta data.";
    }
    if (!horaInicioReservaAtual) return "Informe o horário inicial.";

    const inicioMinutos = timeToMinutes(horaInicioReservaAtual);
    const fimMinutos = timeToMinutes(horaFimReserva);
    const abreMinutos = timeToMinutes(quadraReserva.abre_as);
    const fechaMinutos = timeToMinutes(quadraReserva.fecha_as);

    if (inicioMinutos % granularidadeReserva !== 0) {
      return `Escolha horários em intervalos de ${granularidadeReserva} minutos.`;
    }

    if (inicioMinutos < abreMinutos || fimMinutos > fechaMinutos) {
      return `Reserva deve ficar entre ${quadraReserva.abre_as} e ${quadraReserva.fecha_as}.`;
    }

    if (minHoraHoje && inicioMinutos < timeToMinutes(minHoraHoje)) {
      return "Escolha um horário futuro para hoje.";
    }

    if (
      validarConflitoLocal(
        quadraReserva.eventos_ocupados ?? [],
        horaInicioReservaAtual,
        horaFimReserva,
        intervaloReserva,
      )
    ) {
      return `Este horário conflita com outra reserva ou com o intervalo de ${intervaloReserva} minutos.`;
    }

    return "";
  }, [
    granularidadeReserva,
    horaFimReserva,
    horaInicioReservaAtual,
    intervaloReserva,
    minHoraHoje,
    quadraReserva,
  ]);

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

        const agenda = montarAgenda(disponibilidade);

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
    setQuadraReservaId("");
    setHoraInicioReserva("");
    setDuracaoReserva(DURACOES_PADRAO[0]);
    setErroReserva("");
    setDialogOpen(false);
    setErro("");
    setFiltrosQuadra(agendaFiltroInicial);
  }

  function selecionarData(data: string) {
    setDataSelecionada(data);
    setHoraInicioReserva("");
    setErroReserva("");
  }

  function continuarReservaManual() {
    const erroFormulario = erroValidacaoReserva;

    if (erroFormulario || !quadraReserva) {
      setErroReserva(erroFormulario || "Selecione uma quadra.");
      return;
    }

    setErroReserva("");
    setHorarioSelecionado({
      id: `manual-${quadraReserva.id}-${horaInicioReservaAtual}-${duracaoReservaAtual}`,
      hora: horaInicioReservaAtual,
      fim: horaFimReserva,
      duracaoMinutos: duracaoReservaAtual,
      quadraId: quadraReserva.id,
      quadraNome: quadraReserva.nome,
      capacidadeMaxima: quadraReserva.capacidade_maxima ?? 4,
      permiteSimples: quadraReserva.permite_simples ?? true,
      permiteDupla: quadraReserva.permite_dupla ?? true,
      participantes: [],
    });

    setDialogOpen(true);
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

          <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-800">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-black text-zinc-950">
                  Nova reserva
                </h2>
                <p className="text-xs font-semibold text-zinc-500">
                  {quadraReserva?.abre_as && quadraReserva?.fecha_as
                    ? `${quadraReserva.abre_as} ate ${quadraReserva.fecha_as}`
                    : "Escolha uma quadra disponível"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1.4fr_0.8fr]">
              <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
                Quadra
                <select
                  value={quadraReserva?.id ?? ""}
                  onChange={(event) => {
                    setQuadraReservaId(event.target.value);
                    setHoraInicioReserva("");
                    setErroReserva("");
                  }}
                  disabled={loading || quadrasFiltradas.length === 0}
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition focus:border-green-700"
                >
                  {quadrasFiltradas.length === 0 ? (
                    <option value="">Nenhuma quadra</option>
                  ) : (
                    quadrasFiltradas.map((quadra) => (
                      <option key={quadra.id} value={quadra.id}>
                        {quadra.nome}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
                Início
                <input
                  type="time"
                  value={horaInicioReservaAtual}
                  min={horaMinimaReserva}
                  max={quadraReserva?.fecha_as ?? undefined}
                  step={granularidadeReserva * 60}
                  onChange={(event) => {
                    setHoraInicioReserva(event.target.value);
                    setErroReserva("");
                  }}
                  disabled={loading || !quadraReserva?.aberta}
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition focus:border-green-700"
                />
              </label>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="grid gap-1.5">
                <span className="text-sm font-bold text-zinc-700">
                  Duração
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {duracoesReserva.map((duracao) => (
                    <button
                      key={duracao}
                      type="button"
                      onClick={() => {
                        setDuracaoReserva(duracao);
                        setErroReserva("");
                      }}
                      className={[
                        "h-10 rounded-xl border text-sm font-black transition",
                        duracaoReservaAtual === duracao
                          ? "border-green-800 bg-green-800 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-green-700",
                      ].join(" ")}
                    >
                      {duracao} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700">
                <span className="block text-xs text-zinc-500">Final</span>
                {horaFimReserva || "--:--"}
              </div>
            </div>

            {(erroReserva || (!loading && erroValidacaoReserva)) && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                {erroReserva || erroValidacaoReserva}
              </p>
            )}

            <Button
              type="button"
              onClick={continuarReservaManual}
              disabled={loading || Boolean(erroValidacaoReserva)}
              className="mt-4 h-11 w-full rounded-xl"
            >
              Continuar
            </Button>
          </div>

          {erro && (
            <p className="mb-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              {erro}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-zinc-500">Carregando agenda...</p>
          ) : horariosFiltrados.length === 0 ? (
            <p className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500">
              Nenhum jogo criado para os filtros selecionados.
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
        onSuccess={handleAgendaMutationSuccess}
      />
    </>
  );
}
