"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import {
  AlertCircle,
  CalendarDays,
  LoaderCircle,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react"
import { clearAuthStorage, getSession, getToken } from "../../../lib/auth-storage"
import {
  canManageAcademia,
  canOperateAcademia,
  getPerfilParaAcademia,
  listActiveAcademiaContexts,
} from "../../../lib/painel-context"
import {
  buildIsoDateTime,
  formatDateTime,
  formatPeriodo,
  getErrorMessage,
  getTodayDate,
  isUnauthorizedError,
} from "../../../lib/painel-format"
import {
  cancelarAula,
  criarAula,
  criarRecorrenciaAula,
  listarAulas,
  listarRecorrenciasAula,
  cancelarRecorrenciaAula,
} from "../../../services/aula.service"
import { listarConvitesJogo } from "../../../services/convite-jogo.service"
import { buscarAgendaAcademia } from "../../../services/dashboard.service"
import { listarMeusJogos } from "../../../services/jogo.service"
import { listarQuadrasAcademia } from "../../../services/quadra.service"
import type { AulaAgenda, RecorrenciaAula } from "../../../types/aula"
import type { AuthSessionSnapshot } from "../../../types/auth"
import type { AgendaEventoAcademia } from "../../../types/dashboard"
import type { JogoDetalhado } from "../../../types/agenda"
import type { QuadraResumo } from "../../../types/quadra"
import type { ConviteJogo } from "../../../types/social"

const DIA_SEMANA_OPTIONS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terca" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sabado" },
] as const

