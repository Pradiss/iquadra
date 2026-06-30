import api from "@/services/api";

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T };
  return data.data ?? (response.data as T);
}

export type TipoJogoAgenda = "SIMPLES" | "DUPLA";

export type QuadraAgenda = {
  id: string;
  nome: string;
  modalidade?: string | null;
  tipo_piso?: string | null;
  coberta?: boolean | null;
};

export type UsuarioBusca = {
  id: string;
  nome: string;
  telefone?: string | null;
  foto_perfil?: string | null;
};

export type ParticipanteForm = {
  id?: string;
  usuario_id?: string;
  nome?: string;
  telefone?: string;
};

export type AgendaParticipante = {
  id: string;
  usuario_id?: string | null;
  nome_externo?: string | null;
  telefone_externo?: string | null;
  usuario?: {
    id: string;
    nome: string;
    telefone?: string | null;
    foto_perfil?: string | null;
  } | null;
};

export type AgendaJogo = {
  id: string;
  tipo_jogo: TipoJogoAgenda;
  status?: string;
  maximo_participantes: number;
  participantes: AgendaParticipante[];
};

export type AgendaHorario = {
  id: string;
  hora: string;
  horaFim: string;
  quadraId: string;
  disponivel: boolean;
  motivo: "JOGO" | "AULA" | "BLOQUEADO" | null;
  jogo?: AgendaJogo | null;
};

export type AgendaEventoAdmin = {
  tipo: "JOGO" | "AULA" | "BLOQUEIO";
  id: string;
  quadra: string;
  inicio_em: string;
  fim_em: string;
  status?: string;
};

export type AgendaAdmin = {
  data: string;
  total: number;
  eventos: AgendaEventoAdmin[];
};

export type DisponibilidadeAdmin = {
  academia?: {
    id: string;
    nome: string;
    slug?: string;
  };
  data: string;
  quadras: Array<{
    quadra?: {
      id: string;
      nome: string;
      modalidade?: string | null;
      tipo_piso?: string | null;
      capacidade_minima?: number;
      capacidade_maxima?: number;
      permite_simples?: boolean;
      permite_dupla?: boolean;
    };
    aberta?: boolean;
    motivo?: string | null;
    abre_as?: string | null;
    fecha_as?: string | null;
    duracao_slot_minutos?: number | null;
    slots?: Array<{
      inicio: string;
      fim: string;
      disponivel: boolean;
      motivo: "JOGO" | "AULA" | "BLOQUEADO" | null;
      jogo?: AgendaJogo | null;
      aula?: {
        id: string;
        observacoes?: string | null;
        cliente?: { id: string; nome: string } | null;
        professor?: { id: string; nome: string } | null;
      } | null;
      bloqueio?: {
        id: string;
        motivo: string;
        tipo_bloqueio: string;
      } | null;
    }>;
    eventos_ocupados?: Array<{
      tipo: "JOGO" | "AULA" | "BLOQUEIO";
      id: string;
      inicio: string;
      fim: string;
      jogo?: AgendaJogo | null;
      aula?: {
        id: string;
        observacoes?: string | null;
        cliente?: { id: string; nome: string } | null;
        professor?: { id: string; nome: string } | null;
      } | null;
      bloqueio?: {
        id: string;
        motivo: string;
        tipo_bloqueio: string;
      } | null;
    }>;
  }>;
};

export async function listarQuadrasAdminAgenda(academiaId: string) {
  const response = await api.get(`/academias/${academiaId}/quadras`);
  return getData<QuadraAgenda[]>(response);
}

export async function buscarDisponibilidadeAdmin(params: {
  academiaId: string;
  data: string;
}) {
  const response = await api.get(
    `/academias/${params.academiaId}/disponibilidade`,
    {
      params: {
        data: params.data,
      },
    }
  );

  return getData<DisponibilidadeAdmin>(response);
}

export async function buscarAgendaAdmin(params: {
  academiaId: string;
  data: string;
}) {
  const response = await api.get(
    `/dashboard/academias/${params.academiaId}/agenda`,
    {
      params: {
        data: params.data,
      },
    }
  );

  return getData<AgendaAdmin>(response);
}

export async function buscarUsuariosAdminAgenda(q: string) {
  const response = await api.get("/users", {
    params: {
      q,
      limit: 10,
    },
  });

  return getData<UsuarioBusca[]>(response);
}

export async function criarAgendamentoAdmin(data: {
  academia_id: string;
  quadra_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  tipo_jogo: TipoJogoAgenda;
  participantes: ParticipanteForm[];
}) {
  const response = await api.post("/jogos", {
    academia_id: data.academia_id,
    quadra_id: data.quadra_id,
    data: data.data,
    hora_inicio: data.hora_inicio,
    hora_fim: data.hora_fim,
    tipo_jogo: data.tipo_jogo,
  });
  const jogo = getData<{ id: string }>(response);

  await Promise.all(
    data.participantes
      .map((participante) => participante.usuario_id ?? participante.id)
      .filter(Boolean)
      .map((usuarioId) =>
        api.post(`/jogos/${jogo.id}/participantes`, {
          usuario_id: usuarioId,
        })
      )
  );

  return jogo;
}

export async function criarAulaAdmin(data: {
  academia_id: string;
  quadra_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  professor_id?: string;
  cliente_id?: string;
  observacoes?: string;
}) {
  const response = await api.post("/aulas", {
    academia_id: data.academia_id,
    quadra_id: data.quadra_id,
    data: data.data,
    hora_inicio: data.hora_inicio,
    hora_fim: data.hora_fim,
    ...(data.professor_id ? { professor_id: data.professor_id } : {}),
    ...(data.cliente_id ? { cliente_id: data.cliente_id } : {}),
    ...(data.observacoes ? { observacoes: data.observacoes } : {}),
  });

  return getData(response);
}

export async function editarAgendamentoAdmin(
  jogoId: string,
  data: {
    academia_id: string;
    quadra_id: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
    tipo_jogo: TipoJogoAgenda;
    participantes: ParticipanteForm[];
  }
) {
  void jogoId;
  void data;
  throw new Error("Edicao de agendamento admin ainda nao possui endpoint.");
}

export async function cancelarAgendamentoAdmin(jogoId: string) {
  const response = await api.patch(`/jogos/${jogoId}/cancelar`);
  return getData(response);
}

export async function cancelarAulaAdmin(aulaId: string) {
  const response = await api.patch(`/aulas/${aulaId}/cancelar`);
  return getData(response);
}

export async function removerBloqueioAdmin(bloqueioId: string) {
  const response = await api.delete(`/bloqueios/${bloqueioId}`);
  return getData(response);
}

export async function criarEventoAdmin(data: {
  quadra_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  motivo: string;
  tipo_bloqueio?: "MANUTENCAO" | "EVENTO" | "FERIADO" | "PARTICULAR" | "OUTRO";
}) {
  const response = await api.post(`/quadras/${data.quadra_id}/bloqueios`, {
    data: data.data,
    hora_inicio: data.hora_inicio,
    hora_fim: data.hora_fim,
    motivo: data.motivo,
    tipo_bloqueio: data.tipo_bloqueio ?? "EVENTO",
  });

  return getData(response);
}
