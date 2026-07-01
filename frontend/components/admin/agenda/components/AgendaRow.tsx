"use client";

import type { LinhaAgenda } from "@/app/painel/admin/agenda/types";
import {
  getEtiquetaClasses,
  getLinhaClasses,
} from "@/app/painel/admin/agenda/utils";
import { EventActions } from "./EventActions";

type AgendaRowProps = {
  linha: LinhaAgenda;
  loading: boolean;
  onAction: (linha: LinhaAgenda) => void;
};

export function AgendaRow({ linha, loading, onAction }: AgendaRowProps) {
  const isLivre = linha.tipo === "LIVRE";

  return (
    <div
      onClick={() => {
        if (isLivre) {
          onAction(linha);
        }
      }}
      className={[
        "grid min-h-16 grid-cols-[76px_1fr_auto] items-center overflow-hidden rounded-xl transition",
        getLinhaClasses(linha.tipo),
        isLivre && "cursor-pointer hover:brightness-95",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex h-full flex-col justify-center bg-black/5 px-3">
        <span className="text-sm font-black">{linha.inicio}</span>
        <span className="text-xs font-semibold opacity-70">
          até {linha.fim}
        </span>
      </div>

      <div className="grid gap-1 px-4">
        <div className="flex flex-wrap items-center gap-3">
          {linha.tipo !== "LIVRE" && (
            <span
              className={[
                "rounded-md px-2 py-1 text-xs font-black",
                getEtiquetaClasses(linha.tipo),
              ].join(" ")}
            >
              {linha.etiqueta}
            </span>
          )}

          <span className="text-sm font-black">{linha.titulo}</span>

          {linha.participantes.length >= 2 && (
            <span className="text-sm font-black">X</span>
          )}
        </div>

        <p className="text-xs font-semibold opacity-75">
          {linha.subtitulo}
        </p>
      </div>

      <div
        className="px-3"
        onClick={(e) => e.stopPropagation()}
      >
        <EventActions
          linha={linha}
          loading={loading}
          onAction={onAction}
        />
      </div>
    </div>
  );
}