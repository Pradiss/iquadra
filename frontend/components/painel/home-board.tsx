"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  LoaderCircle,
  ShieldCheck,
  Trophy,
  UserRoundPlus,
} from "lucide-react"
import { clearAuthStorage, getSession, getToken } from "../../lib/auth-storage"
import {
  getPreferredAcademiaContext,
  listManagedAcademiaContexts,
} from "../../lib/painel-context"
import {
  formatDateTime,
  formatLocation,
  formatPeriodo,
  getErrorMessage,
  getFirstName,
  getTodayDate,
  isUnauthorizedError,
  sortAcademiasByPreference,
} from "../../lib/painel-format"
import { getOutroUsuarioDaAmizade, isPendingIncoming } from "../../lib/social"
import { getPerfilLabel, getUserExperience } from "../../lib/perfis"
import { listarAmizades } from "../../services/amizade.service"
import { listarAulas, listarRecorrenciasAula } from "../../services/aula.service"
import { listarConvitesJogo } from "../../services/convite-jogo.service"
import {
  buscarAgendaAcademia,
  buscarDashboardAcademia,
} from "../../services/dashboard.service"
import { listarEmpresas } from "../../services/empresa.service"
import { listarMeusJogos } from "../../services/jogo.service"
import type { AulaAgenda, RecorrenciaAula } from "../../types/aula"
import type { AuthSessionSnapshot } from "../../types/auth"
import type { DashboardResumoAcademia, AgendaAcademiaResponse } from "../../types/dashboard"
import type { EmpresaMarketplace } from "../../types/empresa"
import type { JogoDetalhado } from "../../types/agenda"
import type { Amizade, ConviteJogo } from "../../types/social"
import { AcademiasExplorer } from "./academias-explorer"

