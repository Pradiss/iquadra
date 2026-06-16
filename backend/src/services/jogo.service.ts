import { prisma } from "../lib/prisma";
import { CreateJogoData } from "../schemas/jogo.schema";

function validarPeriodo(inicio: Date, fim: Date) {
  if (fim <= inicio) {
    throw new Error("Horário final deve ser maior que o horário inicial");
  }
}

function getMaximoParticipantes(
  tipo: "SIMPLES" | "DUPLA",
  quadra: {
    capacidade_minima: number;
    capacidade_maxima: number;
    permite_simples: boolean;
    permite_dupla: boolean;
  }
) {
  if (tipo === "SIMPLES") {
    if (!quadra.permite_simples) {
      throw new Error("Esta quadra nao permite jogo simples");
    }

    if (quadra.capacidade_minima > 2 || quadra.capacidade_maxima < 2) {
      throw new Error("Esta quadra nao comporta jogo simples");
    }

    return 2;
  }

  if (!quadra.permite_dupla) {
    throw new Error("Esta quadra nao permite jogo em dupla");
  }

  if (quadra.capacidade_maxima < 4) {
    throw new Error("Esta quadra nao comporta jogo em dupla");
  }

  return 4;
}

async function validarConflitoAgenda(
  quadraId: string,
  inicio: Date,
  fim: Date
) {
  const jogoConflitante = await prisma.jogo.findFirst({
    where: {
      quadra_id: quadraId,
      status: {
        in: ["ABERTO", "COMPLETO"],
      },
      inicio_em: {
        lt: fim,
      },
      fim_em: {
        gt: inicio,
      },
    },
  });

  if (jogoConflitante) {
    throw new Error("Já existe um jogo nesse horário");
  }

  const aulaConflitante = await prisma.aula.findFirst({
    where: {
      quadra_id: quadraId,
      status: "CONFIRMADA",
      inicio_em: {
        lt: fim,
      },
      fim_em: {
        gt: inicio,
      },
    },
  });

  if (aulaConflitante) {
    throw new Error("Já existe uma aula nesse horário");
  }

  const bloqueioConflitante = await prisma.bloqueioQuadra.findFirst({
    where: {
      quadra_id: quadraId,
      inicio_em: {
        lt: fim,
      },
      fim_em: {
        gt: inicio,
      },
    },
  });

  if (bloqueioConflitante) {
    throw new Error("Este horário está bloqueado");
  }
}

export async function createJogo(usuarioId: string, data: CreateJogoData) {
  const inicio = new Date(data.inicio_em);
  const fim = new Date(data.fim_em);

  validarPeriodo(inicio, fim);

  const quadra = await prisma.quadra.findUnique({
    where: {
      id: data.quadra_id,
    },
  });

  if (!quadra) {
    throw new Error("Quadra não encontrada");
  }

  if (!quadra.ativa) {
    throw new Error("Quadra inativa");
  }

  if (quadra.academia_id !== data.academia_id) {
    throw new Error("Quadra não pertence à academia informada");
  }

  await validarConflitoAgenda(data.quadra_id, inicio, fim);

  const maximoParticipantes = getMaximoParticipantes(data.tipo_jogo, quadra);

  const jogo = await prisma.$transaction(async (tx) => {
    const novoJogo = await tx.jogo.create({
      data: {
        academia_id: data.academia_id,
        quadra_id: data.quadra_id,
        criado_por_usuario_id: usuarioId,
        responsavel_usuario_id: usuarioId,
        tipo_jogo: data.tipo_jogo,
        inicio_em: inicio,
        fim_em: fim,
        maximo_participantes: maximoParticipantes,
        ...(data.observacoes !== undefined
          ? { observacoes: data.observacoes }
          : {}),
      },
    });

    await tx.participanteJogo.create({
      data: {
        jogo_id: novoJogo.id,
        usuario_id: usuarioId,
        papel: "CRIADOR",
        status: "CONFIRMADO",
      },
    });

    return novoJogo;
  });

  return getJogoById(jogo.id);
}

