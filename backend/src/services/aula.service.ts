import { prisma } from "../lib/prisma";
import { CreateAulaData } from "../schemas/aula.schema";
import { getLocalDayRange, resolvePeriod } from "../utils/date-time";

function validarPeriodo(inicio: Date, fim: Date) {
  if (fim <= inicio) {
    throw new Error("Horário final deve ser maior que o horário inicial");
  }
}

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
    throw new Error("Você não tem permissão para criar aula nesta academia");
  }
}

async function validarConflitos(quadraId: string, inicio: Date, fim: Date) {
  const jogoConflitante = await prisma.jogo.findFirst({
    where: {
      quadra_id: quadraId,
      status: {
        in: ["ABERTO", "COMPLETO"],
      },
      inicio_em: { lt: fim },
      fim_em: { gt: inicio },
    },
  });

  if (jogoConflitante) {
    throw new Error("Já existe um jogo nesse horário");
  }

  const aulaConflitante = await prisma.aula.findFirst({
    where: {
      quadra_id: quadraId,
      status: "CONFIRMADA",
      inicio_em: { lt: fim },
      fim_em: { gt: inicio },
    },
  });

  if (aulaConflitante) {
    throw new Error("Já existe uma aula nesse horário");
  }

  const bloqueioConflitante = await prisma.bloqueioQuadra.findFirst({
    where: {
      quadra_id: quadraId,
      inicio_em: { lt: fim },
      fim_em: { gt: inicio },
    },
  });

  if (bloqueioConflitante) {
    throw new Error("Este horário está bloqueado");
  }
}

export async function createAula(usuarioId: string, data: CreateAulaData) {
  const { inicio, fim } = resolvePeriod(data);

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

  await verificarPermissaoAcademia(usuarioId, data.academia_id);
  await validarConflitos(data.quadra_id, inicio, fim);

  return prisma.aula.create({
    data: {
      academia_id: data.academia_id,
      quadra_id: data.quadra_id,
      professor_id: data.professor_id,
      cliente_id: data.cliente_id,
      inicio_em: inicio,
      fim_em: fim,
      observacoes: data.observacoes,
    },
    include: {
      academia: true,
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
  });
}

export async function listAulas(params: {
  academia_id?: string;
  quadra_id?: string;
  professor_id?: string;
  cliente_id?: string;
  data?: string;
}) {
  const where: any = {};

  if (params.academia_id) where.academia_id = params.academia_id;
  if (params.quadra_id) where.quadra_id = params.quadra_id;
  if (params.professor_id) where.professor_id = params.professor_id;
  if (params.cliente_id) where.cliente_id = params.cliente_id;

  if (params.data) {
    const { inicio, fim } = getLocalDayRange(params.data);

    where.inicio_em = {
      gte: inicio,
      lt: fim,
    };
  }

  return prisma.aula.findMany({
    where,
    include: {
      academia: true,
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
    orderBy: {
      inicio_em: "asc",
    },
  });
}

export async function getAulaById(id: string) {
  const aula = await prisma.aula.findUnique({
    where: { id },
    include: {
      academia: true,
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
  });

  if (!aula) {
    throw new Error("Aula não encontrada");
  }

  return aula;
}

export async function cancelarAula(usuarioId: string, aulaId: string) {
  const aula = await prisma.aula.findUnique({
    where: {
      id: aulaId,
    },
  });

  if (!aula) {
    throw new Error("Aula não encontrada");
  }

  await verificarPermissaoAcademia(usuarioId, aula.academia_id);

  await prisma.aula.update({
    where: {
      id: aulaId,
    },
    data: {
      status: "CANCELADA",
    },
  });

  return getAulaById(aulaId);
}
