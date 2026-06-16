"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  UsersRound,
  X,
} from "lucide-react";

import {
  criarJogo,
  convidarJogador,
  listarUsuarios,
  participarJogo,
} from "@/services/jogador.service";
import { getSafeImageUrl } from "@/lib/safe-image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Usuario = {
  id: string;
  nome?: string;
  name?: string;
  email?: string;
  foto_perfil?: string | null;
};

type HorarioSelecionado = {
  id: string;
  hora: string;
  fim?: string;
  quadraId: string;
  quadraNome: string;
  capacidadeMaxima: number;
  permiteSimples: boolean;
  permiteDupla: boolean;
  jogoId?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horario: HorarioSelecionado | null;
  data: string;
  academiaId: string;
  onSuccess?: () => void;
};

function nomeUsuario(usuario: Usuario) {
  return usuario.nome || usuario.name || usuario.email || "Jogador";
}

function fotoUsuario(usuario?: Usuario | null) {
  return getSafeImageUrl(usuario?.foto_perfil);
}

function normalizarUsuarios(response: unknown): Usuario[] {
  const data = response as {
    data?: Usuario[];
    usuarios?: Usuario[];
    users?: Usuario[];
    items?: Usuario[];
  };

  if (Array.isArray(response)) return response;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.usuarios)) return data.usuarios;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getErrorMessage(error: unknown) {
  const fallback = "Nao foi possivel confirmar.";

  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const maybeApiError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return maybeApiError.response?.data?.message || maybeApiError.message || fallback;
}

