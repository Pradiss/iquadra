"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, Building2, MapPin, Search, Sparkles } from "lucide-react"
import type { EmpresaMarketplace } from "../../types/empresa"



function formatLocation(empresa: Pick<EmpresaMarketplace, "cidade" | "estado">) {
  const parts = [empresa.cidade, empresa.estado].filter(Boolean)
  return parts.length > 0 ? parts.join(" - ") : "Localizacao nao informada"
}

type AcademiasExplorerProps = {
  academias: EmpresaMarketplace[]
  title: string
  description: string
  currentEmpresaId?: string | null
  limit?: number
  linkHref?: string
  linkLabel?: string
  showSearch?: boolean
  sectionId?: string
}

export function AcademiasExplorer({
  academias,
  title,
  description,
  currentEmpresaId = null,
  limit,
  linkHref,
  linkLabel,
  showSearch = true,
  sectionId,
}: AcademiasExplorerProps) {
  const [query, setQuery] = useState("")
  void currentEmpresaId

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    const base = normalized
      ? academias.filter((empresa) => {
          const searchable = [
            empresa.nome,
            empresa.cidade,
            empresa.estado,
            empresa.tiposPiso.join(" "),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()

          return searchable.includes(normalized)
        })
      : academias

    return limit ? base.slice(0, limit) : base
  }, [academias, limit, query])

  return (
    
    <section id={sectionId} className="space-y-6 sm:space-y-0 ">
      <div className="">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-green-700">
              IQuadra
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
              {title}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              {description}
            </p>
          </div>

          {linkHref && linkLabel ? (
            <Link
              href={linkHref}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-green-50 px-4 text-sm font-black text-green-700 transition hover:bg-green-100"
            >
              {linkLabel}
            </Link>
          ) : null}
        </div>

        {showSearch && (
          <label className="mt-5 flex h-14 items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 transition focus-within:border-green-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100">
            <Search className="h-5 w-5 text-zinc-400" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar academia, cidade ou tipo de quadra..."
              className="w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
            />
          </label>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 sm:py-7 ">
          {filtered.map((empresa) => {
            return (
              <Link
                key={empresa.id}
                href={`/painel/academia/${empresa.id}`}
                className="group overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-green-800 via-green-600 to-lime-500">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.38),transparent_35%)]" />

                  <div className="absolute bottom-5 left-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/95 text-green-700 shadow-lg">
                      <Building2 className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-black tracking-tight text-zinc-950 transition group-hover:text-green-700">
                    {empresa.nome}
                  </h3>

                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500">
                    <MapPin className="h-4 w-4" />
                    {formatLocation(empresa)}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <InfoBadge label="Quadras" value={String(empresa.totalQuadras)} />
                    <InfoBadge
                      label="Agenda"
                      value={empresa.agendaPronta ? "Aberta" : "Em breve"}
                    />
                  </div>

                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-black text-zinc-950">Nenhuma academia encontrada</p>
          <p className="mt-2 text-sm text-zinc-500">
            Tente buscar por nome, cidade ou tipo de quadra.
          </p>
        </div>
      )}
    </section>
  )
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-zinc-900">
        <Sparkles className="h-3.5 w-3.5 text-green-700" />
        {value}
      </p>
    </div>
  )
}
