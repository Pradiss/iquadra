import { prisma } from "../lib/prisma";
import { CACHE_TTL, getOrSetCache } from "../lib/cache";
import {
  buildDateTime,
  generateTimeSlots,
  getDiaSemana,
  getLocalDayRange,
} from "../utils/date-time";

type DisponibilidadeOptions = {
  includeParticipantDetails?: boolean;
  useCache?: boolean;
};

type QuadraDisponibilidade = {
  id: string;
  nome: string;
  academia_id: string;
  tipo_piso: string;
  modalidade: string | null;
  valor_hora: number | null;
  coberta: boolean;
  capacidade_minima: number;
  capacidade_maxima: number;
  permite_simples: boolean;
  permite_dupla: boolean;
  ativa: boolean;
  academia?: {
    nome: string;
  } | null;
};

type HorarioPadrao = {
  quadra_id: string;
  abre_as: string;
  fecha_as: string;
  duracao_slot_minutos: number;
};

type HorarioEspecial = {
  quadra_id: string;
  abre_as: string | null;
  fecha_as: string | null;
  fechada: boolean;
  motivo: string | null;
};

type PeriodoAgenda = {
  id: string;
  quadra_id: string;
  inicio_em: Date;
  fim_em: Date;
};

type JogoAgenda = PeriodoAgenda & {
  criado_por_usuario_id: string;
  tipo_jogo: "SIMPLES" | "DUPLA";
  status: string;
  maximo_participantes: number;
  observacoes: string | null;
  participantes: Array<{
    usuario_id: string;
    usuario?: {
      id: string;
      nome: string;
      foto_perfil: string | null;
      perfil_cliente: {
        categoria: string;
      } | null;
    };
  }>;
};

type AulaAgenda = PeriodoAgenda & {
  observacoes: string | null;
  cliente?: {
    id: string;
    nome: string;
  } | null;
  professor?: {
    id: string;
    nome: string;
  } | null;
};

type BloqueioAgenda = PeriodoAgenda & {
  motivo: string;
  tipo_bloqueio: string;
};

function montarResumoQuadra(quadra: QuadraDisponibilidade) {
  return {
    id: quadra.id,
    nome: quadra.nome,
    academia: quadra.academia?.nome,
    tipo_piso: quadra.tipo_piso,
    modalidade: quadra.modalidade,
    valor_hora: quadra.valor_hora,
    coberta: quadra.coberta,
    capacidade_minima: quadra.capacidade_minima,
    capacidade_maxima: quadra.capacidade_maxima,
    permite_simples: quadra.permite_simples,
    permite_dupla: quadra.permite_dupla,
  };
}

function hasConflict(
  slotInicio: Date,
  slotFim: Date,
  itemInicio: Date,
  itemFim: Date
) {
  return itemInicio < slotFim && itemFim > slotInicio;
}

function groupByQuadraId<T extends { quadra_id: string }>(items: T[]) {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const values = grouped.get(item.quadra_id) ?? [];
    values.push(item);
    grouped.set(item.quadra_id, values);
  }

  return grouped;
}

function firstByQuadraId<T extends { quadra_id: string }>(items: T[]) {
  const grouped = new Map<string, T>();

  for (const item of items) {
    if (!grouped.has(item.quadra_id)) {
      grouped.set(item.quadra_id, item);
    }
  }

  return grouped;
}

export async function getDisponibilidadeQuadra(
  quadraId: string,
  data: string,
  options: DisponibilidadeOptions = {}
) {
  const includeParticipantDetails = Boolean(options.includeParticipantDetails);
  const cacheKey = `disponibilidade:quadra:${quadraId}:data:${data}:details:${includeParticipantDetails}`;

  const loader = async () => {
    const quadra = await prisma.quadra.findUnique({
      where: { id: quadraId },
      include: {
        academia: {
          select: {
            nome: true,
          },
        },
      },
    });

    if (!quadra) {
      throw new Error("Quadra não encontrada");
    }

    if (!quadra.ativa) {
      throw new Error("Quadra inativa");
    }

    const [disponibilidade] = await buildDisponibilidades(
      [quadra],
      data,
      includeParticipantDetails
    );

    return disponibilidade;
  };

  if (options.useCache === false) {
    return loader();
  }

  return getOrSetCache(cacheKey, CACHE_TTL.disponibilidade, loader);
}

