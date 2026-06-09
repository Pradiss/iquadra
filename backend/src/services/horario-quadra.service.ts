import { prisma } from "../lib/prisma";
import {
  CreateHorarioQuadraData,
  UpdateHorarioQuadraData,
} from "../schemas/horario-quadra.schema";

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

export async function createHorarioQuadra(
  usuarioId: string,
  quadraId: string,
  data: CreateHorarioQuadraData
) {
  await verificarPermissaoPorQuadra(usuarioId, quadraId);

  return prisma.horarioQuadra.create({
    data: {
      quadra_id: quadraId,
      dia_semana: data.dia_semana,
      abre_as: data.abre_as,
      fecha_as: data.fecha_as,
      duracao_slot_minutos: data.duracao_slot_minutos ?? 60,
      ativo: data.ativo ?? true,
    },
  });
}

export async function listHorariosQuadra(quadraId: string) {
  return prisma.horarioQuadra.findMany({
    where: {
      quadra_id: quadraId,
    },
    orderBy: {
      dia_semana: "asc",
    },
  });
}

export async function updateHorarioQuadra(
  usuarioId: string,
  horarioId: string,
  data: UpdateHorarioQuadraData
) {
  const horario = await prisma.horarioQuadra.findUnique({
    where: { id: horarioId },
  });

  if (!horario) {
    throw new Error("Horário não encontrado");
  }

  await verificarPermissaoPorQuadra(usuarioId, horario.quadra_id);

  return prisma.horarioQuadra.update({
    where: { id: horarioId },
    data,
  });
}

export async function deleteHorarioQuadra(
  usuarioId: string,
  horarioId: string
) {
  const horario = await prisma.horarioQuadra.findUnique({
    where: { id: horarioId },
  });

  if (!horario) {
    throw new Error("Horário não encontrado");
  }

  await verificarPermissaoPorQuadra(usuarioId, horario.quadra_id);

  await prisma.horarioQuadra.delete({
    where: { id: horarioId },
  });

  return true;
}