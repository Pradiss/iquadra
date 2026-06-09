import type { JogoParticipante } from "./agenda"

export type DashboardResumoAcademia = {
  total_quadras: number
  jogos_hoje: number
  aulas_hoje: number
  bloqueios_ativos: number
  professores: number
  clientes: number
}

export type AgendaEventoAcademia =
  | {
      tipo: "JOGO"
      id: string
      quadra: string
      inicio_em: string
      fim_em: string
      status: string
      participantes: JogoParticipante[]
    }
  | {
      tipo: "AULA"
      id: string
      quadra: string
      inicio_em: string
      fim_em: string
      status: string
      professor?: {
        id: string
        nome: string
        foto_perfil?: string | null
      } | null
      cliente?: {
        id: string
        nome: string
        foto_perfil?: string | null
      } | null
    }
  | {
      tipo: "BLOQUEIO"
      id: string
      quadra: string
      inicio_em: string
      fim_em: string
      tipo_bloqueio: string
      motivo: string
    }

export type AgendaAcademiaResponse = {
  data: string
  total: number
  eventos: AgendaEventoAcademia[]
}
