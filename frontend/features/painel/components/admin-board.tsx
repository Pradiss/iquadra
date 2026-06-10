"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  CalendarDays,
  Clock3,
  Edit3,
  LayoutGrid,
  LoaderCircle,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import { clearAuthStorage, getSession, getToken } from "@/shared/lib/auth-storage"
import {
  canManageAcademia,
  getPerfilParaAcademia,
  listManagedAcademiaContexts,
} from "@/shared/lib/painel-context"
import {
  buildIsoDateTime,
  formatDateTime,
  formatPeriodo,
  formatTipoPiso,
  getErrorMessage,
  getTodayDate,
  isUnauthorizedError,
} from "@/shared/lib/painel-format"
import {
  cancelarAula,
  cancelarRecorrenciaAula,
  criarAula,
  criarRecorrenciaAula,
  listarAulas,
  listarRecorrenciasAula,
} from "@/shared/services/aula.service"
import {
  criarBloqueioQuadra,
  listarBloqueiosQuadra,
  removerBloqueioQuadra,
} from "@/shared/services/bloqueio.service"
import {
  buscarAgendaAcademia,
  buscarDashboardAcademia,
} from "@/shared/services/dashboard.service"
import { buscarEmpresaDetalhes } from "@/shared/services/empresa.service"
import {
  atualizarHorarioQuadra,
  atualizarQuadra,
  atualizarStatusQuadra,
  criarHorarioQuadra,
  criarQuadra,
  listarHorariosQuadra,
  listarQuadrasAcademia,
  removerHorarioQuadra,
} from "@/shared/services/quadra.service"
import type { AulaAgenda, RecorrenciaAula } from "@/shared/types/aula"
import type { AuthSessionSnapshot } from "@/shared/types/auth"
import type { BloqueioQuadra, TipoBloqueioQuadra } from "@/shared/types/bloqueio"
import type { DashboardResumoAcademia, AgendaEventoAcademia } from "@/shared/types/dashboard"
import type { EmpresaDetalhe } from "@/shared/types/empresa"
import type {
  HorarioQuadraDetalhe,
  QuadraResumo,
  TipoPisoQuadra,
} from "@/shared/types/quadra"

const TIPO_PISO_OPTIONS: TipoPisoQuadra[] = [
  "SAIBRO",
  "HARD",
  "GRAMA",
  "SINTETICA",
  "AREIA",
  "OUTRO",
]

const TIPO_BLOQUEIO_OPTIONS: TipoBloqueioQuadra[] = [
  "MANUTENCAO",
  "EVENTO",
  "FERIADO",
  "PARTICULAR",
  "OUTRO",
]

const DIA_SEMANA_OPTIONS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terca" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sabado" },
] as const

const INITIAL_QUADRA_FORM = {
  id: "",
  nome: "",
  descricao: "",
  tipo_piso: "HARD" as TipoPisoQuadra,
  coberta: false,
  ordem_exibicao: "0",
}

const INITIAL_HORARIO_FORM = {
  id: "",
  quadraId: "",
  dia_semana: "1",
  abre_as: "06:00",
  fecha_as: "22:00",
  duracao_slot_minutos: "60",
  ativo: true,
}

const INITIAL_ACADEMIA_HORARIO_FORM = {
  diasSemana: [1, 2, 3, 4, 5] as number[],
  abre_as: "06:00",
  fecha_as: "22:00",
  duracao_slot_minutos: "60",
  ativo: true,
}

const INITIAL_BLOQUEIO_FORM = {
  quadraId: "",
  inicioEm: "",
  fimEm: "",
  tipo_bloqueio: "OUTRO" as TipoBloqueioQuadra,
  motivo: "",
}

const INITIAL_AULA_FORM = {
  quadraId: "",
  inicio: "08:00",
  fim: "09:00",
  observacoes: "",
}

const INITIAL_RECORRENCIA_FORM = {
  quadraId: "",
  dataInicio: getTodayDate(),
  dataFim: "",
  diasSemana: [1] as number[],
  horarioInicio: "08:00",
  horarioFim: "09:00",
  observacoes: "",
}

function buildHorarioPayload(
  form: {
    abre_as: string
    fecha_as: string
    duracao_slot_minutos: string
    ativo: boolean
  },
  diaSemana: number
) {
  return {
    dia_semana: diaSemana,
    abre_as: form.abre_as,
    fecha_as: form.fecha_as,
    duracao_slot_minutos: Number(form.duracao_slot_minutos || "60"),
    ativo: form.ativo,
  }
}

function getHorarioPadraoAcademia(
  quadras: QuadraResumo[],
  horariosPorQuadra: Record<string, HorarioQuadraDetalhe[]>
) {
  const quadraBase = quadras
    .map((quadra) =>
      [...(horariosPorQuadra[quadra.id] ?? [])].sort(
        (primeiro, segundo) => primeiro.dia_semana - segundo.dia_semana
      )
    )
    .filter((horarios) => horarios.length > 0)
    .sort((primeiro, segundo) => segundo.length - primeiro.length)[0]

  return quadraBase ?? []
}

