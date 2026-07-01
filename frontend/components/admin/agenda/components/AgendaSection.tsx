"use client";

import { Loader2 } from "lucide-react";

import type {
  LinhaAgenda,
  LinhaPorQuadra,
} from "@/app/painel/admin/agenda/types";
import { formatModalidade } from "@/app/painel/admin/agenda/utils";
import { AgendaRow } from "./AgendaRow";

type AgendaSectionProps = {
  academiaSelecionada: unknown;
  loading: boolean;
  linhasPorQuadra: LinhaPorQuadra[];
  actionLoadingId: string;
  onAction: (linha: LinhaAgenda) => void;
};

export function AgendaSection({
  academiaSelecionada,
  loading,
  linhasPorQuadra,
  actionLoadingId,
  onAction,
}: AgendaSectionProps) {
  if (!academiaSelecionada) {
    return (
      <p className="rounded-xl bg-white p-4 text-sm font-semibold text-zinc-600">
        Nenhuma academia admin encontrada para este usuário.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-white p-4 text-sm font-semibold text-zinc-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando agenda...
      </div>
    );
  }

  if (linhasPorQuadra.length === 0) {
    return (
      <p className="rounded-xl bg-white p-4 text-sm font-semibold text-zinc-600">
        Nenhum evento encontrado para os filtros selecionados.
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      {linhasPorQuadra.map(({ quadra, items }) => (
        <section key={quadra.id} className="grid gap-3">
          <div>
            <h2 className="text-xl font-black text-zinc-950">{quadra.nome}</h2>

            <p className="text-sm font-semibold text-zinc-500">
              {formatModalidade(quadra.tipo_piso || quadra.modalidade)}
            </p>
          </div>

          <div className="grid gap-2">
            {items.map((linha) => (
              <AgendaRow
                key={linha.id}
                linha={linha}
                loading={actionLoadingId === linha.id}
                onAction={onAction}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
