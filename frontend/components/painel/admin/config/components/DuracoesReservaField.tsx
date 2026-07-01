"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { DuracaoReserva } from "@/services/academia.service";

import { DURACOES_RESERVA } from "../constants";
import { Campo } from "./Campo";

export function DuracoesReservaField({
  value,
  onToggle,
}: {
  value: DuracaoReserva[];
  onToggle: (duracao: DuracaoReserva, checked: boolean) => void;
}) {
  return (
    <Campo label="Duracoes de reserva">
      <div className="grid gap-2 sm:grid-cols-3">
        {DURACOES_RESERVA.map((duracao) => {
          const checked = value.includes(duracao);

          return (
            <label
              key={duracao}
              className={[
                "flex h-[50px] items-center gap-3 rounded-xl border px-4 text-sm font-bold transition",
                checked
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200 bg-zinc-50 text-zinc-700",
              ].join(" ")}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(checkedValue) =>
                  onToggle(duracao, checkedValue === true)
                }
                className="border-zinc-300 data-checked:border-white data-checked:bg-white data-checked:text-zinc-950"
              />
              <span>{duracao} min</span>
            </label>
          );
        })}
      </div>
    </Campo>
  );
}
