import { prisma } from "../lib/prisma";
import { CreateQuadraData, UpdateQuadraData } from "../schemas/quadra.schema";

type CapacidadeQuadraInput = {
  capacidade_minima?: number | undefined;
  capacidade_maxima?: number | undefined;
  permite_simples?: boolean | undefined;
  permite_dupla?: boolean | undefined;
};

type CapacidadeQuadraAtual = {
  capacidade_minima: number;
  capacidade_maxima: number;
  permite_simples: boolean;
  permite_dupla: boolean;
};

function montarCapacidadeQuadra(
  data: CapacidadeQuadraInput,
  atual?: CapacidadeQuadraAtual
) {
  const informouPermissao =
    data.permite_simples !== undefined || data.permite_dupla !== undefined;
  const informouCapacidade =
    data.capacidade_minima !== undefined || data.capacidade_maxima !== undefined;

  let permiteSimples =
    data.permite_simples ?? atual?.permite_simples ?? true;
  let permiteDupla = data.permite_dupla ?? atual?.permite_dupla ?? true;
  let capacidadeMinima =
    data.capacidade_minima ?? atual?.capacidade_minima ?? 2;
  let capacidadeMaxima =
    data.capacidade_maxima ?? atual?.capacidade_maxima ?? capacidadeMinima;

  if (!informouPermissao && informouCapacidade) {
    if (capacidadeMinima === 2 && capacidadeMaxima === 2) {
      permiteSimples = true;
      permiteDupla = false;
    } else if (capacidadeMinima === 4 && capacidadeMaxima === 4) {
      permiteSimples = false;
      permiteDupla = true;
    } else if (capacidadeMinima === 2 && capacidadeMaxima === 4) {
      permiteSimples = true;
      permiteDupla = true;
    }
  } else if (informouPermissao) {
    capacidadeMinima = permiteSimples ? 2 : 4;
    capacidadeMaxima = permiteDupla ? 4 : 2;

    if (data.capacidade_minima !== undefined) {
      capacidadeMinima = data.capacidade_minima;
    }

    if (data.capacidade_maxima !== undefined) {
      capacidadeMaxima = data.capacidade_maxima;
    }
  }

  if (!permiteSimples && !permiteDupla) {
    throw new Error("A quadra deve permitir jogo simples, dupla ou ambos");
  }

  if (capacidadeMaxima < capacidadeMinima) {
    throw new Error("Capacidade maxima deve ser maior ou igual a minima");
  }

  if (permiteSimples && permiteDupla) {
    if (capacidadeMinima !== 2 || capacidadeMaxima !== 4) {
      throw new Error(
        "Quadras que permitem simples e dupla precisam aceitar 2 e 4 jogadores"
      );
    }
  } else if (permiteSimples) {
    if (capacidadeMinima !== 2 || capacidadeMaxima !== 2) {
      throw new Error("Quadras de simples precisam aceitar exatamente 2 jogadores");
    }
  } else if (permiteDupla) {
    if (capacidadeMinima !== 4 || capacidadeMaxima !== 4) {
      throw new Error("Quadras de dupla precisam aceitar exatamente 4 jogadores");
    }
  }

  return {
    capacidade_minima: capacidadeMinima,
    capacidade_maxima: capacidadeMaxima,
    permite_simples: permiteSimples,
    permite_dupla: permiteDupla,
  };
}

async function verificarPermissaoAcademia(usuarioId: string, academiaId: string) {
  const vinculo = await prisma.academiaUsuario.findFirst({
    where: {
      usuario_id: usuarioId,
      academia_id: academiaId,
      status: "ATIVO",
      perfil: {
        in: ["DONO", "ADMIN_ACADEMIA", "FUNCIONARIO"],
      },
    },
  });

  if (!vinculo) {
    throw new Error("Voce nao tem permissao para gerenciar esta academia");
  }
}