export default function AgendaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const academiaIdFromQuery = searchParams.get("academia") ?? ""
  const [session] = useState<AuthSessionSnapshot | null>(() => getSession())
  const initialContexts = listActiveAcademiaContexts(session)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [savingAula, setSavingAula] = useState(false)
  const [savingRecorrencia, setSavingRecorrencia] = useState(false)
  const [busyCancelId, setBusyCancelId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [warning, setWarning] = useState("")
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [selectedAcademiaId, setSelectedAcademiaId] = useState(
    academiaIdFromQuery || initialContexts[0]?.academia.id || ""
  )
  const [jogos, setJogos] = useState<JogoDetalhado[]>([])
  const [convites, setConvites] = useState<ConviteJogo[]>([])
  const [aulas, setAulas] = useState<AulaAgenda[]>([])
  const [recorrencias, setRecorrencias] = useState<RecorrenciaAula[]>([])
  const [quadras, setQuadras] = useState<QuadraResumo[]>([])
  const [agendaAcademia, setAgendaAcademia] = useState<AgendaEventoAcademia[]>([])
  const [aulaForm, setAulaForm] = useState({
    quadraId: "",
    inicio: "08:00",
    fim: "09:00",
    observacoes: "",
  })
  const [recorrenciaForm, setRecorrenciaForm] = useState({
    quadraId: "",
    diasSemana: [1] as number[],
    dataFim: "",
    horarioInicio: "08:00",
    horarioFim: "09:00",
    observacoes: "",
  })

  useEffect(() => {
    const token = getToken()

    if (!token || !session) {
      clearAuthStorage()
      router.replace("/login")
    }
  }, [router, session])

  useEffect(() => {
    async function loadAgenda() {
      const currentSession = getSession()

      if (!currentSession) {
        return
      }

      setError("")
      setNotice("")
      setWarning("")

      try {
        const [jogosResponse, convitesResponse] = await Promise.all([
          listarMeusJogos(currentSession.usuario.id, {
            data: selectedDate,
            academiaId: selectedAcademiaId || undefined,
          }),
          listarConvitesJogo(),
        ])

        setJogos(jogosResponse.jogos)
        setConvites(convitesResponse.convites)

        const perfilNaAcademia = getPerfilParaAcademia(currentSession, selectedAcademiaId)

        if (
          currentSession.usuario.temPerfilProfessor &&
          canOperateAcademia(perfilNaAcademia) &&
          selectedAcademiaId
        ) {
          const [aulasResponse, quadrasResponse] = await Promise.all([
            listarAulas({
              professorId: currentSession.usuario.id,
              academiaId: selectedAcademiaId,
              data: selectedDate,
            }),
            listarQuadrasAcademia(selectedAcademiaId),
          ])

          setAulas(aulasResponse.aulas)
          const quadrasAtivas = quadrasResponse.quadras.filter((quadra) => quadra.ativa)
          const defaultQuadraId = quadrasAtivas[0]?.id ?? ""

          setQuadras(quadrasAtivas)
          setAulaForm((current) => ({
            ...current,
            quadraId: quadrasAtivas.some((quadra) => quadra.id === current.quadraId)
              ? current.quadraId
              : defaultQuadraId,
          }))
          setRecorrenciaForm((current) => ({
            ...current,
            quadraId: quadrasAtivas.some((quadra) => quadra.id === current.quadraId)
              ? current.quadraId
              : defaultQuadraId,
          }))

          try {
            const recorrenciasResponse = await listarRecorrenciasAula({
              professorId: currentSession.usuario.id,
              academiaId: selectedAcademiaId,
            })
            setRecorrencias(recorrenciasResponse.recorrencias)
          } catch (recorrenciaError) {
            console.warn("Falha ao listar recorrencias", recorrenciaError)
            setRecorrencias([])
            setWarning("As recorrencias nao puderam ser listadas agora.")
          }
        } else {
          setAulas([])
          setRecorrencias([])
          setQuadras([])
        }

        if (
          selectedAcademiaId &&
          canManageAcademia(perfilNaAcademia)
        ) {
          const agendaResponse = await buscarAgendaAcademia(selectedAcademiaId, selectedDate)
          setAgendaAcademia(agendaResponse.eventos)
        } else {
          setAgendaAcademia([])
        }
      } catch (requestError) {
        if (isUnauthorizedError(requestError)) {
          clearAuthStorage()
          router.replace("/login")
          return
        }

        setError(getErrorMessage(requestError, "Nao foi possivel carregar a agenda agora."))
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      void loadAgenda()
    }
  }, [refreshKey, router, selectedAcademiaId, selectedDate, session])

  const contexts = listActiveAcademiaContexts(session)
  const perfilNaAcademia = getPerfilParaAcademia(session, selectedAcademiaId)
  const canCreateLessons =
    Boolean(session?.usuario.temPerfilProfessor) &&
    canOperateAcademia(perfilNaAcademia) &&
    Boolean(selectedAcademiaId)
  const convitesPendentes = convites.filter((convite) => convite.status === "PENDENTE")

  async function handleCriarAula(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedAcademiaId || !aulaForm.quadraId || !session) {
      return
    }

    setSavingAula(true)
    setError("")
    setNotice("")

    try {
      await criarAula({
        academia_id: selectedAcademiaId,
        quadra_id: aulaForm.quadraId,
        professor_id: session.usuario.id,
        inicio_em: buildIsoDateTime(selectedDate, aulaForm.inicio),
        fim_em: buildIsoDateTime(selectedDate, aulaForm.fim),
        observacoes: aulaForm.observacoes.trim() || undefined,
      })

      setNotice("Aula criada com sucesso.")
      setAulaForm((current) => ({
        ...current,
        observacoes: "",
      }))
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel criar a aula agora."))
    } finally {
      setSavingAula(false)
    }
  }

  async function handleCriarRecorrencia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedAcademiaId || !recorrenciaForm.quadraId || !session) {
      return
    }

    setSavingRecorrencia(true)
    setError("")
    setNotice("")

    try {
      await criarRecorrenciaAula({
        academia_id: selectedAcademiaId,
        quadra_id: recorrenciaForm.quadraId,
        professor_id: session.usuario.id,
        dias_semana: recorrenciaForm.diasSemana,
        data_inicio: selectedDate,
        data_fim: recorrenciaForm.dataFim || undefined,
        horario_inicio: recorrenciaForm.horarioInicio,
        horario_fim: recorrenciaForm.horarioFim,
        observacoes: recorrenciaForm.observacoes.trim() || undefined,
      })

      setNotice("Recorrencia criada com sucesso.")
      setRecorrenciaForm((current) => ({
        ...current,
        observacoes: "",
      }))
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel criar a recorrencia agora."))
    } finally {
      setSavingRecorrencia(false)
    }
  }

  async function handleCancelarAula(aulaId: string) {
    setBusyCancelId(aulaId)
    setError("")
    setNotice("")

    try {
      await cancelarAula(aulaId)
      setNotice("Aula cancelada com sucesso.")
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel cancelar a aula agora."))
    } finally {
      setBusyCancelId(null)
    }
  }

  async function handleCancelarRecorrencia(recorrenciaId: string) {
    setBusyCancelId(recorrenciaId)
    setError("")
    setNotice("")

    try {
      await cancelarRecorrenciaAula(recorrenciaId)
      setNotice("Recorrencia cancelada com sucesso.")
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Nao foi possivel cancelar a recorrencia agora.")
      )
    } finally {
      setBusyCancelId(null)
    }
  }

  if (loading) {
    return (
      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-bold text-zinc-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Carregando agenda
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <section className="rounded-[34px] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-green-700">
              Agenda pessoal
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
              Jogos, convites e aulas
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Jogadores acompanham partidas e convites. Professores criam aulas avulsas e recorrentes sem depender de academia ativa.
            </p>
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

            {contexts.length > 0 ? (
              <label className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
                <span className="mr-3 text-zinc-500">Academia</span>
                <select
                  value={selectedAcademiaId}
                  onChange={(event) => setSelectedAcademiaId(event.target.value)}
                  className="bg-transparent outline-none"
                >
                  {contexts.map((context) => (
                    <option key={context.vinculoId ?? context.academia.id} value={context.academia.id}>
                      {context.academia.nome}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <button
              type="button"
              onClick={() => setRefreshKey((current) => current + 1)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
          </div>
        </div>

        {(error || notice || warning) && (
          <div
            className={[
              "mt-5 rounded-2xl px-4 py-3 text-sm font-semibold ring-1",
              error
                ? "bg-red-50 text-red-700 ring-red-200"
                : warning
                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                  : "bg-lime-50 text-lime-800 ring-lime-200",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error || warning || notice}</p>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Jogos no dia" value={String(jogos.length)} />
        <SummaryCard label="Convites pendentes" value={String(convitesPendentes.length)} />
        <SummaryCard label="Aulas no dia" value={String(aulas.length)} />
        <SummaryCard label="Recorrencias" value={String(recorrencias.length)} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <PanelCard
          title="Suas partidas"
          subtitle="Jogos confirmados para a data e academia filtrada."
          icon={<Trophy className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {jogos.length > 0 ? (
              jogos.map((jogo) => (
                <article
                  key={jogo.id}
                  className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-4"
                >
                  <p className="text-lg font-black text-zinc-950">{jogo.quadra.nome}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {jogo.academia?.nome || "Academia"} · {formatDateTime(jogo.inicio_em)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatPeriodo(jogo.inicio_em, jogo.fim_em)} · {jogo.tipo_jogo}
                  </p>
                  <div className="mt-3">
                    <Link
                      href={`/painel/academia/${jogo.academia_id}`}
                      className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
                    >
                      Abrir academia
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Nenhum jogo encontrado"
                text="Quando voce entrar ou criar partidas para essa data, elas aparecem aqui."
              />
            )}
          </div>
        </PanelCard>

        <PanelCard
          title="Convites recebidos"
          subtitle="Chamados pendentes para voce responder no centro de jogos."
          icon={<Users className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {convitesPendentes.length > 0 ? (
              convitesPendentes.map((convite) => (
                <article
                  key={convite.id}
                  className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-4"
                >
                  <p className="text-lg font-black text-zinc-950">
                    {convite.enviadoPor.nome}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {convite.jogo.quadra.nome} · {formatDateTime(convite.jogo.inicio_em)}
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/painel/meus-jogos"
                      className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-bold text-white"
                    >
                      Abrir convites
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Nenhum convite pendente"
                text="Os convites para seus jogos ficam concentrados aqui e em Meus jogos."
              />
            )}
          </div>
        </PanelCard>
      </section>

      {canCreateLessons ? (
        <section className="grid gap-5 xl:grid-cols-2">
          <PanelCard
            title="Criar aula avulsa"
            subtitle="Professor logado e quadras da academia selecionada."
            icon={<Plus className="h-5 w-5" />}
          >
            <form onSubmit={handleCriarAula} className="grid gap-3 md:grid-cols-2">
              <FormSelect
                label="Quadra"
                value={aulaForm.quadraId}
                onChange={(value) =>
                  setAulaForm((current) => ({ ...current, quadraId: value }))
                }
                options={quadras.map((quadra) => ({
                  value: quadra.id,
                  label: quadra.nome,
                }))}
              />
              <FormField
                label="Inicio"
                type="time"
                value={aulaForm.inicio}
                onChange={(value) =>
                  setAulaForm((current) => ({ ...current, inicio: value }))
                }
              />
              <FormField
                label="Fim"
                type="time"
                value={aulaForm.fim}
                onChange={(value) =>
                  setAulaForm((current) => ({ ...current, fim: value }))
                }
              />
              <FormField
                label="Observacoes"
                value={aulaForm.observacoes}
                onChange={(value) =>
                  setAulaForm((current) => ({ ...current, observacoes: value }))
                }
                placeholder="Opcional"
              />
              <button
                type="submit"
                disabled={savingAula || !aulaForm.quadraId}
                className="h-[50px] rounded-xl bg-green-700 px-5 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-60 md:col-span-2"
              >
                {savingAula ? "Criando aula..." : "Criar aula"}
              </button>
            </form>
          </PanelCard>

          <PanelCard
            title="Criar recorrencia"
            subtitle="Grade recorrente usando os dias da semana selecionados."
            icon={<CalendarDays className="h-5 w-5" />}
          >
            <form onSubmit={handleCriarRecorrencia} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <FormSelect
                  label="Quadra"
                  value={recorrenciaForm.quadraId}
                  onChange={(value) =>
                    setRecorrenciaForm((current) => ({ ...current, quadraId: value }))
                  }
                  options={quadras.map((quadra) => ({
                    value: quadra.id,
                    label: quadra.nome,
                  }))}
                />
                <FormField
                  label="Data final"
                  type="date"
                  value={recorrenciaForm.dataFim}
                  onChange={(value) =>
                    setRecorrenciaForm((current) => ({ ...current, dataFim: value }))
                  }
                />
                <FormField
                  label="Inicio"
                  type="time"
                  value={recorrenciaForm.horarioInicio}
                  onChange={(value) =>
                    setRecorrenciaForm((current) => ({
                      ...current,
                      horarioInicio: value,
                    }))
                  }
                />
                <FormField
                  label="Fim"
                  type="time"
                  value={recorrenciaForm.horarioFim}
                  onChange={(value) =>
                    setRecorrenciaForm((current) => ({ ...current, horarioFim: value }))
                  }
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-gray-700">Dias da semana</p>
                <div className="flex flex-wrap gap-2">
                  {DIA_SEMANA_OPTIONS.map((dia) => {
                    const active = recorrenciaForm.diasSemana.includes(dia.value)

                    return (
                      <button
                        key={dia.value}
                        type="button"
                        onClick={() =>
                          setRecorrenciaForm((current) => ({
                            ...current,
                            diasSemana: active
                              ? current.diasSemana.filter((item) => item !== dia.value)
                              : [...current.diasSemana, dia.value].sort((a, b) => a - b),
                          }))
                        }
                        className={[
                          "rounded-full px-4 py-2 text-sm font-bold transition",
                          active
                            ? "bg-green-700 text-white"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                        ].join(" ")}
                      >
                        {dia.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <FormField
                label="Observacoes"
                value={recorrenciaForm.observacoes}
                onChange={(value) =>
                  setRecorrenciaForm((current) => ({ ...current, observacoes: value }))
                }
                placeholder="Opcional"
              />

              <button
                type="submit"
                disabled={
                  savingRecorrencia ||
                  !recorrenciaForm.quadraId ||
                  recorrenciaForm.diasSemana.length === 0
                }
                className="h-[50px] w-full rounded-xl bg-zinc-950 px-5 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-60"
              >
                {savingRecorrencia ? "Criando recorrencia..." : "Criar recorrencia"}
              </button>
            </form>
          </PanelCard>
        </section>
      ) : null}

      {canCreateLessons ? (
        <section className="grid gap-5 xl:grid-cols-2">
          <PanelCard
            title="Aulas do dia"
            subtitle="Aulas filtradas para o professor logado."
            icon={<Users className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {aulas.length > 0 ? (
                aulas.map((aula) => (
                  <article
                    key={aula.id}
                    className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <p className="text-lg font-black text-zinc-950">{aula.quadra.nome}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {formatPeriodo(aula.inicio_em, aula.fim_em)}
                    </p>
                    <button
                      type="button"
                      disabled={busyCancelId === aula.id}
                      onClick={() => void handleCancelarAula(aula.id)}
                      className="mt-3 inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {busyCancelId === aula.id ? "Cancelando..." : "Cancelar aula"}
                    </button>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="Nenhuma aula nessa data"
                  text="Quando houver aulas para o professor logado, elas aparecem aqui."
                />
              )}
            </div>
          </PanelCard>

          <PanelCard
            title="Recorrencias"
            subtitle="Recorrencias carregadas para a academia filtrada."
            icon={<CalendarDays className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {recorrencias.length > 0 ? (
                recorrencias.map((recorrencia) => (
                  <article
                    key={recorrencia.id}
                    className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <p className="text-lg font-black text-zinc-950">
                      {recorrencia.quadra?.nome || "Quadra"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {recorrencia.horario_inicio} - {recorrencia.horario_fim} · {recorrencia.status}
                    </p>
                    <button
                      type="button"
                      disabled={busyCancelId === recorrencia.id}
                      onClick={() => void handleCancelarRecorrencia(recorrencia.id)}
                      className="mt-3 inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {busyCancelId === recorrencia.id
                        ? "Cancelando..."
                        : "Cancelar recorrencia"}
                    </button>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="Nenhuma recorrencia encontrada"
                  text="Se o backend conseguir listar recorrencias dessa academia, elas aparecem aqui."
                />
              )}
            </div>
          </PanelCard>
        </section>
      ) : null}

      {selectedAcademiaId && canManageAcademia(perfilNaAcademia) ? (
        <PanelCard
          title="Agenda operacional da academia"
          subtitle="Visao resumida para perfis de gestao nessa data."
          icon={<ShieldCheck className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {agendaAcademia.length > 0 ? (
              agendaAcademia.map((evento) => (
                <article
                  key={`${evento.tipo}-${evento.id}`}
                  className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-4"
                >
                  <p className="font-black text-zinc-950">
                    {evento.tipo} · {evento.quadra}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatDateTime(evento.inicio_em)} · {formatPeriodo(evento.inicio_em, evento.fim_em)}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState
                title="Nenhum evento operacional"
                text="Para gestao completa de quadras, horarios e bloqueios use a central admin."
              />
            )}
          </div>
        </PanelCard>
      ) : null}
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

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition focus:border-green-600 focus:bg-white"
      />
    </label>
  )
}

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition focus:border-green-600 focus:bg-white"
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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
