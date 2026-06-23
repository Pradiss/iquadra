import { prisma } from "../lib/prisma";
import {
  lockAgendaSlot,
  type TransactionClient,
} from "../lib/advisory-lock";
import { invalidateQuadraCache } from "../lib/cache";
import { CreateBloqueioData } from "../schemas/bloqueio.schema";
import { resolvePeriod } from "../utils/date-time";

type DbClient = typeof prisma | TransactionClient;

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

async function validarConflitos(
  db: DbClient,
  quadraId: string,
  inicio: Date,
  fim: Date
) {
  const jogoConflitante = await db.jogo.findFirst({
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

  const aulaConflitante = await db.aula.findFirst({
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

  const bloqueioConflitante = await db.bloqueioQuadra.findFirst({
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
  const quadra = await verificarPermissaoPorQuadra(usuarioId, quadraId);

  const { inicio, fim } = resolvePeriod(data);

  validarPeriodo(inicio, fim);

  const bloqueio = await prisma.$transaction(async (tx) => {
    await lockAgendaSlot(tx, quadraId, inicio);
    await validarConflitos(tx, quadraId, inicio, fim);

    return tx.bloqueioQuadra.create({
      data: {
        quadra_id: quadraId,
        inicio_em: inicio,
        fim_em: fim,
        tipo_bloqueio: data.tipo_bloqueio ?? "OUTRO",
        motivo: data.motivo,
        criado_por_usuario_id: usuarioId,
      },
    });
  });

  invalidateQuadraCache(quadraId, quadra.academia_id);

  return bloqueio;
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

  const quadra = await prisma.quadra.findUnique({
    where: {
      id: bloqueio.quadra_id,
    },
    select: {
      academia_id: true,
    },
  });

  invalidateQuadraCache(bloqueio.quadra_id, quadra?.academia_id);

  return true;
}