export async function createQuadra(
  usuarioId: string,
  academiaId: string,
  data: CreateQuadraData
) {
  await verificarPermissaoAcademia(usuarioId, academiaId);

  const capacidade = montarCapacidadeQuadra(data);

  return prisma.quadra.create({
    data: {
      academia_id: academiaId,
      nome: data.nome,
      tipo_piso: data.tipo_piso,
      modalidade: data.modalidade,
      valor_hora: data.valor_hora,
      coberta: data.coberta ?? false,
      ordem_exibicao: data.ordem_exibicao ?? 0,
      ...(data.descricao !== undefined ? { descricao: data.descricao } : {}),
      ...capacidade,
    },
  });
}

export async function listQuadrasByAcademia(
  academiaId: string,
  incluirInativas = false
) {
  return prisma.quadra.findMany({
    where: {
      academia_id: academiaId,
      ...(incluirInativas ? {} : { ativa: true }),
    },
    orderBy: {
      ordem_exibicao: "asc",
    },
  });
}

export async function getQuadraById(id: string) {
  const quadra = await prisma.quadra.findUnique({
    where: { id },
    include: {
      academia: {
        select: {
          id: true,
          nome: true,
          slug: true,
          cidade: true,
          estado: true,
          status: true,
        },
      },
      horarios: true,
    },
  });

  if (!quadra) {
    throw new Error("Quadra nao encontrada");
  }

  return quadra;
}

export async function updateQuadra(
  usuarioId: string,
  quadraId: string,
  data: UpdateQuadraData
) {
  const quadra = await prisma.quadra.findUnique({
    where: { id: quadraId },
  });

  if (!quadra) {
    throw new Error("Quadra nao encontrada");
  }

  await verificarPermissaoAcademia(usuarioId, quadra.academia_id);

  const capacidade = montarCapacidadeQuadra(data, quadra);

  return prisma.quadra.update({
    where: { id: quadraId },
    data: {
      ...(data.nome !== undefined ? { nome: data.nome } : {}),
      ...(data.descricao !== undefined ? { descricao: data.descricao } : {}),
      ...(data.tipo_piso !== undefined ? { tipo_piso: data.tipo_piso } : {}),
      ...(data.modalidade !== undefined ? { modalidade: data.modalidade } : {}),
      ...(data.valor_hora !== undefined ? { valor_hora: data.valor_hora } : {}),
      ...(data.coberta !== undefined ? { coberta: data.coberta } : {}),
      ...(data.ordem_exibicao !== undefined
        ? { ordem_exibicao: data.ordem_exibicao }
        : {}),
      ...capacidade,
    },
  });
}

export async function updateStatusQuadra(
  usuarioId: string,
  quadraId: string,
  ativa: boolean
) {
  const quadra = await prisma.quadra.findUnique({
    where: { id: quadraId },
  });

  if (!quadra) {
    throw new Error("Quadra nao encontrada");
  }

  await verificarPermissaoAcademia(usuarioId, quadra.academia_id);

  return prisma.quadra.update({
    where: { id: quadraId },
    data: { ativa },
  });
}

export async function deleteQuadra(usuarioId: string, quadraId: string) {
  const quadra = await prisma.quadra.findUnique({
    where: { id: quadraId },
  });

  if (!quadra) {
    throw new Error("Quadra nao encontrada");
  }

  await verificarPermissaoAcademia(usuarioId, quadra.academia_id);

  const [jogos, aulas, recorrencias] = await prisma.$transaction([
    prisma.jogo.count({
      where: { quadra_id: quadraId },
    }),
    prisma.aula.count({
      where: { quadra_id: quadraId },
    }),
    prisma.recorrenciaAula.count({
      where: { quadra_id: quadraId },
    }),
  ]);

  if (jogos > 0 || aulas > 0 || recorrencias > 0) {
    throw new Error(
      "Nao e possivel excluir uma quadra com jogos, aulas ou recorrencias vinculadas. Inative a quadra para remover dos agendamentos."
    );
  }

  await prisma.$transaction([
    prisma.bloqueioQuadra.deleteMany({
      where: { quadra_id: quadraId },
    }),
    prisma.horarioEspecialQuadra.deleteMany({
      where: { quadra_id: quadraId },
    }),
    prisma.horarioQuadra.deleteMany({
      where: { quadra_id: quadraId },
    }),
    prisma.quadra.delete({
      where: { id: quadraId },
    }),
  ]);

  return quadra;
}
