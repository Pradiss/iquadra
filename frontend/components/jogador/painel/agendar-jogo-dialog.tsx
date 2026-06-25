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

type DuracaoReserva = 60 | 90 | 120;

type EventoOcupado = {
  tipo: "JOGO" | "AULA" | "BLOQUEIO";
  id: string;
  inicio: string;
  fim: string;
};

export type QuadraReservaOpcao = {
  id: string;
  nome: string;
  capacidade_maxima?: number;
  permite_simples?: boolean;
  permite_dupla?: boolean;
  aberta?: boolean;
  motivo?: string | null;
  abre_as?: string | null;
  fecha_as?: string | null;
  intervalo_entre_reservas_minutos?: number;
  granularidade_agendamento_minutos?: number;
  duracoes_reserva_minutos?: DuracaoReserva[];
  eventos_ocupados?: EventoOcupado[];
};

type HorarioSelecionado = {
  id: string;
  hora: string;
  fim?: string;
  duracaoMinutos?: DuracaoReserva;
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
  quadras?: QuadraReservaOpcao[];
  data: string;
  academiaId: string;
  onSuccess?: () => void;
};

const DURACOES_PADRAO: DuracaoReserva[] = [60, 90, 120];
const GRANULARIDADE_PADRAO_MINUTOS = 5;
const INTERVALO_PADRAO_MINUTOS = 10;

function timeToMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const remainingMinutes = (minutes % 60).toString().padStart(2, "0");

  return `${hours}:${remainingMinutes}`;
}

function addMinutesToTime(time: string, minutes: number) {
  return minutesToTime(timeToMinutes(time) + minutes);
}

function roundUpToGranularity(minutes: number, granularity: number) {
  return Math.ceil(minutes / granularity) * granularity;
}

function getMinutosAgora(granularity: number) {
  const agora = new Date();
  return roundUpToGranularity(
    agora.getHours() * 60 + agora.getMinutes() + 1,
    granularity,
  );
}

function getMinHoraParaData(data: string, granularity: number) {
  const agora = new Date();
  const hoje = [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, "0"),
    String(agora.getDate()).padStart(2, "0"),
  ].join("-");

  if (data !== hoje) return null;

  const minutos = getMinutosAgora(granularity);
  return minutos >= 24 * 60 ? null : minutesToTime(minutos);
}

function normalizarDuracoes(duracoes?: number[] | null): DuracaoReserva[] {
  const permitidas = new Set(DURACOES_PADRAO);
  const normalizadas = (duracoes ?? []).filter((duracao) =>
    permitidas.has(duracao as DuracaoReserva),
  ) as DuracaoReserva[];

  return normalizadas.length > 0 ? normalizadas : DURACOES_PADRAO;
}

