import type { AgendaSlot, JogoDetalhado } from "@/shared/types/agenda"
import type { AulaAgenda } from "@/shared/types/aula"
import type { HorarioQuadraDetalhe } from "@/shared/types/quadra"
import type { AgendaVisualRow, AgendaVisualTone, BuildAgendaVisualRowsParams } from "./types"

export const DIA_SEMANA_LABEL: Record<number, string> = {
  0: "Domingo",
  1: "Segunda",
  2: "Terca",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sabado",
}

export const DIA_SEMANA_CURTO = ["D", "S", "T", "Q", "Q", "S", "S"]

export const WEEKDAY_GRID_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

export function getSlotKey(quadraId: string, slot: Pick<AgendaSlot, "inicio" | "fim">) {
  return `${quadraId}:${slot.inicio}:${slot.fim}`
}

export function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, (month || 1) - 1, day || 1, 12)
}

export function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1, 12)
}

export function addMonths(value: Date, amount: number) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1, 12)
}

export function formatMonthYear(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(value)
}

export function toDateInputValue(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function getCalendarDays(
  visibleMonth: Date,
  diasAtivos: Set<number>,
  selectedDate: string,
  todayDate: string
) {
  const monthStart = startOfMonth(visibleMonth)
  const calendarStart = new Date(monthStart)
  calendarStart.setDate(monthStart.getDate() - monthStart.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(calendarStart)
    current.setDate(calendarStart.getDate() + index)
    const iso = toDateInputValue(current)

    return {
      date: iso,
      day: String(current.getDate()).padStart(2, "0"),
      weekday: current.getDay(),
      available: diasAtivos.has(current.getDay()),
      selected: iso === selectedDate,
      isPast: iso < todayDate,
      isCurrentMonth:
        current.getMonth() === visibleMonth.getMonth() &&
        current.getFullYear() === visibleMonth.getFullYear(),
    }
  })
}

export function getWeekDays(
  selectedDate: string,
  diasAtivos: Set<number>,
  todayDate: string
) {
  const selected = parseDateInput(selectedDate)
  const weekStart = new Date(selected)
  weekStart.setDate(selected.getDate() - selected.getDay())

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(weekStart)
    current.setDate(weekStart.getDate() + index)
    const iso = toDateInputValue(current)

    return {
      date: iso,
      day: String(current.getDate()).padStart(2, "0"),
      weekday: current.getDay(),
      short: DIA_SEMANA_CURTO[current.getDay()],
      available: diasAtivos.has(current.getDay()),
      selected: iso === selectedDate,
      isPast: iso < todayDate,
      isCurrentMonth:
        current.getMonth() === selected.getMonth() &&
        current.getFullYear() === selected.getFullYear(),
    }
  })
}

export function formatOperatingDays(horarios: HorarioQuadraDetalhe[]) {
  const diasUnicos = Array.from(
    new Set(
      horarios
        .filter((horario) => horario.ativo)
        .map((horario) => DIA_SEMANA_LABEL[horario.dia_semana] || "Dia")
    )
  )

  return diasUnicos.length > 0 ? diasUnicos.join(", ") : "Sem horarios cadastrados"
}

export function getQuadraAgendaLabel(nome?: string) {
  if (!nome) return "-"

  const match = nome.match(/\d+/)
  const fallbackLabel = nome.replace(/quadra/i, "").trim()

  return match?.[0] ?? (fallbackLabel || nome)
}

export function buildAgendaVisualRows({
  disponibilidade,
  jogos,
  aulas,
  quadraLabel,
  currentUserId,
  currentUserCategoria,
  includeAvailableSlots,
}: BuildAgendaVisualRowsParams) {
  const rows: AgendaVisualRow[] = [
    ...jogos.map((jogo) =>
      buildGameAgendaRow(jogo, quadraLabel, currentUserId, currentUserCategoria)
    ),
    ...aulas.map((aula) =>
      buildLessonAgendaRow(aula, quadraLabel, currentUserId, currentUserCategoria)
    ),
    ...(includeAvailableSlots
      ? (disponibilidade?.slots ?? [])
          .filter((slot) => slot.disponivel)
          .map((slot) => buildAvailableAgendaRow(slot, quadraLabel))
      : []),
  ]

  return rows.sort((first, second) => {
    const timeDiff = first.start.localeCompare(second.start)

    if (timeDiff !== 0) return timeDiff

    return getAgendaToneOrder(first.tone) - getAgendaToneOrder(second.tone)
  })
}

