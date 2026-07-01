"use client";

import { MoreVertical, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { LinhaAgenda } from "@/app/painel/admin/agenda/types";

type EventActionsProps = {
  linha: LinhaAgenda;
  loading: boolean;
  onAction: (linha: LinhaAgenda) => void;
};

export function EventActions({ linha, loading, onAction }: EventActionsProps) {
  if (linha.tipo === "LIVRE") {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => onAction(linha)}
        className="h-10 w-10 rounded-full bg-white/80"
      >
        <Plus className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={loading}
          className="h-9 w-9 rounded-full"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem variant="destructive" onClick={() => onAction(linha)}>
          {linha.tipo === "BLOQUEIO" ? "Remover evento" : "Cancelar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
