"use client";

import { Check, MapPin, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { getUsuario } from "@/lib/auth-storage";

export type AcademiaBusca = {
  id: string;
  nome: string;
  cidade?: string | null;
  estado?: string | null;
};

type Props = {
  open: boolean;
  academias: AcademiaBusca[];
  selectedAcademia?: AcademiaBusca | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (academia: AcademiaBusca) => void;
};

const RECENTES_KEY = "iquadra_academias_recentes";
const LIMITE_RECENTES = 5;

export function AcademiaSearchModal({
  open,
  academias,
  selectedAcademia,
  onOpenChange,
  onSelect,
}: Props) {
  const [busca, setBusca] = useState("");
  const [recentes, setRecentes] = useState<AcademiaBusca[]>([]);

  useEffect(() => {
    if (!open) return;

    setRecentes(carregarRecentes());
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const usuario = useMemo(() => getUsuario(), [open]);
  const perfilCliente = usuario?.perfil_cliente as
    | { cidade?: string | null; estado?: string | null }
    | null
    | undefined;

  const cidadeUsuario = perfilCliente?.cidade ?? "";
  const estadoUsuario = perfilCliente?.estado ?? "";

  const recentesValidos = useMemo(() => {
    const idsAcademias = new Set(academias.map((academia) => academia.id));

    return recentes.filter((academia) => idsAcademias.has(academia.id));
  }, [academias, recentes]);

  const resultados = useMemo(() => {
    const termo = normalizar(busca.trim());

    if (!termo) return [];

    return academias.filter((academia) =>
      normalizar(
        `${academia.nome} ${academia.cidade ?? ""} ${academia.estado ?? ""}`
      ).includes(termo)
    );
  }, [academias, busca]);

  const pertoDeVoce = useMemo(() => {
    if (!cidadeUsuario.trim()) return [];

    const cidade = normalizar(cidadeUsuario);
    const estado = normalizar(estadoUsuario);
    const recentesIds = new Set(recentesValidos.map((academia) => academia.id));

    return academias.filter((academia) => {
      if (recentesIds.has(academia.id)) return false;

      const mesmaCidade = normalizar(academia.cidade ?? "") === cidade;
      const mesmoEstado =
        !estado || normalizar(academia.estado ?? "") === estado;

      return mesmaCidade && mesmoEstado;
    });
  }, [academias, cidadeUsuario, estadoUsuario, recentesValidos]);

  const outrasAcademias = useMemo(() => {
    const idsExibidos = new Set([
      ...recentesValidos.map((academia) => academia.id),
      ...pertoDeVoce.map((academia) => academia.id),
    ]);

    return academias.filter((academia) => !idsExibidos.has(academia.id));
  }, [academias, pertoDeVoce, recentesValidos]);

  if (!open) return null;

  function selecionar(academia: AcademiaBusca) {
    const novosRecentes = salvarRecente(academia);

    setRecentes(novosRecentes);
    onSelect(academia);
    setBusca("");
    onOpenChange(false);
  }

  const digitando = busca.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <button
        type="button"
        aria-label="Fechar busca de academias"
        className="absolute inset-0 bg-black/55"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative z-10 flex max-h-[88vh] w-full max-w-xl flex-col rounded-t-[34px] bg-white px-5 pb-6 pt-3 shadow-[0_-20px_60px_rgba(15,23,42,0.22)]">
        <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-zinc-200" />

        <div className="flex items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-700" />

            <Input
              autoFocus
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar academia..."
              className="h-12 rounded-2xl border-zinc-200 bg-white pl-11 pr-11 text-sm font-semibold shadow-sm"
            />

            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-200 text-zinc-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-12 shrink-0 px-1 text-sm font-black text-green-700"
          >
            Cancelar
          </button>
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pb-2">
          {digitando ? (
            <AcademiaSecao title="Resultados">
              {resultados.length === 0 ? (
                <p className="rounded-2xl bg-zinc-50 p-4 text-sm font-semibold text-zinc-500">
                  Nenhuma academia encontrada.
                </p>
              ) : (
                resultados.map((academia) => (
                  <AcademiaItem
                    key={academia.id}
                    academia={academia}
                    selected={academia.id === selectedAcademia?.id}
                    onClick={() => selecionar(academia)}
                  />
                ))
              )}
            </AcademiaSecao>
          ) : (
            <div className="grid gap-6">
              <AcademiaSecao title="Recentes">
                {recentesValidos.length === 0 ? (
                  <p className="text-sm font-semibold text-zinc-400">
                    Nenhuma academia recente.
                  </p>
                ) : (
                  recentesValidos.map((academia) => (
                    <AcademiaItem
                      key={academia.id}
                      academia={academia}
                      selected={academia.id === selectedAcademia?.id}
                      onClick={() => selecionar(academia)}
                    />
                  ))
                )}
              </AcademiaSecao>

              <AcademiaSecao title="Perto de voce">
                {pertoDeVoce.length === 0 ? (
                  <p className="text-sm font-semibold text-zinc-400">
                    Nenhuma academia perto do seu perfil.
                  </p>
                ) : (
                  pertoDeVoce.map((academia) => (
                    <AcademiaItem
                      key={academia.id}
                      academia={academia}
                      selected={academia.id === selectedAcademia?.id}
                      onClick={() => selecionar(academia)}
                    />
                  ))
                )}
              </AcademiaSecao>

              <AcademiaSecao title="Outras academias">
                {outrasAcademias.length === 0 ? (
                  <p className="text-sm font-semibold text-zinc-400">
                    Nenhuma outra academia disponivel.
                  </p>
                ) : (
                  outrasAcademias.map((academia) => (
                    <AcademiaItem
                      key={academia.id}
                      academia={academia}
                      selected={academia.id === selectedAcademia?.id}
                      onClick={() => selecionar(academia)}
                    />
                  ))
                )}
              </AcademiaSecao>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AcademiaSecao({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
        {title}
      </h2>

      <div className="grid gap-1">{children}</div>
    </section>
  );
}

function AcademiaItem({
  academia,
  selected,
  onClick,
}: {
  academia: AcademiaBusca;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition",
        selected ? "bg-green-50" : "hover:bg-zinc-50",
      ].join(" ")}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-black text-green-800">
        {academia.nome.charAt(0).toUpperCase()}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-zinc-950">
          {academia.nome}
        </span>

        <span className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-zinc-500">
          <MapPin className="h-3 w-3 shrink-0" />
          {formatarLocal(academia)}
        </span>
      </span>

      {selected && <Check className="h-5 w-5 shrink-0 text-green-700" />}
    </button>
  );
}

function formatarLocal(academia: AcademiaBusca) {
  const cidade = academia.cidade?.trim();
  const estado = academia.estado?.trim();

  if (cidade && estado) return `${cidade} - ${estado}`;
  if (cidade) return cidade;
  if (estado) return estado;

  return "Local nao informado";
}

function carregarRecentes() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(RECENTES_KEY) ?? "[]");

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isAcademiaBusca)
      .slice(0, LIMITE_RECENTES);
  } catch {
    return [];
  }
}

function salvarRecente(academia: AcademiaBusca) {
  const recentes = carregarRecentes();
  const novosRecentes = [
    academia,
    ...recentes.filter((item) => item.id !== academia.id),
  ].slice(0, LIMITE_RECENTES);

  localStorage.setItem(RECENTES_KEY, JSON.stringify(novosRecentes));

  return novosRecentes;
}

function isAcademiaBusca(value: unknown): value is AcademiaBusca {
  if (!value || typeof value !== "object") return false;

  const academia = value as Partial<AcademiaBusca>;

  return typeof academia.id === "string" && typeof academia.nome === "string";
}

function normalizar(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
