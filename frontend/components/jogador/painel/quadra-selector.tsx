"use client";

import { Button } from "@/components/ui/button";

type Quadra = {
  id: string;
  nome: string;
  tipo_piso?: string | null;
  coberta?: boolean | null;
  capacidade_minima?: number | null;
  capacidade_maxima?: number | null;
  permite_simples?: boolean | null;
  permite_dupla?: boolean | null;
};

type Props = {
  quadras: Quadra[];
  selected?: string;
  onSelect: (id: string) => void;
};

export function QuadraSelector({ quadras, selected, onSelect }: Props) {
  function getCapacidadeLabel(quadra: Quadra) {
    const permiteSimples = quadra.permite_simples ?? true;
    const permiteDupla = quadra.permite_dupla ?? true;

    if (permiteSimples && permiteDupla) return "2 ou 4 jogadores";
    if (permiteSimples) return "2 jogadores";
    if (permiteDupla) return "4 jogadores";

    return "Indefinido";
  }

  return (
    <div className="flex gap-2 overflow-x-auto">
      {quadras.map((quadra) => {
        const ativo = selected === quadra.id;

        return (
          <Button
            key={quadra.id}
            type="button"
            variant="outline"
            onClick={() => onSelect(quadra.id)}
            className={[
              "h-auto min-h-[76px] w-[138px] shrink-0 rounded-2xl px-3 py-2.5 text-left",
              "flex flex-col items-start justify-start gap-1.5 transition-all",
              ativo
                ? "border-green-600 bg-green-50 text-zinc-950 ring-1 ring-green-500 hover:bg-green-50"
                : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50",
            ].join(" ")}
          >
            <span className="w-full truncate text-sm font-bold leading-tight">
              {quadra.nome}
            </span>

            <div className="flex w-full flex-wrap gap-1">
              {quadra.tipo_piso && (
                <span
                  className={[
                    "max-w-full truncate rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none",
                    ativo
                      ? "bg-green-100 text-green-700"
                      : "bg-zinc-100 text-zinc-600",
                  ].join(" ")}
                >
                  {quadra.tipo_piso}
                </span>
              )}

              {quadra.coberta !== null && quadra.coberta !== undefined && (
                <span
                  className={[
                    "rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none",
                    ativo
                      ? "bg-green-100 text-green-700"
                      : "bg-zinc-100 text-zinc-600",
                  ].join(" ")}
                >
                  {quadra.coberta ? "Coberta" : "Descoberta"}
                </span>
              )}
            </div>

            <span
              className={[
                "mt-auto w-full truncate text-[10px] font-semibold leading-none",
                ativo ? "text-green-700" : "text-zinc-500",
              ].join(" ")}
            >
              {getCapacidadeLabel(quadra)}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
