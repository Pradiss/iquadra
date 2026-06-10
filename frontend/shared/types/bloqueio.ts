export type TipoBloqueioQuadra =
  | "MANUTENCAO"
  | "EVENTO"
  | "FERIADO"
  | "PARTICULAR"
  | "OUTRO"

export type BloqueioQuadra = {
  id: string
  quadra_id: string
  inicio_em: string
  fim_em: string
  tipo_bloqueio: TipoBloqueioQuadra
  motivo: string
  criado_por_usuario_id: string
  criado_por?: {
    id: string
    nome: string
    email: string
  }
}

export type CreateBloqueioPayload = {
  inicio_em: string
  fim_em: string
  tipo_bloqueio?: TipoBloqueioQuadra
  motivo: string
}

export type ListBloqueiosResponse = {
  bloqueios: BloqueioQuadra[]
}
