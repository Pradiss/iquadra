import { prisma } from "../lib/prisma";
import {
  AdicionarParticipanteJogoData,
  CreateJogoData,
} from "../schemas/jogo.schema";
import {
  formatInAppTimeZone,
  getDiaSemana,
  getLocalDayRange,
  resolvePeriod,
  timeToMinutes,
} from "../utils/date-time";

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

async function validarHorarioFuncionamento(
  quadraId: string,
  inicio: Date,
  fim: Date
) {
  const inicioLocal = formatInAppTimeZone(inicio);
  const fimLocal = formatInAppTimeZone(fim);

  if (inicioLocal.data !== fimLocal.data) {
    throw new Error("Horario deve iniciar e terminar no mesmo dia");
  }

  const { inicio: inicioDia, fim: fimDia } = getLocalDayRange(inicioLocal.data);
  const diaSemana = getDiaSemana(inicioLocal.data);

  const [horarioPadrao, horarioEspecial] = await Promise.all([
    prisma.horarioQuadra.findFirst({
      where: {
        quadra_id: quadraId,
        dia_semana: diaSemana,
        ativo: true,
      },
    }),
    prisma.horarioEspecialQuadra.findFirst({
      where: {
        quadra_id: quadraId,
        data: {
          gte: inicioDia,
          lt: fimDia,
        },
      },
    }),
  ]);

  if (!horarioPadrao) {
    throw new Error("Quadra sem horario configurado para esta data");
  }

  if (horarioEspecial?.fechada) {
    throw new Error("Quadra fechada nesta data");
  }

  const abreAs = horarioEspecial?.abre_as || horarioPadrao.abre_as;
  const fechaAs = horarioEspecial?.fecha_as || horarioPadrao.fecha_as;
  const duracao = horarioPadrao.duracao_slot_minutos;
  const abreMinutos = timeToMinutes(abreAs);
  const fechaMinutos = timeToMinutes(fechaAs);
  const inicioMinutos = timeToMinutes(inicioLocal.hora);
  const fimMinutos = timeToMinutes(fimLocal.hora);

  if (inicioMinutos < abreMinutos || fimMinutos > fechaMinutos) {
    throw new Error("Horario fora do funcionamento da quadra");
  }

  if (fimMinutos - inicioMinutos !== duracao) {
    throw new Error(`Horario deve ter ${duracao} minutos`);
  }

  if ((inicioMinutos - abreMinutos) % duracao !== 0) {
    throw new Error("Horario nao corresponde a um slot configurado");
  }
}

async function validarPermissaoGerenciarParticipantes(
  usuarioId: string,
  jogo: {
    academia_id: string;
    criado_por_usuario_id: string;
  }
) {
  if (jogo.criado_por_usuario_id === usuarioId) {
    return;
  }

  const vinculoAdmin = await prisma.academiaUsuario.findFirst({
    where: {
      academia_id: jogo.academia_id,
      usuario_id: usuarioId,
      status: "ATIVO",
      perfil: {
        in: ["DONO", "ADMIN_ACADEMIA"],
      },
    },
  });

  if (!vinculoAdmin) {
    throw new Error("Voce nao tem permissao para gerenciar participantes");
  }
}

function getStatusPorTotalParticipantes(total: number, maximo: number) {
  return total >= maximo ? "COMPLETO" : "ABERTO";
}

export async function createJogo(usuarioId: string, data: CreateJogoData) {
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

  await validarHorarioFuncionamento(data.quadra_id, inicio, fim);
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
    const { inicio, fim } = getLocalDayRange(params.data);

    where.inicio_em = {
      gte: inicio,
      lt: fim,
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
          status: {
            in: ["CONFIRMADO", "SAIU", "REMOVIDO"],
          },
        },
      },
    },
  });

  if (!jogo) {
    throw new Error("Jogo não encontrado");
  }

  if (!["ABERTO", "COMPLETO"].includes(jogo.status)) {
    throw new Error("Este jogo não está aberto para participantes");
  }

  const participantesConfirmados = jogo.participantes.filter(
    (participante) => participante.status === "CONFIRMADO"
  );

  const participanteExistente = jogo.participantes.find(
    (participante) => participante.usuario_id === usuarioId
  );

  if (participanteExistente?.status === "CONFIRMADO") {
    throw new Error("Você já participa deste jogo");
  }

  if (participantesConfirmados.length >= jogo.maximo_participantes) {
    throw new Error("Este jogo já está completo");
  }

  const totalParticipantes = participantesConfirmados.length + 1;

  await prisma.$transaction(async (tx) => {
    if (participanteExistente) {
      await tx.participanteJogo.update({
        where: {
          id: participanteExistente.id,
        },
        data: {
          status: "CONFIRMADO",
          papel:
            participanteExistente.papel === "CRIADOR" ? "CRIADOR" : "JOGADOR",
        },
      });
    } else {
      await tx.participanteJogo.create({
        data: {
          jogo_id: jogoId,
          usuario_id: usuarioId,
          papel: "JOGADOR",
          status: "CONFIRMADO",
        },
      });
    }

    await tx.conviteJogo.updateMany({
      where: {
        jogo_id: jogoId,
        convidado_usuario_id: usuarioId,
        status: "PENDENTE",
      },
      data: {
        status: "ACEITO",
      },
    });

    const jogoFicouCompleto =
      totalParticipantes >= jogo.maximo_participantes;

    await tx.jogo.update({
      where: {
        id: jogoId,
      },
      data: {
        status: jogoFicouCompleto ? "COMPLETO" : "ABERTO",
      },
    });

    if (jogoFicouCompleto) {
      await tx.conviteJogo.updateMany({
        where: {
          jogo_id: jogoId,
          status: "PENDENTE",
        },
        data: {
          status: "CANCELADO",
        },
      });
    }
  });

  return getJogoById(jogoId);
}

