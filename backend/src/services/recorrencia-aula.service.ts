import { prisma } from "../lib/prisma";
import { CreateRecorrenciaAulaData } from "../schemas/recorrencia-aula.schema";
import {
  addDaysToDateOnly,
  buildDateTime,
  formatInAppTimeZone,
  getDiaSemana,
} from "../utils/date-time";

function formatarConflito(date: Date) {
  const { data, hora } = formatInAppTimeZone(date);

  return `${data} ${hora}`;
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
    throw new Error("Você não tem permissão para criar recorrência nesta academia");
  }
}

async function validarConflitos(quadraId: string, inicio: Date, fim: Date) {
  const jogo = await prisma.jogo.findFirst({
    where: {
      quadra_id: quadraId,
      status: { in: ["ABERTO", "COMPLETO"] },
      inicio_em: { lt: fim },
      fim_em: { gt: inicio },
    },
  });

  if (jogo) throw new Error(`Conflito com jogo em ${formatarConflito(inicio)}`);

  const aula = await prisma.aula.findFirst({
    where: {
      quadra_id: quadraId,
      status: "CONFIRMADA",
      inicio_em: { lt: fim },
      fim_em: { gt: inicio },
    },
  });

  if (aula) throw new Error(`Conflito com aula em ${formatarConflito(inicio)}`);

  const bloqueio = await prisma.bloqueioQuadra.findFirst({
    where: {
      quadra_id: quadraId,
      inicio_em: { lt: fim },
      fim_em: { gt: inicio },
    },
  });

  if (bloqueio) {
    throw new Error(`Conflito com bloqueio em ${formatarConflito(inicio)}`);
  }
}

export async function createRecorrenciaAula(
  usuarioId: string,
  data: CreateRecorrenciaAulaData
) {
  await verificarPermissaoAcademia(usuarioId, data.academia_id);

  const quadra = await prisma.quadra.findUnique({
    where: { id: data.quadra_id },
  });

  if (!quadra) throw new Error("Quadra não encontrada");
  if (!quadra.ativa) throw new Error("Quadra inativa");
  if (quadra.academia_id !== data.academia_id) {
    throw new Error("Quadra não pertence à academia informada");
  }

  const inicioBase = buildDateTime(data.data_inicio, "00:00");
  const dataFim = data.data_fim ?? addDaysToDateOnly(data.data_inicio, 90);
  const fimBase = buildDateTime(dataFim, "00:00");

  const aulasParaCriar: {
    inicio_em: Date;
    fim_em: Date;
  }[] = [];

  let dataAtual = data.data_inicio;

  while (dataAtual <= dataFim) {
    const diaSemana = getDiaSemana(dataAtual);

    if (data.dias_semana.includes(diaSemana)) {
      const inicio = buildDateTime(dataAtual, data.horario_inicio);
      const fim = buildDateTime(dataAtual, data.horario_fim);

      if (fim <= inicio) {
        throw new Error("Horário final deve ser maior que o horário inicial");
      }

      await validarConflitos(data.quadra_id, inicio, fim);

      aulasParaCriar.push({
        inicio_em: inicio,
        fim_em: fim,
      });
    }

    dataAtual = addDaysToDateOnly(dataAtual, 1);
  }

  if (aulasParaCriar.length === 0) {
    throw new Error("Nenhuma aula foi gerada para os dias informados");
  }

  const result = await prisma.$transaction(async (tx) => {
    const recorrencia = await tx.recorrenciaAula.create({
      data: {
        academia_id: data.academia_id,
        quadra_id: data.quadra_id,
        professor_id: data.professor_id,
        dias_semana: data.dias_semana.join(","),
        data_inicio: inicioBase,
        data_fim: fimBase,
        horario_inicio: data.horario_inicio,
        horario_fim: data.horario_fim,
      },
    });

    await tx.aula.createMany({
      data: aulasParaCriar.map((aula) => ({
        academia_id: data.academia_id,
        quadra_id: data.quadra_id,
        professor_id: data.professor_id,
        inicio_em: aula.inicio_em,
        fim_em: aula.fim_em,
        recorrente: true,
        recorrencia_id: recorrencia.id,
        observacoes: data.observacoes,
      })),
    });

    return recorrencia;
  });

  return getRecorrenciaAulaById(result.id);
}

export async function listRecorrenciasAula(params: {
  academia_id?: string;
  quadra_id?: string;
  professor_id?: string;
}) {
  const where: any = {};

  if (params.academia_id) where.academia_id = params.academia_id;
  if (params.quadra_id) where.quadra_id = params.quadra_id;
  if (params.professor_id) where.professor_id = params.professor_id;

  return prisma.recorrenciaAula.findMany({
    where,
    include: {
      academia: true,
      quadra: true,
      aulas: true,
    },
    orderBy: {
      criado_em: "desc",
    },
  });
}

export async function getRecorrenciaAulaById(id: string) {
  const recorrencia = await prisma.recorrenciaAula.findUnique({
    where: { id },
    include: {
      academia: true,
      quadra: true,
      aulas: true,
    },
  });

  if (!recorrencia) {
    throw new Error("Recorrência não encontrada");
  }

  return recorrencia;
}

export async function cancelarRecorrenciaAula(
  usuarioId: string,
  recorrenciaId: string
) {
  const recorrencia = await prisma.recorrenciaAula.findUnique({
    where: { id: recorrenciaId },
  });

  if (!recorrencia) {
    throw new Error("Recorrência não encontrada");
  }

  await verificarPermissaoAcademia(usuarioId, recorrencia.academia_id);

  await prisma.$transaction([
    prisma.recorrenciaAula.update({
      where: { id: recorrenciaId },
      data: { status: "CANCELADA" },
    }),
    prisma.aula.updateMany({
      where: {
        recorrencia_id: recorrenciaId,
        status: "CONFIRMADA",
      },
      data: {
        status: "CANCELADA",
      },
    }),
  ]);

  return getRecorrenciaAulaById(recorrenciaId);
}
