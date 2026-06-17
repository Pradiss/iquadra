"use client";

import { Button } from "@/components/ui/button";

type Quadra = {
  id: string;
  nome: string;
  capacidade_minima?: number;
  capacidade_maxima?: number;
  permite_simples?: boolean;
  permite_dupla?: boolean;
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
            variant={ativo ? "default" : "outline"}
            onClick={() => onSelect(quadra.id)}
            className={[
              "h-auto min-h-[58px] w-[120px] shrink-0 flex-col items-start rounded-xl px-3 py-2 text-left",
              ativo
                ? "border border-green-600 bg-green-100 text-zinc-950 hover:bg-green-100"
                : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
            ].join(" ")}
          >
            <span className="w-full truncate text-sm leading-tight font-bold">
              {quadra.nome}
            </span>

            <span
              className={[
                "mt-[-2px] w-full truncate text-[9px] leading-none font-semibold",
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
