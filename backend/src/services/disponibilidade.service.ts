import { prisma } from "../lib/prisma";

function getDiaSemana(data: string) {
  const date = new Date(`${data}T00:00:00`);
  return date.getDay(); // 0 domingo, 1 segunda...
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function buildDateTime(data: string, time: string) {
  return new Date(`${data}T${time}:00`);
}

function hasConflict(
  slotInicio: Date,
  slotFim: Date,
  itemInicio: Date,
  itemFim: Date
) {
  return itemInicio < slotFim && itemFim > slotInicio;
}

export async function getDisponibilidadeQuadra(quadraId: string, data: string) {
  const quadra = await prisma.quadra.findUnique({
    where: { id: quadraId },
    include: {
      academia: true,
    },
  });

  if (!quadra) {
    throw new Error("Quadra não encontrada");
  }

  if (!quadra.ativa) {
    throw new Error("Quadra inativa");
  }

  const diaSemana = getDiaSemana(data);

  const horarioPadrao = await prisma.horarioQuadra.findFirst({
    where: {
      quadra_id: quadraId,
      dia_semana: diaSemana,
      ativo: true,
    },
  });

  if (!horarioPadrao) {
    return {
      quadra: {
        id: quadra.id,
        nome: quadra.nome,
      },
      data,
      aberta: false,
      motivo: "Quadra sem horário configurado para esta data",
      slots: [],
    };
  }

  const inicioDia = new Date(`${data}T00:00:00`);
  const fimDia = new Date(`${data}T23:59:59`);

  const horarioEspecial = await prisma.horarioEspecialQuadra.findFirst({
    where: {
      quadra_id: quadraId,
      data: {
        gte: inicioDia,
        lte: fimDia,
      },
    },
  });

  if (horarioEspecial?.fechada) {
    return {
      quadra: {
        id: quadra.id,
        nome: quadra.nome,
      },
      data,
      aberta: false,
      motivo: horarioEspecial.motivo || "Quadra fechada nesta data",
      slots: [],
    };
  }

  const abreAs = horarioEspecial?.abre_as || horarioPadrao.abre_as;
  const fechaAs = horarioEspecial?.fecha_as || horarioPadrao.fecha_as;
  const duracao = horarioPadrao.duracao_slot_minutos;

  const bloqueios = await prisma.bloqueioQuadra.findMany({
    where: {
      quadra_id: quadraId,
      inicio_em: {
        lt: fimDia,
      },
      fim_em: {
        gt: inicioDia,
      },
    },
  });

  const jogos = await prisma.jogo.findMany({
    where: {
      quadra_id: quadraId,
      status: {
        in: ["ABERTO", "COMPLETO"],
      },
      inicio_em: {
        lt: fimDia,
      },
      fim_em: {
        gt: inicioDia,
      },
    },
  });

  const aulas = await prisma.aula.findMany({
    where: {
      quadra_id: quadraId,
      status: "CONFIRMADA",
      inicio_em: {
        lt: fimDia,
      },
      fim_em: {
        gt: inicioDia,
      },
    },
  });

  const slots = [];

  let atual = timeToMinutes(abreAs);
  const fim = timeToMinutes(fechaAs);

  while (atual + duracao <= fim) {
    const inicio = minutesToTime(atual);
    const fimSlot = minutesToTime(atual + duracao);

    const slotInicio = buildDateTime(data, inicio);
    const slotFim = buildDateTime(data, fimSlot);

    const conflitoBloqueio = bloqueios.some((bloqueio) =>
      hasConflict(slotInicio, slotFim, bloqueio.inicio_em, bloqueio.fim_em)
    );

    const conflitoJogo = jogos.some((jogo) =>
      hasConflict(slotInicio, slotFim, jogo.inicio_em, jogo.fim_em)
    );

    const conflitoAula = aulas.some((aula) =>
      hasConflict(slotInicio, slotFim, aula.inicio_em, aula.fim_em)
    );

    const disponivel = !conflitoBloqueio && !conflitoJogo && !conflitoAula;

    slots.push({
      inicio,
      fim: fimSlot,
      disponivel,
      motivo: disponivel
        ? null
        : conflitoBloqueio
          ? "BLOQUEADO"
          : conflitoJogo
            ? "JOGO"
            : "AULA",
    });

    atual += duracao;
  }

  return {
    quadra: {
      id: quadra.id,
      nome: quadra.nome,
      academia: quadra.academia.nome,
    },
    data,
    aberta: true,
    abre_as: abreAs,
    fecha_as: fechaAs,
    duracao_slot_minutos: duracao,
    slots,
  };
}