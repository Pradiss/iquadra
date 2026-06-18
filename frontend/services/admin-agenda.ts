import api from "@/services/api";

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T };
  return data.data ?? (response.data as T);
}

export type TipoJogoAgenda = "SIMPLES" | "DUPLA";

export type QuadraAgenda = {
  id: string;
  nome: string;
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

export async function listarQuadrasAdminAgenda(academiaId: string) {
  const response = await api.get(`/academias/${academiaId}/quadras`);
  return getData<QuadraAgenda[]>(response);
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