export function AgendarJogoDialog({
  open,
  onOpenChange,
  horario,
  data,
  academiaId,
  onSuccess,
}: Props) {
  const [tipoJogo, setTipoJogo] = useState<"SIMPLES" | "DUPLA">("SIMPLES");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [buscandoIndex, setBuscandoIndex] = useState<number | null>(null);
  const [jogadores, setJogadores] = useState<(Usuario | null)[]>([
    null,
    null,
    null,
  ]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const entrandoEmJogo = Boolean(horario?.jogoId);
  const quantidadeConvites = tipoJogo === "SIMPLES" ? 1 : 3;
  const jogadoresExibidos = jogadores.slice(0, quantidadeConvites);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return usuarios
      .filter((usuario) => {
        const nome = nomeUsuario(usuario).toLowerCase();
        const email = usuario.email?.toLowerCase() || "";
        const jaSelecionado = jogadores.some(
          (jogador) => jogador?.id === usuario.id
        );

        if (jaSelecionado) return false;
        if (!termo) return true;

        return nome.includes(termo) || email.includes(termo);
      })
      .slice(0, 10);
  }, [busca, usuarios, jogadores]);

  useEffect(() => {
    if (!open || !horario) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErro("");
    setBusca("");
    setBuscandoIndex(null);
    setJogadores([null, null, null]);
    setTipoJogo(horario.permiteSimples ? "SIMPLES" : "DUPLA");

    listarUsuarios()
      .then((res) => {
        setUsuarios(normalizarUsuarios(res));
      })
      .catch(() => {
        setUsuarios([]);
      });
  }, [open, horario]);

  function abrirBusca(index: number) {
    setBuscandoIndex(index);
    setBusca("");
  }

  function selecionarJogador(usuario: Usuario) {
    if (buscandoIndex === null) return;

    setJogadores((atual) =>
      atual.map((item, index) => (index === buscandoIndex ? usuario : item))
    );

    setBuscandoIndex(null);
    setBusca("");
  }

  function removerJogador(index: number) {
    setJogadores((atual) =>
      atual.map((item, i) => (i === index ? null : item))
    );
  }

  async function confirmar() {
    if (!horario || !data || !academiaId) {
      setErro("Dados do horario incompletos.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      if (horario.jogoId) {
        await participarJogo(horario.jogoId);
      } else {
        const inicio_em = new Date(`${data}T${horario.hora}:00`).toISOString();
        const fim_em = new Date(
          `${data}T${horario.fim || horario.hora}:00`
        ).toISOString();

        const jogo = await criarJogo({
          academia_id: academiaId,
          quadra_id: horario.quadraId,
          tipo_jogo: tipoJogo,
          inicio_em,
          fim_em,
        });

        const convidados = jogadoresExibidos.filter(Boolean) as Usuario[];

        await Promise.all(
          convidados.map((jogador) => convidarJogador(jogo.id, jogador.id))
        );
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px] border-0 p-6 sm:max-w-[390px]">
        <DialogHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white">
            <UsersRound className="h-5 w-5 text-zinc-700" />
          </div>

          <DialogTitle className="text-lg font-black text-zinc-950">
            {entrandoEmJogo ? "Entrar no jogo" : "Quem vai jogar?"}
          </DialogTitle>

          <p className="text-sm text-zinc-500">
            Confira o horario e escolha os jogadores.
          </p>
        </DialogHeader>

        {horario && (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <MapPin className="h-4 w-4 text-green-700" />
                {horario.quadraNome}
              </div>

              <div className="flex items-center gap-2 text-zinc-600">
                <CalendarDays className="h-4 w-4" />
                {formatarData(data)}
              </div>

              <div className="flex items-center gap-2 text-zinc-600">
                <Clock className="h-4 w-4" />
                {horario.hora} {horario.fim ? `ate ${horario.fim}` : ""}
              </div>
            </div>
          </div>
        )}

        {!entrandoEmJogo && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={tipoJogo === "SIMPLES" ? "default" : "outline"}
              disabled={!horario?.permiteSimples}
              onClick={() => setTipoJogo("SIMPLES")}
            >
              Simples
            </Button>

            <Button
              type="button"
              variant={tipoJogo === "DUPLA" ? "default" : "outline"}
              disabled={!horario?.permiteDupla}
              onClick={() => setTipoJogo("DUPLA")}
            >
              Dupla
            </Button>
          </div>
        )}

        {!entrandoEmJogo && (
          <div className="space-y-3">
            {jogadoresExibidos.map((jogador, index) => {
              const fotoPerfil = fotoUsuario(jogador);

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200">
                      {jogador && fotoPerfil ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fotoPerfil}
                          alt={nomeUsuario(jogador)}
                          className="h-full w-full object-cover"
                        />
                      ) : jogador ? (
                        <span className="text-xs font-black text-zinc-800">
                          {nomeUsuario(jogador).charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <Plus className="h-4 w-4 text-zinc-700" />
                      )}
                    </div>

                    {buscandoIndex === index ? (
                      <div className="relative flex-1">
                        <Input
                          autoFocus
                          value={busca}
                          onChange={(event) => setBusca(event.target.value)}
                          placeholder={`Buscar jogador ${index + 2}`}
                          className="pr-9"
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setBuscandoIndex(null);
                            setBusca("");
                          }}
                          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-zinc-700">
                          {jogador
                            ? nomeUsuario(jogador)
                            : `Jogador ${index + 2}`}
                        </p>
                      </div>
                    )}

                    {jogador ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removerJogador(index)}
                      >
                        Remover
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => abrirBusca(index)}
                      >
                        Adicionar
                      </Button>
                    )}
                  </div>

                  {buscandoIndex === index && (
                    <div className="max-h-40 overflow-y-auto rounded-xl border border-zinc-200 p-2">
                      {usuariosFiltrados.length === 0 ? (
                        <p className="px-2 py-2 text-sm text-zinc-500">
                          Nenhum jogador encontrado.
                        </p>
                      ) : (
                        usuariosFiltrados.map((usuario) => {
                          const foto = fotoUsuario(usuario);

                          return (
                            <Button
                              key={usuario.id}
                              type="button"
                              variant="ghost"
                              onClick={() => selecionarJogador(usuario)}
                              className="mb-1 h-auto w-full justify-start gap-2 py-2"
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-black">
                                {foto ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={foto}
                                    alt={nomeUsuario(usuario)}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  nomeUsuario(usuario).charAt(0).toUpperCase()
                                )}
                              </span>

                              <span className="truncate">
                                {nomeUsuario(usuario)}
                              </span>
                            </Button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {erro && (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">
            {erro}
          </p>
        )}

        <div className="sticky bottom-0 space-y-2 bg-white pt-3">
          <Button
            type="button"
            disabled={loading || !horario}
            onClick={confirmar}
            className="h-11 w-full"
          >
            {loading
              ? "Confirmando..."
              : entrandoEmJogo
                ? "Entrar no jogo"
                : "Confirmar"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 w-full"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
