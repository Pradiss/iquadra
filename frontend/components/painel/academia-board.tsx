"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  LoaderCircle,
  MapPin,
  Phone,
  Plus,
  Send,
  Trophy,
  UserRoundPlus,
  Users,
} from "lucide-react"
import { clearAuthStorage, getSession, getToken } from "../../lib/auth-storage"
import {
  buildIsoDateTime,
  formatLocation,
  formatLongDate,
  formatPeriodo,
  formatTipoPiso,
  getErrorMessage,
  getTodayDate,
  isUnauthorizedError,
} from "../../lib/painel-format"
import { getAmizadeComUsuario } from "../../lib/social"
import { listarAmizades, solicitarAmizade } from "../../services/amizade.service"
import { listarAulas } from "../../services/aula.service"
import { buscarDisponibilidade } from "../../services/disponibilidade.service"
import { buscarEmpresaDetalhes } from "../../services/empresa.service"
import {
  cancelarJogo,
  criarJogo,
  entrarNoJogo,
  listarJogos,
  sairDoJogo,
} from "../../services/jogo.service"
import { listarHorariosQuadra } from "../../services/quadra.service"
import type { AulaAgenda } from "../../types/aula"
import type { AuthSessionSnapshot } from "../../types/auth"
import type { EmpresaDetalhe } from "../../types/empresa"
import type { AgendaDisponibilidade, AgendaSlot, JogoDetalhado } from "../../types/agenda"
import type { HorarioQuadraDetalhe } from "../../types/quadra"
import type { Amizade, UsuarioSocial } from "../../types/social"
import { convidarJogadorParaJogo } from "../../services/convite-jogo.service"
import { getOutroUsuarioDaAmizade } from "../../lib/social"

const DIA_SEMANA_LABEL: Record<number, string> = {
  0: "Domingo",
  1: "Segunda",
  2: "Terca",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sabado",
}

