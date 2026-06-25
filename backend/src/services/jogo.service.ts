import { env } from "../config/env";
import { badRequest } from "../errors/app-error";
import { prisma } from "../lib/prisma";
import {
  lockAgendaSlot,
  lockJogo,
  type TransactionClient,
} from "../lib/advisory-lock";
import { invalidateQuadraCache } from "../lib/cache";
import {
  AdicionarParticipanteJogoData,
  CreateJogoData,
  DURACOES_RESERVA_MINUTOS,
} from "../schemas/jogo.schema";
import {
  addDaysToDateOnly,
  buildDateTime,
  formatInAppTimeZone,
  getDiaSemana,
  getLocalDayRange,
  resolvePeriod,
  timeToMinutes,
} from "../utils/date-time";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;

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

type DbClient = typeof prisma | TransactionClient;

type CreateJogoComDuracao = Extract<CreateJogoData, { duracao_minutos: number }>;

function hasDuracaoMinutos(data: CreateJogoData): data is CreateJogoComDuracao {
  return "duracao_minutos" in data;
}

function resolveJogoPeriod(data: CreateJogoData) {
  if (hasDuracaoMinutos(data)) {
    const inicio = buildDateTime(data.data, data.hora_inicio);

    return {
      inicio,
      fim: new Date(inicio.getTime() + data.duracao_minutos * MS_PER_MINUTE),
    };
  }

  return resolvePeriod(data);
}

function getDuracaoMinutos(inicio: Date, fim: Date) {
  return Math.round((fim.getTime() - inicio.getTime()) / MS_PER_MINUTE);
}

function validarDuracaoReserva(inicio: Date, fim: Date) {
  const duracao = getDuracaoMinutos(inicio, fim);

  if (
    !DURACOES_RESERVA_MINUTOS.includes(
      duracao as (typeof DURACOES_RESERVA_MINUTOS)[number]
    )
  ) {
    throw badRequest("Duração da reserva deve ser 60, 90 ou 120 minutos.");
  }
}

function validarHorarioNaoPassado(inicio: Date) {
  if (inicio <= new Date()) {
    throw badRequest("Não é possível agendar em um horário que já passou.");
  }
}

function validarGranularidadeAgendamento(inicio: Date) {
  const inicioLocal = formatInAppTimeZone(inicio);
  const inicioMinutos = timeToMinutes(inicioLocal.hora);

  if (inicioMinutos % env.GRANULARIDADE_AGENDAMENTO_MINUTOS !== 0) {
    throw badRequest(
      `Horário inicial deve respeitar intervalos de ${env.GRANULARIDADE_AGENDAMENTO_MINUTOS} minutos.`
    );
  }
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * MS_PER_MINUTE);
}

async function validarConflitoAgenda(
  db: DbClient,
  quadraId: string,
  inicio: Date,
  fim: Date
) {
  const intervalo = env.INTERVALO_ENTRE_RESERVAS_MINUTOS;
  const inicioComIntervalo = addMinutes(inicio, -intervalo);
  const fimComIntervalo = addMinutes(fim, intervalo);

  const jogoConflitante = await db.jogo.findFirst({
    where: {
      quadra_id: quadraId,
      status: {
        in: ["ABERTO", "COMPLETO"],
      },
      inicio_em: {
        lt: fimComIntervalo,
      },
      fim_em: {
        gt: inicioComIntervalo,
      },
    },
  });

  if (jogoConflitante) {
    throw new Error("Já existe um jogo nesse horário");
  }

  const aulaConflitante = await db.aula.findFirst({
    where: {
      quadra_id: quadraId,
      status: "CONFIRMADA",
      inicio_em: {
        lt: fimComIntervalo,
      },
      fim_em: {
        gt: inicioComIntervalo,
      },
    },
  });

  if (aulaConflitante) {
    throw new Error("Já existe uma aula nesse horário");
  }

  const bloqueioConflitante = await db.bloqueioQuadra.findFirst({
    where: {
      quadra_id: quadraId,
      inicio_em: {
        lt: fimComIntervalo,
      },
      fim_em: {
        gt: inicioComIntervalo,
      },
    },
  });

  if (bloqueioConflitante) {
    throw new Error("Este horário está bloqueado");
  }
}

