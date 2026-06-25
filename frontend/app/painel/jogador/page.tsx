"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { listarAcademias } from "@/services/jogador.service";
import { salvarUltimaAcademia } from "@/lib/last-academia";

import { AcademiaSearch } from "@/components/jogador/painel/academia-search";
import { AcademiaCardMini } from "@/components/jogador/painel/academia-card-mini";

type Academia = {
  id: string;
  nome: string;
  cidade?: string;
  estado?: string;
  logo_url?: string | null;
};

type AcademiasCache = {
  data: Academia[];
  createdAt: number;
};

const CACHE_KEY = "playfy_academias_cache:v2";
const ULTIMA_ACADEMIA_KEY = "playfy_ultima_academia";
const CACHE_TTL_MS = 1000 * 60 * 5;

function safeStorageGet(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

function safeStorageRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

function lerCacheAcademias() {
  const raw = safeStorageGet(CACHE_KEY);
  if (!raw) return null;

  try {
    const cache = JSON.parse(raw) as AcademiasCache;
    const expirado = Date.now() - cache.createdAt > CACHE_TTL_MS;

    if (expirado || !Array.isArray(cache.data)) {
      safeStorageRemove(CACHE_KEY);
      return null;
    }

    return cache.data;
  } catch {
    safeStorageRemove(CACHE_KEY);
    return null;
  }
}

function salvarCacheAcademias(data: Academia[]) {
  if (data.length === 0) return;

  safeStorageSet(
    CACHE_KEY,
    JSON.stringify({
      data,
      createdAt: Date.now(),
    }),
  );
}

export default function PainelJogadorPage() {
  const router = useRouter();

  const [busca, setBusca] = useState("");
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const academiasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return academias;

    return academias.filter((academia) =>
      `${academia.nome} ${academia.cidade ?? ""} ${academia.estado ?? ""}`
        .toLowerCase()
        .includes(termo),
    );
  }, [academias, busca]);

  useEffect(() => {
    let ativo = true;

    const timeoutId = window.setTimeout(() => {
      async function carregarAcademias() {
        const cache = lerCacheAcademias();

        if (cache && ativo) {
          setAcademias(cache);
          setLoading(false);
        }

        try {
          setErro("");

          const response = await listarAcademias();
          const lista = Array.isArray(response) ? response : [];

          if (!ativo) return;

          setAcademias(lista);
          salvarCacheAcademias(lista);
        } catch {
          if (!ativo) return;

          setErro("Não foi possível carregar as academias agora.");

          if (!cache) {
            setAcademias([]);
          }
        } finally {
          if (ativo) {
            setLoading(false);
          }
        }
      }

      void carregarAcademias();
    }, 0);

    return () => {
      ativo = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  function selecionarAcademia(academia: Academia) {
    try {
      salvarUltimaAcademia(academia.id);
    } catch {
      safeStorageSet(ULTIMA_ACADEMIA_KEY, academia.id);
    }

    router.push(`/painel/jogador/academia/${academia.id}`);
  }

  return (
    <section className="max-w-5xl">
      <section className="mb-6">
        <p className="text-sm font-semibold text-green-700">Início</p>

        <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-950">
          Encontre uma quadra para jogar
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Busque uma academia e veja os horários disponíveis.
        </p>
      </section>

      <AcademiaSearch value={busca} onChange={setBusca} />

      {erro && !loading ? (
        <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-600 shadow-sm">
          {erro}
        </p>
      ) : loading ? (
        <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-zinc-500 shadow-sm">
          Carregando academias...
        </p>
      ) : academiasFiltradas.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-zinc-500 shadow-sm">
          Nenhuma academia encontrada.
        </p>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {academiasFiltradas.map((academia) => (
            <AcademiaCardMini
              key={academia.id}
              nome={academia.nome}
              cidade={academia.cidade}
              fotoUrl={academia.logo_url}
              selected={false}
              onClick={() => selecionarAcademia(academia)}
            />
          ))}
        </div>
      )}
    </section>
  );
}