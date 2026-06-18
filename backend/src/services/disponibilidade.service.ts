import { prisma } from "../lib/prisma";
import {
  buildDateTime,
  generateTimeSlots,
  getDiaSemana,
  getLocalDayRange,
} from "../utils/date-time";

function montarResumoQuadra(quadra: {
  id: string;
  nome: string;
  capacidade_minima: number;
  capacidade_maxima: number;
  permite_simples: boolean;
  permite_dupla: boolean;
  academia?: {
    nome: string;
  } | null;
}) {
  return {
    id: quadra.id,
    nome: quadra.nome,
    academia: quadra.academia?.nome,
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

export async function getDisponibilidadeQuadra(quadraId: string, data: string) {
  const quadra = await prisma.quadra.findUnique({
    where: { id: quadraId },
    include: {
      academia: true,
    },
  });

  if (!quadra) {
    throw new Error("Quadra não encontrada");
  }

  if (!quadra.ativa) {
    throw new Error("Quadra inativa");
  }

  const diaSemana = getDiaSemana(data);

  const horarioPadrao = await prisma.horarioQuadra.findFirst({
    where: {
      quadra_id: quadraId,
      dia_semana: diaSemana,
      ativo: true,
    },
  });

  if (!horarioPadrao) {
    return {
      quadra: montarResumoQuadra(quadra),
      data,
      aberta: false,
      motivo: "Quadra sem horário configurado para esta data",
      slots: [],
    };
  }

  const { inicio: inicioDia, fim: fimDia } = getLocalDayRange(data);

  const horarioEspecial = await prisma.horarioEspecialQuadra.findFirst({
    where: {
      quadra_id: quadraId,
      data: {
        gte: inicioDia,
        lt: fimDia,
      },
    },
  });

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

  const bloqueios = await prisma.bloqueioQuadra.findMany({
    where: {
      quadra_id: quadraId,
      inicio_em: {
        lt: fimDia,
      },
      fim_em: {
        gt: inicioDia,
      },
    },
  });

  const jogos = await prisma.jogo.findMany({
    where: {
      quadra_id: quadraId,
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
      participantes: {
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
      },
    },
  });

  const aulas = await prisma.aula.findMany({
    where: {
      quadra_id: quadraId,
      status: "CONFIRMADA",
      inicio_em: {
        lt: fimDia,
      },
      fim_em: {
        gt: inicioDia,
      },
    },
    include: {
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
    },
  });

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
          id: p.usuario.id,
          nome: p.usuario.nome,
          foto_perfil: p.usuario.foto_perfil,
          categoria: p.usuario.perfil_cliente?.categoria || "Sem ranking",
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
            criador_usuario_id: jogoConflitante.criado_por_usuario_id,
            tipo_jogo: jogoConflitante.tipo_jogo,
            status: jogoConflitante.status,
            maximo_participantes: jogoConflitante.maximo_participantes,
            jogadores_confirmados: jogadoresConfirmados,
            vagas_disponiveis: vagasDisponiveis,
            observacoes: jogoConflitante.observacoes,
            participantes,
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
            observacoes: aulaConflitante.observacoes,
            cliente: aulaConflitante.cliente,
            professor: aulaConflitante.professor,
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
