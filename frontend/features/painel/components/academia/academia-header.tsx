import Link from "next/link"
import { AlertCircle, ArrowLeft, MapPin, Phone } from "lucide-react"
import { formatLocation, formatLongDate } from "@/shared/lib/painel-format"
import type { EmpresaDetalhe } from "@/shared/types/empresa"

export function AcademiaHeader({
  academia,
  quadraSelecionada,
  selectedDate,
  selectedDateIsPast,
  error,
  notice,
}: {
  academia: EmpresaDetalhe
  quadraSelecionada: EmpresaDetalhe["quadras"][number] | null
  selectedDate: string
  selectedDateIsPast: boolean
  error: string
  notice: string
}) {
  return (
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

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-green-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-green-700">
              {quadraSelecionada ? quadraSelecionada.nome : "Escolha uma quadra"}
            </span>

            <span
              className={[
                "inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em]",
                selectedDateIsPast
                  ? "bg-amber-100 text-amber-800"
                  : "bg-zinc-950 text-white",
              ].join(" ")}
            >
              {selectedDateIsPast ? "Historico" : "Reserva ativa"}
            </span>

            <span className="inline-flex rounded-full bg-zinc-100 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-700">
              {formatLongDate(selectedDate)}
            </span>
          </div>

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
  )
}