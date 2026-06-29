"use client";

import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FilterChip } from "./filter-chip";

type PisoFiltro =
  | "TODOS"
  | "AREIA"
  | "SAIBRO"
  | "HARD"
  | "SINTETICA"
  | "GRAMA"
  | "OUTRO";

type CoberturaFiltro = "TODAS" | "COBERTA" | "DESCOBERTA";
type JogadoresFiltro = "TODOS" | "2" | "4";
type PrecoFiltro = "TODOS" | "ATE_50" | "50_100" | "ACIMA_100";

type ModalidadeFiltro =
  | "TODAS"
  | "TENIS"
  | "BEACH_TENNIS"
  | "PADEL"
  | "PICKLEBALL"
  | "OUTRO";

type StatusFiltro =
  | "TODOS"
  | "DISPONIVEL"
  | "OCUPADO"
  | "JOGO_ABERTO"
  | "JOGO_COMPLETO"
  | "AULA"
  | "BLOQUEADO";

type PeriodoFiltro = "TODOS" | "MANHA" | "TARDE" | "NOITE";

export type AgendaFiltros = {
  piso: PisoFiltro;
  cobertura: CoberturaFiltro;
  jogadores: JogadoresFiltro;
  preco: PrecoFiltro;
  modalidade: ModalidadeFiltro;
  status: StatusFiltro;
  periodo: PeriodoFiltro;
};

type Props = {
  filtros: AgendaFiltros;
  onChange: (filtros: AgendaFiltros) => void;
};

const filtroInicial: AgendaFiltros = {
  piso: "TODOS",
  cobertura: "TODAS",
  jogadores: "TODOS",
  preco: "TODOS",
  modalidade: "TODAS",
  status: "TODOS",
  periodo: "TODOS",
};

export { filtroInicial as agendaFiltroInicial };

const pisos: { value: PisoFiltro; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "AREIA", label: "Areia" },
  { value: "SAIBRO", label: "Saibro" },
  { value: "HARD", label: "Hard" },
  { value: "SINTETICA", label: "Sintética" },
  { value: "GRAMA", label: "Grama" },
  { value: "OUTRO", label: "Outro" },
];

const coberturas: { value: CoberturaFiltro; label: string }[] = [
  { value: "TODAS", label: "Todas" },
  { value: "COBERTA", label: "Coberta" },
  { value: "DESCOBERTA", label: "Descoberta" },
];

const jogadores: { value: JogadoresFiltro; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "2", label: "2 jogadores" },
  { value: "4", label: "4 jogadores" },
];

const precos: { value: PrecoFiltro; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "ATE_50", label: "Até R$ 50" },
  { value: "50_100", label: "R$ 50 a R$ 100" },
  { value: "ACIMA_100", label: "Acima de R$ 100" },
];

const modalidades: { value: ModalidadeFiltro; label: string }[] = [
  { value: "TODAS", label: "Todas" },
  { value: "TENIS", label: "Tênis" },
  { value: "BEACH_TENNIS", label: "Beach Tennis" },
  { value: "PADEL", label: "Padel" },
  { value: "PICKLEBALL", label: "Pickleball" },
  { value: "OUTRO", label: "Outro" },
];

const statusOptions: { value: StatusFiltro; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "DISPONIVEL", label: "Disponíveis" },
  { value: "OCUPADO", label: "Ocupados" },
  { value: "JOGO_ABERTO", label: "Jogos abertos" },
  { value: "JOGO_COMPLETO", label: "Jogos completos" },
  { value: "AULA", label: "Aulas" },
  { value: "BLOQUEADO", label: "Bloqueados" },
];

const periodos: { value: PeriodoFiltro; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "MANHA", label: "Manhã" },
  { value: "TARDE", label: "Tarde" },
  { value: "NOITE", label: "Noite" },
];