export function AcademiaBoard() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const academiaId = typeof params?.id === "string" ? params.id : ""
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [creating, setCreating] = useState(false)
  const [actingGameId, setActingGameId] = useState<string | null>(null)
  const [sendingFriendId, setSendingFriendId] = useState<string | null>(null)
  const [sendingInviteGameId, setSendingInviteGameId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
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
  const [slotKey, setSlotKey] = useState("")
  const [tipoJogo, setTipoJogo] = useState<"SIMPLES" | "DUPLA">("SIMPLES")
  const [observacoes, setObservacoes] = useState("")
  const [manualStart, setManualStart] = useState("08:00")
  const [manualEnd, setManualEnd] = useState("09:00")
  const [selectedFriendByGame, setSelectedFriendByGame] = useState<Record<string, string>>({})

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
  const quadraSelecionada =
    quadrasAtivas.find((quadra) => quadra.id === quadraId) ?? quadrasAtivas[0] ?? null
  const quadraSelecionadaId = quadraSelecionada?.id ?? ""
  const disponibilidadeSelecionada =
    disponibilidades.find((disponibilidade) => disponibilidade.quadra.id === quadraSelecionadaId) ??
    null
  const slotsLivres = disponibilidadeSelecionada?.slots.filter((slot) => slot.disponivel) ?? []
  const slotSelecionado =
    slotsLivres.find((slot) => getSlotKey(quadraSelecionadaId, slot) === slotKey) ??
    slotsLivres[0] ??
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
  const totalSlotsLivres = disponibilidades.reduce(
    (total, disponibilidade) =>
      total + disponibilidade.slots.filter((slot) => slot.disponivel).length,
    0
  )
  const amigosAceitos: UsuarioSocial[] = session?.usuario.id
    ? amizades
        .filter((amizade) => amizade.status === "ACEITA")
        .map((amizade) => getOutroUsuarioDaAmizade(amizade, session.usuario.id))
    : []
  const podeUsarHorarioManual = slotsLivres.length === 0

  async function handleCreateGame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!academia || !quadraSelecionada) {
      return
    }

    setCreating(true)
    setError("")
    setNotice("")

    try {
      await criarJogo({
        academia_id: academia.id,
        quadra_id: quadraSelecionada.id,
        tipo_jogo: tipoJogo,
        inicio_em: buildIsoDateTime(
          selectedDate,
          podeUsarHorarioManual ? manualStart : slotSelecionado?.inicio ?? manualStart
        ),
        fim_em: buildIsoDateTime(
          selectedDate,
          podeUsarHorarioManual ? manualEnd : slotSelecionado?.fim ?? manualEnd
        ),
        observacoes: observacoes.trim() || undefined,
      })

      setObservacoes("")
      setNotice("Jogo criado com sucesso.")
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel criar o jogo agora."))
    } finally {
      setCreating(false)
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

  async function handleConvidarAmigo(jogo: JogoDetalhado) {
    const convidadoUsuarioId = selectedFriendByGame[jogo.id]

    if (!convidadoUsuarioId) {
      return
    }

    setSendingInviteGameId(jogo.id)
    setError("")
    setNotice("")

    try {
      await convidarJogadorParaJogo(jogo.id, convidadoUsuarioId)
      setNotice("Convite enviado com sucesso.")
      setSelectedFriendByGame((current) => ({
        ...current,
        [jogo.id]: "",
      }))
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel convidar esse amigo agora."))
    } finally {
      setSendingInviteGameId(null)
    }
  }

  async function handleSolicitarAmizade(usuarioId: string) {
    setSendingFriendId(usuarioId)
    setError("")
    setNotice("")

    try {
      await solicitarAmizade(usuarioId)
      setNotice("Pedido de amizade enviado com sucesso.")
      const amizadesResponse = await listarAmizades()
      setAmizades(amizadesResponse.amizades)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel enviar o pedido agora."))
    } finally {
      setSendingFriendId(null)
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
        <Link
          href="/painel/buscar"
          className="mt-5 inline-flex rounded-2xl bg-green-700 px-5 py-3 text-sm font-bold text-white"
        >
          Voltar para busca
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <section className="rounded-[34px] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-green-700">
              Academia escolhida
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
              {academia.nome}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {formatLocation(academia)}
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-600">
              {academia.telefone ? (
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-zinc-400" />
                  {academia.telefone}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-zinc-400" />
                {academia.totalQuadras} quadra(s)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
              <span className="mr-3 text-zinc-500">Data</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="bg-transparent outline-none"
              />
            </label>

            <Link
              href="/painel/buscar"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Trocar academia
            </Link>
          </div>
        </div>

        {(error || notice) && (
          <div
            className={[
              "mt-5 rounded-2xl px-4 py-3 text-sm font-semibold ring-1",
              error
                ? "bg-red-50 text-red-700 ring-red-200"
                : "bg-lime-50 text-lime-800 ring-lime-200",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error || notice}</p>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Quadras ativas" value={String(quadrasAtivas.length)} />
        <SummaryCard label="Slots livres" value={String(totalSlotsLivres)} />
        <SummaryCard label="Jogos do dia" value={String(jogos.length)} />
        <SummaryCard label="Aulas do dia" value={String(aulas.length)} />
      </section>

      <section className="rounded-[32px] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-green-700">
              Escolha da quadra
            </p>
            <h2 className="mt-2 text-2xl font-black text-zinc-950">
              {formatLongDate(selectedDate)}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Clique na quadra para ver detalhes, horarios padrao, slots livres e jogos do dia.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quadrasAtivas.map((quadra) => {
            const ativa = quadra.id === quadraSelecionadaId

            return (
              <button
                key={quadra.id}
                type="button"
                onClick={() => {
                  setQuadraId(quadra.id)
                  setSlotKey("")
                }}
                className={[
                  "rounded-[28px] border p-4 text-left transition",
                  ativa
                    ? "border-green-300 bg-green-50 shadow-sm"
                    : "border-zinc-200 bg-white hover:border-green-200 hover:bg-zinc-50",
                ].join(" ")}
              >
                <p className="text-lg font-black text-zinc-950">{quadra.nome}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatTipoPiso(quadra.tipo_piso)} {quadra.coberta ? "· Coberta" : "· Descoberta"}
                </p>
                {quadra.descricao ? (
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{quadra.descricao}</p>
                ) : null}
              </button>
            )
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <PanelCard
          title={quadraSelecionada?.nome || "Quadra"}
          subtitle="Detalhes da quadra e agenda semanal configurada."
          icon={<CalendarDays className="h-5 w-5" />}
        >
          {quadraSelecionada ? (
            <div className="space-y-5">
              <div className="rounded-[26px] bg-[linear-gradient(135deg,#0f5132_0%,#4caf70_52%,#d0f0a8_100%)] p-5 text-white">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-white/75">
                  Quadra selecionada
                </p>
                <h3 className="mt-2 text-3xl font-black">{quadraSelecionada.nome}</h3>
                <p className="mt-3 text-sm leading-6 text-white/85">
                  {quadraSelecionada.descricao || "Sem descricao adicional para esta quadra."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge label={formatTipoPiso(quadraSelecionada.tipo_piso)} />
                  <Badge label={quadraSelecionada.coberta ? "Coberta" : "Descoberta"} />
                  <Badge label={quadraSelecionada.ativa ? "Disponivel" : "Inativa"} />
                </div>
              </div>

              <div className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">
                  Horarios da quadra
                </p>
                <div className="mt-3 space-y-3">
                  {horariosDaQuadra.length > 0 ? (
                    horariosDaQuadra.map((horario) => (
                      <div
                        key={horario.id}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3"
                      >
                        <div>
                          <p className="font-black text-zinc-950">
                            {DIA_SEMANA_LABEL[horario.dia_semana] || "Dia"}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {horario.abre_as} - {horario.fecha_as}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-zinc-600">
                          {horario.duracao_slot_minutos} min
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">
                      Sem horarios semanais cadastrados para essa quadra.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Nenhuma quadra ativa"
              text="Essa academia ainda nao publicou uma quadra disponivel para reserva."
            />
          )}
        </PanelCard>

        <PanelCard
          title="Marcar jogo"
          subtitle="Use um slot livre da quadra selecionada para abrir sua partida. Se nao aparecer horario, a academia ainda pode estar sem grade configurada."
          icon={<Plus className="h-5 w-5" />}
        >
          <form onSubmit={handleCreateGame} className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Quadra</span>
              <select
                value={quadraSelecionadaId}
                onChange={(event) => {
                  setQuadraId(event.target.value)
                  setSlotKey("")
                }}
                disabled={quadrasAtivas.length === 0}
                className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition focus:border-green-600 focus:bg-white"
              >
                {quadrasAtivas.length > 0 ? (
                  quadrasAtivas.map((quadra) => (
                    <option key={quadra.id} value={quadra.id}>
                      {quadra.nome}
                    </option>
                  ))
                ) : (
                  <option value="">Sem quadras ativas</option>
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Horario livre</span>
              <select
                value={slotSelecionado ? getSlotKey(quadraSelecionadaId, slotSelecionado) : ""}
                onChange={(event) => setSlotKey(event.target.value)}
                disabled={slotsLivres.length === 0}
                className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition focus:border-green-600 focus:bg-white"
              >
                {slotsLivres.length > 0 ? (
                  slotsLivres.map((slot) => (
                    <option key={getSlotKey(quadraSelecionadaId, slot)} value={getSlotKey(quadraSelecionadaId, slot)}>
                      {slot.inicio} - {slot.fim}
                    </option>
                  ))
                ) : (
                  <option value="">Sem slots livres na data</option>
                )}
              </select>
            </label>

            {podeUsarHorarioManual ? (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Inicio manual
                  </span>
                  <input
                    type="time"
                    value={manualStart}
                    onChange={(event) => setManualStart(event.target.value)}
                    className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition focus:border-green-600 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Fim manual
                  </span>
                  <input
                    type="time"
                    value={manualEnd}
                    onChange={(event) => setManualEnd(event.target.value)}
                    className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition focus:border-green-600 focus:bg-white"
                  />
                </label>
              </>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Tipo</span>
              <select
                value={tipoJogo}
                onChange={(event) => setTipoJogo(event.target.value as "SIMPLES" | "DUPLA")}
                className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition focus:border-green-600 focus:bg-white"
              >
                <option value="SIMPLES">Simples</option>
                <option value="DUPLA">Dupla</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Observacoes</span>
              <input
                value={observacoes}
                onChange={(event) => setObservacoes(event.target.value)}
                placeholder="Opcional"
                className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition focus:border-green-600 focus:bg-white"
              />
            </label>

            <button
              type="submit"
              disabled={
                creating ||
                !quadraSelecionada ||
                (!podeUsarHorarioManual && !slotSelecionado)
              }
              className="h-[50px] rounded-xl bg-green-700 px-5 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
            >
              {creating ? "Criando jogo..." : "Criar jogo"}
            </button>

            {podeUsarHorarioManual ? (
              <p className="text-sm leading-6 text-amber-700 md:col-span-2">
                Nao apareceu slot livre pela disponibilidade. Isso costuma acontecer quando a academia ainda nao configurou a grade semanal da quadra. Mesmo assim, voce pode tentar agendar manualmente usando a API atual.
              </p>
            ) : null}
          </form>
        </PanelCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <PanelCard
          title="Jogos da quadra"
          subtitle="Entre, saia ou cancele conforme seu papel na partida."
          icon={<Trophy className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {jogosDaQuadra.length > 0 ? (
              jogosDaQuadra.map((jogo) => {
                const isParticipant = jogo.participantes.some(
                  (participante) =>
                    participante.usuario.id === session?.usuario.id &&
                    (participante.status ?? "CONFIRMADO") === "CONFIRMADO"
                )
                const isResponsavel = jogo.responsavel_usuario_id === session?.usuario.id
                const canJoin =
                  !isParticipant &&
                  !isResponsavel &&
                  jogo.status === "ABERTO" &&
                  jogo.participantes.length < jogo.maximo_participantes
                const podeConvidar =
                  (isParticipant || isResponsavel) && jogo.status === "ABERTO"
                const amigosDisponiveis = amigosAceitos.filter(
                  (amigo) =>
                    !jogo.participantes.some(
                      (participante) => participante.usuario.id === amigo.id
                    )
                )

                return (
                  <article
                    key={jogo.id}
                    className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-black text-zinc-950">
                          {formatPeriodo(jogo.inicio_em, jogo.fim_em)}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {jogo.tipo_jogo} · {jogo.participantes.length}/{jogo.maximo_participantes} confirmado(s)
                        </p>
                        {jogo.observacoes ? (
                          <p className="mt-2 text-sm text-zinc-500">{jogo.observacoes}</p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        disabled={actingGameId === jogo.id || (!canJoin && !isParticipant && !isResponsavel)}
                        onClick={() => void handleGameAction(jogo)}
                        className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                      >
                        {actingGameId === jogo.id
                          ? "Processando..."
                          : isResponsavel
                            ? "Cancelar"
                            : isParticipant
                              ? "Sair"
                              : canJoin
                                ? "Entrar"
                                : "Lotado"}
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {jogo.participantes.map((participante) => (
                        <div
                          key={`${jogo.id}-${participante.usuario.id}`}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3"
                        >
                          <div>
                            <p className="font-black text-zinc-950">
                              {participante.usuario.nome}
                            </p>
                            <p className="text-sm text-zinc-500">{participante.papel}</p>
                          </div>

                          <FriendshipAction
                            currentUserId={session?.usuario.id || ""}
                            targetUserId={participante.usuario.id}
                            amizades={amizades}
                            loading={sendingFriendId === participante.usuario.id}
                            onRequestFriendship={handleSolicitarAmizade}
                          />
                        </div>
                      ))}
                    </div>

                    {podeConvidar ? (
                      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
                        <p className="text-sm font-black text-zinc-950">
                          Chamar amigo para este jogo
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          Convites so funcionam com amizades aceitas.
                        </p>

                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                          <select
                            value={selectedFriendByGame[jogo.id] ?? ""}
                            onChange={(event) =>
                              setSelectedFriendByGame((current) => ({
                                ...current,
                                [jogo.id]: event.target.value,
                              }))
                            }
                            className="h-12 flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-semibold text-zinc-900 outline-none"
                          >
                            <option value="">Selecione um amigo</option>
                            {amigosDisponiveis.map((amigo) => (
                              <option key={amigo.id} value={amigo.id}>
                                {amigo.nome}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            disabled={
                              sendingInviteGameId === jogo.id ||
                              !selectedFriendByGame[jogo.id] ||
                              amigosDisponiveis.length === 0
                            }
                            onClick={() => void handleConvidarAmigo(jogo)}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 text-sm font-bold text-white disabled:opacity-60"
                          >
                            <Send className="h-4 w-4" />
                            {sendingInviteGameId === jogo.id ? "Enviando..." : "Convidar"}
                          </button>
                        </div>

                        {amigosDisponiveis.length === 0 ? (
                          <p className="mt-3 text-sm text-zinc-500">
                            Voce ainda nao tem amigos aceitos disponiveis para esse jogo.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                )
              })
            ) : (
              <EmptyState
                title="Nenhum jogo para esta quadra"
                text="Use um slot livre acima para abrir a primeira partida do dia."
              />
            )}
          </div>
        </PanelCard>

        <PanelCard
          title="Aulas do dia"
          subtitle="Visao publica das aulas confirmadas para a quadra escolhida."
          icon={<Users className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {aulasDaQuadra.length > 0 ? (
              aulasDaQuadra.map((aula) => (
                <article
                  key={aula.id}
                  className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-4"
                >
                  <p className="text-lg font-black text-zinc-950">
                    {formatPeriodo(aula.inicio_em, aula.fim_em)}
                  </p>
                  <div className="mt-3 space-y-2">
                    {aula.professor ? (
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                        <div>
                          <p className="font-black text-zinc-950">{aula.professor.nome}</p>
                          <p className="text-sm text-zinc-500">Professor</p>
                        </div>

                        <FriendshipAction
                          currentUserId={session?.usuario.id || ""}
                          targetUserId={aula.professor.id}
                          amizades={amizades}
                          loading={sendingFriendId === aula.professor.id}
                          onRequestFriendship={handleSolicitarAmizade}
                        />
                      </div>
                    ) : null}

                    {aula.cliente ? (
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                        <div>
                          <p className="font-black text-zinc-950">{aula.cliente.nome}</p>
                          <p className="text-sm text-zinc-500">Cliente</p>
                        </div>

                        <FriendshipAction
                          currentUserId={session?.usuario.id || ""}
                          targetUserId={aula.cliente.id}
                          amizades={amizades}
                          loading={sendingFriendId === aula.cliente.id}
                          onRequestFriendship={handleSolicitarAmizade}
                        />
                      </div>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Nenhuma aula nessa quadra"
                text="Se houver aulas confirmadas para a data, elas aparecem aqui."
              />
            )}
          </div>
        </PanelCard>
      </section>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[28px] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black tracking-tight text-zinc-950">{value}</p>
    </article>
  )
}

function PanelCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-[32px] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-black text-zinc-950">{title}</h2>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white">
      {label}
    </span>
  )
}

function FriendshipAction({
  currentUserId,
  targetUserId,
  amizades,
  loading,
  onRequestFriendship,
}: {
  currentUserId: string
  targetUserId: string
  amizades: Amizade[]
  loading: boolean
  onRequestFriendship: (targetUserId: string) => Promise<void>
}) {
  if (!currentUserId || currentUserId === targetUserId) {
    return (
      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-500">
        Voce
      </span>
    )
  }

  const amizade = getAmizadeComUsuario(amizades, currentUserId, targetUserId)

  if (amizade?.status === "ACEITA") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
        Amigo
      </span>
    )
  }

  if (amizade?.status === "PENDENTE") {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
        Pendente
      </span>
    )
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void onRequestFriendship(targetUserId)}
      className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
    >
      <UserRoundPlus className="h-3.5 w-3.5" />
      {loading ? "Enviando..." : "Adicionar"}
    </button>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5">
      <p className="font-black text-zinc-950">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{text}</p>
    </div>
  )
}

function getSlotKey(quadraId: string, slot: Pick<AgendaSlot, "inicio" | "fim">) {
  return `${quadraId}:${slot.inicio}:${slot.fim}`
}
