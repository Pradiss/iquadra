export type TipoPisoQuadra =
  | "SAIBRO"
  | "HARD"
  | "GRAMA"
  | "SINTETICA"
  | "AREIA"
  | "OUTRO"

export type HorarioQuadraDetalhe = {
  id: string
  quadra_id: string
  dia_semana: number
  abre_as: string
  fecha_as: string
  duracao_slot_minutos: number
  ativo: boolean
}

export type QuadraResumo = {
  id: string
  nome: string
  descricao?: string | null
  tipo_piso: TipoPisoQuadra
  coberta: boolean
  ativa: boolean
  ordem_exibicao: number
}

export type QuadraDetalhe = QuadraResumo & {
  academia: {
    id: string
    nome: string
    slug: string
    cidade?: string | null
    estado?: string | null
  }
  horarios: HorarioQuadraDetalhe[]
}

export type QuadraAdmin = QuadraResumo
export type HorarioQuadraAdmin = HorarioQuadraDetalhe

export type ListQuadrasResponse = {
  quadras: QuadraResumo[]
}

export type ListHorariosQuadraResponse = {
  horarios: HorarioQuadraDetalhe[]
}
