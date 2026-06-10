import type { EmpresaDetalhe } from "@/shared/types/empresa"
import type { HorarioQuadraDetalhe } from "@/shared/types/quadra"
import { formatTipoPiso } from "@/shared/lib/painel-format"
import { SoftBadge } from "./shared-cards"
import { formatOperatingDays } from "./utils"

export function QuadrasSection({
  quadrasAtivas,
  quadraSelecionadaId,
  horariosPorQuadra,
  onSelectQuadra,
}: {
  quadrasAtivas: EmpresaDetalhe["quadras"]
  quadraSelecionadaId: string
  horariosPorQuadra: Record<string, HorarioQuadraDetalhe[]>
  onSelectQuadra: (quadraId: string) => void
}) {
  return (
    <section className="rounded-[32px] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-green-700">
            1. Escolha a quadra
          </p>

          <h2 className="mt-2 text-2xl font-black text-zinc-950">
            Comece pelas quadras
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Clique em um card para abrir o calendario da quadra, ver as especificacoes e depois escolher o horario.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quadrasAtivas.map((quadra) => {
          const ativa = quadra.id === quadraSelecionadaId
          const horariosQuadra = horariosPorQuadra[quadra.id] ?? []

          return (
            <button
              key={quadra.id}
              type="button"
              onClick={() => onSelectQuadra(quadra.id)}
              className={[
                "group rounded-[28px] border p-5 text-left transition",
                ativa
                  ? "border-green-300 bg-green-50 shadow-sm"
                  : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-green-200 hover:bg-zinc-50",
              ].join(" ")}
            >
              <div className="mb-3 flex items-center justify-between gap-3">

                <span
                  className={[
                    "rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]",
                    ativa
                      ? "bg-green-700 text-white"
                      : "bg-zinc-100 text-zinc-500 group-hover:bg-green-100 group-hover:text-green-700",
                  ].join(" ")}
                >
                  {ativa ? "Selecionada" : "Abrir agenda"}
                </span>
              </div>

              <p className="text-lg font-black text-zinc-950">{quadra.nome}</p>

              <p className="mt-1 text-sm text-zinc-500">
                {formatTipoPiso(quadra.tipo_piso)} {quadra.coberta ? "· Coberta" : "· Descoberta"}
              </p>

              {quadra.descricao ? (
                <p className="mt-2 text-sm leading-6 text-zinc-500">{quadra.descricao}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <SoftBadge label={formatTipoPiso(quadra.tipo_piso)} />
                <SoftBadge label={quadra.coberta ? "Coberta" : "Descoberta"} />
                <SoftBadge
                  label={
                    horariosQuadra.some((horario) => horario.ativo)
                      ? "Com agenda"
                      : "Sem agenda"
                  }
                />
              </div>

              <div className="mt-4 rounded-[22px] bg-white/80 px-4 py-3 ring-1 ring-black/5">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  Grade semanal
                </p>

                <p className="mt-2 text-sm font-semibold text-zinc-700">
                  {formatOperatingDays(horariosQuadra)}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