function validarConflitoLocal(
  eventos: EventoOcupado[],
  horaInicio: string,
  horaFim: string,
  intervaloMinutos: number,
) {
  const inicioMinutos = timeToMinutes(horaInicio);
  const fimMinutos = timeToMinutes(horaFim);

  return eventos.some((evento) => {
    const eventoInicio = timeToMinutes(evento.inicio);
    const eventoFim = timeToMinutes(evento.fim);

    return (
      eventoInicio < fimMinutos + intervaloMinutos &&
      eventoFim > inicioMinutos - intervaloMinutos
    );
  });
}

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
  quadras = [],
  data,
  academiaId,
  onSuccess,
}: Props) {
  const [tipoJogo, setTipoJogo] = useState<"SIMPLES" | "DUPLA">("SIMPLES");
  const [quadraReservaId, setQuadraReservaId] = useState("");
  const [horaInicioReserva, setHoraInicioReserva] = useState("");
  const [duracaoReserva, setDuracaoReserva] =
    useState<DuracaoReserva>(DURACOES_PADRAO[0]);
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
  const quadraReserva = useMemo(() => {
    return (
      quadras.find((quadra) => quadra.id === quadraReservaId) ??
      quadras.find((quadra) => quadra.id === horario?.quadraId) ??
      null
    );
  }, [horario?.quadraId, quadraReservaId, quadras]);
  const duracoesReserva = useMemo(
    () => normalizarDuracoes(quadraReserva?.duracoes_reserva_minutos),
    [quadraReserva?.duracoes_reserva_minutos],
  );
  const duracaoReservaAtual = duracoesReserva.includes(duracaoReserva)
    ? duracaoReserva
    : (duracoesReserva[0] ?? DURACOES_PADRAO[0]);
  const granularidadeReserva =
    quadraReserva?.granularidade_agendamento_minutos ??
    GRANULARIDADE_PADRAO_MINUTOS;
  const intervaloReserva =
    quadraReserva?.intervalo_entre_reservas_minutos ??
    INTERVALO_PADRAO_MINUTOS;
  const minHoraHoje = getMinHoraParaData(data, granularidadeReserva);
  const horaMinimaReserva =
    minHoraHoje && quadraReserva?.abre_as
      ? minutesToTime(
          Math.max(
            timeToMinutes(minHoraHoje),
            timeToMinutes(quadraReserva.abre_as),
          ),
        )
      : (minHoraHoje ?? quadraReserva?.abre_as ?? undefined);
  const horaInicioReservaAtual = useMemo(() => {
    const fallback = horaMinimaReserva ?? quadraReserva?.abre_as ?? "";

    if (!horaInicioReserva) return fallback;
    if (
      horaMinimaReserva &&
      timeToMinutes(horaInicioReserva) < timeToMinutes(horaMinimaReserva)
    ) {
      return horaMinimaReserva;
    }

    return horaInicioReserva;
  }, [horaInicioReserva, horaMinimaReserva, quadraReserva?.abre_as]);
  const horaFimReserva = horaInicioReservaAtual
    ? addMinutesToTime(horaInicioReservaAtual, duracaoReservaAtual)
    : "";
  const permiteSimplesAtual = entrandoEmJogo
    ? (horario?.permiteSimples ?? true)
    : (quadraReserva?.permite_simples ?? horario?.permiteSimples ?? true);
  const permiteDuplaAtual = entrandoEmJogo
    ? (horario?.permiteDupla ?? true)
    : (quadraReserva?.permite_dupla ?? horario?.permiteDupla ?? true);
  const erroValidacaoReserva = useMemo(() => {
    if (entrandoEmJogo) return "";
    if (!quadraReserva) return "Selecione uma quadra.";
    if (!quadraReserva.aberta) {
      return quadraReserva.motivo || "Quadra fechada nesta data.";
    }
    if (!quadraReserva.abre_as || !quadraReserva.fecha_as) {
      return "Quadra sem horário configurado para esta data.";
    }
    if (!horaInicioReservaAtual) return "Informe o horário inicial.";
    if (tipoJogo === "SIMPLES" && !permiteSimplesAtual) {
      return "Esta quadra não permite jogo simples.";
    }
    if (tipoJogo === "DUPLA" && !permiteDuplaAtual) {
      return "Esta quadra não permite jogo em dupla.";
    }

    const inicioMinutos = timeToMinutes(horaInicioReservaAtual);
    const fimMinutos = timeToMinutes(horaFimReserva);
    const abreMinutos = timeToMinutes(quadraReserva.abre_as);
    const fechaMinutos = timeToMinutes(quadraReserva.fecha_as);

    if (inicioMinutos % granularidadeReserva !== 0) {
      return `Escolha horários em intervalos de ${granularidadeReserva} minutos.`;
    }

    if (inicioMinutos < abreMinutos || fimMinutos > fechaMinutos) {
      return `Reserva deve ficar entre ${quadraReserva.abre_as} e ${quadraReserva.fecha_as}.`;
    }

    if (minHoraHoje && inicioMinutos < timeToMinutes(minHoraHoje)) {
      return "Escolha um horário futuro para hoje.";
    }

    if (
      validarConflitoLocal(
        quadraReserva.eventos_ocupados ?? [],
        horaInicioReservaAtual,
        horaFimReserva,
        intervaloReserva,
      )
    ) {
      return `Este horário conflita com outra reserva ou com o intervalo de ${intervaloReserva} minutos.`;
    }

    return "";
  }, [
    entrandoEmJogo,
    granularidadeReserva,
    horaFimReserva,
    horaInicioReservaAtual,
    intervaloReserva,
    minHoraHoje,
    permiteDuplaAtual,
    permiteSimplesAtual,
    quadraReserva,
    tipoJogo,
  ]);
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
      setQuadraReservaId(horario.quadraId);
      setHoraInicioReserva(horario.hora);
      setDuracaoReserva(horario.duracaoMinutos ?? DURACOES_PADRAO[0]);
      setTipoJogo(horario.permiteSimples ? "SIMPLES" : "DUPLA");
      setUsuarios([]);
    }, 0);

    return () => {
      ativo = false;
      window.clearTimeout(timeoutId);
    };
  }, [open, horario, podeGerenciarParticipantes]);

  useEffect(() => {
    if (!open || !horario || buscandoIndex === null) return;
    if (horario.jogoId && !podeGerenciarParticipantes) return;

    const termo = busca.trim();

    if (termo.length < 2) {
      return;
    }

    let ativo = true;
    const timeoutId = window.setTimeout(() => {
      listarUsuarios(termo)
        .then((res) => {
          if (ativo) setUsuarios(normalizarUsuarios(res));
        })
        .catch(() => {
          if (ativo) setUsuarios([]);
        });
    }, 250);

    return () => {
      ativo = false;
      window.clearTimeout(timeoutId);
    };
  }, [busca, buscandoIndex, horario, open, podeGerenciarParticipantes]);

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

    if (!horario.jogoId && (erroValidacaoReserva || !quadraReserva)) {
      setErro(erroValidacaoReserva || "Selecione uma quadra.");
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
        const payload = {
          academia_id: academiaId,
          quadra_id: quadraReserva!.id,
          tipo_jogo: tipoJogo,
          data,
          hora_inicio: horaInicioReservaAtual,
          duracao_minutos: duracaoReservaAtual,
        };
        const jogo = await criarJogo({
          ...payload,
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
      : "Agendar jogo";
  const descricao = entrandoEmJogo
    ? "Confira os jogadores confirmados neste horário."
    : "Ajuste a reserva e convide os jogadores.";
  const textoBotaoPrincipal = loading
    ? "Confirmando..."
    : jaParticipa
      ? "Sair do jogo"
      : entrandoEmJogo
        ? temVaga
          ? "Entrar no jogo"
          : "Jogo completo"
        : "Confirmar reserva";
  const desabilitarBotaoPrincipal =
    loading ||
    !horario ||
    (entrandoEmJogo && !jaParticipa && !temVaga) ||
    (!entrandoEmJogo && Boolean(erroValidacaoReserva));

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
                {entrandoEmJogo
                  ? horario.quadraNome
                  : (quadraReserva?.nome ?? horario.quadraNome)}
              </div>

              <div className="flex items-center gap-2 text-zinc-600">
                <CalendarDays className="h-4 w-4" />
                {formatarData(data)}
              </div>

              <div className="flex items-center gap-2 text-zinc-600">
                <Clock className="h-4 w-4" />
                {entrandoEmJogo
                  ? `${horario.hora}${horario.fim ? ` até ${horario.fim}` : ""}`
                  : `${horaInicioReservaAtual || "--:--"} até ${
                      horaFimReserva || "--:--"
                    }`}
              </div>
            </div>
          </div>
        )}

        {!entrandoEmJogo && horario && (
          <div className="grid gap-3 rounded-2xl border border-zinc-200 p-3">
            <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
              Quadra
              <select
                value={quadraReserva?.id ?? ""}
                onChange={(event) => {
                  const proximaQuadra = quadras.find(
                    (quadra) => quadra.id === event.target.value,
                  );

                  setQuadraReservaId(event.target.value);
                  if (
                    tipoJogo === "SIMPLES" &&
                    proximaQuadra?.permite_simples === false &&
                    proximaQuadra?.permite_dupla !== false
                  ) {
                    setTipoJogo("DUPLA");
                  } else if (
                    tipoJogo === "DUPLA" &&
                    proximaQuadra?.permite_dupla === false &&
                    proximaQuadra?.permite_simples !== false
                  ) {
                    setTipoJogo("SIMPLES");
                  }
                  setErro("");
                }}
                disabled={loading || quadras.length === 0}
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition focus:border-green-700"
              >
                {quadras.length === 0 ? (
                  <option value="">Nenhuma quadra</option>
                ) : (
                  quadras.map((quadra) => (
                    <option key={quadra.id} value={quadra.id}>
                      {quadra.nome}
                    </option>
                  ))
                )}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
                Início
                <input
                  type="time"
                  value={horaInicioReservaAtual}
                  min={horaMinimaReserva}
                  max={quadraReserva?.fecha_as ?? undefined}
                  step={granularidadeReserva * 60}
                  onChange={(event) => {
                    setHoraInicioReserva(event.target.value);
                    setErro("");
                  }}
                  disabled={loading || !quadraReserva?.aberta}
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition focus:border-green-700"
                />
              </label>

              <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700">
                <span className="block text-xs text-zinc-500">Final</span>
                {horaFimReserva || "--:--"}
              </div>
            </div>

            <div className="grid gap-1.5">
              <span className="text-sm font-bold text-zinc-700">Duração</span>
              <div className="grid grid-cols-3 gap-2">
                {duracoesReserva.map((duracao) => (
                  <button
                    key={duracao}
                    type="button"
                    onClick={() => {
                      setDuracaoReserva(duracao);
                      setErro("");
                    }}
                    className={[
                      "h-10 rounded-xl border text-sm font-black transition",
                      duracaoReservaAtual === duracao
                        ? "border-green-800 bg-green-800 text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-green-700",
                    ].join(" ")}
                  >
                    {duracao} min
                  </button>
                ))}
              </div>
            </div>

            {erroValidacaoReserva && (
              <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">
                {erroValidacaoReserva}
              </p>
            )}
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
              disabled={!permiteSimplesAtual}
              onClick={() => setTipoJogo("SIMPLES")}
            >
              Simples
            </Button>

            <Button
              type="button"
              variant={tipoJogo === "DUPLA" ? "default" : "outline"}
              disabled={!permiteDuplaAtual}
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
