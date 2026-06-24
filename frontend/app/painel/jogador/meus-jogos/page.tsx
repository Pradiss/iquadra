"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

import { getUsuario } from "@/lib/auth-storage";
import type { Convite, Jogo } from "@/lib/jogos-utils";
import { sortJogosAsc, sortJogosDesc } from "@/lib/jogos-utils";

type AbaJogos = "pendentes" | "proximos" | "historico";

type MeusJogosCache = {
  usuarioId: string;
  jogos: Jogo[];
  convites: Convite[];
  savedAt: number;
};

const CACHE_KEY = "playfy_meus_jogos_cache";
const CACHE_TTL_MS = 1000 * 60;

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

function readCache() {
  const raw = safeStorageGet(CACHE_KEY);
  if (!raw) return null;

  try {
    const cache = JSON.parse(raw) as MeusJogosCache;
    const expirado = Date.now() - cache.savedAt > CACHE_TTL_MS;

    if (
      expirado ||
      !cache.usuarioId ||
      !Array.isArray(cache.jogos) ||
      !Array.isArray(cache.convites)
    ) {
      safeStorageRemove(CACHE_KEY);
      return null;
    }

    return cache;
  } catch {
    safeStorageRemove(CACHE_KEY);
    return null;
  }
}

function saveCache(cache: Omit<MeusJogosCache, "savedAt">) {
  safeStorageSet(
    CACHE_KEY,
    JSON.stringify({
      ...cache,
      savedAt: Date.now(),
    }),
  );
}

function invalidateCache() {
  safeStorageRemove(CACHE_KEY);
}

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

function getDataJogo(jogo: Jogo) {
  const jogoComDatas = jogo as Jogo & {
    data_hora?: string;
    data?: string;
    created_at?: string;
    horario_inicio?: string;
  };

  const value =
    jogo.inicio_em ??
    jogoComDatas.data_hora ??
    jogoComDatas.data ??
    jogoComDatas.horario_inicio ??
    jogoComDatas.created_at;

  if (!value) return null;

  const data = new Date(value);
  if (Number.isNaN(data.getTime())) return null;

  return data;
}

function usuarioEstaNoJogo(jogo: Jogo, usuarioId: string) {
  if (!usuarioId) return false;

  return Boolean(
    jogo.participantes?.some((participante) => {
      const participanteAny = participante as {
        usuario_id?: string;
        usuario?: { id?: string };
        id?: string;
      };

      return (
        participanteAny.usuario_id === usuarioId ||
        participanteAny.usuario?.id === usuarioId ||
        participanteAny.id === usuarioId
      );
    }),
  );
}

function isCancelado(jogo: Jogo) {
  const status = jogo.status?.toUpperCase();
  return status === "CANCELADO" || status === "CANCELED";
}

function isConcluido(jogo: Jogo) {
  const status = jogo.status?.toUpperCase();
  return (
    status === "CONCLUIDO" ||
    status === "CONCLUÍDO" ||
    status === "FINALIZADO" ||
    status === "FINISHED"
  );
}

function isFuturo(jogo: Jogo) {
  const data = getDataJogo(jogo);

  if (!data) return true;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return data.getTime() >= hoje.getTime();
}

export default function MeusJogosPage() {
  const requestRef = useRef(0);

  const [aba, setAba] = useState<AbaJogos>("pendentes");
  const [usuarioId, setUsuarioId] = useState("");
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const aplicarDados = useCallback(
    (dados: { usuarioId: string; jogos: Jogo[]; convites: Convite[] }) => {
      setUsuarioId(dados.usuarioId);
      setJogos(dados.jogos);
      setConvites(dados.convites);
    },
    [],
  );

  const carregarDados = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      if (force) {
        invalidateCache();
      }

      const cache = !force ? readCache() : null;

      if (cache) {
        aplicarDados({
          usuarioId: cache.usuarioId,
          jogos: cache.jogos,
          convites: cache.convites,
        });
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        setErro("");

        const usuarioCache = getUsuario();

        const [usuario, jogosApi, convitesApi] = await Promise.all([
          usuarioCache ? Promise.resolve(usuarioCache) : buscarUsuarioLogado(),
          listarJogos({ meus: true, limit: 100 }),
          listarConvitesJogos(),
        ]);

        if (requestId !== requestRef.current) return;

        const novosDados = {
          usuarioId: usuario.id,
          jogos: normalizarLista<Jogo>(jogosApi),
          convites: normalizarLista<Convite>(convitesApi),
        };

        aplicarDados(novosDados);
        saveCache(novosDados);
      } catch {
        if (requestId !== requestRef.current) return;

        if (!cache) {
          setUsuarioId("");
          setJogos([]);
          setConvites([]);
        }

        setErro("Não foi possível carregar seus jogos agora.");
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
        }
      }
    },
    [aplicarDados],
  );

  useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void carregarDados();
  }, 0);

  return () => window.clearTimeout(timeoutId);
}, [carregarDados]);

  const meusJogos = useMemo(() => {
    return jogos.filter((jogo) => usuarioEstaNoJogo(jogo, usuarioId));
  }, [jogos, usuarioId]);

  const convitesPendentes = useMemo(() => {
    return convites.filter(isConvitePendente);
  }, [convites]);

  const jogosProximos = useMemo(() => {
    return [...meusJogos]
      .filter(
        (jogo) => isFuturo(jogo) && !isCancelado(jogo) && !isConcluido(jogo),
      )
      .sort(sortJogosAsc);
  }, [meusJogos]);

  const jogosPendentes = useMemo(() => {
    return jogosProximos.filter((jogo) => {
      const participantes = jogo.participantes?.length ?? 0;
      const maximo = jogo.maximo_participantes ?? 2;

      return participantes < maximo;
    });
  }, [jogosProximos]);

  const jogosHistorico = useMemo(() => {
    return [...meusJogos]
      .filter(
        (jogo) => !isFuturo(jogo) || isCancelado(jogo) || isConcluido(jogo),
      )
      .sort(sortJogosDesc);
  }, [meusJogos]);

  const aceitarConvite = useCallback(
    async (id: string) => {
      await aceitarConviteJogo(id);
      await carregarDados({ force: true });
    },
    [carregarDados],
  );

  const recusarConvite = useCallback(
    async (id: string) => {
      await recusarConviteJogo(id);
      await carregarDados({ force: true });
    },
    [carregarDados],
  );

  const handleCancelarJogo = useCallback(
    async (id: string) => {
      await cancelarJogo(id);
      await carregarDados({ force: true });
    },
    [carregarDados],
  );

  return (
    <>
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
        {erro && !loading && (
          <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
            {erro}
          </p>
        )}

        {loading && <EmptyJogos text="Carregando seus jogos..." />}

        {!loading && !erro && aba === "pendentes" && (
          <>
            {convitesPendentes.length === 0 && jogosPendentes.length === 0 && (
              <EmptyJogos text="Nenhum convite ou jogo aguardando jogadores." />
            )}

            {convitesPendentes.map((convite) => (
              <ConviteCard
                key={convite.id}
                convite={convite}
                onAceitar={() => aceitarConvite(convite.id)}
                onRecusar={() => recusarConvite(convite.id)}
              />
            ))}

            {jogosPendentes.map((jogo) => (
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

        {!loading && !erro && aba === "proximos" && (
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

        {!loading && !erro && aba === "historico" && (
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
    </>
  );
}