"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin, Plus, UsersRound, X } from "lucide-react";

import {
  adicionarParticipanteJogo,
  cancelarJogoInteiro,
  criarJogo,
  listarUsuarios,
  participarJogo,
  removerParticipanteJogo,
  sairDoJogo,
} from "@/services/jogador.service";
import { getSafeImageUrl } from "@/lib/safe-image";
import { getUsuario } from "@/lib/auth-storage";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type UsuarioAcademia = {
  academia_id?: string;
  perfil?: string;
  status?: string;
  academia?: {
    id?: string;
  } | null;
};

type Usuario = {
  id: string;
  nome?: string;
  name?: string;
  email?: string;
  foto_perfil?: string | null;
  perfil_cliente?: {
    categoria?: string | null;
  } | null;
  academias?: UsuarioAcademia[];
};

type Participante = {
  id: string;
  usuario_id?: string;
  nome: string;
  foto_perfil?: string | null;
  categoria?: string | null;
  status?: string;
  usuario?: {
    id?: string;
    nome?: string;
    foto_perfil?: string | null;
    perfil_cliente?: {
      categoria?: string | null;
    } | null;
  };
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
  criadorUsuarioId?: string;
  status?: string;
  tipoJogo?: "SIMPLES" | "DUPLA";
  maximoParticipantes?: number;
  jogadoresConfirmados?: number;
  vagasDisponiveis?: number;
  participantes?: Participante[];
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

function normalizarParticipantesConfirmados(response: unknown): Participante[] {
  const jogo = response as {
    participantes?: Participante[];
  };

  if (!Array.isArray(jogo?.participantes)) return [];

  return jogo.participantes
    .filter((participante) => {
      const status = participante.status?.toUpperCase();
      return !status || status === "CONFIRMADO";
    })
    .map((participante) => {
      const usuario = participante.usuario;
      const id = participante.usuario_id || usuario?.id || participante.id;

      return {
        id,
        usuario_id: participante.usuario_id || usuario?.id || id,
        nome: usuario?.nome || participante.nome || "Jogador",
        foto_perfil: usuario?.foto_perfil ?? participante.foto_perfil ?? null,
        categoria:
          usuario?.perfil_cliente?.categoria ?? participante.categoria ?? null,
        status: participante.status,
      };
    })
    .filter((participante) => Boolean(participante.id));
}

function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getErrorMessage(error: unknown) {
  const fallback = "Não foi possível confirmar.";

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

  return (
    maybeApiError.response?.data?.message || maybeApiError.message || fallback
  );
}

function usuarioEhAdminDaAcademia(
  usuario: Usuario | null,
  academiaId: string,
) {
  if (!usuario?.academias?.length) return false;

  return usuario.academias.some((vinculo) => {
    const vinculoAcademiaId = vinculo.academia_id || vinculo.academia?.id;
    const perfil = vinculo.perfil || "";

    return (
      vinculoAcademiaId === academiaId &&
      vinculo.status !== "INATIVO" &&
      ["DONO", "ADMIN_ACADEMIA"].includes(perfil)
    );
  });
}

function ParticipanteItem({
  participante,
  action,
}: {
  participante: Participante;
  action?: React.ReactNode;
}) {
  const fotoPerfil = getSafeImageUrl(participante.foto_perfil);

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-2 text-sm font-semibold text-zinc-700">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-black text-zinc-800">
        {fotoPerfil ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotoPerfil}
            alt={participante.nome}
            className="h-full w-full object-cover"
          />
        ) : (
          participante.nome.charAt(0).toUpperCase()
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate">{participante.nome}</span>
        {participante.categoria && (
          <span className="block truncate text-xs font-bold text-zinc-500">
            {participante.categoria}
          </span>
        )}
      </span>

      {action}
    </div>
  );
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
  const [buscandoIndex, setBuscandoIndex] = useState<
    number | "existente" | null
  >(null);
  const [jogadores, setJogadores] = useState<(Usuario | null)[]>([
    null,
    null,
    null,
  ]);
  const [participantesAtuais, setParticipantesAtuais] = useState<
    Participante[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const usuarioLogado = useMemo(() => getUsuario() as Usuario | null, []);
  const entrandoEmJogo = Boolean(horario?.jogoId);
  const maximoParticipantes =
    horario?.maximoParticipantes ?? (tipoJogo === "SIMPLES" ? 2 : 4);
  const participantes = useMemo(() => {
    if (entrandoEmJogo) return participantesAtuais;

    return horario?.participantes ?? [];
  }, [entrandoEmJogo, horario?.participantes, participantesAtuais]);
  const jogadoresConfirmados = participantes.length;
  const vagasDisponiveis = entrandoEmJogo
    ? Math.max(maximoParticipantes - jogadoresConfirmados, 0)
    : (horario?.vagasDisponiveis ??
      Math.max(maximoParticipantes - jogadoresConfirmados, 0));
  const temVaga = vagasDisponiveis > 0;

  const jaParticipa = Boolean(
    usuarioLogado?.id &&
      participantes.some((participante) => participante.id === usuarioLogado.id),
  );
  const usuarioCriador = Boolean(
    usuarioLogado?.id && horario?.criadorUsuarioId === usuarioLogado.id,
  );
  const podeCancelarJogoInteiro =
    entrandoEmJogo &&
    (usuarioCriador || usuarioEhAdminDaAcademia(usuarioLogado, academiaId));
  const podeGerenciarParticipantes = podeCancelarJogoInteiro;
  const podeAdicionarParticipante = podeGerenciarParticipantes && temVaga;

  const quantidadeConvites = tipoJogo === "SIMPLES" ? 1 : 3;
  const jogadoresExibidos = jogadores.slice(0, quantidadeConvites);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (termo.length < 2) return [];

    return usuarios
      .filter((usuario) => {
        const nome = nomeUsuario(usuario).toLowerCase();
        const email = usuario.email?.toLowerCase() || "";
        const jaSelecionado = jogadores.some(
          (jogador) => jogador?.id === usuario.id,
        );
        const jaParticipaDoJogo = participantes.some(
          (participante) => participante.id === usuario.id,
        );

        if (
          usuario.id === usuarioLogado?.id ||
          jaSelecionado ||
          jaParticipaDoJogo
        ) {
          return false;
        }

        return nome.includes(termo) || email.includes(termo);
      })
      .slice(0, 10);
  }, [busca, usuarios, jogadores, participantes, usuarioLogado?.id]);

  useEffect(() => {
    if (!open || !horario) return;

    let ativo = true;
    const timeoutId = window.setTimeout(() => {
      if (!ativo) return;

      setErro("");
      setBusca("");
      setBuscandoIndex(null);
      setJogadores([null, null, null]);
      setParticipantesAtuais(horario.participantes ?? []);
      setTipoJogo(horario.permiteSimples ? "SIMPLES" : "DUPLA");

      if (!horario.jogoId || podeGerenciarParticipantes) {
        listarUsuarios()
          .then((res) => {
            if (ativo) setUsuarios(normalizarUsuarios(res));
          })
          .catch(() => {
            if (ativo) setUsuarios([]);
          });
      }
    }, 0);

    return () => {
      ativo = false;
      window.clearTimeout(timeoutId);
    };
  }, [open, horario, podeGerenciarParticipantes]);

  function abrirBusca(index: number | "existente") {
    setBuscandoIndex(index);
    setBusca("");
  }

  function selecionarJogador(usuario: Usuario) {
    if (buscandoIndex === null) return;

    if (buscandoIndex === "existente") {
      void adicionarJogadorAoJogo(usuario);
      return;
    }

    setJogadores((atual) =>
      atual.map((item, index) => (index === buscandoIndex ? usuario : item)),
    );

    setBuscandoIndex(null);
    setBusca("");
  }

  function removerJogador(index: number) {
    setJogadores((atual) =>
      atual.map((item, i) => (i === index ? null : item)),
    );
  }

  async function adicionarJogadorAoJogo(usuario: Usuario) {
    if (!horario?.jogoId) return;

    setLoading(true);
    setErro("");

    try {
      const jogoAtualizado = await adicionarParticipanteJogo(
        horario.jogoId,
        usuario.id,
      );
      setParticipantesAtuais(
        normalizarParticipantesConfirmados(jogoAtualizado),
      );
      setBuscandoIndex(null);
      setBusca("");
      onSuccess?.();
    } catch (error: unknown) {
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function removerParticipanteSelecionado(usuarioId: string) {
    if (!horario?.jogoId) return;

    setLoading(true);
    setErro("");

    try {
      const jogoAtualizado = await removerParticipanteJogo(
        horario.jogoId,
        usuarioId,
      );
      const participantesConfirmados =
        normalizarParticipantesConfirmados(jogoAtualizado);

      setParticipantesAtuais(participantesConfirmados);
      onSuccess?.();

      if (participantesConfirmados.length === 0) {
        onOpenChange(false);
      }
    } catch (error: unknown) {
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function confirmar() {
    if (!horario || !data || !academiaId) {
      setErro("Dados do horário incompletos.");
      return;
    }

    if (horario.jogoId && !jaParticipa && !temVaga) {
      setErro("Este jogo já está completo.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      if (horario.jogoId && jaParticipa) {
        await sairDoJogo(horario.jogoId);
      } else if (horario.jogoId) {
        await participarJogo(horario.jogoId);
      } else {
        const inicio_em = new Date(`${data}T${horario.hora}:00`).toISOString();
        const fim_em = new Date(
          `${data}T${horario.fim || horario.hora}:00`,
        ).toISOString();

        const jogo = await criarJogo({
          academia_id: academiaId,
          quadra_id: horario.quadraId,
          tipo_jogo: tipoJogo,
          inicio_em,
          fim_em,
        });

        const jogadoresSelecionados = jogadoresExibidos.filter(
          Boolean,
        ) as Usuario[];

        for (const jogador of jogadoresSelecionados) {
          await adicionarParticipanteJogo(jogo.id, jogador.id);
        }
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function cancelarJogoSelecionado() {
    if (!horario?.jogoId) return;

    setLoading(true);
    setErro("");

    try {
      await cancelarJogoInteiro(horario.jogoId);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const titulo = jaParticipa
    ? "Sua participação"
    : entrandoEmJogo
      ? "Jogo criado"
      : "Quem vai jogar?";
  const descricao = entrandoEmJogo
    ? "Confira os jogadores confirmados neste horário."
    : "Você entra como Jogador 1 e pode adicionar os demais.";
  const textoBotaoPrincipal = loading
    ? "Confirmando..."
    : jaParticipa
      ? "Sair do jogo"
      : entrandoEmJogo
        ? temVaga
          ? "Entrar no jogo"
          : "Jogo completo"
        : "Confirmar jogo";
  const desabilitarBotaoPrincipal =
    loading || !horario || (entrandoEmJogo && !jaParticipa && !temVaga);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px] border-0 p-6 sm:max-w-[390px]">
        <DialogHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white">
            <UsersRound className="h-5 w-5 text-zinc-700" />
          </div>

          <DialogTitle className="text-lg font-black text-zinc-950">
            {titulo}
          </DialogTitle>

          <p className="text-sm text-zinc-500">{descricao}</p>
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
                {horario.hora} {horario.fim ? `até ${horario.fim}` : ""}
              </div>
            </div>
          </div>
        )}

        {entrandoEmJogo ? (
          <div className="rounded-2xl bg-zinc-50 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-zinc-500">
                Jogadores confirmados
              </p>
              <span className="text-xs font-black text-zinc-700">
                {jogadoresConfirmados}/{maximoParticipantes}
              </span>
            </div>

            <div className="grid gap-2">
              {participantes.length > 0 ? (
                participantes.map((participante) => (
                  <ParticipanteItem
                    key={participante.id}
                    participante={participante}
                    action={
                      podeGerenciarParticipantes &&
                      participante.id !== usuarioLogado?.id ? (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={loading}
                          onClick={() =>
                            removerParticipanteSelecionado(participante.id)
                          }
                          className="shrink-0 text-red-700 hover:bg-red-50 hover:text-red-800"
                        >
                          Remover
                        </Button>
                      ) : undefined
                    }
                  />
                ))
              ) : (
                <p className="rounded-xl bg-white p-3 text-sm text-zinc-500">
                  Nenhum jogador confirmado.
                </p>
              )}
            </div>

            {podeAdicionarParticipante && (
              <div className="mt-3 space-y-2">
                {buscandoIndex === "existente" ? (
                  <div className="relative">
                    <Input
                      autoFocus
                      value={busca}
                      onChange={(event) => setBusca(event.target.value)}
                      placeholder="Buscar jogador"
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
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={() => abrirBusca("existente")}
                    className="h-10 w-full"
                  >
                    Adicionar jogador
                  </Button>
                )}

                {buscandoIndex === "existente" && (
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2">
                    {busca.trim().length < 2 ? (
                      <p className="px-2 py-2 text-sm text-zinc-500">
                        Digite pelo menos 2 letras para buscar jogadores.
                      </p>
                    ) : usuariosFiltrados.length === 0 ? (
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
                            disabled={loading}
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
            )}
          </div>
        ) : null}

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

        {!entrandoEmJogo && usuarioLogado && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-zinc-500">Jogador 1</p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200">
                {fotoUsuario(usuarioLogado) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fotoUsuario(usuarioLogado)}
                    alt={nomeUsuario(usuarioLogado)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-zinc-800">
                    {nomeUsuario(usuarioLogado).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-zinc-700">
                  {nomeUsuario(usuarioLogado)}
                </p>
              </div>
            </div>
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
                      {busca.trim().length < 2 ? (
                        <p className="px-2 py-2 text-sm text-zinc-500">
                          Digite pelo menos 2 letras para buscar jogadores.
                        </p>
                      ) : usuariosFiltrados.length === 0 ? (
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
            disabled={desabilitarBotaoPrincipal}
            onClick={confirmar}
            className={
              jaParticipa
                ? "h-11 w-full bg-red-600 text-white hover:bg-red-700"
                : "h-11 w-full"
            }
          >
            {textoBotaoPrincipal}
          </Button>

          {podeCancelarJogoInteiro && (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={cancelarJogoSelecionado}
              className="h-11 w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              Cancelar jogo inteiro
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 w-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
