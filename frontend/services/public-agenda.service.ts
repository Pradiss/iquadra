import api from "@/services/api";

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T };
  return data.data ?? (response.data as T);
}

export type AcademiaPublica = {
  nome: string;
  slug: string;
  cidade?: string | null;
  estado?: string | null;
};

export type QuadraPublica = {
  nome: string;
  tipo_piso?: string | null;
  modalidade?: string | null;
  valor_hora?: number | null;
  coberta?: boolean | null;
  capacidade_minima?: number | null;
  capacidade_maxima?: number | null;
  permite_simples?: boolean | null;
  permite_dupla?: boolean | null;
};

export type SlotPublico = {
  inicio: string;
  fim: string;
  disponivel: boolean;
  motivo: "JOGO" | "AULA" | "BLOQUEADO" | null;
  capacidade_minima?: number;
  capacidade_maxima?: number;
  permite_simples?: boolean;
  permite_dupla?: boolean;
  jogadores_confirmados?: number;
  vagas_disponiveis?: number;
};

export type DisponibilidadeQuadraPublica = {
  quadra: QuadraPublica;
  aberta?: boolean;
  motivo?: string | null;
  abre_as?: string | null;
  fecha_as?: string | null;
  duracao_slot_minutos?: number | null;
  slots: SlotPublico[];
};

export type DisponibilidadeAcademiaPublica = {
  academia: AcademiaPublica;
  data: string;
  quadras: DisponibilidadeQuadraPublica[];
};

export async function listarAcademiasPublicas() {
  const response = await api.get("/public/academias");
  return getData<AcademiaPublica[]>(response);
}

export async function buscarAcademiaPublica(slug: string) {
  const response = await api.get(`/public/academias/${slug}`);
  return getData<AcademiaPublica>(response);
}

export async function obterDisponibilidadePublica(slug: string, data: string) {
  const response = await api.get(`/public/academias/${slug}/disponibilidade`, {
    params: { data },
  });

  return getData<DisponibilidadeAcademiaPublica>(response);
}