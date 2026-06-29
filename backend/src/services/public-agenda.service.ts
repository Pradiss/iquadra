import { prisma } from "../lib/prisma";
import { getDisponibilidadeAcademia } from "./disponibilidade.service";

export async function listarAcademiasPublicas() {
  return prisma.academia.findMany({
    where: { status: "ATIVO" },
    select: {
      nome: true,
      slug: true,
      cidade: true,
      estado: true,
    },
    orderBy: { nome: "asc" },
  });
}

export async function buscarAcademiaPublicaPorSlug(slug: string) {
  const academia = await prisma.academia.findUnique({
    where: { slug },
    select: {
      nome: true,
      slug: true,
      cidade: true,
      estado: true,
      status: true,
    },
  });

  if (!academia || academia.status !== "ATIVO") {
    throw new Error("Academia não encontrada");
  }

  return {
    nome: academia.nome,
    slug: academia.slug,
    cidade: academia.cidade,
    estado: academia.estado,
  };
}

export async function buscarDisponibilidadePublicaPorSlug(
  slug: string,
  data: string,
) {
  const academia = await prisma.academia.findUnique({
    where: { slug },
    select: {
      id: true,
      nome: true,
      slug: true,
      cidade: true,
      estado: true,
      status: true,
    },
  });

  if (!academia || academia.status !== "ATIVO") {
    throw new Error("Academia não encontrada");
  }

  const disponibilidade = await getDisponibilidadeAcademia(academia.id, data, {
    includeParticipantDetails: true,
  });

  return {
    academia: {
      nome: academia.nome,
      slug: academia.slug,
      cidade: academia.cidade,
      estado: academia.estado,
      duracoes_reserva_minutos: disponibilidade.academia.duracoes_reserva_minutos,
    },
    data,
    quadras: disponibilidade.quadras.map((item) => ({
      quadra: {
        nome: item.quadra.nome,
        tipo_piso: item.quadra.tipo_piso,
        modalidade: item.quadra.modalidade,
        valor_hora: item.quadra.valor_hora,
        coberta: item.quadra.coberta,
        capacidade_minima: item.quadra.capacidade_minima,
        capacidade_maxima: item.quadra.capacidade_maxima,
        permite_simples: item.quadra.permite_simples,
        permite_dupla: item.quadra.permite_dupla,
      },
      aberta: item.aberta,
      motivo: item.motivo,
      abre_as: item.abre_as,
      fecha_as: item.fecha_as,
      duracoes_reserva_minutos: item.duracoes_reserva_minutos,
      duracao_slot_minutos: item.duracao_slot_minutos,
      slots: item.slots.map((slot) => ({
        inicio: slot.inicio,
        fim: slot.fim,
        disponivel: slot.disponivel,
        motivo: slot.motivo,
        capacidade_minima: slot.capacidade_minima,
        capacidade_maxima: slot.capacidade_maxima,
        permite_simples: slot.permite_simples,
        permite_dupla: slot.permite_dupla,
        jogadores_confirmados: slot.jogadores_confirmados,
        vagas_disponiveis: slot.vagas_disponiveis,
        jogo: slot.jogo
          ? {
              tipo_jogo: slot.jogo.tipo_jogo,
              status: slot.jogo.status,
              maximo_participantes: slot.jogo.maximo_participantes,
              jogadores_confirmados: slot.jogo.jogadores_confirmados,
              vagas_disponiveis: slot.jogo.vagas_disponiveis,
              participantes:
                slot.jogo.participantes?.map((participante) => ({
                  nome: participante.nome,
                  foto_perfil: participante.foto_perfil,
                  categoria: participante.categoria,
                })) ?? [],
            }
          : null,
      })),
    })),
  };
}