export async function getDisponibilidadeAcademia(
  academiaId: string,
  data: string,
  options: DisponibilidadeOptions = {}
) {
  const includeParticipantDetails = Boolean(options.includeParticipantDetails);
  const cacheKey = `disponibilidade:academia:${academiaId}:data:${data}:details:${includeParticipantDetails}`;

  const loader = async () => {
    const [academia, quadras] = await Promise.all([
      prisma.academia.findUnique({
        where: {
          id: academiaId,
        },
        select: {
          id: true,
          nome: true,
          slug: true,
          cidade: true,
          estado: true,
          status: true,
        },
      }),
      prisma.quadra.findMany({
        where: {
          academia_id: academiaId,
          ativa: true,
        },
        include: {
          academia: {
            select: {
              nome: true,
            },
          },
        },
        orderBy: {
          ordem_exibicao: "asc",
        },
      }),
    ]);

    if (!academia) {
      throw new Error("Academia não encontrada");
    }

    return {
      academia,
      data,
      quadras: await buildDisponibilidades(
        quadras,
        data,
        includeParticipantDetails
      ),
    };
  };

  if (options.useCache === false) {
    return loader();
  }

  return getOrSetCache(cacheKey, CACHE_TTL.disponibilidade, loader);
}

async function buildDisponibilidades(
  quadras: QuadraDisponibilidade[],
  data: string,
  includeParticipantDetails: boolean
) {
  if (quadras.length === 0) {
    return [];
  }

  const quadraIds = quadras.map((quadra) => quadra.id);
  const diaSemana = getDiaSemana(data);
  const { inicio: inicioDia, fim: fimDia } = getLocalDayRange(data);

  const [
    horariosPadrao,
    horariosEspeciais,
    bloqueios,
    jogos,
    aulas,
  ] = await Promise.all([
    prisma.horarioQuadra.findMany({
      where: {
        quadra_id: {
          in: quadraIds,
        },
        dia_semana: diaSemana,
        ativo: true,
      },
      orderBy: {
        criado_em: "asc",
      },
    }),
    prisma.horarioEspecialQuadra.findMany({
      where: {
        quadra_id: {
          in: quadraIds,
        },
        data: {
          gte: inicioDia,
          lt: fimDia,
        },
      },
      orderBy: {
        criado_em: "asc",
      },
    }),
    prisma.bloqueioQuadra.findMany({
      where: {
        quadra_id: {
          in: quadraIds,
        },
        inicio_em: {
          lt: fimDia,
        },
        fim_em: {
          gt: inicioDia,
        },
      },
    }),
    prisma.jogo.findMany({
      where: {
        quadra_id: {
          in: quadraIds,
        },
        status: {
          in: ["ABERTO", "COMPLETO"],
        },
        inicio_em: {
          lt: fimDia,
        },
        fim_em: {
          gt: inicioDia,
        },
      },
      include: {
        participantes: includeParticipantDetails
          ? {
              where: {
                status: "CONFIRMADO",
              },
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    foto_perfil: true,
                    perfil_cliente: {
                      select: {
                        categoria: true,
                      },
                    },
                  },
                },
              },
            }
          : {
              where: {
                status: "CONFIRMADO",
              },
              select: {
                usuario_id: true,
              },
            },
      },
    }) as Promise<JogoAgenda[]>,
    prisma.aula.findMany({
      where: {
        quadra_id: {
          in: quadraIds,
        },
        status: "CONFIRMADA",
        inicio_em: {
          lt: fimDia,
        },
        fim_em: {
          gt: inicioDia,
        },
      },
      include: includeParticipantDetails
        ? {
            cliente: {
              select: {
                id: true,
                nome: true,
              },
            },
            professor: {
              select: {
                id: true,
                nome: true,
              },
            },
          }
        : undefined,
    }) as Promise<AulaAgenda[]>,
  ]);

  const horariosPadraoByQuadra = firstByQuadraId(
    horariosPadrao as HorarioPadrao[]
  );
  const horariosEspeciaisByQuadra = firstByQuadraId(
    horariosEspeciais as HorarioEspecial[]
  );
  const bloqueiosByQuadra = groupByQuadraId(bloqueios as BloqueioAgenda[]);
  const jogosByQuadra = groupByQuadraId(jogos);
  const aulasByQuadra = groupByQuadraId(aulas);

  return quadras.map((quadra) =>
    montarDisponibilidadeQuadra({
      quadra,
      data,
      includeParticipantDetails,
      horarioPadrao: horariosPadraoByQuadra.get(quadra.id),
      horarioEspecial: horariosEspeciaisByQuadra.get(quadra.id),
      bloqueios: bloqueiosByQuadra.get(quadra.id) ?? [],
      jogos: jogosByQuadra.get(quadra.id) ?? [],
      aulas: aulasByQuadra.get(quadra.id) ?? [],
    })
  );
}

