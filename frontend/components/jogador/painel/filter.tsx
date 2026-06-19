"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type Quadra = {
  id: string;
  nome: string;
  tipo_piso?: string | null;
  coberta?: boolean | null;
  permite_simples?: boolean | null;
  permite_dupla?: boolean | null;
};

type QuadraFiltros = {
  tipo_piso: string;
  cobertura: "TODAS" | "COBERTA" | "DESCOBERTA";
  jogadores: "TODOS" | "2" | "4";
};

type Props = {
  quadras: Quadra[];
  filtros: QuadraFiltros;
  onChange: (filtros: QuadraFiltros) => void;
};

export function QuadraFilter({ quadras, filtros, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const tipos = Array.from(
    new Set(quadras.map((quadra) => quadra.tipo_piso).filter(Boolean))
  ) as string[];

  const totalFiltros =
    (filtros.tipo_piso !== "TODOS" ? 1 : 0) +
    (filtros.cobertura !== "TODAS" ? 1 : 0) +
    (filtros.jogadores !== "TODOS" ? 1 : 0);

  function atualizarFiltro<K extends keyof QuadraFiltros>(
    key: K,
    value: QuadraFiltros[K]
  ) {
    onChange({
      ...filtros,
      [key]: value,
    });
  }

  function limparFiltros() {
    onChange({
      tipo_piso: "TODOS",
      cobertura: "TODAS",
      jogadores: "TODOS",
    });
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((current) => !current)}
        className="h-10 rounded-full bg-white px-4 text-sm font-bold"
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filtro
        {totalFiltros > 0 && (
          <span className="ml-2 rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-black text-white">
            {totalFiltros}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-[300px] rounded-3xl border border-zinc-100 bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-black text-zinc-950">Filtrar quadras</p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4">
            <FiltroGrupo title="Tipo de piso">
              <FiltroBotao
                active={filtros.tipo_piso === "TODOS"}
                onClick={() => atualizarFiltro("tipo_piso", "TODOS")}
              >
                Todos
              </FiltroBotao>

              {tipos.map((tipo) => (
                <FiltroBotao
                  key={tipo}
                  active={filtros.tipo_piso === tipo}
                  onClick={() => atualizarFiltro("tipo_piso", tipo)}
                >
                  {tipo}
                </FiltroBotao>
              ))}
            </FiltroGrupo>

            <FiltroGrupo title="Área">
              <FiltroBotao
                active={filtros.cobertura === "TODAS"}
                onClick={() => atualizarFiltro("cobertura", "TODAS")}
              >
                Todas
              </FiltroBotao>

              <FiltroBotao
                active={filtros.cobertura === "COBERTA"}
                onClick={() => atualizarFiltro("cobertura", "COBERTA")}
              >
                Coberta
              </FiltroBotao>

              <FiltroBotao
                active={filtros.cobertura === "DESCOBERTA"}
                onClick={() => atualizarFiltro("cobertura", "DESCOBERTA")}
              >
                Descoberta
              </FiltroBotao>
            </FiltroGrupo>

            <FiltroGrupo title="Jogadores">
              <FiltroBotao
                active={filtros.jogadores === "TODOS"}
                onClick={() => atualizarFiltro("jogadores", "TODOS")}
              >
                Todos
              </FiltroBotao>

              <FiltroBotao
                active={filtros.jogadores === "2"}
                onClick={() => atualizarFiltro("jogadores", "2")}
              >
                2 jogadores
              </FiltroBotao>

              <FiltroBotao
                active={filtros.jogadores === "4"}
                onClick={() => atualizarFiltro("jogadores", "4")}
              >
                4 jogadores
              </FiltroBotao>
            </FiltroGrupo>
          </div>

          {totalFiltros > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={limparFiltros}
              className="mt-4 h-10 w-full rounded-xl text-green-700"
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function FiltroGrupo({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
        {title}
      </p>

      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FiltroBotao({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-3 py-2 text-xs font-bold transition",
        active
          ? "bg-zinc-950 text-white"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export type { QuadraFiltros };