"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  LoaderCircle,
  MapPinned,
  Plus,
  RefreshCcw,
  Send,
  Users,
} from "lucide-react"
import { clearAuthStorage, getSession, getToken } from "../../lib/auth-storage"
import {
  formatDate,
  formatPeriodo,
  formatTipoPiso,
  getErrorMessage,
  isUnauthorizedError,
} from "../../lib/painel-format"
import { getOutroUsuarioDaAmizade } from "../../lib/social"
import { listarAmizades } from "../../services/amizade.service"
import {
  aceitarConviteJogo,
  convidarJogadorParaJogo,
  listarConvitesJogo,
  recusarConviteJogo,
} from "../../services/convite-jogo.service"
import {
  cancelarJogo,
  listarMeusJogos,
  sairDoJogo,
} from "../../services/jogo.service"
import type { AuthSessionSnapshot } from "../../types/auth"
import type { JogoDetalhado } from "../../types/agenda"
import type { Amizade, ConviteJogo, UsuarioSocial } from "../../types/social"

type AbaAtiva = "FUTURAS" | "PASSADAS" | "CONVITES"

export function MeusJogosBoard() {
  const [session, setSession] = useState<AuthSessionSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>("FUTURAS")
  const [refreshKey, setRefreshKey] = useState(0)
  const [busyJogoId, setBusyJogoId] = useState<string | null>(null)
  const [busyConviteId, setBusyConviteId] = useState<string | null>(null)
  const [sendingInviteGameId, setSendingInviteGameId] = useState<string | null>(null)
  const [selectedFriendByGame, setSelectedFriendByGame] = useState<Record<string, string>>({})
  const [jogos, setJogos] = useState<JogoDetalhado[]>([])
  const [convites, setConvites] = useState<ConviteJogo[]>([])
  const [amizades, setAmizades] = useState<Amizade[]>([])

  useEffect(() => {
    async function loadData() {
      const token = getToken()
      const currentSession = getSession()

      if (!token || !currentSession) {
        clearAuthStorage()
        return
      }

      setSession(currentSession)
      setError("")

      try {
        const [jogosResponse, convitesResponse, amizadesResponse] = await Promise.all([
          listarMeusJogos(currentSession.usuario.id),
          listarConvitesJogo(),
          listarAmizades(),
        ])

        setJogos(jogosResponse.jogos)
        setConvites(convitesResponse.convites)
        setAmizades(amizadesResponse.amizades)
      } catch (requestError) {
        if (isUnauthorizedError(requestError)) {
          clearAuthStorage()
          return
        }

        setError(getErrorMessage(requestError, "Nao foi possivel carregar seus jogos agora."))
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [refreshKey])

  const now = new Date()
  const jogosFuturos = [...jogos]
    .filter((jogo) => new Date(jogo.fim_em) >= now)
    .sort(
      (primeiro, segundo) =>
        new Date(primeiro.inicio_em).getTime() -
        new Date(segundo.inicio_em).getTime()
    )
  const jogosPassados = [...jogos]
    .filter((jogo) => new Date(jogo.fim_em) < now)
    .sort(
      (primeiro, segundo) =>
        new Date(segundo.inicio_em).getTime() -
        new Date(primeiro.inicio_em).getTime()
    )
  const convitesPendentes = convites.filter((convite) => convite.status === "PENDENTE")

  const amigosAceitos: UsuarioSocial[] = session?.usuario.id
    ? amizades
        .filter((amizade) => amizade.status === "ACEITA")
        .map((amizade) => getOutroUsuarioDaAmizade(amizade, session.usuario.id))
    : []

  const jogosExibidos = abaAtiva === "FUTURAS" ? jogosFuturos : jogosPassados

  async function handleCancelarOuSair(jogo: JogoDetalhado) {
    setBusyJogoId(jogo.id)
    setError("")
    setNotice("")

    try {
      const isResponsavel = jogo.responsavel_usuario_id === session?.usuario.id

      if (isResponsavel) {
        await cancelarJogo(jogo.id)
        setNotice("Jogo cancelado com sucesso.")
      } else {
        await sairDoJogo(jogo.id)
        setNotice("Voce saiu do jogo com sucesso.")
      }

      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel concluir essa acao agora."))
    } finally {
      setBusyJogoId(null)
    }
  }

  async function handleResponderConvite(
    conviteId: string,
    action: "aceitar" | "recusar"
  ) {
    setBusyConviteId(conviteId)
    setError("")
    setNotice("")

    try {
      if (action === "aceitar") {
        await aceitarConviteJogo(conviteId)
        setNotice("Convite aceito com sucesso.")
      } else {
        await recusarConviteJogo(conviteId)
        setNotice("Convite recusado com sucesso.")
      }

      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel responder ao convite agora."))
    } finally {
      setBusyConviteId(null)
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

  if (!session && loading) {
    return (
      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-bold text-zinc-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Carregando seus jogos
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-5">
      <section className="rounded-[34px] bg-white border border-black/5 bg-[linear-gradient(180deg,#fffdfa_0%,#f8f4ec_100%)] p-5 shadow-[0_28px_70px_rgba(15,23,42,0.07)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-green-700">
              Meus jogos
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
              Minhas partidas e convites
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Veja seus jogos por data, responda convites e convide amigos aceitos
              para completar a quadra.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-700 shadow-sm hover:border-zinc-300 hover:bg-zinc-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </button>
        </div>

       

        <div className="mt-6 inline-flex w-full rounded-2xl bg-[#edf0f6] p-1 sm:w-auto">
          <TabButton
            active={abaAtiva === "FUTURAS"}
            onClick={() => setAbaAtiva("FUTURAS")}
            label={`Futuras ${jogosFuturos.length}`}
          />
          <TabButton
            active={abaAtiva === "PASSADAS"}
            onClick={() => setAbaAtiva("PASSADAS")}
            label={`Passadas ${jogosPassados.length}`}
          />
          <TabButton
            active={abaAtiva === "CONVITES"}
            onClick={() => setAbaAtiva("CONVITES")}
            label={`Convites ${convitesPendentes.length}`}
          />
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

      {abaAtiva === "CONVITES" ? (
        <section className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-44 rounded-[26px] border border-zinc-200 bg-white/80"
              />
            ))
          ) : convites.length > 0 ? (
            convites.map((convite) => (
              <article
                key={convite.id}
                className="rounded-[26px] border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-zinc-950">
                      {convite.jogo.quadra.nome}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {convite.jogo.academia?.nome || "Academia"} ·{" "}
                      {formatDate(convite.jogo.inicio_em)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {formatPeriodo(convite.jogo.inicio_em, convite.jogo.fim_em)} · enviado por{" "}
                      {convite.enviadoPor.nome}
                    </p>
                  </div>

                  <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-700">
                    {convite.status}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {convite.status === "PENDENTE" ? (
                    <>
                      <button
                        type="button"
                        disabled={busyConviteId === convite.id}
                        onClick={() => void handleResponderConvite(convite.id, "aceitar")}
                        className="inline-flex items-center justify-center rounded-2xl bg-green-700 px-4 py-3 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-60"
                      >
                        {busyConviteId === convite.id ? "Processando..." : "Aceitar"}
                      </button>
                      <button
                        type="button"
                        disabled={busyConviteId === convite.id}
                        onClick={() => void handleResponderConvite(convite.id, "recusar")}
                        className="inline-flex items-center justify-center rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-200 disabled:opacity-60"
                      >
                        Recusar
                      </button>
                    </>
                  ) : null}

                  <Link
                    href={`/painel/academia/${convite.jogo.academia_id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
                  >
                    Abrir academia
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <EmptyState
              title="Nenhum convite encontrado"
              text="Quando alguem te chamar para uma partida, ela aparece aqui."
            />
          )}
        </section>
      ) : (
        <section className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-52 rounded-[26px] border border-zinc-200 bg-white/80"
              />
            ))
          ) : jogosExibidos.length > 0 ? (
            jogosExibidos.map((jogo) => {
              const passado = new Date(jogo.fim_em) < now
              const isResponsavel = jogo.responsavel_usuario_id === session?.usuario.id
              const canInvite = !passado && jogo.status === "ABERTO"
              const amigosDisponiveis = amigosAceitos.filter(
                (amigo) =>
                  !jogo.participantes.some(
                    (participante) => participante.usuario.id === amigo.id
                  )
              )

              return (
                <article
                  key={jogo.id}
                  className={[
                    "rounded-[26px] border p-5 shadow-sm transition",
                    passado
                      ? "border-zinc-200 bg-[#f8f9fc]"
                      : "border-zinc-200 bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)]",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={[
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                          passado ? "bg-zinc-100 text-zinc-400" : "bg-[#e9f6ef] text-green-700",
                        ].join(" ")}
                      >
                        <MapPinned className="h-5 w-5" />
                      </div>

                      <div>
                        <h2
                          className={[
                            "text-xl font-black leading-tight",
                            passado ? "text-zinc-500" : "text-zinc-950",
                          ].join(" ")}
                        >
                          {jogo.quadra.nome}
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                          {jogo.academia?.nome || "Academia"} · Quadra de{" "}
                          {formatTipoPiso(jogo.quadra.tipo_piso)}
                          {jogo.quadra.coberta ? " · Coberta" : ""}
                        </p>
                        {jogo.quadra.descricao && (
                          <p className="mt-1 text-sm text-zinc-400">{jogo.quadra.descricao}</p>
                        )}
                      </div>
                    </div>

                    <span
                      className={[
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                        passado
                          ? "bg-zinc-200 text-zinc-600"
                          : "bg-lime-100 text-green-700",
                      ].join(" ")}
                    >
                      {passado ? "Finalizada" : jogo.status}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-zinc-600">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-zinc-400" />
                      {formatDate(jogo.inicio_em)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-zinc-400" />
                      {formatPeriodo(jogo.inicio_em, jogo.fim_em)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Users className="h-4 w-4 text-zinc-400" />
                      {jogo.participantes.length}/{jogo.maximo_participantes} · {jogo.tipo_jogo}
                    </span>
                  </div>

                  {!passado ? (
                    <div className="mt-5 space-y-4 ">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          disabled={busyJogoId === jogo.id}
                          onClick={() => void handleCancelarOuSair(jogo)}
                          className="inline-flex items-center justify-center rounded-2xl bg-[#dfe6f2] px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-[#d2dbea] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {busyJogoId === jogo.id ? (
                            <span className="inline-flex items-center gap-2">
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                              Processando...
                            </span>
                          ) : isResponsavel ? (
                            "Cancelar"
                          ) : (
                            "Sair do jogo"
                          )}
                        </button>

                        <Link
                          href={`/painel/academia/${jogo.academia_id}`}
                          className="inline-flex items-center justify-center rounded-2xl bg-[#007f46] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(0,127,70,0.2)] hover:bg-[#006a3b]"
                        >
                          Abrir academia
                        </Link>
                      </div>

                      {canInvite ? (
                        <div className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4">
                          <p className="text-sm font-black text-zinc-950">
                            Convidar amigo 
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
                              className="h-12 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 outline-none"
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
                              {sendingInviteGameId === jogo.id
                                ? "Enviando..."
                                : "Convidar"}
                            </button>
                          </div>

                          {amigosDisponiveis.length === 0 ? (
                            <p className="mt-3 text-sm text-zinc-500">
                              Voce precisa ter um amigo aceito e fora desta partida para enviar convite.
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              )
            })
          ) : (
            <EmptyState
              title={
                abaAtiva === "FUTURAS"
                  ? "Nenhuma reserva futura por enquanto"
                  : "Nenhuma reserva passada encontrada"
              }
              text={
                abaAtiva === "FUTURAS"
                  ? "Abra uma academia pela busca para montar sua proxima partida."
                  : "Quando seus jogos forem concluidos, eles aparecem aqui."
              }
            />
          )}

          {abaAtiva === "FUTURAS" ? (
            <div className="rounded-[28px] border border-dashed border-[#d6deea] bg-white/80 px-6 py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#94a3b8] bg-white text-zinc-600">
                <Plus className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-2xl font-black tracking-tight text-zinc-950">
                Quer jogar mais?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Encontre novos horarios disponiveis entrando direto na academia que voce quiser.
              </p>

              <Link
                href="/painel/buscar"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#007f46] px-7 py-3.5 text-sm font-bold text-white shadow-[0_16px_30px_rgba(0,127,70,0.22)] hover:bg-[#006a3b]"
              >
                Buscar quadras
              </Link>
            </div>
          ) : null}
        </section>
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[24px] bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-zinc-950">{value}</p>
    </article>
  )
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 rounded-[14px] px-5 py-3 text-sm font-bold transition sm:flex-none",
        active
          ? "bg-white text-green-700 shadow-sm"
          : "text-zinc-500 hover:text-zinc-700",
      ].join(" ")}
    >
      {label}
    </button>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[26px] border border-dashed border-zinc-300 bg-white/70 px-5 py-10 text-center">
      <p className="text-lg font-black text-zinc-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  )
}