function montarDisponibilidadeQuadra({
  quadra,
  data,
  includeParticipantDetails,
  horarioPadrao,
  horarioEspecial,
  bloqueios,
  jogos,
  aulas,
}: {
  quadra: QuadraDisponibilidade;
  data: string;
  includeParticipantDetails: boolean;
  horarioPadrao?: HorarioPadrao;
  horarioEspecial?: HorarioEspecial;
  bloqueios: BloqueioAgenda[];
  jogos: JogoAgenda[];
  aulas: AulaAgenda[];
}) {
  if (!horarioPadrao) {
    return {
      quadra: montarResumoQuadra(quadra),
      data,
      aberta: false,
      motivo: "Quadra sem horário configurado para esta data",
      slots: [],
    };
  }

  if (horarioEspecial?.fechada) {
    return {
      quadra: montarResumoQuadra(quadra),
      data,
      aberta: false,
      motivo: horarioEspecial.motivo || "Quadra fechada nesta data",
      slots: [],
    };
  }

  const abreAs = horarioEspecial?.abre_as || horarioPadrao.abre_as;
  const fechaAs = horarioEspecial?.fecha_as || horarioPadrao.fecha_as;
  const duracao = horarioPadrao.duracao_slot_minutos;
  const slots = [];

  for (const slot of generateTimeSlots(abreAs, fechaAs, duracao)) {
    const slotInicio = buildDateTime(data, slot.inicio);
    const slotFim = buildDateTime(data, slot.fim);

    const conflitoBloqueio = bloqueios.find((bloqueio) =>
      hasConflict(slotInicio, slotFim, bloqueio.inicio_em, bloqueio.fim_em)
    );

    const jogoConflitante = jogos.find((jogo) =>
      hasConflict(slotInicio, slotFim, jogo.inicio_em, jogo.fim_em)
    );

    const aulaConflitante = aulas.find((aula) =>
      hasConflict(slotInicio, slotFim, aula.inicio_em, aula.fim_em)
    );

    const disponivel = !conflitoBloqueio && !jogoConflitante && !aulaConflitante;
    const participantes = jogoConflitante
      ? jogoConflitante.participantes.map((p) => ({
          id: p.usuario?.id ?? p.usuario_id,
          nome: includeParticipantDetails
            ? (p.usuario?.nome ?? "Jogador")
            : "Jogador",
          foto_perfil: includeParticipantDetails
            ? (p.usuario?.foto_perfil ?? null)
            : null,
          categoria: includeParticipantDetails
            ? (p.usuario?.perfil_cliente?.categoria ?? "Sem ranking")
            : null,
        }))
      : [];
    const maximoParticipantes =
      jogoConflitante?.maximo_participantes ?? quadra.capacidade_maxima;
    const jogadoresConfirmados = participantes.length;
    const permiteMostrarVagas = !conflitoBloqueio && !aulaConflitante;
    const vagasDisponiveis = permiteMostrarVagas
      ? Math.max(maximoParticipantes - jogadoresConfirmados, 0)
      : 0;

    slots.push({
      inicio: slot.inicio,
      fim: slot.fim,
      disponivel,
      capacidade_minima: quadra.capacidade_minima,
      capacidade_maxima: quadra.capacidade_maxima,
      permite_simples: quadra.permite_simples,
      permite_dupla: quadra.permite_dupla,
      jogadores_confirmados: jogadoresConfirmados,
      vagas_disponiveis: vagasDisponiveis,
      motivo: disponivel
        ? null
        : conflitoBloqueio
          ? "BLOQUEADO"
          : jogoConflitante
            ? "JOGO"
            : "AULA",
      jogo: jogoConflitante
        ? {
            id: jogoConflitante.id,
            criador_usuario_id: includeParticipantDetails
              ? jogoConflitante.criado_por_usuario_id
              : undefined,
            tipo_jogo: jogoConflitante.tipo_jogo,
            status: jogoConflitante.status,
            maximo_participantes: jogoConflitante.maximo_participantes,
            jogadores_confirmados: jogadoresConfirmados,
            vagas_disponiveis: vagasDisponiveis,
            observacoes: includeParticipantDetails
              ? jogoConflitante.observacoes
              : null,
            participantes: includeParticipantDetails ? participantes : [],
          }
        : null,
      bloqueio: conflitoBloqueio
        ? {
            id: conflitoBloqueio.id,
            motivo: conflitoBloqueio.motivo,
            tipo_bloqueio: conflitoBloqueio.tipo_bloqueio,
          }
        : null,
      aula: aulaConflitante
        ? {
            id: aulaConflitante.id,
            observacoes: includeParticipantDetails
              ? aulaConflitante.observacoes
              : null,
            cliente: includeParticipantDetails ? aulaConflitante.cliente : null,
            professor: includeParticipantDetails
              ? aulaConflitante.professor
              : null,
          }
        : null,
    });
  }

  return {
    quadra: montarResumoQuadra(quadra),
    data,
    aberta: true,
    abre_as: abreAs,
    fecha_as: fechaAs,
    duracao_slot_minutos: duracao,
    slots,
  };
}
