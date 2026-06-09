export type AulaStatus = "CONFIRMADA" | "CANCELADA" | "CONCLUIDA"

export type StatusRecorrenciaAula = "ATIVA" | "CANCELADA" | "FINALIZADA"

export type AulaAgenda = {
  id: string
  academia_id?: string
  quadra_id?: string
  professor_id?: string | null
  cliente_id?: string | null
  inicio_em: string
  fim_em: string
  status: AulaStatus
  recorrente: boolean
  recorrencia_id?: string | null
  observacoes?: string | null
  academia?: {
    id: string
    nome: string
  }
  quadra: {
    id: string
    nome: string
    tipo_piso?: string
    coberta?: boolean
  }
  cliente?: {
    id: string
    nome: string
    email: string
    foto_perfil?: string | null
  } | null
  professor?: {
    id: string
    nome: string
    email: string
    foto_perfil?: string | null
  } | null
}

export type RecorrenciaAula = {
  id: string
  academia_id: string
  quadra_id: string
  professor_id?: string | null
  dias_semana: string
  data_inicio: string
  data_fim?: string | null
  horario_inicio: string
  horario_fim: string
  status: StatusRecorrenciaAula
  academia?: {
    id: string
    nome: string
  }
  quadra?: {
    id: string
    nome: string
    tipo_piso?: string
    coberta?: boolean
  }
  aulas?: AulaAgenda[]
}

export type CreateAulaPayload = {
  academia_id: string
  quadra_id: string
  professor_id?: string
  cliente_id?: string
  inicio_em: string
  fim_em: string
  observacoes?: string
}

export type CreateRecorrenciaAulaPayload = {
  academia_id: string
  quadra_id: string
  professor_id?: string
  dias_semana: number[]
  data_inicio: string
  data_fim?: string
  horario_inicio: string
  horario_fim: string
  observacoes?: string
}

export type ListAulasResponse = {
  aulas: AulaAgenda[]
}

export type ListRecorrenciasAulaResponse = {
  recorrencias: RecorrenciaAula[]
}
