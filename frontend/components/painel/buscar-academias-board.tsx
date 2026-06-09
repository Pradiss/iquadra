"use client"

import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AlertCircle, ArrowLeft, LoaderCircle, Search } from "lucide-react"
import { clearAuthStorage, getSession, getToken } from "../../lib/auth-storage"
import { listarEmpresas } from "../../services/empresa.service"
import type { EmpresaMarketplace } from "../../types/empresa"
import { AcademiasExplorer } from "./academias-explorer"

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? ""
}

export function BuscarAcademiasBoard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [marketplace, setMarketplace] = useState<EmpresaMarketplace[]>([])
  const session = getSession()

  useEffect(() => {
    async function loadData() {
      const token = getToken()

      if (!token || !session) {
        clearAuthStorage()
        router.replace("/login")
        return
      }

      try {
        const empresasResponse = await listarEmpresas()
        setMarketplace(empresasResponse.empresas)
      } catch (requestError) {
        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 401
        ) {
          clearAuthStorage()
          router.replace("/login")
          return
        }

        setError(
          getErrorMessage(
            requestError,
            "Nao foi possivel carregar as academias agora."
          )
        )
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [router, session])

  const academiasOrdenadas = [...marketplace].sort((primeira, segunda) => {
    const cidadeUsuario = normalizeText(session?.usuario.cidade)
    const prioridadePrimeira =
      (cidadeUsuario && normalizeText(primeira.cidade) === cidadeUsuario ? 2 : 0) +
      (primeira.agendaPronta ? 1 : 0)
    const prioridadeSegunda =
      (cidadeUsuario && normalizeText(segunda.cidade) === cidadeUsuario ? 2 : 0) +
      (segunda.agendaPronta ? 1 : 0)

    if (prioridadePrimeira !== prioridadeSegunda) {
      return prioridadeSegunda - prioridadePrimeira
    }

    return primeira.nome.localeCompare(segunda.nome, "pt-BR")
  })

  const academiasComAgenda = marketplace.filter((academia) => academia.agendaPronta)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <section className="rounded-[32px] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-green-700">
              Buscar academias
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
              Escolha a academia e va direto para a quadra
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
              Clique em qualquer academia para abrir as quadras dela, ver horarios livres
              e marcar um jogo. Sem etapa extra antes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700">
              <Search className="h-4 w-4 text-green-700" />
              {academiasComAgenda.length} com agenda publicada
            </div>

            <Link
              href="/painel"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-700 shadow-sm hover:bg-zinc-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para inicio
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-[26px] bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {loading ? (
        <section className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-3 text-sm font-bold text-zinc-500">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Carregando academias
          </div>
        </section>
      ) : (
        <AcademiasExplorer
          academias={academiasOrdenadas}
          title="Academias disponiveis"
          description="Escolha a academia que voce quer usar agora. O proximo passo ja sera selecionar a quadra e o horario."
          showSearch
          sectionId="buscar-academias"
        />
      )}
    </div>
  )
}
