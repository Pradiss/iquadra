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
    <div className="">
    

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
