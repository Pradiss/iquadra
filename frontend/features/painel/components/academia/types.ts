import type { AgendaSlot, AgendaDisponibilidade, JogoDetalhado } from "@/shared/types/agenda"
import type { AulaAgenda } from "@/shared/types/aula"

export type AgendaVisualTone = "available" | "pending" | "closed"

export type AgendaVisualPlayer = {
  id: string
  nome: string
  foto?: string | null
  categoria?: string | null
}

export type AgendaVisualRow = {
  id: string
  kind: "slot" | "jogo" | "aula"
  start: string
  end?: string
  quadra: string
  tone: AgendaVisualTone
  status: string
  tag: string
  description: string
  players: AgendaVisualPlayer[]
  capacity?: number
  game?: JogoDetalhado
  slot?: AgendaSlot
  lesson?: AulaAgenda
}

export type BuildAgendaVisualRowsParams = {
  disponibilidade: AgendaDisponibilidade | null
  jogos: JogoDetalhado[]
  aulas: AulaAgenda[]
  quadraLabel: string
  currentUserId: string
  currentUserCategoria?: string | null
  includeAvailableSlots: boolean
}

export type SlotKeySlot = Pick<AgendaSlot, "inicio" | "fim">