export async function adicionarParticipanteJogo(
  usuarioId: string,
  jogoId: string,
  data: AdicionarParticipanteJogoData
) {
  const jogo = await prisma.jogo.findUnique({
    where: {
      id: jogoId,
    },
    include: {
      participantes: {
        where: {
          status: {
            in: ["CONFIRMADO", "SAIU", "REMOVIDO"],
          },
        },
      },
    },
  });

  if (!jogo) {
    throw new Error("Jogo nao encontrado");
  }

  await validarPermissaoGerenciarParticipantes(usuarioId, jogo);

  if (!["ABERTO", "COMPLETO"].includes(jogo.status)) {
    throw new Error("Este jogo nao esta aberto para participantes");
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      id: data.usuario_id,
    },
  });

  if (!usuario) {
    throw new Error("Usuario nao encontrado");
  }

  const participantesConfirmados = jogo.participantes.filter(
    (participante) => participante.status === "CONFIRMADO"
  );

  const participanteExistente = jogo.participantes.find(
    (participante) => participante.usuario_id === data.usuario_id
  );

  if (participanteExistente?.status === "CONFIRMADO") {
    throw new Error("Este usuario ja participa do jogo");
  }

  if (participantesConfirmados.length >= jogo.maximo_participantes) {
    throw new Error("Este jogo ja esta completo");
  }

  const totalParticipantes = participantesConfirmados.length + 1;
  const jogoFicouCompleto =
    totalParticipantes >= jogo.maximo_participantes;

  await prisma.$transaction(async (tx) => {
    if (participanteExistente) {
      await tx.participanteJogo.update({
        where: {
          id: participanteExistente.id,
        },
        data: {
          status: "CONFIRMADO",
          papel:
            data.usuario_id === jogo.criado_por_usuario_id
              ? "CRIADOR"
              : "JOGADOR",
        },
      });
    } else {
      await tx.participanteJogo.create({
        data: {
          jogo_id: jogoId,
          usuario_id: data.usuario_id,
          papel:
            data.usuario_id === jogo.criado_por_usuario_id
              ? "CRIADOR"
              : "JOGADOR",
          status: "CONFIRMADO",
        },
      });
    }

    await tx.conviteJogo.updateMany({
      where: {
        jogo_id: jogoId,
        convidado_usuario_id: data.usuario_id,
        status: "PENDENTE",
      },
      data: {
        status: "ACEITO",
      },
    });

    await tx.jogo.update({
      where: {
        id: jogoId,
      },
      data: {
        status: getStatusPorTotalParticipantes(
          totalParticipantes,
          jogo.maximo_participantes
        ),
      },
    });

    if (jogoFicouCompleto) {
      await tx.conviteJogo.updateMany({
        where: {
          jogo_id: jogoId,
          status: "PENDENTE",
        },
        data: {
          status: "CANCELADO",
        },
      });
    }
  });

  return getJogoById(jogoId);
}

export async function removerParticipanteJogo(
  usuarioId: string,
  jogoId: string,
  participanteUsuarioId: string
) {
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
    throw new Error("Jogo nao encontrado");
  }

  await validarPermissaoGerenciarParticipantes(usuarioId, jogo);

  if (!["ABERTO", "COMPLETO"].includes(jogo.status)) {
    throw new Error("Este jogo nao esta aberto para remover participantes");
  }

  const participante = jogo.participantes.find(
    (item) => item.usuario_id === participanteUsuarioId
  );

  if (!participante) {
    throw new Error("Este usuario nao participa do jogo");
  }

  const totalRestante = jogo.participantes.length - 1;

  await prisma.$transaction(async (tx) => {
    await tx.participanteJogo.update({
      where: {
        id: participante.id,
      },
      data: {
        status: "REMOVIDO",
      },
    });

    await tx.jogo.update({
      where: {
        id: jogoId,
      },
      data: {
        status:
          totalRestante === 0
            ? "SEM_PARTICIPANTES"
            : getStatusPorTotalParticipantes(
                totalRestante,
                jogo.maximo_participantes
              ),
      },
    });

    if (totalRestante === 0) {
      await tx.conviteJogo.updateMany({
        where: {
          jogo_id: jogoId,
          status: "PENDENTE",
        },
        data: {
          status: "CANCELADO",
        },
      });
    }
  });

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
    await prisma.$transaction(async (tx) => {
      await tx.jogo.update({
        where: {
          id: jogoId,
        },
        data: {
          status: "SEM_PARTICIPANTES",
        },
      });

      await tx.conviteJogo.updateMany({
        where: {
          jogo_id: jogoId,
          status: "PENDENTE",
        },
        data: {
          status: "CANCELADO",
        },
      });
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

  const vinculoAdmin = await prisma.academiaUsuario.findFirst({
    where: {
      academia_id: jogo.academia_id,
      usuario_id: usuarioId,
      status: "ATIVO",
      perfil: {
        in: ["DONO", "ADMIN_ACADEMIA"],
      },
    },
  });

  const podeCancelar =
    jogo.criado_por_usuario_id === usuarioId ||
    jogo.responsavel_usuario_id === usuarioId ||
    Boolean(vinculoAdmin);

  if (!podeCancelar) {
    throw new Error("Você não tem permissão para cancelar este jogo");
  }

  await prisma.$transaction(async (tx) => {
    await tx.jogo.update({
      where: {
        id: jogoId,
      },
      data: {
        status: "CANCELADO",
      },
    });

    await tx.conviteJogo.updateMany({
      where: {
        jogo_id: jogoId,
        status: "PENDENTE",
      },
      data: {
        status: "CANCELADO",
      },
    });
  });

  return getJogoById(jogoId);
}