export function PainelAdminBoard() {
  const router = useRouter()
  const [session] = useState<AuthSessionSnapshot | null>(() => getSession())
  const managedContexts = listManagedAcademiaContexts(session)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [savingQuadra, setSavingQuadra] = useState(false)
  const [savingAcademiaHorario, setSavingAcademiaHorario] = useState(false)
  const [savingHorario, setSavingHorario] = useState(false)
  const [savingBloqueio, setSavingBloqueio] = useState(false)
  const [savingAula, setSavingAula] = useState(false)
  const [savingRecorrencia, setSavingRecorrencia] = useState(false)
  const [busyActionId, setBusyActionId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [warning, setWarning] = useState("")
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [selectedAcademiaId, setSelectedAcademiaId] = useState(
    managedContexts[0]?.academia.id ?? ""
  )
  const [selectedQuadraId, setSelectedQuadraId] = useState("")
  const [empresa, setEmpresa] = useState<EmpresaDetalhe | null>(null)
  const [dashboard, setDashboard] = useState<DashboardResumoAcademia | null>(null)
  const [agenda, setAgenda] = useState<AgendaEventoAcademia[]>([])
  const [quadras, setQuadras] = useState<QuadraResumo[]>([])
  const [horariosPorQuadra, setHorariosPorQuadra] = useState<
    Record<string, HorarioQuadraDetalhe[]>
  >({})
  const [bloqueiosPorQuadra, setBloqueiosPorQuadra] = useState<
    Record<string, BloqueioQuadra[]>
  >({})
  const [aulas, setAulas] = useState<AulaAgenda[]>([])
  const [recorrencias, setRecorrencias] = useState<RecorrenciaAula[]>([])
  const [quadraForm, setQuadraForm] = useState(INITIAL_QUADRA_FORM)
  const [academiaHorarioForm, setAcademiaHorarioForm] = useState(
    INITIAL_ACADEMIA_HORARIO_FORM
  )
  const [horarioForm, setHorarioForm] = useState(INITIAL_HORARIO_FORM)
  const [bloqueioForm, setBloqueioForm] = useState(INITIAL_BLOQUEIO_FORM)
  const [aulaForm, setAulaForm] = useState(INITIAL_AULA_FORM)
  const [recorrenciaForm, setRecorrenciaForm] = useState(INITIAL_RECORRENCIA_FORM)

  useEffect(() => {
    const token = getToken()

    if (!token || !session) {
      clearAuthStorage()
      router.replace("/login")
      return
    }

    if (managedContexts.length === 0) {
      router.replace("/painel")
    }
  }, [managedContexts.length, router, session])

  useEffect(() => {
    async function loadData() {
      if (!session || !selectedAcademiaId) {
        return
      }

      setError("")
      setNotice("")
      setWarning("")

      try {
        const [empresaResponse, dashboardResponse, agendaResponse, quadrasResponse, aulasResponse] =
          await Promise.all([
            buscarEmpresaDetalhes(selectedAcademiaId),
            buscarDashboardAcademia(selectedAcademiaId),
            buscarAgendaAcademia(selectedAcademiaId, selectedDate),
            listarQuadrasAcademia(selectedAcademiaId),
            listarAulas({ academiaId: selectedAcademiaId, data: selectedDate }),
          ])

        setEmpresa(empresaResponse.empresa)
        setDashboard(dashboardResponse)
        setAgenda(agendaResponse.eventos)
        setQuadras(quadrasResponse.quadras)
        setAulas(aulasResponse.aulas)
        const defaultQuadraId = quadrasResponse.quadras[0]?.id ?? ""

        setSelectedQuadraId((current) =>
          quadrasResponse.quadras.some((quadra) => quadra.id === current)
            ? current
            : defaultQuadraId
        )
        setHorarioForm((current) => ({
          ...current,
          quadraId:
            current.quadraId &&
            quadrasResponse.quadras.some((quadra) => quadra.id === current.quadraId)
              ? current.quadraId
              : defaultQuadraId,
        }))
        setBloqueioForm((current) => ({
          ...current,
          quadraId:
            current.quadraId &&
            quadrasResponse.quadras.some((quadra) => quadra.id === current.quadraId)
              ? current.quadraId
              : defaultQuadraId,
        }))
        setAulaForm((current) => ({
          ...current,
          quadraId:
            current.quadraId &&
            quadrasResponse.quadras.some((quadra) => quadra.id === current.quadraId)
              ? current.quadraId
              : defaultQuadraId,
        }))
        setRecorrenciaForm((current) => ({
          ...current,
          quadraId:
            current.quadraId &&
            quadrasResponse.quadras.some((quadra) => quadra.id === current.quadraId)
              ? current.quadraId
              : defaultQuadraId,
        }))

        try {
          const recorrenciasResponse = await listarRecorrenciasAula({
            academiaId: selectedAcademiaId,
          })
          setRecorrencias(recorrenciasResponse.recorrencias)
        } catch (recorrenciaError) {
          console.warn("Falha ao listar recorrencias no admin", recorrenciaError)
          setRecorrencias([])
          setWarning("As recorrencias nao puderam ser listadas agora.")
        }

        const [horarioEntries, bloqueioEntries] = await Promise.all([
          Promise.all(
            quadrasResponse.quadras.map(async (quadra) => [
              quadra.id,
              (await listarHorariosQuadra(quadra.id)).horarios,
            ] as const)
          ),
          Promise.all(
            quadrasResponse.quadras.map(async (quadra) => [
              quadra.id,
              (await listarBloqueiosQuadra(quadra.id)).bloqueios,
            ] as const)
          ),
        ])

        setHorariosPorQuadra(Object.fromEntries(horarioEntries))
        setBloqueiosPorQuadra(Object.fromEntries(bloqueioEntries))
      } catch (requestError) {
        if (isUnauthorizedError(requestError)) {
          clearAuthStorage()
          router.replace("/login")
          return
        }

        setError(
          getErrorMessage(requestError, "Nao foi possivel carregar a central da academia.")
        )
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [refreshKey, router, selectedAcademiaId, selectedDate, session])

  const perfilNaAcademia = getPerfilParaAcademia(session, selectedAcademiaId)

  if (loading) {
    return (
      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-bold text-zinc-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Carregando central da academia
        </div>
      </div>
    )
  }

  if (!canManageAcademia(perfilNaAcademia)) {
    return (
      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <p className="text-lg font-black text-zinc-950">Acesso restrito</p>
        <p className="mt-2 text-sm text-zinc-500">
          Essa area e exclusiva para dono, admin da academia ou operacao.
        </p>
      </div>
    )
  }

  async function handleSalvarQuadra(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedAcademiaId) {
      return
    }

    setSavingQuadra(true)
    setError("")
    setNotice("")
    setWarning("")

    try {
      const payload = {
        nome: quadraForm.nome.trim(),
        descricao: quadraForm.descricao.trim() || undefined,
        tipo_piso: quadraForm.tipo_piso,
        coberta: quadraForm.coberta,
        ordem_exibicao: Number(quadraForm.ordem_exibicao || "0"),
      }

      if (quadraForm.id) {
        await atualizarQuadra(quadraForm.id, payload)
        setNotice("Quadra atualizada com sucesso.")
      } else {
        const quadraCriada = await criarQuadra(selectedAcademiaId, payload)
        const horariosPadrao = getHorarioPadraoAcademia(quadras, horariosPorQuadra)

        if (quadraCriada?.id && horariosPadrao.length > 0) {
          try {
            await Promise.all(
              horariosPadrao.map((horario) =>
                criarHorarioQuadra(quadraCriada.id, {
                  dia_semana: horario.dia_semana,
                  abre_as: horario.abre_as,
                  fecha_as: horario.fecha_as,
                  duracao_slot_minutos: horario.duracao_slot_minutos,
                  ativo: horario.ativo,
                })
              )
            )

            setNotice("Quadra criada e ja entrou no horario padrao da academia.")
          } catch (copyError) {
            console.warn("Falha ao copiar horario padrao da academia", copyError)
            setWarning("Quadra criada, mas nao foi possivel copiar o horario padrao agora.")
          }
        } else {
          setNotice("Quadra criada com sucesso.")
        }
      }

      setQuadraForm(INITIAL_QUADRA_FORM)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel salvar a quadra agora."))
    } finally {
      setSavingQuadra(false)
    }
  }

  async function handleToggleStatusQuadra(quadra: QuadraResumo) {
    setBusyActionId(quadra.id)
    setError("")
    setNotice("")

    try {
      await atualizarStatusQuadra(quadra.id, !quadra.ativa)
      setNotice(`Quadra ${quadra.ativa ? "desativada" : "ativada"} com sucesso.`)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel alterar o status agora."))
    } finally {
      setBusyActionId(null)
    }
  }

  async function handleSalvarHorario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!horarioForm.quadraId) {
      return
    }

    setSavingHorario(true)
    setError("")
    setNotice("")
    setWarning("")

    try {
      const payload = buildHorarioPayload(horarioForm, Number(horarioForm.dia_semana))

      if (horarioForm.id) {
        await atualizarHorarioQuadra(horarioForm.id, payload)
        setNotice("Horario atualizado com sucesso.")
      } else {
        await criarHorarioQuadra(horarioForm.quadraId, payload)
        setNotice("Horario criado com sucesso.")
      }

      setHorarioForm((current) => ({
        ...INITIAL_HORARIO_FORM,
        quadraId: current.quadraId,
      }))
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel salvar o horario agora."))
    } finally {
      setSavingHorario(false)
    }
  }

  async function handleAplicarHorarioAcademia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (quadras.length === 0) {
      setError("Cadastre ao menos uma quadra antes de aplicar o horario padrao.")
      setNotice("")
      setWarning("")
      return
    }

    if (academiaHorarioForm.diasSemana.length === 0) {
      setError("Escolha pelo menos um dia da semana para montar os slots.")
      setNotice("")
      setWarning("")
      return
    }

    setSavingAcademiaHorario(true)
    setError("")
    setNotice("")
    setWarning("")

    try {
      const diasOrdenados = [...academiaHorarioForm.diasSemana].sort((a, b) => a - b)
      const operacoes = quadras.flatMap((quadra) => {
        const horariosDaQuadraAtual = horariosPorQuadra[quadra.id] ?? []

        return diasOrdenados.map((diaSemana) => {
          const payload = buildHorarioPayload(academiaHorarioForm, diaSemana)
          const horarioExistente = horariosDaQuadraAtual.find(
            (horario) => horario.dia_semana === diaSemana
          )

          return horarioExistente
            ? atualizarHorarioQuadra(horarioExistente.id, payload)
            : criarHorarioQuadra(quadra.id, payload)
        })
      })

      await Promise.all(operacoes)

      setNotice(
        `Horario padrao aplicado em ${quadras.length} ${
          quadras.length === 1 ? "quadra" : "quadras"
        }. Os slots dessa academia agora seguem a mesma grade.`
      )
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Nao foi possivel aplicar o horario padrao agora.")
      )
    } finally {
      setSavingAcademiaHorario(false)
    }
  }

  async function handleRemoverHorario(horarioId: string) {
    setBusyActionId(horarioId)
    setError("")
    setNotice("")

    try {
      await removerHorarioQuadra(horarioId)
      setNotice("Horario removido com sucesso.")
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel remover o horario agora."))
    } finally {
      setBusyActionId(null)
    }
  }

  async function handleSalvarBloqueio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!bloqueioForm.quadraId) {
      return
    }

    setSavingBloqueio(true)
    setError("")
    setNotice("")

    try {
      await criarBloqueioQuadra(bloqueioForm.quadraId, {
        inicio_em: new Date(bloqueioForm.inicioEm).toISOString(),
        fim_em: new Date(bloqueioForm.fimEm).toISOString(),
        tipo_bloqueio: bloqueioForm.tipo_bloqueio,
        motivo: bloqueioForm.motivo.trim(),
      })

      setNotice("Bloqueio criado com sucesso.")
      setBloqueioForm((current) => ({
        ...INITIAL_BLOQUEIO_FORM,
        quadraId: current.quadraId,
      }))
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel criar o bloqueio agora."))
    } finally {
      setSavingBloqueio(false)
    }
  }

  async function handleRemoverBloqueio(bloqueioId: string) {
    setBusyActionId(bloqueioId)
    setError("")
    setNotice("")

    try {
      await removerBloqueioQuadra(bloqueioId)
      setNotice("Bloqueio removido com sucesso.")
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel remover o bloqueio agora."))
    } finally {
      setBusyActionId(null)
    }
  }

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
        professor_id: session.usuario.temPerfilProfessor ? session.usuario.id : undefined,
        inicio_em: buildIsoDateTime(selectedDate, aulaForm.inicio),
        fim_em: buildIsoDateTime(selectedDate, aulaForm.fim),
        observacoes: aulaForm.observacoes.trim() || undefined,
      })

      setNotice("Aula criada com sucesso.")
      setAulaForm((current) => ({ ...current, observacoes: "" }))
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel criar a aula agora."))
    } finally {
      setSavingAula(false)
    }
  }

  async function handleCancelarAula(aulaId: string) {
    setBusyActionId(aulaId)
    setError("")
    setNotice("")

    try {
      await cancelarAula(aulaId)
      setNotice("Aula cancelada com sucesso.")
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel cancelar a aula agora."))
    } finally {
      setBusyActionId(null)
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
        professor_id: session.usuario.temPerfilProfessor ? session.usuario.id : undefined,
        dias_semana: recorrenciaForm.diasSemana,
        data_inicio: recorrenciaForm.dataInicio,
        data_fim: recorrenciaForm.dataFim || undefined,
        horario_inicio: recorrenciaForm.horarioInicio,
        horario_fim: recorrenciaForm.horarioFim,
        observacoes: recorrenciaForm.observacoes.trim() || undefined,
      })

      setNotice("Recorrencia criada com sucesso.")
      setRecorrenciaForm((current) => ({ ...current, observacoes: "" }))
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel criar a recorrencia agora."))
    } finally {
      setSavingRecorrencia(false)
    }
  }

  async function handleCancelarRecorrencia(recorrenciaId: string) {
    setBusyActionId(recorrenciaId)
    setError("")
    setNotice("")

    try {
      await cancelarRecorrenciaAula(recorrenciaId)
      setNotice("Recorrencia cancelada com sucesso.")
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel cancelar a recorrencia agora."))
    } finally {
      setBusyActionId(null)
    }
  }

  const horariosPadraoAcademia = getHorarioPadraoAcademia(quadras, horariosPorQuadra)
  const horariosDaQuadra = horariosPorQuadra[selectedQuadraId] ?? []
  const bloqueiosDaQuadra = bloqueiosPorQuadra[selectedQuadraId] ?? []
  const quadrasComGrade = quadras.filter(
    (quadra) => (horariosPorQuadra[quadra.id] ?? []).length > 0
  ).length

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <section className="rounded-[34px] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-green-700">
              Central da academia
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
              {empresa?.nome || "Sua academia"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Gerencie quadras, horarios, bloqueios e agenda usando apenas o que a API atual ja entrega.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
              <span className="mr-3 text-zinc-500">Academia</span>
              <select
                value={selectedAcademiaId}
                onChange={(event) => setSelectedAcademiaId(event.target.value)}
                className="bg-transparent outline-none"
              >
                {managedContexts.map((context) => (
                  <option key={context.vinculoId ?? context.academia.id} value={context.academia.id}>
                    {context.academia.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
              <span className="mr-3 text-zinc-500">Data</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="bg-transparent outline-none"
              />
            </label>

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
            {error || warning || notice}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Quadras" value={String(dashboard?.total_quadras ?? 0)} />
        <SummaryCard label="Jogos hoje" value={String(dashboard?.jogos_hoje ?? 0)} />
        <SummaryCard label="Aulas hoje" value={String(dashboard?.aulas_hoje ?? 0)} />
        <SummaryCard label="Bloqueios ativos" value={String(dashboard?.bloqueios_ativos ?? 0)} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <PanelCard
          title={quadraForm.id ? "Editar quadra" : "Cadastrar quadra"}
          subtitle="Controle piso, descricao, ordem e cobertura."
          icon={<LayoutGrid className="h-5 w-5" />}
        >
          <form onSubmit={handleSalvarQuadra} className="grid gap-3 md:grid-cols-2">
            <FormField
              label="Nome da quadra"
              value={quadraForm.nome}
              onChange={(value) => setQuadraForm((current) => ({ ...current, nome: value }))}
              placeholder="Quadra 1"
            />
            <FormSelect
              label="Tipo de piso"
              value={quadraForm.tipo_piso}
              onChange={(value) =>
                setQuadraForm((current) => ({
                  ...current,
                  tipo_piso: value as TipoPisoQuadra,
                }))
              }
              options={TIPO_PISO_OPTIONS.map((tipo) => ({
                value: tipo,
                label: formatTipoPiso(tipo),
              }))}
            />
            <FormField
              label="Descricao"
              value={quadraForm.descricao}
              onChange={(value) =>
                setQuadraForm((current) => ({ ...current, descricao: value }))
              }
              placeholder="Ex.: quadra central coberta"
            />
            <FormField
              label="Ordem de exibicao"
              type="number"
              value={quadraForm.ordem_exibicao}
              onChange={(value) =>
                setQuadraForm((current) => ({ ...current, ordem_exibicao: value }))
              }
            />
            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 md:col-span-2">
              <input
                type="checkbox"
                checked={quadraForm.coberta}
                onChange={(event) =>
                  setQuadraForm((current) => ({
                    ...current,
                    coberta: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-green-700"
              />
              <span className="text-sm font-semibold text-zinc-700">
                Marcar como quadra coberta
              </span>
            </label>
            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={savingQuadra || quadraForm.nome.trim().length < 2}
                className="h-[50px] flex-1 rounded-xl bg-green-700 px-5 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-60"
              >
                {savingQuadra
                  ? "Salvando..."
                  : quadraForm.id
                    ? "Atualizar quadra"
                    : "Cadastrar quadra"}
              </button>
              {quadraForm.id ? (
                <button
                  type="button"
                  onClick={() => setQuadraForm(INITIAL_QUADRA_FORM)}
                  className="h-[50px] rounded-xl border border-zinc-200 px-5 text-sm font-bold text-zinc-700"
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </PanelCard>

        <PanelCard
          title="Agenda do dia"
          subtitle="Resumo operacional da data selecionada."
          icon={<CalendarDays className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {agenda.length > 0 ? (
              agenda.map((evento) => (
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
                title="Nenhum evento operacional"
                text="Se houver jogos, aulas ou bloqueios no dia, eles aparecem aqui."
              />
            )}
          </div>
        </PanelCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <PanelCard
          title="Quadras cadastradas"
          subtitle="Edite dados basicos e ative ou desative quando precisar."
          icon={<Building2 className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {quadras.length > 0 ? (
              quadras.map((quadra) => (
                <article
                  key={quadra.id}
                  className={[
                    "rounded-[22px] border p-4",
                    quadra.id === selectedQuadraId
                      ? "border-green-300 bg-green-50"
                      : "border-zinc-200 bg-zinc-50",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedQuadraId(quadra.id)}
                      className="text-left"
                    >
                      <p className="text-lg font-black text-zinc-950">{quadra.nome}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {formatTipoPiso(quadra.tipo_piso)} · {quadra.coberta ? "Coberta" : "Descoberta"}
                      </p>
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setQuadraForm({
                            id: quadra.id,
                            nome: quadra.nome,
                            descricao: quadra.descricao ?? "",
                            tipo_piso: quadra.tipo_piso,
                            coberta: quadra.coberta,
                            ordem_exibicao: String(quadra.ordem_exibicao),
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-black text-zinc-700"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={busyActionId === quadra.id}
                        onClick={() => void handleToggleStatusQuadra(quadra)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
                      >
                        {quadra.ativa ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Nenhuma quadra cadastrada"
                text="Crie a primeira quadra para liberar horarios e disponibilidade."
              />
            )}
          </div>
        </PanelCard>

        <PanelCard
          title="Horarios e slots"
          subtitle="Defina um padrao da academia e ajuste excecoes por quadra quando precisar."
          icon={<Clock3 className="h-5 w-5" />}
        >
          <div className="rounded-[24px] border border-green-200 bg-green-50/70 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-lg font-black text-zinc-950">
                  Horario padrao da academia
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-zinc-600">
                  Salve uma vez e replique a mesma grade semanal em todas as quadras atuais.
                  Depois disso, as novas quadras tambem passam a herdar esse padrao.
                </p>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-700 ring-1 ring-green-200">
                {quadrasComGrade}/{quadras.length || 0} quadras com grade pronta
              </div>
            </div>

            <form onSubmit={handleAplicarHorarioAcademia} className="mt-4 space-y-4">
              <div>
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Dias da semana
                </span>
                <div className="flex flex-wrap gap-2">
                  {DIA_SEMANA_OPTIONS.map((dia) => {
                    const selected = academiaHorarioForm.diasSemana.includes(dia.value)

                    return (
                      <button
                        key={dia.value}
                        type="button"
                        onClick={() =>
                          setAcademiaHorarioForm((current) => ({
                            ...current,
                            diasSemana: selected
                              ? current.diasSemana.filter((item) => item !== dia.value)
                              : [...current.diasSemana, dia.value].sort((a, b) => a - b),
                          }))
                        }
                        className={[
                          "rounded-2xl px-3 py-2 text-xs font-black transition",
                          selected
                            ? "bg-green-700 text-white"
                            : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50",
                        ].join(" ")}
                      >
                        {dia.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  label="Abre as"
                  type="time"
                  value={academiaHorarioForm.abre_as}
                  onChange={(value) =>
                    setAcademiaHorarioForm((current) => ({ ...current, abre_as: value }))
                  }
                />
                <FormField
                  label="Fecha as"
                  type="time"
                  value={academiaHorarioForm.fecha_as}
                  onChange={(value) =>
                    setAcademiaHorarioForm((current) => ({ ...current, fecha_as: value }))
                  }
                />
                <FormField
                  label="Duracao do slot"
                  type="number"
                  value={academiaHorarioForm.duracao_slot_minutos}
                  onChange={(value) =>
                    setAcademiaHorarioForm((current) => ({
                      ...current,
                      duracao_slot_minutos: value,
                    }))
                  }
                />
                <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-4">
                  <input
                    type="checkbox"
                    checked={academiaHorarioForm.ativo}
                    onChange={(event) =>
                      setAcademiaHorarioForm((current) => ({
                        ...current,
                        ativo: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-green-700"
                  />
                  <span className="text-sm font-semibold text-zinc-700">
                    Horario ativo em todas as quadras
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={
                  savingAcademiaHorario ||
                  quadras.length === 0 ||
                  academiaHorarioForm.diasSemana.length === 0
                }
                className="h-[50px] w-full rounded-xl bg-green-700 px-5 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-60"
              >
                {savingAcademiaHorario
                  ? "Aplicando horario padrao..."
                  : "Aplicar horario padrao em todas as quadras"}
              </button>
            </form>

            <div className="mt-4 space-y-3">
              {horariosPadraoAcademia.length > 0 ? (
                horariosPadraoAcademia.map((horario) => (
                  <article
                    key={`padrao-${horario.id}`}
                    className="rounded-[20px] bg-white px-4 py-3 ring-1 ring-green-200"
                  >
                    <p className="font-black text-zinc-950">
                      {DIA_SEMANA_OPTIONS.find((dia) => dia.value === horario.dia_semana)?.label}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {horario.abre_as} - {horario.fecha_as} - {horario.duracao_slot_minutos} min
                    </p>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="Horario padrao ainda nao definido"
                  text="Assim que voce salvar a grade acima, os slots ficam prontos para todas as quadras dessa academia."
                />
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-zinc-100 pt-5">
            <div className="mb-4">
              <h3 className="text-lg font-black text-zinc-950">Horario especifico da quadra</h3>
              <p className="text-sm text-zinc-500">
                Use esta parte so quando uma quadra precisar fugir do padrao geral.
              </p>
            </div>

            <form onSubmit={handleSalvarHorario} className="grid gap-3 md:grid-cols-2">
            <FormSelect
              label="Quadra"
              value={horarioForm.quadraId}
              onChange={(value) =>
                setHorarioForm((current) => ({ ...current, quadraId: value }))
              }
              options={quadras.map((quadra) => ({ value: quadra.id, label: quadra.nome }))}
            />
            <FormSelect
              label="Dia da semana"
              value={horarioForm.dia_semana}
              onChange={(value) =>
                setHorarioForm((current) => ({ ...current, dia_semana: value }))
              }
              options={DIA_SEMANA_OPTIONS.map((dia) => ({
                value: String(dia.value),
                label: dia.label,
              }))}
            />
            <FormField
              label="Abre as"
              type="time"
              value={horarioForm.abre_as}
              onChange={(value) =>
                setHorarioForm((current) => ({ ...current, abre_as: value }))
              }
            />
            <FormField
              label="Fecha as"
              type="time"
              value={horarioForm.fecha_as}
              onChange={(value) =>
                setHorarioForm((current) => ({ ...current, fecha_as: value }))
              }
            />
            <FormField
              label="Duracao do slot"
              type="number"
              value={horarioForm.duracao_slot_minutos}
              onChange={(value) =>
                setHorarioForm((current) => ({
                  ...current,
                  duracao_slot_minutos: value,
                }))
              }
            />
            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
              <input
                type="checkbox"
                checked={horarioForm.ativo}
                onChange={(event) =>
                  setHorarioForm((current) => ({ ...current, ativo: event.target.checked }))
                }
                className="h-4 w-4 accent-green-700"
              />
              <span className="text-sm font-semibold text-zinc-700">Horario ativo</span>
            </label>
            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={savingHorario || !horarioForm.quadraId}
                className="h-[50px] flex-1 rounded-xl bg-zinc-950 px-5 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-60"
              >
                {savingHorario
                  ? "Salvando..."
                  : horarioForm.id
                    ? "Atualizar horario"
                    : "Cadastrar horario"}
              </button>
              {horarioForm.id ? (
                <button
                  type="button"
                  onClick={() =>
                    setHorarioForm((current) => ({
                      ...INITIAL_HORARIO_FORM,
                      quadraId: current.quadraId,
                    }))
                  }
                  className="h-[50px] rounded-xl border border-zinc-200 px-5 text-sm font-bold text-zinc-700"
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>

          <div className="mt-5 space-y-3">
            {horariosDaQuadra.length > 0 ? (
              horariosDaQuadra.map((horario) => (
                <article
                  key={horario.id}
                  className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-zinc-950">
                        {DIA_SEMANA_OPTIONS.find((dia) => dia.value === horario.dia_semana)?.label}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {horario.abre_as} - {horario.fecha_as} · {horario.duracao_slot_minutos} min
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setHorarioForm({
                            id: horario.id,
                            quadraId: horario.quadra_id,
                            dia_semana: String(horario.dia_semana),
                            abre_as: horario.abre_as,
                            fecha_as: horario.fecha_as,
                            duracao_slot_minutos: String(horario.duracao_slot_minutos),
                            ativo: horario.ativo,
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-black text-zinc-700"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={busyActionId === horario.id}
                        onClick={() => void handleRemoverHorario(horario.id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remover
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Sem horarios nessa quadra"
                text="Cadastre horarios para a disponibilidade da quadra funcionar."
              />
            )}
          </div>
          </div>
        </PanelCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <PanelCard
          title="Bloqueios da quadra"
          subtitle="Crie e remova bloqueios de manutencao, evento ou uso particular."
          icon={<MapPin className="h-5 w-5" />}
        >
          <form onSubmit={handleSalvarBloqueio} className="grid gap-3 md:grid-cols-2">
            <FormSelect
              label="Quadra"
              value={bloqueioForm.quadraId}
              onChange={(value) =>
                setBloqueioForm((current) => ({ ...current, quadraId: value }))
              }
              options={quadras.map((quadra) => ({ value: quadra.id, label: quadra.nome }))}
            />
            <FormSelect
              label="Tipo de bloqueio"
              value={bloqueioForm.tipo_bloqueio}
              onChange={(value) =>
                setBloqueioForm((current) => ({
                  ...current,
                  tipo_bloqueio: value as TipoBloqueioQuadra,
                }))
              }
              options={TIPO_BLOQUEIO_OPTIONS.map((tipo) => ({
                value: tipo,
                label: tipo,
              }))}
            />
            <FormField
              label="Inicio"
              type="datetime-local"
              value={bloqueioForm.inicioEm}
              onChange={(value) =>
                setBloqueioForm((current) => ({ ...current, inicioEm: value }))
              }
            />
            <FormField
              label="Fim"
              type="datetime-local"
              value={bloqueioForm.fimEm}
              onChange={(value) =>
                setBloqueioForm((current) => ({ ...current, fimEm: value }))
              }
            />
            <FormField
              label="Motivo"
              value={bloqueioForm.motivo}
              onChange={(value) =>
                setBloqueioForm((current) => ({ ...current, motivo: value }))
              }
              placeholder="Ex.: manutencao da iluminacao"
            />
            <button
              type="submit"
              disabled={
                savingBloqueio ||
                !bloqueioForm.quadraId ||
                !bloqueioForm.inicioEm ||
                !bloqueioForm.fimEm ||
                bloqueioForm.motivo.trim().length < 3
              }
              className="h-[50px] rounded-xl bg-zinc-950 px-5 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {savingBloqueio ? "Criando..." : "Criar bloqueio"}
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {bloqueiosDaQuadra.length > 0 ? (
              bloqueiosDaQuadra.map((bloqueio) => (
                <article
                  key={bloqueio.id}
                  className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4"
                >
                  <p className="font-black text-zinc-950">{bloqueio.tipo_bloqueio}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {bloqueio.motivo}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatDateTime(bloqueio.inicio_em)} ate {formatDateTime(bloqueio.fim_em)}
                  </p>
                  <button
                    type="button"
                    disabled={busyActionId === bloqueio.id}
                    onClick={() => void handleRemoverBloqueio(bloqueio.id)}
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover
                  </button>
                </article>
              ))
            ) : (
              <EmptyState
                title="Nenhum bloqueio nessa quadra"
                text="Os bloqueios criados aparecem aqui com horario e motivo."
              />
            )}
          </div>
        </PanelCard>

        <PanelCard
          title="Aulas e recorrencias"
          subtitle="Use somente os endpoints reais de aula e recorrencia disponiveis hoje."
          icon={<ShieldCheck className="h-5 w-5" />}
        >
          <div className="grid gap-5 xl:grid-cols-2">
            <div>
              <h3 className="text-lg font-black text-zinc-950">Criar aula</h3>
              <form onSubmit={handleCriarAula} className="mt-4 grid gap-3">
                <FormSelect
                  label="Quadra"
                  value={aulaForm.quadraId}
                  onChange={(value) =>
                    setAulaForm((current) => ({ ...current, quadraId: value }))
                  }
                  options={quadras.map((quadra) => ({ value: quadra.id, label: quadra.nome }))}
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
                  className="h-[50px] rounded-xl bg-green-700 px-5 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-60"
                >
                  {savingAula ? "Criando..." : "Criar aula"}
                </button>
              </form>

              <div className="mt-5 space-y-3">
                {aulas.length > 0 ? (
                  aulas.map((aula) => (
                    <article
                      key={aula.id}
                      className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <p className="font-black text-zinc-950">{aula.quadra.nome}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {formatPeriodo(aula.inicio_em, aula.fim_em)}
                      </p>
                      <button
                        type="button"
                        disabled={busyActionId === aula.id}
                        onClick={() => void handleCancelarAula(aula.id)}
                        className="mt-3 inline-flex rounded-2xl bg-zinc-950 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
                      >
                        Cancelar aula
                      </button>
                    </article>
                  ))
                ) : (
                  <EmptyState
                    title="Nenhuma aula no dia"
                    text="As aulas criadas para a data aparecem nesta lista."
                  />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-zinc-950">Criar recorrencia</h3>
              <form onSubmit={handleCriarRecorrencia} className="mt-4 space-y-4">
                <FormSelect
                  label="Quadra"
                  value={recorrenciaForm.quadraId}
                  onChange={(value) =>
                    setRecorrenciaForm((current) => ({ ...current, quadraId: value }))
                  }
                  options={quadras.map((quadra) => ({ value: quadra.id, label: quadra.nome }))}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    label="Data inicial"
                    type="date"
                    value={recorrenciaForm.dataInicio}
                    onChange={(value) =>
                      setRecorrenciaForm((current) => ({ ...current, dataInicio: value }))
                    }
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
                  {savingRecorrencia ? "Criando..." : "Criar recorrencia"}
                </button>
              </form>

              <div className="mt-5 space-y-3">
                {recorrencias.length > 0 ? (
                  recorrencias.map((recorrencia) => (
                    <article
                      key={recorrencia.id}
                      className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <p className="font-black text-zinc-950">
                        {recorrencia.quadra?.nome || "Quadra"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {recorrencia.horario_inicio} - {recorrencia.horario_fim} · {recorrencia.status}
                      </p>
                      <button
                        type="button"
                        disabled={busyActionId === recorrencia.id}
                        onClick={() => void handleCancelarRecorrencia(recorrencia.id)}
                        className="mt-3 inline-flex rounded-2xl bg-zinc-950 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
                      >
                        Cancelar recorrencia
                      </button>
                    </article>
                  ))
                ) : (
                  <EmptyState
                    title="Nenhuma recorrencia carregada"
                    text="Quando a API listar recorrencias dessa academia, elas aparecem aqui."
                  />
                )}
              </div>
            </div>
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
