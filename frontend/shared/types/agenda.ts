export type AgendaDisponibilidade = {
  quadra: {
    id: string
    nome: string
    academia?: string
  }
  data: string
  aberta: boolean
  motivo?: string | null
  abre_as?: string
  fecha_as?: string
  duracao_slot_minutos?: number
  slots: AgendaSlot[]
}

export type AgendaSlot = {
  inicio: string
  fim: string
  disponivel: boolean
  motivo: "BLOQUEADO" | "JOGO" | "AULA" | null
}

export type JogoParticipante = {
  id?: string
  papel: "CRIADOR" | "JOGADOR"
  status?: "CONFIRMADO" | "SAIU" | "REMOVIDO"
  usuario: {
    id: string
    nome: string
    email?: string
    foto_perfil: string | null
  }
}

export type JogoDetalhado = {
  id: string
  academia_id: string
  quadra_id: string
  criado_por_usuario_id: string
  responsavel_usuario_id: string
  inicio_em: string
  fim_em: string
  tipo_jogo: "SIMPLES" | "DUPLA"
  maximo_participantes: number
  status:
    | "ABERTO"
    | "COMPLETO"
    | "CANCELADO"
    | "CONCLUIDO"
    | "SEM_PARTICIPANTES"
    | "NAO_COMPARECEU"
  observacoes?: string | null
  academia?: {
    id: string
    nome: string
  }
  quadra: {
    id: string
    nome: string
    descricao?: string | null
    tipo_piso?: string
    coberta?: boolean
  }
  participantes: JogoParticipante[]
}

export type JogosAbertosResponse = {
  jogos: JogoDetalhado[]
}

export type MeusJogosResponse = {
  jogos: JogoDetalhado[]
}