export async function listJogos(params: {
  academia_id?: string;
  data?: string;
  status?: "ABERTO" | "COMPLETO" | "CANCELADO" | "CONCLUIDO";
}) {
  const where: any = {};

  if (params.academia_id) {
    where.academia_id = params.academia_id;
  }

  if (params.status) {
    where.status = params.status;
  }

  if (params.data) {
    where.inicio_em = {
      gte: new Date(`${params.data}T00:00:00`),
      lte: new Date(`${params.data}T23:59:59`),
    };
  }

  return prisma.jogo.findMany({
    where,
    include: {
      academia: true,
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
    orderBy: {
      inicio_em: "asc",
    },
  });
}

export async function getJogoById(id: string) {
  const jogo = await prisma.jogo.findUnique({
    where: {
      id,
    },
    include: {
      academia: true,
      quadra: true,
      participantes: {
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
  });

  if (!jogo) {
    throw new Error("Jogo não encontrado");
  }

  return jogo;
}

export async function participarJogo(usuarioId: string, jogoId: string) {
  const jogo = await prisma.jogo.findUnique({
    where: {
      id: jogoId,
    },
    include: {
      participantes: {
        where: {
          status: "CONFIRMADO",
        },
      },
    },
  });

  if (!jogo) {
    throw new Error("Jogo não encontrado");
  }

  if (jogo.status !== "ABERTO") {
    throw new Error("Este jogo não está aberto para participantes");
  }

  const jaParticipa = jogo.participantes.some(
    (participante) => participante.usuario_id === usuarioId
  );

  if (jaParticipa) {
    throw new Error("Você já participa deste jogo");
  }

  if (jogo.participantes.length >= jogo.maximo_participantes) {
    throw new Error("Este jogo já está completo");
  }

  await prisma.participanteJogo.create({
    data: {
      jogo_id: jogoId,
      usuario_id: usuarioId,
      papel: "JOGADOR",
      status: "CONFIRMADO",
    },
  });

  const totalParticipantes = jogo.participantes.length + 1;

  if (totalParticipantes >= jogo.maximo_participantes) {
    await prisma.jogo.update({
      where: {
        id: jogoId,
      },
      data: {
        status: "COMPLETO",
      },
    });
  }

  return getJogoById(jogoId);
}

export async function sairJogo(usuarioId: string, jogoId: string) {
  const participante = await prisma.participanteJogo.findUnique({
    where: {
      jogo_id_usuario_id: {
        jogo_id: jogoId,
        usuario_id: usuarioId,
      },
    },
  });

  if (!participante || participante.status !== "CONFIRMADO") {
    throw new Error("Você não participa deste jogo");
  }

  await prisma.participanteJogo.update({
    where: {
      id: participante.id,
    },
    data: {
      status: "SAIU",
    },
  });

  const participantesAtivos = await prisma.participanteJogo.count({
    where: {
      jogo_id: jogoId,
      status: "CONFIRMADO",
    },
  });

  if (participantesAtivos === 0) {
    await prisma.jogo.update({
      where: {
        id: jogoId,
      },
      data: {
        status: "SEM_PARTICIPANTES",
      },
    });
  } else {
    await prisma.jogo.update({
      where: {
        id: jogoId,
      },
      data: {
        status: "ABERTO",
      },
    });
  }

  return getJogoById(jogoId);
}

export async function cancelarJogo(usuarioId: string, jogoId: string) {
  const jogo = await prisma.jogo.findUnique({
    where: {
      id: jogoId,
    },
  });

  if (!jogo) {
    throw new Error("Jogo não encontrado");
  }

  const podeCancelar =
    jogo.criado_por_usuario_id === usuarioId ||
    jogo.responsavel_usuario_id === usuarioId;

  if (!podeCancelar) {
    throw new Error("Você não tem permissão para cancelar este jogo");
  }

  await prisma.jogo.update({
    where: {
      id: jogoId,
    },
    data: {
      status: "CANCELADO",
    },
  });

  return getJogoById(jogoId);
}
