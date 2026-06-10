"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { LoaderCircle } from "lucide-react"
import { clearAuthStorage, getSession, getToken } from "@/shared/lib/auth-storage"
import {
  buildIsoDateTime,
  getErrorMessage,
  getTodayDate,
  isUnauthorizedError,
} from "@/shared/lib/painel-format"
import { getOutroUsuarioDaAmizade } from "@/shared/lib/social"
import { listarAmizades } from "@/shared/services/amizade.service"
import { listarAulas } from "@/shared/services/aula.service"
import { convidarJogadorParaJogo } from "@/shared/services/convite-jogo.service"
import { buscarDisponibilidade } from "@/shared/services/disponibilidade.service"
import { buscarEmpresaDetalhes } from "@/shared/services/empresa.service"
import {
  cancelarJogo,
  criarJogo,
  entrarNoJogo,
  listarJogos,
  sairDoJogo,
} from "@/shared/services/jogo.service"
import { listarHorariosQuadra } from "@/shared/services/quadra.service"
import type { AgendaDisponibilidade, AgendaSlot, JogoDetalhado } from "@/shared/types/agenda"
import type { AulaAgenda } from "@/shared/types/aula"
import type { AuthSessionSnapshot } from "@/shared/types/auth"
import type { EmpresaDetalhe } from "@/shared/types/empresa"
import type { HorarioQuadraDetalhe } from "@/shared/types/quadra"
import type { Amizade, UsuarioSocial } from "@/shared/types/social"
import { AcademiaHeader } from "./academia-header"
import { AgendamentoWorkspace } from "./agendamento-workspace"
import { QuadrasSection } from "./quadras-section"
import { buildAgendaVisualRows, getQuadraAgendaLabel } from "./utils"