async function validarHorarioFuncionamento(
  db: DbClient,
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
    db.horarioQuadra.findFirst({
      where: {
        quadra_id: quadraId,
        dia_semana: diaSemana,
        ativo: true,
      },
    }),
    db.horarioEspecialQuadra.findFirst({
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
  const abreMinutos = timeToMinutes(abreAs);
  const fechaMinutos = timeToMinutes(fechaAs);
  const inicioMinutos = timeToMinutes(inicioLocal.hora);
  const fimMinutos = timeToMinutes(fimLocal.hora);

  if (inicioMinutos < abreMinutos || fimMinutos > fechaMinutos) {
    throw new Error("Horario fora do funcionamento da quadra");
  }
}

async function validarPermissaoGerenciarParticipantes(
  db: DbClient,
  usuarioId: string,
  jogo: {
    academia_id: string;
    criado_por_usuario_id: string;
  }
) {
  if (jogo.criado_por_usuario_id === usuarioId) {
    return;
  }

  const vinculoAdmin = await db.academiaUsuario.findFirst({
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

function validarAntecedenciaMaxima(inicio: Date) {
  const limiteMs = env.MAX_DIAS_AGENDAMENTO * MS_PER_DAY;
  const diferencaMs = inicio.getTime() - Date.now();

  if (diferencaMs > limiteMs) {
    throw badRequest(
      `Você só pode agendar jogos com até ${
        env.MAX_DIAS_AGENDAMENTO * 24
      } horas de antecedência.`
    );
  }
}

function getLocalWeekRange(date: Date) {
  const dataLocal = formatInAppTimeZone(date).data;
  const diaSemana = getDiaSemana(dataLocal);
  const offsetSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const inicioSemanaData = addDaysToDateOnly(dataLocal, offsetSegunda);
  const fimSemanaData = addDaysToDateOnly(inicioSemanaData, 7);

  return {
    inicio: getLocalDayRange(inicioSemanaData).inicio,
    fim: getLocalDayRange(fimSemanaData).inicio,
  };
}

async function validarLimiteJogosSemana(
  db: DbClient,
  usuarioId: string,
  inicio: Date
) {
  const semana = getLocalWeekRange(inicio);
  const totalJogosSemana = await db.jogo.count({
    where: {
      criado_por_usuario_id: usuarioId,
      status: {
        not: "CANCELADO",
      },
      inicio_em: {
        gte: semana.inicio,
        lt: semana.fim,
      },
    },
  });

  if (totalJogosSemana >= env.MAX_JOGOS_SEMANA) {
    throw badRequest(
      `Você atingiu o limite de ${env.MAX_JOGOS_SEMANA} jogos por semana.`
    );
  }
}

export async function createJogo(usuarioId: string, data: CreateJogoData) {
  const { inicio, fim } = resolveJogoPeriod(data);

  validarPeriodo(inicio, fim);
  validarDuracaoReserva(inicio, fim);
  validarHorarioNaoPassado(inicio);
  validarGranularidadeAgendamento(inicio);
  validarAntecedenciaMaxima(inicio);

  const jogo = await prisma.$transaction(async (tx) => {
    await lockAgendaSlot(tx, data.quadra_id, inicio);

    const quadra = await tx.quadra.findUnique({
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

    await validarHorarioFuncionamento(tx, data.quadra_id, inicio, fim);
    await validarConflitoAgenda(tx, data.quadra_id, inicio, fim);
    await validarLimiteJogosSemana(tx, usuarioId, inicio);

    const maximoParticipantes = getMaximoParticipantes(data.tipo_jogo, quadra);

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

  invalidateQuadraCache(data.quadra_id, data.academia_id);

  return getJogoById(jogo.id);
}

export async function listJogos(params: {
  academia_id?: string;
  data?: string;
  status?: "ABERTO" | "COMPLETO" | "CANCELADO" | "CONCLUIDO";
  meus?: boolean;
  usuario_id?: string;
  limit?: number;
  cursor?: string;
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

  if (params.meus && params.usuario_id) {
    where.participantes = {
      some: {
        usuario_id: params.usuario_id,
        status: "CONFIRMADO",
      },
    };
  }

  return prisma.jogo.findMany({
    where,
    take: params.limit ?? 50,
    ...(params.cursor
      ? {
          cursor: {
            id: params.cursor,
          },
          skip: 1,
        }
      : {}),
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
    orderBy: [
      {
        inicio_em: "asc",
      },
      {
        id: "asc",
      },
    ],
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
  await prisma.$transaction(async (tx) => {
    await lockJogo(tx, jogoId);

    const jogo = await tx.jogo.findUnique({
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

  const jogoAtualizado = await prisma.jogo.findUnique({
    where: {
      id: jogoId,
    },
    select: {
      quadra_id: true,
      academia_id: true,
    },
  });

  if (jogoAtualizado) {
    invalidateQuadraCache(jogoAtualizado.quadra_id, jogoAtualizado.academia_id);
  }

  return getJogoById(jogoId);
}

export async function adicionarParticipanteJogo(
  usuarioId: string,
  jogoId: string,
  data: AdicionarParticipanteJogoData
) {
  await prisma.$transaction(async (tx) => {
    await lockJogo(tx, jogoId);

    const jogo = await tx.jogo.findUnique({
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

    await validarPermissaoGerenciarParticipantes(tx, usuarioId, jogo);

    if (!["ABERTO", "COMPLETO"].includes(jogo.status)) {
      throw new Error("Este jogo nao esta aberto para participantes");
    }

    const usuario = await tx.usuario.findUnique({
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

  const jogoAtualizado = await prisma.jogo.findUnique({
    where: {
      id: jogoId,
    },
    select: {
      quadra_id: true,
      academia_id: true,
    },
  });

  if (jogoAtualizado) {
    invalidateQuadraCache(jogoAtualizado.quadra_id, jogoAtualizado.academia_id);
  }

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

  await validarPermissaoGerenciarParticipantes(prisma, usuarioId, jogo);

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

  invalidateQuadraCache(jogo.quadra_id, jogo.academia_id);

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

  const jogo = await prisma.jogo.findUnique({
    where: {
      id: jogoId,
    },
    select: {
      quadra_id: true,
      academia_id: true,
    },
  });

  if (jogo) {
    invalidateQuadraCache(jogo.quadra_id, jogo.academia_id);
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
    await lockJogo(tx, jogoId);

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

  invalidateQuadraCache(jogo.quadra_id, jogo.academia_id);

  return getJogoById(jogoId);
}
