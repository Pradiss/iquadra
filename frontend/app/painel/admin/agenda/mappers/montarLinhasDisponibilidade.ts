import type { DisponibilidadeAdmin } from "@/services/admin-agenda";

import type { LinhaAgenda } from "../types";
import { timeToMinutes } from "../utils";

function normalizarPessoa(participante: unknown) {
  const item = participante as {
    nome?: string;
    usuario?: {
      nome?: string;
    } | null;
  };

  return item.usuario?.nome || item.nome || "Cliente";
}

export function montarLinhasDisponibilidade(
  disponibilidade?: DisponibilidadeAdmin,
) {
  const linhas: LinhaAgenda[] = [];

  for (const item of disponibilidade?.quadras ?? []) {
    const quadra = item.quadra;
    if (!quadra?.id) continue;

    const modalidade = quadra.modalidade || quadra.tipo_piso || null;

    for (const evento of item.eventos_ocupados ?? []) {
      if (evento.tipo === "JOGO" && evento.jogo) {
        const participantes = (evento.jogo.participantes ?? []).map((p) =>
          normalizarPessoa(p),
        );

        const status =
          evento.jogo.status === "PENDENTE" ? "PENDENTE" : "CONFIRMADO";

        linhas.push({
          id: `jogo-${evento.id}`,
          tipo: status === "PENDENTE" ? "PENDENTE" : "JOGO",
          status,
          quadraId: quadra.id,
          quadraNome: quadra.nome,
          modalidade,
          inicio: evento.inicio,
          fim: evento.fim,
          titulo:
            status === "PENDENTE"
              ? participantes[0] || "Reserva pendente"
              : "Jogo",
          subtitulo:
            status === "PENDENTE"
              ? "Aguardando confirmação"
              : participantes.length > 0
                ? participantes.join(" x ")
                : "Partida agendada",
          etiqueta: status === "PENDENTE" ? "Reserva pendente" : "Jogo",
          participantes,
          jogoId: evento.jogo.id,
        });
      }

      if (evento.tipo === "AULA" && evento.aula) {
        linhas.push({
          id: `aula-${evento.id}`,
          tipo: "AULA",
          status: "CONFIRMADO",
          quadraId: quadra.id,
          quadraNome: quadra.nome,
          modalidade,
          inicio: evento.inicio,
          fim: evento.fim,
          titulo: evento.aula.observacoes || "Aula particular",
          subtitulo: evento.aula.professor?.nome
            ? `Instrutor: ${evento.aula.professor.nome}`
            : evento.aula.cliente?.nome
              ? `Cliente: ${evento.aula.cliente.nome}`
              : "Aula confirmada",
          etiqueta: "Aula",
          participantes: [
            evento.aula.cliente?.nome,
            evento.aula.professor?.nome,
          ].filter(Boolean) as string[],
          aulaId: evento.aula.id,
        });
      }

      if (evento.tipo === "BLOQUEIO" && evento.bloqueio) {
        linhas.push({
          id: `bloqueio-${evento.id}`,
          tipo: "BLOQUEIO",
          status: "BLOQUEADO",
          quadraId: quadra.id,
          quadraNome: quadra.nome,
          modalidade,
          inicio: evento.inicio,
          fim: evento.fim,
          titulo: evento.bloqueio.motivo || "Bloqueado",
          subtitulo: "Horário indisponível",
          etiqueta:
            evento.bloqueio.tipo_bloqueio === "EVENTO"
              ? "Evento"
              : "Bloqueio",
          participantes: [],
          bloqueioId: evento.bloqueio.id,
        });
      }
    }

    for (const slot of item.slots ?? []) {
      if (!slot.disponivel || slot.motivo || slot.jogo) continue;

      linhas.push({
        id: `livre-${quadra.id}-${slot.inicio}-${slot.fim}`,
        tipo: "LIVRE",
        status: "DISPONIVEL",
        quadraId: quadra.id,
        quadraNome: quadra.nome,
        modalidade,
        inicio: slot.inicio,
        fim: slot.fim,
        titulo: "Horário livre",
        subtitulo: "Disponível para reserva",
        etiqueta: "Livre",
        participantes: [],
      });
    }
  }

  return linhas.sort((a, b) => {
    const porHora = timeToMinutes(a.inicio) - timeToMinutes(b.inicio);
    return porHora !== 0 ? porHora : a.quadraNome.localeCompare(b.quadraNome);
  });
}