export function AcademiaBoard() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const academiaId = typeof params?.id === "string" ? params.id : ""
  const todayDate = getTodayDate()

  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [actingGameId, setActingGameId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [selectedDate, setSelectedDate] = useState(todayDate)
  const [session, setSession] = useState<AuthSessionSnapshot | null>(null)
  const [academia, setAcademia] = useState<EmpresaDetalhe | null>(null)
  const [disponibilidades, setDisponibilidades] = useState<AgendaDisponibilidade[]>([])
  const [jogos, setJogos] = useState<JogoDetalhado[]>([])
  const [aulas, setAulas] = useState<AulaAgenda[]>([])
  const [amizades, setAmizades] = useState<Amizade[]>([])
  const [horariosPorQuadra, setHorariosPorQuadra] = useState<
    Record<string, HorarioQuadraDetalhe[]>
  >({})
  const [quadraId, setQuadraId] = useState("")

  useEffect(() => {
    async function loadAcademia() {
      const token = getToken()
      const currentSession = getSession()

      if (!token || !currentSession) {
        clearAuthStorage()
        router.replace("/login")
        return
      }

      setSession(currentSession)
      setError("")
      setNotice("")

      try {
        const [empresaResponse, jogosResponse, aulasResponse] = await Promise.all([
          buscarEmpresaDetalhes(academiaId),
          listarJogos({ academiaId, data: selectedDate }),
          listarAulas({ academiaId, data: selectedDate }),
        ])

        setAcademia(empresaResponse.empresa)
        setJogos(
          jogosResponse.filter(
            (jogo) => jogo.status !== "CANCELADO" && jogo.status !== "CONCLUIDO"
          )
        )
        setAulas(aulasResponse.aulas.filter((aula) => aula.status !== "CANCELADA"))

        try {
          const amizadesResponse = await listarAmizades()
          setAmizades(amizadesResponse.amizades)
        } catch (amizadeError) {
          console.warn("Falha ao listar amizades na academia", amizadeError)
          setAmizades([])
        }

        const quadrasAtivas = empresaResponse.empresa.quadras.filter((quadra) => quadra.ativa)
        const [disponibilidadeEntries, horarioEntries] = await Promise.all([
          Promise.all(
            quadrasAtivas.map(async (quadra) => [
              quadra.id,
              await buscarDisponibilidade(quadra.id, selectedDate),
            ] as const)
          ),
          Promise.all(
            empresaResponse.empresa.quadras.map(async (quadra) => [
              quadra.id,
              (await listarHorariosQuadra(quadra.id)).horarios,
            ] as const)
          ),
        ])

        setDisponibilidades(disponibilidadeEntries.map(([, disponibilidade]) => disponibilidade))
        setHorariosPorQuadra(Object.fromEntries(horarioEntries))
      } catch (requestError) {
        if (isUnauthorizedError(requestError)) {
          clearAuthStorage()
          router.replace("/login")
          return
        }

        setError(getErrorMessage(requestError, "Nao foi possivel carregar essa academia agora."))
      } finally {
        setLoading(false)
      }
    }

    if (academiaId) {
      void loadAcademia()
    }
  }, [academiaId, refreshKey, router, selectedDate])

  const quadrasAtivas = academia?.quadras.filter((quadra) => quadra.ativa) ?? []
  const quadraSelecionada = quadrasAtivas.find((quadra) => quadra.id === quadraId) ?? null
  const quadraSelecionadaId = quadraSelecionada?.id ?? ""
  const disponibilidadeSelecionada =
    disponibilidades.find((disponibilidade) => disponibilidade.quadra.id === quadraSelecionadaId) ??
    null
  const jogosDaQuadra = jogos.filter(
    (jogo) =>
      jogo.quadra_id === quadraSelecionadaId &&
      (jogo.status === "ABERTO" ||
        jogo.status === "COMPLETO" ||
        jogo.status === "SEM_PARTICIPANTES")
  )
  const aulasDaQuadra = aulas.filter((aula) => aula.quadra.id === quadraSelecionadaId)
  const horariosDaQuadra = horariosPorQuadra[quadraSelecionadaId] ?? []
  const horariosAtivosDaQuadra = horariosDaQuadra.filter((horario) => horario.ativo)
  const diasAtivosDaQuadra = useMemo(
    () => new Set(horariosAtivosDaQuadra.map((horario) => horario.dia_semana)),
    [horariosAtivosDaQuadra]
  )
  const amigosAceitos: UsuarioSocial[] = session?.usuario.id
    ? amizades
        .filter((amizade) => amizade.status === "ACEITA")
        .map((amizade) => getOutroUsuarioDaAmizade(amizade, session.usuario.id))
    : []
  const selectedDateIsPast = selectedDate < todayDate
  const agendaVisual = buildAgendaVisualRows({
    disponibilidade: disponibilidadeSelecionada,
    jogos: jogosDaQuadra,
    aulas: aulasDaQuadra,
    quadraLabel: getQuadraAgendaLabel(quadraSelecionada?.nome),
    currentUserId: session?.usuario.id ?? "",
    currentUserCategoria: session?.usuario.categoria ?? null,
    includeAvailableSlots: true,
  })

  async function handleCreateGame({
    slot,
    tipoJogo,
    inviteeIds,
  }: {
    slot: AgendaSlot
    tipoJogo: "SIMPLES" | "DUPLA"
    inviteeIds: string[]
  }) {
    if (!academia || !quadraSelecionada) {
      return
    }

    setError("")
    setNotice("")

    try {
      const jogoCriado = (await criarJogo({
        academia_id: academia.id,
        quadra_id: quadraSelecionada.id,
        tipo_jogo: tipoJogo,
        inicio_em: buildIsoDateTime(selectedDate, slot.inicio),
        fim_em: buildIsoDateTime(selectedDate, slot.fim),
      })) as JogoDetalhado

      let failedInvites = 0

      for (const inviteeId of inviteeIds) {
        try {
          await convidarJogadorParaJogo(jogoCriado.id, inviteeId)
        } catch (inviteError) {
          console.warn("Falha ao convidar jogador", inviteError)
          failedInvites += 1
        }
      }

      setNotice(
        failedInvites > 0
          ? `Jogo criado. ${failedInvites} convite(s) nao puderam ser enviados.`
          : inviteeIds.length > 0
            ? "Jogo criado e convites enviados com sucesso."
            : "Jogo criado com sucesso."
      )
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel criar o jogo agora."))
    }
  }

  async function handleInvitePlayers({
    jogo,
    inviteeIds,
  }: {
    jogo: JogoDetalhado
    inviteeIds: string[]
  }) {
    setError("")
    setNotice("")

    try {
      let failedInvites = 0

      for (const inviteeId of inviteeIds) {
        try {
          await convidarJogadorParaJogo(jogo.id, inviteeId)
        } catch (inviteError) {
          console.warn("Falha ao convidar jogador", inviteError)
          failedInvites += 1
        }
      }

      setNotice(
        failedInvites > 0
          ? `${inviteeIds.length - failedInvites} convite(s) enviados. ${failedInvites} falharam.`
          : "Convites enviados com sucesso."
      )
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel enviar os convites agora."))
    }
  }

  async function handleGameAction(jogo: JogoDetalhado) {
    const isParticipant = jogo.participantes.some(
      (participante) =>
        participante.usuario.id === session?.usuario.id &&
        (participante.status ?? "CONFIRMADO") === "CONFIRMADO"
    )
    const isResponsavel = jogo.responsavel_usuario_id === session?.usuario.id

    setActingGameId(jogo.id)
    setError("")
    setNotice("")

    try {
      if (isResponsavel) {
        await cancelarJogo(jogo.id)
        setNotice("Jogo cancelado com sucesso.")
      } else if (isParticipant) {
        await sairDoJogo(jogo.id)
        setNotice("Voce saiu do jogo com sucesso.")
      } else {
        await entrarNoJogo(jogo.id)
        setNotice("Voce entrou no jogo com sucesso.")
      }

      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel concluir essa acao agora."))
    } finally {
      setActingGameId(null)
    }
  }

  if (loading) {
    return (
      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-bold text-zinc-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Carregando academia
        </div>
      </div>
    )
  }

  if (!academia) {
    return (
      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-zinc-950">Academia nao encontrada</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          {error || "Volte para a busca e escolha outra academia."}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <AcademiaHeader
        academia={academia}
        quadraSelecionada={quadraSelecionada}
        selectedDate={selectedDate}
        selectedDateIsPast={selectedDateIsPast}
        error={error}
        notice={notice}
      />

      <QuadrasSection
        quadrasAtivas={quadrasAtivas}
        quadraSelecionadaId={quadraSelecionadaId}
        horariosPorQuadra={horariosPorQuadra}
        onSelectQuadra={setQuadraId}
      />

      {quadraSelecionada ? (
        <AgendamentoWorkspace
          key={quadraSelecionada.id}
          quadraSelecionada={quadraSelecionada}
          selectedDate={selectedDate}
          selectedDateIsPast={selectedDateIsPast}
          todayDate={todayDate}
          activeWeekdays={diasAtivosDaQuadra}
          agendaItems={agendaVisual}
          sessionUserId={session?.usuario.id ?? ""}
          amigosAceitos={amigosAceitos}
          actingGameId={actingGameId}
          onSelectDate={setSelectedDate}
          onCreateGame={handleCreateGame}
          onInvitePlayers={handleInvitePlayers}
          onGameAction={handleGameAction}
        />
      ) : null}
    </div>
  )
}
