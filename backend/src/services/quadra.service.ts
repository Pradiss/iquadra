import { prisma } from "../lib/prisma";
import { CreateQuadraData, UpdateQuadraData } from "../schemas/quadra.schema";

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
    throw new Error("Você não tem permissão para gerenciar esta academia");
  }
}

export async function createQuadra(
  usuarioId: string,
  academiaId: string,
  data: CreateQuadraData
) {
  await verificarPermissaoAcademia(usuarioId, academiaId);

  return prisma.quadra.create({
    data: {
      academia_id: academiaId,
      nome: data.nome,
      descricao: data.descricao,
      tipo_piso: data.tipo_piso,
      coberta: data.coberta ?? false,
      ordem_exibicao: data.ordem_exibicao ?? 0,
    },
  });
}

export async function listQuadrasByAcademia(academiaId: string) {
  return prisma.quadra.findMany({
    where: {
      academia_id: academiaId,
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
      academia: true,
      horarios: true,
    },
  });

  if (!quadra) {
    throw new Error("Quadra não encontrada");
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
    throw new Error("Quadra não encontrada");
  }

  await verificarPermissaoAcademia(usuarioId, quadra.academia_id);

  return prisma.quadra.update({
    where: { id: quadraId },
    data,
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
    throw new Error("Quadra não encontrada");
  }

  await verificarPermissaoAcademia(usuarioId, quadra.academia_id);

  return prisma.quadra.update({
    where: { id: quadraId },
    data: { ativa },
  });
}