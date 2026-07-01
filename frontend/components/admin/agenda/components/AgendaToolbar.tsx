"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AcademiaBusca } from "@/components/jogador/painel/academia-search-modal";
import type { QuadraAgenda } from "@/services/admin-agenda";

import {
  statusOptions,
  tipoOptions,
} from "@/app/painel/admin/agenda/constants";
import type {
  FiltroStatus,
  FiltroTipo,
} from "@/app/painel/admin/agenda/types";
import { formatModalidade } from "@/app/painel/admin/agenda/utils";
import { FilterSelect } from "./FilterSelect";

type AgendaToolbarProps = {
  academias: AcademiaBusca[];
  academiaSelecionada: AcademiaBusca | null;
  quadras: QuadraAgenda[];
  quadraFiltro: string;
  tipoFiltro: FiltroTipo;
  statusFiltro: FiltroStatus;
  onAcademiaChange: (academia: AcademiaBusca | null) => void;
  onQuadraChange: (value: string) => void;
  onTipoChange: (value: FiltroTipo) => void;
  onStatusChange: (value: FiltroStatus) => void;
  onAddEvent: () => void;
};

export function AgendaToolbar({
  academias,
  academiaSelecionada,
  quadras,
  quadraFiltro,
  tipoFiltro,
  statusFiltro,
  onAcademiaChange,
  onQuadraChange,
  onTipoChange,
  onStatusChange,
  onAddEvent,
}: AgendaToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {academias.length > 1 && (
          <FilterSelect
            label="Academia"
            value={academiaSelecionada?.id ?? ""}
            onChange={(id) =>
              onAcademiaChange(
                academias.find((academia) => academia.id === id) ?? null,
              )
            }
          >
            {academias.map((academia) => (
              <option key={academia.id} value={academia.id}>
                {academia.nome}
              </option>
            ))}
          </FilterSelect>
        )}

        <FilterSelect label="Quadra" value={quadraFiltro} onChange={onQuadraChange}>
          <option value="TODAS">Todas as quadras</option>

          {quadras.map((quadra) => (
            <option key={quadra.id} value={quadra.id}>
              {quadra.nome}
              {quadra.tipo_piso ? ` - ${formatModalidade(quadra.tipo_piso)}` : ""}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Tipo de evento"
          value={tipoFiltro}
          onChange={(value) => onTipoChange(value as FiltroTipo)}
        >
          {tipoOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Status"
          value={statusFiltro}
          onChange={(value) => onStatusChange(value as FiltroStatus)}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>
      </div>

      <Button
        type="button"
        onClick={onAddEvent}
        disabled={quadras.length === 0}
        className="h-12 shrink-0 gap-2 rounded-lg bg-slate-950 px-6 text-white hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" />
        Adicionar evento
      </Button>
    </div>
  );
}
