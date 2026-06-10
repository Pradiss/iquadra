"use client"

import { useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { formatLongDate, formatPeriodo, normalizeText } from "@/shared/lib/painel-format"
import type { AgendaSlot, JogoDetalhado, JogoParticipante } from "@/shared/types/agenda"
import type { EmpresaDetalhe } from "@/shared/types/empresa"
import type { UsuarioSocial } from "@/shared/types/social"
import { EmptyState } from "./shared-cards"
import type { AgendaVisualRow } from "./types"
import { addMonths, formatMonthYear, getCalendarDays, getWeekDays, parseDateInput, startOfMonth } from "./utils"
import { InvitePlayersPanel } from "./invite-players-panel"

type AgendamentoWorkspaceProps = {
  quadraSelecionada: EmpresaDetalhe["quadras"][number]
  selectedDate: string
  selectedDateIsPast: boolean
  todayDate: string
  activeWeekdays: Set<number>
  agendaItems: AgendaVisualRow[]
  sessionUserId: string
  amigosAceitos: UsuarioSocial[]
  actingGameId: string | null
  onSelectDate: (date: string) => void
  onCreateGame: (payload: {
    slot: AgendaSlot
    tipoJogo: "SIMPLES" | "DUPLA"
    inviteeIds: string[]
  }) => Promise<void>
  onInvitePlayers: (payload: {
    jogo: JogoDetalhado
    inviteeIds: string[]
  }) => Promise<void>
  onGameAction: (jogo: JogoDetalhado) => Promise<void>
}

export function AgendamentoWorkspace({
  quadraSelecionada,
  selectedDate,
  selectedDateIsPast,
  todayDate,
  activeWeekdays,
  agendaItems,
  sessionUserId,
  amigosAceitos,
  actingGameId,
  onSelectDate,
  onCreateGame,
  onInvitePlayers,
  onGameAction,
}: AgendamentoWorkspaceProps) {
  const [showFullCalendar, setShowFullCalendar] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(parseDateInput(selectedDate))
  )
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null)
  const [inviteQuery, setInviteQuery] = useState("")
  const [selectedInviteIds, setSelectedInviteIds] = useState<string[]>([])
  const [gameType, setGameType] = useState<"SIMPLES" | "DUPLA">("SIMPLES")
  const [submitting, setSubmitting] = useState(false)

  const weekDays = useMemo(
    () => getWeekDays(selectedDate, activeWeekdays, todayDate),
    [activeWeekdays, selectedDate, todayDate]
  )
  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth, activeWeekdays, selectedDate, todayDate),
    [activeWeekdays, selectedDate, todayDate, visibleMonth]
  )
  const selectedAgendaItem = useMemo(
    () => agendaItems.find((item) => item.id === selectedAgendaId) ?? null,
    [agendaItems, selectedAgendaId]
  )

  const selectedGame = selectedAgendaItem?.kind === "jogo" ? selectedAgendaItem.game ?? null : null
  const selectedSlot = selectedAgendaItem?.kind === "slot" ? selectedAgendaItem.slot ?? null : null
  const canInviteInSelectedGame = selectedGame ? canManageGame(selectedGame, sessionUserId) : false
  const selectedGameConfirmedPlayers = useMemo(
    () =>
      selectedGame
        ? selectedGame.participantes.filter((participante) => isConfirmedParticipant(participante))
        : [],
    [selectedGame]
  )
  const remainingInviteSlots = selectedGame
    ? Math.max(selectedGame.maximo_participantes - selectedGameConfirmedPlayers.length, 0)
    : gameType === "DUPLA"
      ? 3
      : 1
  const effectiveSelectedInviteIds = selectedInviteIds.slice(0, remainingInviteSlots)

  const blockedUserIds = useMemo(() => {
    if (!selectedGame) {
      return new Set<string>()
    }

    return new Set(selectedGameConfirmedPlayers.map((participante) => participante.usuario.id))
  }, [selectedGame, selectedGameConfirmedPlayers])

  const selectedFriends = useMemo(
    () =>
      effectiveSelectedInviteIds
        .map((friendId) => amigosAceitos.find((friend) => friend.id === friendId) ?? null)
        .filter((friend): friend is UsuarioSocial => Boolean(friend)),
    [amigosAceitos, effectiveSelectedInviteIds]
  )

  const availableFriends = useMemo(() => {
    const search = normalizeText(inviteQuery)

    if (remainingInviteSlots === 0) {
      return []
    }

    return amigosAceitos.filter((friend) => {
      if (effectiveSelectedInviteIds.includes(friend.id)) {
        return false
      }

      if (blockedUserIds.has(friend.id)) {
        return false
      }

      return !search || normalizeText(friend.nome).includes(search)
    })
  }, [amigosAceitos, blockedUserIds, effectiveSelectedInviteIds, inviteQuery, remainingInviteSlots])

  const panelMode =
    selectedSlot && !selectedDateIsPast
      ? "create"
      : selectedGame && canInviteInSelectedGame && !selectedDateIsPast
        ? "invite"
        : null

  const confirmLabel =
    panelMode === "create"
      ? effectiveSelectedInviteIds.length > 0
        ? "Criar e convidar"
        : "Criar jogo"
      : "Enviar convites"

  const canSubmit =
    panelMode === "create"
      ? Boolean(selectedSlot)
      : panelMode === "invite"
        ? effectiveSelectedInviteIds.length > 0 && remainingInviteSlots > 0
        : false

  async function handleConfirmPanel() {
    if (!panelMode) {
      return
    }

    setSubmitting(true)

    try {
      if (panelMode === "create" && selectedSlot) {
        await onCreateGame({
          slot: selectedSlot,
          tipoJogo: gameType,
          inviteeIds: effectiveSelectedInviteIds,
        })
      }

      if (panelMode === "invite" && selectedGame) {
        await onInvitePlayers({
          jogo: selectedGame,
          inviteeIds: effectiveSelectedInviteIds,
        })
      }

      setSelectedAgendaId(null)
      setInviteQuery("")
      setSelectedInviteIds([])
      setGameType("SIMPLES")
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancelPanel() {
    setSelectedAgendaId(null)
    setInviteQuery("")
    setSelectedInviteIds([])
    setGameType("SIMPLES")
  }

  function handleAddFriend(userId: string) {
    setSelectedInviteIds((current) => {
      if (current.includes(userId) || effectiveSelectedInviteIds.length >= remainingInviteSlots) {
        return current
      }

      return [...current, userId]
    })
  }

  function handleRemoveFriend(userId: string) {
    setSelectedInviteIds((current) => current.filter((id) => id !== userId))
  }

  function shiftSelectedWeek(days: number) {
    const nextDate = new Date(parseDateInput(selectedDate))
    nextDate.setDate(nextDate.getDate() + days)
    handleDateSelection(toDateInputValue(nextDate))
  }

  function handleDateSelection(date: string) {
    onSelectDate(date)
    setVisibleMonth(startOfMonth(parseDateInput(date)))
    setSelectedAgendaId(null)
    setInviteQuery("")
    setSelectedInviteIds([])
    setGameType("SIMPLES")
  }

  function handleAgendaSelection(item: AgendaVisualRow) {
    setSelectedAgendaId(item.id)
    setInviteQuery("")
    setSelectedInviteIds([])
    setGameType(item.game?.tipo_jogo === "DUPLA" ? "DUPLA" : "SIMPLES")
  }

  return (
    <section className="rounded-[32px] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-green-700">
            Agenda da quadra
          </p>
          <h2 className="mt-2 text-2xl font-black text-zinc-950">{quadraSelecionada.nome}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Escolha um dia, toque no horario e monte o jogo sem sair dessa tela.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => shiftSelectedWeek(-7)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => handleDateSelection(todayDate)}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={() => shiftSelectedWeek(7)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowFullCalendar((current) => !current)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 text-sm font-bold text-white transition hover:bg-zinc-800"
          >
            <CalendarDays className="h-4 w-4" />
            {showFullCalendar ? "Fechar calendario" : "Calendario completo"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <button
            key={day.date}
            type="button"
            onClick={() => handleDateSelection(day.date)}
            className={[
              "rounded-[22px] border px-2 py-3 text-center transition",
              day.selected
                ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                : day.isPast
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : day.available
                    ? "border-green-200 bg-green-50 text-zinc-900 hover:border-green-300 hover:bg-green-100"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-white",
            ].join(" ")}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.18em]">
              {day.short}
            </span>
            <span className="mt-2 block text-xl font-black">{day.day}</span>
          </button>
        ))}
      </div>

      {showFullCalendar ? (
        <div className="mt-5 rounded-[26px] border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <p className="text-lg font-black text-zinc-950">{formatMonthYear(visibleMonth)}</p>

            <button
              type="button"
              onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((label) => (
              <span
                key={label}
                className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map((day) => (
              <button
                key={day.date}
                type="button"
                onClick={() => handleDateSelection(day.date)}
                className={[
                  "min-h-[54px] rounded-[18px] border px-2 py-2 text-center transition",
                  day.selected
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : day.isPast
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : day.available
                        ? "border-green-200 bg-green-50 text-zinc-900 hover:border-green-300 hover:bg-green-100"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                  day.isCurrentMonth ? "" : "opacity-45",
                ].join(" ")}
              >
                <span className="text-sm font-black">{day.day}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-[24px] border border-zinc-200 bg-zinc-50 px-4 py-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
          Data selecionada
        </p>
        <h3 className="mt-2 text-2xl font-black text-zinc-950">{formatLongDate(selectedDate)}</h3>
        <p className="mt-2 text-sm text-zinc-500">
          {selectedDateIsPast
            ? "Modo historico: a agenda fica apenas para consulta."
            : "Toque num horario livre para abrir a telinha de convidados."}
        </p>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="space-y-3">
          <div className="hidden grid-cols-[84px_64px_minmax(0,1fr)_auto] gap-3 px-1 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400 lg:grid">
            <span>Hora</span>
            <span>Quadra</span>
            <span>Jogadores</span>
            <span>Acao</span>
          </div>

          {agendaItems.length > 0 ? (
            agendaItems.map((item) => {
              const rowAction = getRowAction({
                item,
                selectedDateIsPast,
                sessionUserId,
                actingGameId,
              })

              return (
                <AgendaListItem
                  key={item.id}
                  item={item}
                  active={selectedAgendaId === item.id}
                  action={rowAction}
                    onSelect={() => {
                    if (rowAction.kind === "select") {
                      handleAgendaSelection(item)
                    }
                  }}
                  onRunAction={() => {
                    if (rowAction.kind === "select") {
                      handleAgendaSelection(item)
                    } else if (rowAction.kind === "direct" && item.game) {
                      void onGameAction(item.game)
                    }
                  }}
                />
              )
            })
          ) : (
            <EmptyState
              title="Sem agenda para esse dia"
              text="Escolha outro dia ou abra o calendario completo para encontrar um horario."
            />
          )}
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <InvitePlayersPanel
            mode={panelMode}
            title="Quem vai jogar?"
            subtitle={
              selectedSlot
                ? `${selectedSlot.inicio} ate ${selectedSlot.fim} · ${quadraSelecionada.nome}`
                : selectedGame
                  ? `${formatPeriodo(selectedGame.inicio_em, selectedGame.fim_em)} · ${quadraSelecionada.nome}`
                  : "Escolha um horario para continuar"
            }
            helper={
              panelMode === "invite"
                ? remainingInviteSlots > 0
                  ? `Busque por nome e adicione ate ${remainingInviteSlots} amigo(s).`
                  : "Esse jogo ja esta completo."
                : `Voce pode adicionar ate ${remainingInviteSlots} amigo(s) nesse jogo.`
            }
            query={inviteQuery}
            onQueryChange={setInviteQuery}
            selectedFriends={selectedFriends}
            availableFriends={availableFriends}
            existingPlayers={selectedGame?.participantes}
            maxSelectable={remainingInviteSlots}
            confirmLabel={confirmLabel}
            canSubmit={canSubmit}
            submitting={submitting}
            gameType={panelMode === "create" ? gameType : undefined}
            onGameTypeChange={panelMode === "create" ? setGameType : undefined}
            onAddFriend={handleAddFriend}
            onRemoveFriend={handleRemoveFriend}
            onConfirm={() => void handleConfirmPanel()}
            onCancel={handleCancelPanel}
            secondaryActionLabel={
              selectedGame && canInviteInSelectedGame
                ? isResponsible(selectedGame, sessionUserId)
                  ? "Cancelar jogo"
                  : "Sair do jogo"
                : undefined
            }
            onSecondaryAction={
              selectedGame && canInviteInSelectedGame
                ? () => void onGameAction(selectedGame)
                : undefined
            }
          />
        </div>
      </div>
    </section>
  )
}

type AgendaRowAction =
  | {
      kind: "select"
      label: string
      busy?: false
    }
  | {
      kind: "direct"
      label: string
      busy: boolean
    }
  | {
      kind: "none"
      label: string
      busy?: false
    }

function getRowAction({
  item,
  selectedDateIsPast,
  sessionUserId,
  actingGameId,
}: {
  item: AgendaVisualRow
  selectedDateIsPast: boolean
  sessionUserId: string
  actingGameId: string | null
}): AgendaRowAction {
  if (selectedDateIsPast) {
    return { kind: "none", label: item.tag }
  }

  if (item.kind === "slot") {
    return { kind: "select", label: "Montar jogo" }
  }

  if (item.kind !== "jogo" || !item.game) {
    return { kind: "none", label: item.tag }
  }

  if (canManageGame(item.game, sessionUserId)) {
    return { kind: "select", label: "Convidar" }
  }

  if (canJoinGame(item.game, sessionUserId)) {
    return {
      kind: "direct",
      label: actingGameId === item.game.id ? "Entrando..." : "Entrar",
      busy: actingGameId === item.game.id,
    }
  }

  return { kind: "none", label: item.tag }
}

function AgendaListItem({
  item,
  active,
  action,
  onSelect,
  onRunAction,
}: {
  item: AgendaVisualRow
  active: boolean
  action: AgendaRowAction
  onSelect: () => void
  onRunAction: () => void
}) {
  const remainingSlots = Math.max((item.capacity ?? item.players.length) - item.players.length, 0)
  const toneClasses = {
    available: "border-zinc-200 bg-zinc-100",
    pending: "border-sky-200 bg-sky-100",
    closed: "border-green-200 bg-green-100",
  } as const

  return (
    <article
      className={[
        "rounded-[24px] border px-4 py-4 transition",
        toneClasses[item.tone],
        active ? "ring-2 ring-green-300" : "",
      ].join(" ")}
    >
      <div className="grid gap-4 lg:grid-cols-[84px_64px_minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 lg:hidden">
            Hora
          </p>
          <p className="text-lg font-black text-zinc-950">{item.start}</p>
          {item.end ? <p className="text-xs font-semibold text-zinc-500">{item.end}</p> : null}
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 lg:hidden">
            Quadra
          </p>
          <p className="text-lg font-black text-zinc-950">{item.quadra}</p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 lg:hidden">
            Jogadores
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {item.players.map((player) => (
              <div
                key={player.id}
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-zinc-800"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-black text-zinc-700">
                  {player.nome.slice(0, 1).toUpperCase()}
                </span>
                <span className="truncate">{player.nome}</span>
              </div>
            ))}

            {Array.from({ length: Math.min(remainingSlots, 3) }).map((_, index) => (
              <div
                key={`${item.id}-empty-${index}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-zinc-500"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-500">
                  <Plus className="h-4 w-4" />
                </span>
                <span>Jogador</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="lg:hidden">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Acao
            </p>
          </div>

          {action.kind === "none" ? (
            <span className="inline-flex rounded-full bg-white/80 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-700">
              {action.label}
            </span>
          ) : (
            <button
              type="button"
              disabled={action.kind === "direct" ? action.busy : false}
              onClick={() => {
                if (action.kind === "select") {
                  onSelect()
                  return
                }

                onRunAction()
              }}
              className={[
                "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-black text-white transition",
                active && action.kind === "select"
                  ? "bg-zinc-950 hover:bg-zinc-800"
                  : "bg-green-700 hover:bg-green-800",
                action.kind === "direct" && action.busy ? "opacity-60" : "",
              ].join(" ")}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-600">
        <span>{item.status}</span>
        <span className="opacity-50">•</span>
        <span>{item.description}</span>
      </div>
    </article>
  )
}

function isConfirmedParticipant(participante: JogoParticipante) {
  return (participante.status ?? "CONFIRMADO") === "CONFIRMADO"
}

function isResponsible(jogo: JogoDetalhado, sessionUserId: string) {
  return jogo.responsavel_usuario_id === sessionUserId
}

function canManageGame(jogo: JogoDetalhado, sessionUserId: string) {
  const isParticipant = jogo.participantes.some(
    (participante) =>
      participante.usuario.id === sessionUserId && isConfirmedParticipant(participante)
  )

  return (isParticipant || isResponsible(jogo, sessionUserId)) && jogo.status === "ABERTO"
}

function canJoinGame(jogo: JogoDetalhado, sessionUserId: string) {
  const alreadyInGame = jogo.participantes.some(
    (participante) =>
      participante.usuario.id === sessionUserId && isConfirmedParticipant(participante)
  )

  return (
    !alreadyInGame &&
    !isResponsible(jogo, sessionUserId) &&
    jogo.status === "ABERTO" &&
    jogo.participantes.length < jogo.maximo_participantes
  )
}

function toDateInputValue(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
