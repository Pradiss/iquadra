import { prisma } from "../lib/prisma";
import { formatInAppTimeZone, getLocalDayRange } from "../utils/date-time";

async function verificarPermissaoAcademia(usuarioId: string, academiaId: string) {
  const vinculo = await prisma.academiaUsuario.findFirst({
    where: {
      usuario_id: usuarioId,
      academia_id: academiaId,
      status: "ATIVO",
      perfil: {
        in: ["DONO", "ADMIN_ACADEMIA", "FUNCIONARIO", "PROFESSOR"],
      },
    },
  });

  if (!vinculo) {
    throw new Error("Você não tem permissão para acessar esta academia");
  }
}

export async function getDashboardAcademia(
  usuarioId: string,
  academiaId: string
) {
  await verificarPermissaoAcademia(usuarioId, academiaId);

  const hoje = formatInAppTimeZone(new Date()).data;
  const { inicio: inicioDia, fim: fimDia } = getLocalDayRange(hoje);

  const [
    totalQuadras,
    jogosHoje,
    aulasHoje,
    bloqueiosAtivos,
    professores,
    clientesComJogos,
  ] = await Promise.all([
    prisma.quadra.count({
      where: {
        academia_id: academiaId,
      },
    }),

    prisma.jogo.count({
      where: {
        academia_id: academiaId,
        inicio_em: {
          gte: inicioDia,
          lt: fimDia,
        },
        status: {
          in: ["ABERTO", "COMPLETO"],
        },
      },
    }),

    prisma.aula.count({
      where: {
        academia_id: academiaId,
        inicio_em: {
          gte: inicioDia,
          lt: fimDia,
        },
        status: "CONFIRMADA",
      },
    }),

    prisma.bloqueioQuadra.count({
      where: {
        quadra: {
          academia_id: academiaId,
        },
        fim_em: {
          gte: new Date(),
        },
      },
    }),

    prisma.academiaUsuario.count({
      where: {
        academia_id: academiaId,
        perfil: "PROFESSOR",
        status: "ATIVO",
      },
    }),

    prisma.participanteJogo.findMany({
      where: {
        jogo: {
          academia_id: academiaId,
        },
        status: "CONFIRMADO",
      },
      select: {
        usuario_id: true,
      },
      distinct: ["usuario_id"],
    }),
  ]);

  return {
    total_quadras: totalQuadras,
    jogos_hoje: jogosHoje,
    aulas_hoje: aulasHoje,
    bloqueios_ativos: bloqueiosAtivos,
    professores,
    clientes: clientesComJogos.length,
  };
}

export async function getAgendaAcademia(
  usuarioId: string,
  academiaId: string,
  data: string
) {
  await verificarPermissaoAcademia(usuarioId, academiaId);

  const { inicio: inicioDia, fim: fimDia } = getLocalDayRange(data);

  const [jogos, aulas, bloqueios] = await Promise.all([
    prisma.jogo.findMany({
      where: {
        academia_id: academiaId,
        inicio_em: {
          gte: inicioDia,
          lt: fimDia,
        },
        status: {
          in: ["ABERTO", "COMPLETO"],
        },
      },
      include: {
        quadra: true,
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
              },
            },
          },
        },
      },
    }),

    prisma.aula.findMany({
      where: {
        academia_id: academiaId,
        inicio_em: {
          gte: inicioDia,
          lt: fimDia,
        },
        status: "CONFIRMADA",
      },
      include: {
        quadra: true,
        professor: {
          select: {
            id: true,
            nome: true,
            foto_perfil: true,
          },
        },
        cliente: {
          select: {
            id: true,
            nome: true,
            foto_perfil: true,
          },
        },
      },
    }),

    prisma.bloqueioQuadra.findMany({
      where: {
        quadra: {
          academia_id: academiaId,
        },
        inicio_em: {
          lt: fimDia,
        },
        fim_em: {
          gt: inicioDia,
        },
      },
      include: {
        quadra: true,
      },
    }),
  ]);

  const eventos = [
    ...jogos.map((jogo) => ({
      tipo: "JOGO",
      id: jogo.id,
      quadra: jogo.quadra.nome,
      inicio_em: jogo.inicio_em,
      fim_em: jogo.fim_em,
      status: jogo.status,
      participantes: jogo.participantes,
    })),

    ...aulas.map((aula) => ({
      tipo: "AULA",
      id: aula.id,
      quadra: aula.quadra.nome,
      inicio_em: aula.inicio_em,
      fim_em: aula.fim_em,
      status: aula.status,
      professor: aula.professor,
      cliente: aula.cliente,
    })),

    ...bloqueios.map((bloqueio) => ({
      tipo: "BLOQUEIO",
      id: bloqueio.id,
      quadra: bloqueio.quadra.nome,
      inicio_em: bloqueio.inicio_em,
      fim_em: bloqueio.fim_em,
      tipo_bloqueio: bloqueio.tipo_bloqueio,
      motivo: bloqueio.motivo,
    })),
  ].sort(
    (a, b) =>
      new Date(a.inicio_em).getTime() - new Date(b.inicio_em).getTime()
  );

  return {
    data,
    total: eventos.length,
    eventos,
  };
}
