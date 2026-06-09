import { prisma } from "../lib/prisma";
import { CreateAmizadeData } from "../schemas/amizade.schema";

export async function solicitarAmizade(usuarioId: string, data: CreateAmizadeData) {
  if (usuarioId === data.amigo_id) {
    throw new Error("Você não pode adicionar você mesmo como amigo");
  }

  const amigo = await prisma.usuario.findUnique({
    where: {
      id: data.amigo_id,
    },
  });

  if (!amigo) {
    throw new Error("Usuário não encontrado");
  }

  const amizadeExistente = await prisma.amizade.findFirst({
    where: {
      OR: [
        {
          usuario_id: usuarioId,
          amigo_id: data.amigo_id,
        },
        {
          usuario_id: data.amigo_id,
          amigo_id: usuarioId,
        },
      ],
    },
  });

  if (amizadeExistente) {
    throw new Error("Já existe uma solicitação ou amizade com este usuário");
  }

  return prisma.amizade.create({
    data: {
      usuario_id: usuarioId,
      amigo_id: data.amigo_id,
      status: "PENDENTE",
    },
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          foto_perfil: true,
        },
      },
      amigo: {
        select: {
          id: true,
          nome: true,
          email: true,
          foto_perfil: true,
        },
      },
    },
  });
}

export async function listarAmizades(usuarioId: string) {
  return prisma.amizade.findMany({
    where: {
      OR: [
        {
          usuario_id: usuarioId,
        },
        {
          amigo_id: usuarioId,
        },
      ],
    },
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          foto_perfil: true,
        },
      },
      amigo: {
        select: {
          id: true,
          nome: true,
          email: true,
          foto_perfil: true,
        },
      },
    },
    orderBy: {
      criado_em: "desc",
    },
  });
}

export async function aceitarAmizade(usuarioId: string, amizadeId: string) {
  const amizade = await prisma.amizade.findUnique({
    where: {
      id: amizadeId,
    },
  });

  if (!amizade) {
    throw new Error("Solicitação de amizade não encontrada");
  }

  if (amizade.amigo_id !== usuarioId) {
    throw new Error("Você não pode aceitar esta solicitação");
  }

  if (amizade.status !== "PENDENTE") {
    throw new Error("Esta solicitação não está pendente");
  }

  return prisma.amizade.update({
    where: {
      id: amizadeId,
    },
    data: {
      status: "ACEITA",
    },
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          foto_perfil: true,
        },
      },
      amigo: {
        select: {
          id: true,
          nome: true,
          email: true,
          foto_perfil: true,
        },
      },
    },
  });
}

export async function recusarAmizade(usuarioId: string, amizadeId: string) {
  const amizade = await prisma.amizade.findUnique({
    where: {
      id: amizadeId,
    },
  });

  if (!amizade) {
    throw new Error("Solicitação de amizade não encontrada");
  }

  if (amizade.amigo_id !== usuarioId) {
    throw new Error("Você não pode recusar esta solicitação");
  }

  if (amizade.status !== "PENDENTE") {
    throw new Error("Esta solicitação não está pendente");
  }

  return prisma.amizade.update({
    where: {
      id: amizadeId,
    },
    data: {
      status: "RECUSADA",
    },
  });
}

export async function removerAmizade(usuarioId: string, amizadeId: string) {
  const amizade = await prisma.amizade.findUnique({
    where: {
      id: amizadeId,
    },
  });

  if (!amizade) {
    throw new Error("Amizade não encontrada");
  }

  const participaDaAmizade =
    amizade.usuario_id === usuarioId || amizade.amigo_id === usuarioId;

  if (!participaDaAmizade) {
    throw new Error("Você não pode remover esta amizade");
  }

  await prisma.amizade.delete({
    where: {
      id: amizadeId,
    },
  });

  return true;
}