function buildGameAgendaRow(
  jogo: JogoDetalhado,
  quadraLabel: string,
  currentUserId: string,
  currentUserCategoria?: string | null
): AgendaVisualRow {
  const players = jogo.participantes.map((participante) => ({
    id: participante.usuario.id,
    nome: participante.usuario.nome,
    foto: participante.usuario.foto_perfil,
    categoria:
      participante.usuario.id === currentUserId ? currentUserCategoria || null : null,
  }))

  return {
    id: `jogo-${jogo.id}`,
    kind: "jogo",
    start: toHourMinute(jogo.inicio_em),
    end: toHourMinute(jogo.fim_em),
    quadra: quadraLabel,
    tone:
      jogo.status === "COMPLETO"
        ? "closed"
        : jogo.status === "ABERTO"
          ? "pending"
          : "available",
    status:
      jogo.status === "COMPLETO"
        ? "Fechado"
        : jogo.status === "ABERTO"
          ? "Pendente"
          : "Disponivel",
    tag: getAgendaGameTag(jogo),
    description: `${jogo.participantes.length}/${jogo.maximo_participantes} jogador(es) · ${formatAgendaGameType(jogo.tipo_jogo)}`,
    players,
    capacity: jogo.maximo_participantes,
    game: jogo,
  }
}

function buildLessonAgendaRow(
  aula: AulaAgenda,
  quadraLabel: string,
  currentUserId: string,
  currentUserCategoria?: string | null
): AgendaVisualRow {
  const usuariosAula = [aula.professor, aula.cliente].filter(Boolean)

  const players = [aula.professor, aula.cliente]
    .filter((usuario): usuario is NonNullable<AulaAgenda["professor"]> => Boolean(usuario))
    .map((usuario) => ({
      id: usuario.id,
      nome: usuario.nome,
      foto: usuario.foto_perfil,
      categoria: usuario.id === currentUserId ? currentUserCategoria || null : null,
    }))

  return {
    id: `aula-${aula.id}`,
    kind: "aula",
    start: toHourMinute(aula.inicio_em),
    end: toHourMinute(aula.fim_em),
    quadra: quadraLabel,
    tone: "closed",
    status: "Fechado",
    tag: aula.recorrente ? "Aula recorrente" : "Aula",
    description: usuariosAula.length > 0 ? "Horario reservado na agenda" : "Aula confirmada",
    players,
    capacity: 2,
    lesson: aula,
  }
}

function buildAvailableAgendaRow(slot: AgendaSlot, quadraLabel: string): AgendaVisualRow {
  return {
    id: `slot-${quadraLabel}-${slot.inicio}-${slot.fim}`,
    kind: "slot",
    start: slot.inicio,
    end: slot.fim,
    quadra: quadraLabel,
    tone: "available",
    status: "Disponivel",
    tag: "Livre",
    description: "Horario disponivel para criar jogo",
    players: [],
    capacity: 2,
    slot,
  }
}

function getAgendaToneOrder(tone: AgendaVisualTone) {
  return tone === "closed" ? 0 : tone === "pending" ? 1 : 2
}

function getAgendaGameTag(jogo: JogoDetalhado) {
  const observacoes = jogo.observacoes?.toLowerCase() ?? ""

  if (observacoes.includes("ranking")) return "Ranking"
  if (observacoes.includes("amist")) return "Amistoso"

  return formatAgendaGameType(jogo.tipo_jogo)
}

function formatAgendaGameType(tipo: JogoDetalhado["tipo_jogo"]) {
  return tipo === "DUPLA" ? "Dupla" : "Simples"
}

function toHourMinute(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}
