"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { LayoutPainel } from "@/components/painel/layout-painel";
import { Button } from "@/components/ui/button";
import { JogosTabs } from "@/components/jogador/meus-jogos/jogos-tabs";
import { EmptyJogos } from "@/components/jogador/meus-jogos/empty-jogos";
import { ConviteCard } from "@/components/jogador/meus-jogos/convite-card";
import { JogoCard } from "@/components/jogador/meus-jogos/jogo-card";

import {
  aceitarConviteJogo,
  buscarUsuarioLogado,
  cancelarJogo,
  listarConvitesJogos,
  listarJogos,
  recusarConviteJogo,
} from "@/services/jogos.service";

import type { Convite, Jogo } from "@/lib/jogos-utils";
import {
  isJogoFuturo,
  isStatusHistorico,
  isUsuarioNoJogo,
  sortJogosAsc,
  sortJogosDesc,
} from "@/lib/jogos-utils";

type AbaJogos = "pendentes" | "proximos" | "historico";

function normalizarLista<T>(response: unknown): T[] {
  const data = response as {
    data?: T[];
    convites?: T[];
    jogos?: T[];
    items?: T[];
  };

  if (Array.isArray(response)) return response;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.convites)) return data.convites;
  if (Array.isArray(data?.jogos)) return data.jogos;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function isConvitePendente(convite: Convite) {
  const status = convite.status?.toUpperCase();

  return !status || status === "PENDENTE" || status === "PENDING";
}

function isJogoAguardandoJogadores(jogo: Jogo) {
  const status = jogo.status?.toUpperCase();
  const participantes = jogo.participantes?.length ?? 0;
  const maximo = jogo.maximo_participantes ?? 2;

  return (
    isJogoFuturo(jogo) &&
    !isStatusHistorico(jogo.status) &&
    status !== "CANCELADO" &&
    participantes < maximo
  );
}

export default function MeusJogosPage() {
  const [aba, setAba] = useState<AbaJogos>("pendentes");

  const [usuarioId, setUsuarioId] = useState("");
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(true);

  const buscarDados = useCallback(async () => {
    try {
      const [usuario, jogosApi, convitesApi] = await Promise.all([
        buscarUsuarioLogado(),
        listarJogos(),
        listarConvitesJogos(),
      ]);

      console.log("JOGOS API:", jogosApi);
      console.log("CONVITES API:", convitesApi);

      setUsuarioId(usuario.id);
      setJogos(normalizarLista<Jogo>(jogosApi));
      setConvites(normalizarLista<Convite>(convitesApi));
    } catch (error) {
      console.log("Erro ao carregar meus jogos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  

  const carregarDados = useCallback(async () => {
    setLoading(true);
    await buscarDados();
  }, [buscarDados]);

  useEffect(() => {
    void buscarDados();
  }, [buscarDados]);

  const meusJogos = useMemo(() => {
    if (!usuarioId) return [];

    return jogos.filter((jogo) => isUsuarioNoJogo(jogo, usuarioId));
  }, [jogos, usuarioId]);

  const convitesPendentes = useMemo(() => {
    return convites.filter(isConvitePendente);
  }, [convites]);

  const jogosAguardandoJogadores = useMemo(() => {
    return [...meusJogos].filter(isJogoAguardandoJogadores).sort(sortJogosAsc);
  }, [meusJogos]);

  const jogosProximos = useMemo(() => {
    return [...meusJogos]
      .filter((jogo) => {
        const status = jogo.status?.toUpperCase();

        return (
          isJogoFuturo(jogo) &&
          !isStatusHistorico(jogo.status) &&
          status !== "CANCELADO" &&
          !isJogoAguardandoJogadores(jogo)
        );
      })
      .sort(sortJogosAsc);
  }, [meusJogos]);

  const jogosHistorico = useMemo(() => {
    return [...meusJogos]
      .filter((jogo) => !isJogoFuturo(jogo) || isStatusHistorico(jogo.status))
      .sort(sortJogosDesc);
  }, [meusJogos]);

  async function aceitarConvite(id: string) {
    await aceitarConviteJogo(id);
    await carregarDados();
  }

  async function recusarConvite(id: string) {
    await recusarConviteJogo(id);
    await carregarDados();
  }

  async function handleCancelarJogo(id: string) {
    await cancelarJogo(id);
    await carregarDados();
  }

  return (
    <LayoutPainel>
      <section>
        <p className="text-sm font-semibold text-green-700">Meus jogos</p>

        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-zinc-950">
          Seus jogos agendados
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Veja convites pendentes, próximos jogos e partidas anteriores.
        </p>
      </section>

      <JogosTabs aba={aba} onChange={setAba} />

      <section className="mt-5 flex flex-col gap-4">
        {loading && <EmptyJogos text="Carregando seus jogos..." />}

        {!loading && aba === "pendentes" && (
          <>
            {convitesPendentes.length === 0 &&
              jogosAguardandoJogadores.length === 0 && (
                <EmptyJogos text="Nenhum convite ou jogo pendente." />
              )}

            {convitesPendentes.map((convite) => (
              <ConviteCard
                key={convite.id}
                convite={convite}
                onAceitar={() => aceitarConvite(convite.id)}
                onRecusar={() => recusarConvite(convite.id)}
              />
            ))}

            {jogosAguardandoJogadores.map((jogo) => (
              <JogoCard
                key={jogo.id}
                jogo={jogo}
                action={
                  <Button
                    variant="outline"
                    onClick={() => handleCancelarJogo(jogo.id)}
                    className="rounded-2xl font-bold text-red-600"
                  >
                    Cancelar
                  </Button>
                }
              />
            ))}
          </>
        )}

        {!loading && aba === "proximos" && (
          <>
            {jogosProximos.length === 0 && (
              <EmptyJogos text="Nenhum jogo próximo." />
            )}

            {jogosProximos.map((jogo) => (
              <JogoCard
                key={jogo.id}
                jogo={jogo}
                action={
                  <Button
                    variant="outline"
                    onClick={() => handleCancelarJogo(jogo.id)}
                    className="rounded-2xl font-bold text-red-600"
                  >
                    Cancelar
                  </Button>
                }
              />
            ))}
          </>
        )}

        {!loading && aba === "historico" && (
          <>
            {jogosHistorico.length === 0 && (
              <EmptyJogos text="Nenhum jogo no histórico." />
            )}

            {jogosHistorico.map((jogo) => (
              <JogoCard key={jogo.id} jogo={jogo} />
            ))}
          </>
        )}
      </section>
    </LayoutPainel>
  );
}