import api from "@/services/api";

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T };
  return data.data ?? (response.data as T);
}

export type TipoPiso =
  | "SAIBRO"
  | "HARD"
  | "GRAMA"
  | "SINTETICA"
  | "AREIA"
  | "OUTRO";

export type ModalidadeQuadra =
  | "TENIS"
  | "BEACH_TENNIS"
  | "PADEL"
  | "PICKLEBALL"
  | "OUTRO";

export type QuadraAdmin = {
  id: string;
  nome: string;
  descricao?: string | null;
  tipo_piso?: TipoPiso;
  modalidade?: ModalidadeQuadra | null;
  valor_hora?: number | null;
  coberta?: boolean;
  ativa: boolean;
  capacidade_minima?: number;
  capacidade_maxima?: number;
  permite_simples?: boolean;
  permite_dupla?: boolean;
};

export type DashboardAdmin = {
  total_quadras: number;
  horarios_cadastrados: number;
  bloqueios_ativos: number;
  agendamentos_hoje: number;
};

export async function listarQuadras(academiaId: string) {
  const response = await api.get(`/academias/${academiaId}/quadras`, {
    params: { incluir_inativas: true },
  });
  return getData<QuadraAdmin[]>(response);
}

export async function criarQuadra(
  academiaId: string,
  data: {
    nome: string;
    descricao?: string;
    tipo_piso?: TipoPiso;
    modalidade?: ModalidadeQuadra;
    valor_hora?: number;
    coberta?: boolean;
    capacidade_minima?: number;
    capacidade_maxima?: number;
    permite_simples?: boolean;
    permite_dupla?: boolean;
  }
) {
  const response = await api.post(`/academias/${academiaId}/quadras`, data);
  return getData<QuadraAdmin>(response);
}

export async function atualizarStatusQuadra(quadraId: string, ativa: boolean) {
  const response = await api.patch(`/quadras/${quadraId}/status`, { ativa });
  return getData<QuadraAdmin>(response);
}

export async function excluirQuadra(quadraId: string) {
  const response = await api.delete(`/quadras/${quadraId}`);
  return getData<QuadraAdmin>(response);
}

export async function listarHorariosQuadra(quadraId: string) {
  const response = await api.get(`/quadras/${quadraId}/horarios`);
  return getData(response);
}

export async function atualizarQuadra(
  quadraId: string,
  data: {
    nome: string;
    descricao?: string;
    tipo_piso?: TipoPiso;
    modalidade?: ModalidadeQuadra;
    valor_hora?: number;
    coberta?: boolean;
    capacidade_minima?: number;
    capacidade_maxima?: number;
    permite_simples?: boolean;
    permite_dupla?: boolean;
  }
) {
  const response = await api.put(`/quadras/${quadraId}`, data);
  return getData<QuadraAdmin>(response);
}

export async function gerarHorarioQuadra(
  quadraId: string,
  data: {
    dia_semana: number;
    abre_as: string;
    fecha_as: string;
    duracao_slot_minutos: number;
    ativo?: boolean;
  }
) {
  const response = await api.post(`/quadras/${quadraId}/horarios`, data);
  return getData(response);
}

export async function atualizarHorarioQuadra(
  horarioId: string,
  data: {
    dia_semana?: number;
    abre_as?: string;
    fecha_as?: string;
    duracao_slot_minutos?: number;
    ativo?: boolean;
  }
) {
  const response = await api.put(`/horarios-quadra/${horarioId}`, data);
  return getData(response);
}

export async function removerHorarioQuadra(horarioId: string) {
  const response = await api.delete(`/horarios-quadra/${horarioId}`);
  return getData(response);
}

export async function bloquearHorario(
  quadraId: string,
  data: {
    data: string;
    hora_inicio: string;
    hora_fim: string;
    motivo: string;
    tipo_bloqueio?:
      | "MANUTENCAO"
      | "EVENTO"
      | "FERIADO"
      | "PARTICULAR"
      | "OUTRO";
  }
) {
  const response = await api.post(`/quadras/${quadraId}/bloqueios`, {
    data: data.data,
    hora_inicio: data.hora_inicio,
    hora_fim: data.hora_fim,
    tipo_bloqueio: data.tipo_bloqueio ?? "OUTRO",
    motivo: data.motivo,
  });

  return getData(response);
}

export type HorarioQuadraAdmin = {
  id: string;
  quadra_id?: string;
  dia_semana: number;
  abre_as: string;
  fecha_as: string;
  duracao_slot_minutos?: number;
};
