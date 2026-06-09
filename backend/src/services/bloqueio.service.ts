import { prisma } from "../lib/prisma";
import { CreateBloqueioData } from "../schemas/bloqueio.schema";

function validarPeriodo(inicio: Date, fim: Date) {
  if (fim <= inicio) {
    throw new Error("Horário final deve ser maior que o horário inicial");
  }
}

async function verificarPermissaoPorQuadra(usuarioId: string, quadraId: string) {
  const quadra = await prisma.quadra.findUnique({
    where: { id: quadraId },
  });

  if (!quadra) {
    throw new Error("Quadra não encontrada");
  }

  const vinculo = await prisma.academiaUsuario.findFirst({
    where: {
      usuario_id: usuarioId,
      academia_id: quadra.academia_id,
      status: "ATIVO",
      perfil: {
        in: ["DONO", "ADMIN_ACADEMIA", "FUNCIONARIO"],
      },
    },
  });

  if (!vinculo) {
    throw new Error("Você não tem permissão para gerenciar esta quadra");
  }

  return quadra;
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
    throw new Error("Não é possível bloquear: já existe jogo nesse período");
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
    throw new Error("Não é possível bloquear: já existe aula nesse período");
  }

  const bloqueioConflitante = await prisma.bloqueioQuadra.findFirst({
    where: {
      quadra_id: quadraId,
      inicio_em: { lt: fim },
      fim_em: { gt: inicio },
    },
  });

  if (bloqueioConflitante) {
    throw new Error("Já existe bloqueio nesse período");
  }
}

export async function createBloqueio(
  usuarioId: string,
  quadraId: string,
  data: CreateBloqueioData
) {
  await verificarPermissaoPorQuadra(usuarioId, quadraId);

  const inicio = new Date(data.inicio_em);
  const fim = new Date(data.fim_em);

  validarPeriodo(inicio, fim);
  await validarConflitos(quadraId, inicio, fim);

  return prisma.bloqueioQuadra.create({
    data: {
      quadra_id: quadraId,
      inicio_em: inicio,
      fim_em: fim,
      tipo_bloqueio: data.tipo_bloqueio ?? "OUTRO",
      motivo: data.motivo,
      criado_por_usuario_id: usuarioId,
    },
  });
}

export async function listBloqueiosByQuadra(quadraId: string) {
  return prisma.bloqueioQuadra.findMany({
    where: {
      quadra_id: quadraId,
    },
    include: {
      criado_por: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
    orderBy: {
      inicio_em: "asc",
    },
  });
}

export async function deleteBloqueio(usuarioId: string, bloqueioId: string) {
  const bloqueio = await prisma.bloqueioQuadra.findUnique({
    where: { id: bloqueioId },
  });

  if (!bloqueio) {
    throw new Error("Bloqueio não encontrado");
  }

  await verificarPermissaoPorQuadra(usuarioId, bloqueio.quadra_id);

  await prisma.bloqueioQuadra.delete({
    where: { id: bloqueioId },
  });

  return true;
}