export function AgendaFilterBar({ filtros, onChange }: Props) {
  const totalAtivos = [
    filtros.piso !== "TODOS",
    filtros.cobertura !== "TODAS",
    filtros.jogadores !== "TODOS",
    filtros.preco !== "TODOS",
    filtros.modalidade !== "TODAS",
    filtros.status !== "TODOS",
    filtros.periodo !== "TODOS",
  ].filter(Boolean).length;

  function atualizar<K extends keyof AgendaFiltros>(
    key: K,
    value: AgendaFiltros[K],
  ) {
    onChange({
      ...filtros,
      [key]: value,
    });
  }

  function limpar() {
    onChange(filtroInicial);
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <FilterChip
        label="Filtros"
        icon={<SlidersHorizontal className="h-5 w-5" />}
        iconOnly
        active={totalAtivos > 0}
      >
        <div className="grid gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
              Filtros
            </p>
            <p className="mt-2 text-sm font-medium text-zinc-900">
              {totalAtivos > 0
                ? `${totalAtivos} filtro${totalAtivos > 1 ? "s" : ""} ativo${
                    totalAtivos > 1 ? "s" : ""
                  }`
                : "Sem filtros ativos"}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={totalAtivos === 0}
            onClick={limpar}
            className="h-10 rounded-2xl bg-white"
          >
            Limpar filtros
          </Button>
        </div>
      </FilterChip>

      <FilterChip label="Status" active={filtros.status !== "TODOS"}>
        <FiltroGrupo title="Status">
          {statusOptions.map((item) => (
            <FiltroOpcao
              key={item.value}
              active={filtros.status === item.value}
              onClick={() => atualizar("status", item.value)}
            >
              {item.label}
            </FiltroOpcao>
          ))}
        </FiltroGrupo>
      </FilterChip>

      <FilterChip label="Período" active={filtros.periodo !== "TODOS"}>
        <FiltroGrupo title="Período">
          {periodos.map((item) => (
            <FiltroOpcao
              key={item.value}
              active={filtros.periodo === item.value}
              onClick={() => atualizar("periodo", item.value)}
            >
              {item.label}
            </FiltroOpcao>
          ))}
        </FiltroGrupo>
      </FilterChip>

      <FilterChip label="Piso" active={filtros.piso !== "TODOS"}>
        <FiltroGrupo title="Piso">
          {pisos.map((item) => (
            <FiltroOpcao
              key={item.value}
              active={filtros.piso === item.value}
              onClick={() => atualizar("piso", item.value)}
            >
              {item.label}
            </FiltroOpcao>
          ))}
        </FiltroGrupo>
      </FilterChip>

      <FilterChip label="Cobertura" active={filtros.cobertura !== "TODAS"}>
        <FiltroGrupo title="Cobertura">
          {coberturas.map((item) => (
            <FiltroOpcao
              key={item.value}
              active={filtros.cobertura === item.value}
              onClick={() => atualizar("cobertura", item.value)}
            >
              {item.label}
            </FiltroOpcao>
          ))}
        </FiltroGrupo>
      </FilterChip>

      <FilterChip label="Jogadores" active={filtros.jogadores !== "TODOS"}>
        <FiltroGrupo title="Jogadores">
          {jogadores.map((item) => (
            <FiltroOpcao
              key={item.value}
              active={filtros.jogadores === item.value}
              onClick={() => atualizar("jogadores", item.value)}
            >
              {item.label}
            </FiltroOpcao>
          ))}
        </FiltroGrupo>
      </FilterChip>

      <FilterChip label="Preço" active={filtros.preco !== "TODOS"}>
        <FiltroGrupo title="Preço">
          {precos.map((item) => (
            <FiltroOpcao
              key={item.value}
              active={filtros.preco === item.value}
              onClick={() => atualizar("preco", item.value)}
            >
              {item.label}
            </FiltroOpcao>
          ))}
        </FiltroGrupo>
      </FilterChip>

      <FilterChip label="Modalidade" active={filtros.modalidade !== "TODAS"}>
        <FiltroGrupo title="Modalidade">
          {modalidades.map((item) => (
            <FiltroOpcao
              key={item.value}
              active={filtros.modalidade === item.value}
              onClick={() => atualizar("modalidade", item.value)}
            >
              {item.label}
            </FiltroOpcao>
          ))}
        </FiltroGrupo>
      </FilterChip>
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
    <div className="w-fit">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
        {title}
      </p>

      <div className="flex w-fit max-w-[240px] flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FiltroOpcao({
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
        "min-h-5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
        active
          ? "bg-zinc-950 text-white"
          : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}