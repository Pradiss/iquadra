import { prisma } from "../lib/prisma";
import { ConvidarJogadorData } from "../schemas/convite-jogo.schema";

async function validarAmizade(usuarioId: string, amigoId: string) {
  const amizade = await prisma.amizade.findFirst({
    where: {
      status: "ACEITA",
      OR: [
        {
          usuario_id: usuarioId,
          amigo_id: amigoId,
        },
        {
          usuario_id: amigoId,
          amigo_id: usuarioId,
        },
      ],
    },
  });

  if (!amizade) {
    throw new Error("Você só pode convidar jogadores que são seus amigos");
  }
}

export async function convidarJogadorParaJogo(
  usuarioId: string,
  jogoId: string,
  data: ConvidarJogadorData
) {
  if (usuarioId === data.convidado_usuario_id) {
    throw new Error("Você não pode convidar você mesmo");
  }

  const jogo = await prisma.jogo.findUnique({
    where: { id: jogoId },
    include: {
      participantes: {
        where: { status: "CONFIRMADO" },
      },
    },
  });

  if (!jogo) {
    throw new Error("Jogo não encontrado");
  }

  if (jogo.status !== "ABERTO") {
    throw new Error("Este jogo não está aberto para convites");
  }

  const ehParticipante = jogo.participantes.some(
    (participante) => participante.usuario_id === usuarioId
  );

  if (!ehParticipante) {
    throw new Error("Você precisa participar do jogo para convidar alguém");
  }

  if (jogo.participantes.length >= jogo.maximo_participantes) {
    throw new Error("Este jogo já está completo");
  }

  const convidado = await prisma.usuario.findUnique({
    where: { id: data.convidado_usuario_id },
  });

  if (!convidado) {
    throw new Error("Usuário convidado não encontrado");
  }

  await validarAmizade(usuarioId, data.convidado_usuario_id);

  const jaParticipa = jogo.participantes.some(
    (participante) => participante.usuario_id === data.convidado_usuario_id
  );

  if (jaParticipa) {
    throw new Error("Este usuário já participa do jogo");
  }

  const conviteExistente = await prisma.conviteJogo.findUnique({
    where: {
      jogo_id_convidado_usuario_id: {
        jogo_id: jogoId,
        convidado_usuario_id: data.convidado_usuario_id,
      },
    },
  });

  if (conviteExistente && conviteExistente.status === "PENDENTE") {
    throw new Error("Este usuário já foi convidado para este jogo");
  }

  return prisma.conviteJogo.create({
    data: {
      jogo_id: jogoId,
      convidado_usuario_id: data.convidado_usuario_id,
      enviado_por_id: usuarioId,
      status: "PENDENTE",
    },
    include: {
      jogo: {
        include: {
          quadra: true,
          academia: true,
        },
      },
      convidado: {
        select: {
          id: true,
          nome: true,
          foto_perfil: true,
        },
      },
      enviadoPor: {
        select: {
          id: true,
          nome: true,
          foto_perfil: true,
        },
      },
    },
  });
}

export async function listarConvitesJogos(usuarioId: string) {
  return prisma.conviteJogo.findMany({
    where: {
      convidado_usuario_id: usuarioId,
    },
    include: {
      jogo: {
        include: {
          academia: true,
          quadra: true,
          participantes: {
            where: { status: "CONFIRMADO" },
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
      },
      enviadoPor: {
        select: {
          id: true,
          nome: true,
          foto_perfil: true,
        },
      },
    },
    orderBy: {
      criado_em: "desc",
    },
  });
}

export async function aceitarConviteJogo(usuarioId: string, conviteId: string) {
  const convite = await prisma.conviteJogo.findUnique({
    where: { id: conviteId },
    include: {
      jogo: {
        include: {
          participantes: {
            where: { status: "CONFIRMADO" },
          },
        },
      },
    },
  });

  if (!convite) {
    throw new Error("Convite não encontrado");
  }

  if (convite.convidado_usuario_id !== usuarioId) {
    throw new Error("Você não pode aceitar este convite");
  }

  if (convite.status !== "PENDENTE") {
    throw new Error("Este convite não está pendente");
  }

  if (convite.jogo.status !== "ABERTO") {
    throw new Error("Este jogo não está mais aberto");
  }

  const jaParticipa = convite.jogo.participantes.some(
    (participante) => participante.usuario_id === usuarioId
  );

  if (jaParticipa) {
    throw new Error("Você já participa deste jogo");
  }

  if (convite.jogo.participantes.length >= convite.jogo.maximo_participantes) {
    throw new Error("Este jogo já está completo");
  }

  const totalAposAceitar = convite.jogo.participantes.length + 1;

  const result = await prisma.$transaction(async (tx) => {
    await tx.participanteJogo.create({
      data: {
        jogo_id: convite.jogo_id,
        usuario_id: usuarioId,
        papel: "JOGADOR",
        status: "CONFIRMADO",
      },
    });

    const conviteAtualizado = await tx.conviteJogo.update({
      where: { id: conviteId },
      data: {
        status: "ACEITO",
      },
    });

    if (totalAposAceitar >= convite.jogo.maximo_participantes) {
      await tx.jogo.update({
        where: { id: convite.jogo_id },
        data: {
          status: "COMPLETO",
        },
      });
    }

    return conviteAtualizado;
  });

  return result;
}

export async function recusarConviteJogo(usuarioId: string, conviteId: string) {
  const convite = await prisma.conviteJogo.findUnique({
    where: { id: conviteId },
  });

  if (!convite) {
    throw new Error("Convite não encontrado");
  }

  if (convite.convidado_usuario_id !== usuarioId) {
    throw new Error("Você não pode recusar este convite");
  }

  if (convite.status !== "PENDENTE") {
    throw new Error("Este convite não está pendente");
  }

  return prisma.conviteJogo.update({
    where: { id: conviteId },
    data: {
      status: "RECUSADO",
    },
  });
}
