"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { listarAcademias } from "@/services/jogador.service";
import {
  buscarUltimaAcademia,
  limparUltimaAcademia,
  salvarUltimaAcademia,
} from "@/lib/last-academia";

import { AcademiaSearch } from "@/components/jogador/painel/academia-search";
import { AcademiaCardMini } from "@/components/jogador/painel/academia-card-mini";


type Academia = {
  id: string;
  nome: string;
  cidade?: string;
  estado?: string;
};

export default function PainelJogadorPage() {
  const router = useRouter();

  const [busca, setBusca] = useState("");
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [loading, setLoading] = useState(true);

  const academiasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();

    return academias.filter((academia) =>
      `${academia.nome} ${academia.cidade ?? ""} ${academia.estado ?? ""}`
        .toLowerCase()
        .includes(termo)
    );
  }, [academias, busca]);

  useEffect(() => {
    async function carregarAcademias() {
      try {
        const response = await listarAcademias();
        setAcademias(Array.isArray(response) ? response : []);
      } catch {
        setAcademias([]);
        setAcademias([]);
      } finally {
        setLoading(false);
      }
    }

    carregarAcademias();
  }, []);

  useEffect(() => {
    if (loading || academias.length === 0) return;

    const ultimaAcademiaId = buscarUltimaAcademia();

    if (!ultimaAcademiaId) return;

    const academiaExiste = academias.some(
      (academia) => academia.id === ultimaAcademiaId
    );

    if (!academiaExiste) {
      limparUltimaAcademia();
      return;
    }

    router.replace(`/painel/jogador/academia/${ultimaAcademiaId}`);
  }, [academias, loading, router]);

  function selecionarAcademia(academia: Academia) {
    salvarUltimaAcademia(academia.id);
    router.push(`/painel/jogador/academia/${academia.id}`);
  }

  return (
    <>
      <section className="max-w-5xl">
        <section className="mb-6">
          <p className="text-sm font-semibold text-green-700">Início</p>

          <h1 className=" text-3xl font-bold tracking-[-0.03em] text-zinc-950">
            Encontre uma quadra para jogar
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Busque uma academia e veja os horários disponíveis.
          </p>
        </section>

        <AcademiaSearch value={busca} onChange={setBusca} />

        {loading ? (
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
                selected={false}
                onClick={() => selecionarAcademia(academia)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