export function PainelHomeBoard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")
  const [session, setSession] = useState<AuthSessionSnapshot | null>(null)
  const [academias, setAcademias] = useState<EmpresaMarketplace[]>([])
  const [meusJogos, setMeusJogos] = useState<JogoDetalhado[]>([])
  const [convites, setConvites] = useState<ConviteJogo[]>([])
  const [amizades, setAmizades] = useState<Amizade[]>([])
  const [minhasAulas, setMinhasAulas] = useState<AulaAgenda[]>([])
  const [recorrencias, setRecorrencias] = useState<RecorrenciaAula[]>([])
  const [dashboard, setDashboard] = useState<DashboardResumoAcademia | null>(null)
  const [agendaAcademia, setAgendaAcademia] = useState<AgendaAcademiaResponse | null>(null)

  useEffect(() => {
    async function loadPainel() {
      const token = getToken()
      const currentSession = getSession()

      if (!token || !currentSession) {
        clearAuthStorage()
        router.replace("/login")
        return
      }

      setSession(currentSession)
      setError("")
      setWarning("")

      try {
        const experience = getUserExperience(currentSession.perfilAtual)
        const [{ empresas }] = await Promise.all([listarEmpresas()])
        setAcademias(empresas)

        if (experience === "PLAYER") {
          const [jogosResponse, convitesResponse, amizadesResponse] =
            await Promise.all([
              listarMeusJogos(currentSession.usuario.id),
              listarConvitesJogo(),
              listarAmizades(),
            ])

          setMeusJogos(jogosResponse.jogos)
          setConvites(convitesResponse.convites)
          setAmizades(amizadesResponse.amizades)
          return
        }

        if (experience === "PROFESSOR") {
          const [jogosResponse, aulasResponse] = await Promise.all([
            listarMeusJogos(currentSession.usuario.id),
            listarAulas({ professorId: currentSession.usuario.id }),
          ])

          setMeusJogos(jogosResponse.jogos)
          setMinhasAulas(aulasResponse.aulas)

          try {
            const recorrenciasResponse = await listarRecorrenciasAula({
              professorId: currentSession.usuario.id,
            })
            setRecorrencias(recorrenciasResponse.recorrencias)
          } catch (recorrenciaError) {
            console.warn("Falha ao listar recorrencias", recorrenciaError)
            setWarning("As recorrencias nao puderam ser listadas agora.")
          }

          return
        }

        const managedContexts = listManagedAcademiaContexts(currentSession)
        const preferredContext =
          getPreferredAcademiaContext(currentSession) ?? managedContexts[0] ?? null

        if (!preferredContext) {
          return
        }

        const [dashboardResponse, agendaResponse] = await Promise.all([
          buscarDashboardAcademia(preferredContext.academia.id),
          buscarAgendaAcademia(preferredContext.academia.id, getTodayDate()),
        ])

        setDashboard(dashboardResponse)
        setAgendaAcademia(agendaResponse)
      } catch (requestError) {
        if (isUnauthorizedError(requestError)) {
          clearAuthStorage()
          router.replace("/login")
          return
        }

        setError(getErrorMessage(requestError, "Nao foi possivel carregar o painel agora."))
      } finally {
        setLoading(false)
      }
    }

    void loadPainel()
  }, [router])

  const experience = getUserExperience(session?.perfilAtual)
  const academiasOrdenadas = useMemo(
    () => sortAcademiasByPreference(academias, session?.usuario.cidade),
    [academias, session?.usuario.cidade]
  )
  const now = new Date()
  const meusJogosFuturos = meusJogos
    .filter((jogo) => new Date(jogo.fim_em) >= now)
    .slice(0, 4)
  const minhasAulasFuturas = minhasAulas
    .filter((aula) => new Date(aula.fim_em) >= now)
    .slice(0, 4)
  const convitesPendentes = convites.filter((convite) => convite.status === "PENDENTE")
  const pedidosRecebidos = amizades.filter(
    (amizade) =>
      session?.usuario.id &&
      isPendingIncoming(amizade, session.usuario.id)
  )
  const managedContexts = listManagedAcademiaContexts(session)
  const adminContext =
    getPreferredAcademiaContext(session) ?? managedContexts[0] ?? null

  if (loading) {
    return (
      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-bold text-zinc-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Carregando painel
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <section className="rounded-[34px] border border-black/5 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-green-700">
              {getPerfilLabel(session?.perfilAtual)}
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
              Ola, {getFirstName(session?.usuario.nome)}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
              {experience === "PLAYER"
                ? "Escolha uma academia, abra a quadra e monte seu jogo sem depender de academia ativa."
                : experience === "PROFESSOR"
                  ? "Acompanhe aulas, jogos e recorrencias a partir das academias onde voce atua."
                  : "Gerencie a operacao das suas academias com foco nas rotas que o backend ja oferece hoje."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <QuickCta
              href={
                experience === "COMPANY_ADMIN"
                  ? "/painel/admin"
                  : experience === "PROFESSOR"
                    ? "/painel/agenda"
                    : "/painel/buscar"
              }
              label={
                experience === "COMPANY_ADMIN"
                  ? "Abrir central"
                  : experience === "PROFESSOR"
                    ? "Abrir agenda"
                    : "Buscar academias"
              }
              primary
            />
            <QuickCta
              href={experience === "PLAYER" ? "/painel/meus-jogos" : "/painel/perfil"}
              label={experience === "PLAYER" ? "Meus jogos" : "Ver perfil"}
            />
          </div>
        </div>

        {(error || warning) && (
          <div
            className={[
              "mt-5 rounded-2xl px-4 py-3 text-sm font-semibold ring-1",
              error
                ? "bg-red-50 text-red-700 ring-red-200"
                : "bg-amber-50 text-amber-700 ring-amber-200",
            ].join(" ")}
          >
            {error || warning}
          </div>
        )}
      </section>

      {experience === "PLAYER" ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Academias" value={String(academias.length)} />
            <SummaryCard label="Proximos jogos" value={String(meusJogosFuturos.length)} />
            <SummaryCard
              label="Convites pendentes"
              value={String(convitesPendentes.length)}
            />
            <SummaryCard label="Pedidos de amizade" value={String(pedidosRecebidos.length)} />
          </section>

          <AcademiasExplorer
            academias={academiasOrdenadas}
            title="Academias para jogar agora"
            description="Entre direto na academia escolhida para selecionar quadra, horario livre e partida."
            limit={4}
            linkHref="/painel/buscar"
            linkLabel="Ver todas"
            showSearch={false}
            sectionId="home-player-academias"
          />

          <section className="grid gap-5 xl:grid-cols-2">
            <PanelCard
              title="Seus proximos jogos"
              subtitle="Partidas confirmadas nas proximas datas."
              icon={<Trophy className="h-5 w-5" />}
            >
              {meusJogosFuturos.length > 0 ? (
                <div className="space-y-3">
                  {meusJogosFuturos.map((jogo) => (
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
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nenhum jogo confirmado"
                  text="Abra uma academia pela busca para marcar sua proxima partida."
                />
              )}
            </PanelCard>

            <PanelCard
              title="Social"
              subtitle="Convites e pedidos recebidos para voce responder rapido."
              icon={<UserRoundPlus className="h-5 w-5" />}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                    Convites pendentes
                  </p>
                  <div className="mt-3 space-y-3">
                    {convitesPendentes.length > 0 ? (
                      convitesPendentes.slice(0, 3).map((convite) => (
                        <article
                          key={convite.id}
                          className="rounded-[20px] border border-zinc-200 bg-zinc-50 p-4"
                        >
                          <p className="font-black text-zinc-950">
                            {convite.enviadoPor.nome} te convidou
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {convite.jogo.quadra.nome} · {formatDateTime(convite.jogo.inicio_em)}
                          </p>
                        </article>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">Nenhum convite pendente.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                    Pedidos de amizade
                  </p>
                  <div className="mt-3 space-y-3">
                    {pedidosRecebidos.length > 0 ? (
                      pedidosRecebidos.slice(0, 3).map((amizade) => (
                        <article
                          key={amizade.id}
                          className="rounded-[20px] border border-zinc-200 bg-zinc-50 p-4"
                        >
                          <p className="font-black text-zinc-950">
                            {session?.usuario.id
                              ? getOutroUsuarioDaAmizade(amizade, session.usuario.id).nome
                              : amizade.usuario.nome}
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Pedido aguardando sua resposta no perfil.
                          </p>
                        </article>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">Nenhum pedido pendente.</p>
                    )}
                  </div>
                </div>
              </div>
            </PanelCard>
          </section>
        </>
      ) : null}

      {experience === "PROFESSOR" ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Academias ativas" value={String(session?.usuario.academias.length ?? 0)} />
            <SummaryCard label="Aulas futuras" value={String(minhasAulasFuturas.length)} />
            <SummaryCard label="Recorrencias" value={String(recorrencias.length)} />
            <SummaryCard label="Jogos confirmados" value={String(meusJogosFuturos.length)} />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <PanelCard
              title="Proximos compromissos"
              subtitle="Aulas e jogos em ordem cronologica."
              icon={<CalendarDays className="h-5 w-5" />}
            >
              <div className="space-y-3">
                {[...minhasAulasFuturas, ...meusJogosFuturos]
                  .sort(
                    (primeiro, segundo) =>
                      new Date(primeiro.inicio_em).getTime() -
                      new Date(segundo.inicio_em).getTime()
                  )
                  .slice(0, 5)
                  .map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <p className="font-black text-zinc-950">
                        {"recorrente" in item ? "Aula" : "Jogo"} · {item.quadra.nome}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {"academia" in item && item.academia?.nome
                          ? `${item.academia.nome} · `
                          : ""}
                        {formatDateTime(item.inicio_em)}
                      </p>
                    </article>
                  ))}
                {minhasAulasFuturas.length === 0 && meusJogosFuturos.length === 0 ? (
                  <EmptyState
                    title="Agenda livre"
                    text="Quando surgirem aulas ou jogos futuros, eles aparecem aqui."
                  />
                ) : null}
              </div>
            </PanelCard>

            <PanelCard
              title="Recorrencias e atalhos"
              subtitle="Acesse sua agenda para criar aulas avulsas ou recorrentes."
              icon={<Clock3 className="h-5 w-5" />}
            >
              <div className="space-y-4">
                {recorrencias.length > 0 ? (
                  recorrencias.slice(0, 4).map((recorrencia) => (
                    <article
                      key={recorrencia.id}
                      className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <p className="font-black text-zinc-950">
                        {recorrencia.quadra?.nome || "Quadra"} · {recorrencia.horario_inicio} -{" "}
                        {recorrencia.horario_fim}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        Inicio em {formatDateTime(`${recorrencia.data_inicio}T00:00:00`)}
                      </p>
                    </article>
                  ))
                ) : (
                  <EmptyState
                    title="Nenhuma recorrencia ativa"
                    text="Crie sua grade recorrente na agenda sempre que precisar."
                  />
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <QuickLink
                    href="/painel/agenda"
                    icon={<CalendarDays className="h-5 w-5" />}
                    title="Abrir agenda"
                    subtitle="Criar aula avulsa ou recorrente"
                  />
                  <QuickLink
                    href="/painel/buscar"
                    icon={<Building2 className="h-5 w-5" />}
                    title="Ver academias"
                    subtitle="Abrir quadras disponiveis"
                  />
                </div>
              </div>
            </PanelCard>
          </section>
        </>
      ) : null}

      {experience === "COMPANY_ADMIN" ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Quadras" value={String(dashboard?.total_quadras ?? 0)} />
            <SummaryCard label="Jogos hoje" value={String(dashboard?.jogos_hoje ?? 0)} />
            <SummaryCard label="Aulas hoje" value={String(dashboard?.aulas_hoje ?? 0)} />
            <SummaryCard
              label="Bloqueios ativos"
              value={String(dashboard?.bloqueios_ativos ?? 0)}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <PanelCard
              title="Academias gerenciadas"
              subtitle="Selecione a que quiser operar, sem precisar vincular nada no fluxo."
              icon={<ShieldCheck className="h-5 w-5" />}
            >
              <div className="space-y-3">
                {managedContexts.map((context) => (
                  <article
                    key={context.vinculoId ?? context.academia.id}
                    className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <p className="font-black text-zinc-950">{context.academia.nome}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {context.academia.cidade || "Cidade nao informada"} ·{" "}
                      {getPerfilLabel(context.perfil)}
                    </p>
                  </article>
                ))}
              </div>
            </PanelCard>

            <PanelCard
              title="Hoje na operacao"
              subtitle={
                adminContext
                  ? `${adminContext.academia.nome} · ${formatLocation(adminContext.academia)}`
                  : "Sem academia de gestao selecionada"
              }
              icon={<CalendarDays className="h-5 w-5" />}
            >
              <div className="space-y-3">
                {agendaAcademia?.eventos.length ? (
                  agendaAcademia.eventos.slice(0, 4).map((evento) => (
                    <article
                      key={`${evento.tipo}-${evento.id}`}
                      className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4"
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
                    title="Nenhum evento hoje"
                    text="A central admin mostra a agenda operacional completa."
                  />
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <QuickLink
                    href="/painel/admin"
                    icon={<ShieldCheck className="h-5 w-5" />}
                    title="Abrir central"
                    subtitle="Gerenciar quadras, horarios e bloqueios"
                  />
                  <QuickLink
                    href="/painel/agenda"
                    icon={<CalendarDays className="h-5 w-5" />}
                    title="Abrir agenda"
                    subtitle="Ver compromissos por data"
                  />
                </div>
              </div>
            </PanelCard>
          </section>
        </>
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

function QuickCta({
  href,
  label,
  primary = false,
}: {
  href: string
  label: string
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-black transition",
        primary
          ? "bg-green-700 text-white shadow-sm hover:bg-green-800"
          : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
      ].join(" ")}
    >
      {label}
    </Link>
  )
}

function QuickLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string
  icon: ReactNode
  title: string
  subtitle: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3 transition hover:bg-zinc-100"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-green-700">
        {icon}
      </div>
      <div>
        <p className="font-black text-zinc-950">{title}</p>
        <p className="text-sm text-zinc-500">{subtitle}</p>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 text-zinc-400" />
    </Link>
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
