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

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type UsuarioAcademia = {
  academia_id?: string;
  perfil?: string;
  status?: string;
  academia?: { id?: string } | null;
};

type Usuario = {
  id: string;
  nome?: string;
  name?: string;
  email?: string;
  foto_perfil?: string | null;
  perfil_cliente?: { categoria?: string | null } | null;
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
    perfil_cliente?: { categoria?: string | null } | null;
  };
};

type DuracaoReserva = 60 | 90 | 120;
type TipoJogo = "SIMPLES" | "DUPLA";
type BuscaIndex = number | "existente" | null;

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
  tipoJogo?: TipoJogo;
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

function timeToMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const remainingMinutes = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${remainingMinutes}`;
}

function addMinutesToTime(time: string, minutes: number) {
  return minutesToTime(timeToMinutes(time) + minutes);
}

function roundUpToGranularity(minutes: number, granularity: number) {
  return Math.ceil(minutes / granularity) * granularity;
}

function getMinHoraParaData(data: string, granularity: number) {
  const agora = new Date();
  const hoje = [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, "0"),
    String(agora.getDate()).padStart(2, "0"),
  ].join("-");

  if (data !== hoje) return null;

  const minutos = roundUpToGranularity(
    agora.getHours() * 60 + agora.getMinutes() + 1,
    granularity,
  );

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
) {
  const inicioMinutos = timeToMinutes(horaInicio);
  const fimMinutos = timeToMinutes(horaFim);

  return eventos.some((evento) => {
    const eventoInicio = timeToMinutes(evento.inicio);
    const eventoFim = timeToMinutes(evento.fim);

    return eventoInicio < fimMinutos && eventoFim > inicioMinutos;
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
  const jogo = response as { participantes?: Participante[] };

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

  if (typeof error !== "object" || error === null) return fallback;

  const maybeApiError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return maybeApiError.response?.data?.message || maybeApiError.message || fallback;
}

function usuarioEhAdminDaAcademia(usuario: Usuario | null, academiaId: string) {
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

function PlayerAvatar({
  nome,
  foto,
  icon,
}: {
  nome: string;
  foto?: string | null;
  icon?: React.ReactNode;
}) {
  const url = getSafeImageUrl(foto);

  return (
    <Avatar className="h-9 w-9">
      {url ? <AvatarImage src={url} alt={nome} /> : null}
      <AvatarFallback className="bg-zinc-200 text-xs font-black text-zinc-800">
        {icon ?? nome.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function PlayerRow({
  participante,
  usuario,
  placeholder,
  action,
}: {
  participante?: Participante;
  usuario?: Usuario | null;
  placeholder?: string;
  action?: React.ReactNode;
}) {
  const nome = participante?.nome || (usuario ? nomeUsuario(usuario) : placeholder) || "Jogador";
  const foto = participante?.foto_perfil ?? usuario?.foto_perfil;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-2 text-sm font-semibold text-zinc-700">
      <PlayerAvatar nome={nome} foto={foto} icon={!participante && !usuario ? <Plus className="h-4 w-4" /> : undefined} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{nome}</p>
        {participante?.categoria ? (
          <p className="truncate text-xs font-bold text-zinc-500">
            {participante.categoria}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function UserSearchBox({
  busca,
  loading,
  usuarios,
  onBuscaChange,
  onClose,
  onSelect,
  placeholder = "Buscar jogador",
}: {
  busca: string;
  loading: boolean;
  usuarios: Usuario[];
  onBuscaChange: (value: string) => void;
  onClose: () => void;
  onSelect: (usuario: Usuario) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          autoFocus
          value={busca}
          onChange={(event) => onBuscaChange(event.target.value)}
          placeholder={placeholder}
          className="pr-9"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="max-h-40 rounded-xl border border-zinc-200 bg-white p-2">
        {busca.trim().length < 2 ? (
          <p className="px-2 py-2 text-sm text-zinc-500">
            Digite pelo menos 2 letras para buscar jogadores.
          </p>
        ) : usuarios.length === 0 ? (
          <p className="px-2 py-2 text-sm text-zinc-500">
            Nenhum jogador encontrado.
          </p>
        ) : (
          usuarios.map((usuario) => (
            <Button
              key={usuario.id}
              type="button"
              variant="ghost"
              disabled={loading}
              onClick={() => onSelect(usuario)}
              className="mb-1 h-auto w-full justify-start gap-2 py-2"
            >
              <PlayerAvatar nome={nomeUsuario(usuario)} foto={usuario.foto_perfil} />
              <span className="truncate">{nomeUsuario(usuario)}</span>
            </Button>
          ))
        )}
      </ScrollArea>
    </div>
  );
}

function InfoCard({
  horario,
  data,
  entrandoEmJogo,
  quadraNome,
  horaInicio,
  horaFim,
}: {
  horario: HorarioSelecionado;
  data: string;
  entrandoEmJogo: boolean;
  quadraNome: string;
  horaInicio: string;
  horaFim: string;
}) {
  return (
    <Card className="bg-zinc-50 shadow-none">
      <CardContent className="grid gap-1 text-sm">
        <div className="flex items-center gap-2 font-bold text-zinc-900">
          <MapPin className="h-4 w-4 text-green-700" />
          {quadraNome}
        </div>
        <div className="flex items-center gap-2 text-zinc-600">
          <CalendarDays className="h-4 w-4" />
          {formatarData(data)}
        </div>
        <div className="flex items-center gap-2 text-zinc-600">
          <Clock className="h-4 w-4" />
          {entrandoEmJogo
            ? `${horario.hora}${horario.fim ? ` até ${horario.fim}` : ""}`
            : `${horaInicio || "--:--"} até ${horaFim || "--:--"}`}
        </div>
      </CardContent>
    </Card>
  );
}

function ReservationForm({
  quadras,
  quadraReserva,
  quadraReservaId,
  horaInicioReservaAtual,
  horaMinimaReserva,
  horaFimReserva,
  granularidadeReserva,
  duracoesReserva,
  duracaoReservaAtual,
  tipoJogo,
  permiteSimplesAtual,
  permiteDuplaAtual,
  loading,
  erroValidacaoReserva,
  onQuadraChange,
  onHoraChange,
  onDuracaoChange,
  onTipoJogoChange,
}: {
  quadras: QuadraReservaOpcao[];
  quadraReserva: QuadraReservaOpcao | null;
  quadraReservaId: string;
  horaInicioReservaAtual: string;
  horaMinimaReserva?: string;
  horaFimReserva: string;
  granularidadeReserva: number;
  duracoesReserva: DuracaoReserva[];
  duracaoReservaAtual: DuracaoReserva;
  tipoJogo: TipoJogo;
  permiteSimplesAtual: boolean;
  permiteDuplaAtual: boolean;
  loading: boolean;
  erroValidacaoReserva: string;
  onQuadraChange: (quadraId: string) => void;
  onHoraChange: (hora: string) => void;
  onDuracaoChange: (duracao: DuracaoReserva) => void;
  onTipoJogoChange: (tipo: TipoJogo) => void;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="grid gap-4 ">
        {/* {quadras.length > 1 ? (
          <div className="grid gap-1.5">
            <Label>Quadra</Label>
            <Select
              value={quadraReservaId || quadraReserva?.id || ""}
              disabled={loading || quadras.length === 0}
              onValueChange={onQuadraChange}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Selecione uma quadra" />
              </SelectTrigger>
              <SelectContent>
                {quadras.map((quadra) => (
                  <SelectItem key={quadra.id} value={quadra.id}>
                    {quadra.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null} */}

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="grid gap-1.5">
            <Label>Início</Label>
            <Input
              type="time"
              value={horaInicioReservaAtual}
              min={horaMinimaReserva}
              max={quadraReserva?.fecha_as ?? undefined}
              step={granularidadeReserva * 60}
              disabled={loading || !quadraReserva?.aberta}
              onChange={(event) => onHoraChange(event.target.value)}
              className="h-11 rounded-xl font-semibold"
            />
          </div>

          <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700">
            <span className="block text-xs text-zinc-500">Final</span>
            {horaFimReserva || "--:--"}
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label>Duração</Label>
          <ToggleGroup
            type="single"
            value={String(duracaoReservaAtual)}
            onValueChange={(value) => value && onDuracaoChange(Number(value) as DuracaoReserva)}
            className="grid grid-cols-3 gap-2"
          >
            {duracoesReserva.map((duracao) => (
              <ToggleGroupItem
                key={duracao}
                value={String(duracao)}
                className="h-10 rounded-xl border text-sm font-black data-[state=on]:bg-green-800 data-[state=on]:text-white"
              >
                {duracao} min
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="grid gap-1.5">
          <Label>Tipo de jogo</Label>
          <RadioGroup
            value={tipoJogo}
            onValueChange={(value) => onTipoJogoChange(value as TipoJogo)}
            className="grid grid-cols-2 gap-2"
          >
            <Label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border has-[:checked]:border-green-800 has-[:checked]:bg-green-800 has-[:checked]:text-white">
              <RadioGroupItem value="SIMPLES" disabled={!permiteSimplesAtual} />
              Simples
            </Label>
            <Label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border has-[:checked]:border-green-800 has-[:checked]:bg-green-800 has-[:checked]:text-white">
              <RadioGroupItem value="DUPLA" disabled={!permiteDuplaAtual} />
              Dupla
            </Label>
          </RadioGroup>
        </div>

        {erroValidacaoReserva ? (
          <Alert variant="destructive">
            <AlertDescription>{erroValidacaoReserva}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ExistingGameParticipants({
  participantes,
  jogadoresConfirmados,
  maximoParticipantes,
  podeGerenciarParticipantes,
  podeAdicionarParticipante,
  usuarioLogadoId,
  loading,
  buscando,
  busca,
  usuariosFiltrados,
  onOpenSearch,
  onCloseSearch,
  onBuscaChange,
  onSelectUsuario,
  onRemoveParticipante,
}: {
  participantes: Participante[];
  jogadoresConfirmados: number;
  maximoParticipantes: number;
  podeGerenciarParticipantes: boolean;
  podeAdicionarParticipante: boolean;
  usuarioLogadoId?: string;
  loading: boolean;
  buscando: boolean;
  busca: string;
  usuariosFiltrados: Usuario[];
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onBuscaChange: (value: string) => void;
  onSelectUsuario: (usuario: Usuario) => void;
  onRemoveParticipante: (usuarioId: string) => void;
}) {
  return (
    <Card className="bg-zinc-50 shadow-none">
      <CardContent className="space-y-3 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-zinc-500">Jogadores confirmados</p>
          <span className="text-xs font-black text-zinc-700">
            {jogadoresConfirmados}/{maximoParticipantes}
          </span>
        </div>

        <div className="grid gap-2">
          {participantes.length > 0 ? (
            participantes.map((participante) => (
              <PlayerRow
                key={participante.id}
                participante={participante}
                action={
                  podeGerenciarParticipantes && participante.id !== usuarioLogadoId ? (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={loading}
                      onClick={() => onRemoveParticipante(participante.id)}
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

        {podeAdicionarParticipante ? (
          buscando ? (
            <UserSearchBox
              busca={busca}
              loading={loading}
              usuarios={usuariosFiltrados}
              onBuscaChange={onBuscaChange}
              onClose={onCloseSearch}
              onSelect={onSelectUsuario}
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={onOpenSearch}
              className="h-10 w-full"
            >
              Adicionar jogador
            </Button>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}

function InvitePlayers({
  usuarioLogado,
  jogadoresExibidos,
  buscandoIndex,
  busca,
  usuariosFiltrados,
  loading,
  onAbrirBusca,
  onFecharBusca,
  onBuscaChange,
  onSelecionarJogador,
  onRemoverJogador,
}: {
  usuarioLogado: Usuario | null;
  jogadoresExibidos: (Usuario | null)[];
  buscandoIndex: BuscaIndex;
  busca: string;
  usuariosFiltrados: Usuario[];
  loading: boolean;
  onAbrirBusca: (index: number) => void;
  onFecharBusca: () => void;
  onBuscaChange: (value: string) => void;
  onSelecionarJogador: (usuario: Usuario) => void;
  onRemoverJogador: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      {usuarioLogado ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-zinc-500">Jogador 1</p>
          <PlayerRow usuario={usuarioLogado} />
        </div>
      ) : null}

      <Separator />

      {jogadoresExibidos.map((jogador, index) => (
        <div key={index} className="space-y-2">
          {buscandoIndex === index ? (
            <UserSearchBox
              busca={busca}
              loading={loading}
              usuarios={usuariosFiltrados}
              placeholder={`Buscar jogador ${index + 2}`}
              onBuscaChange={onBuscaChange}
              onClose={onFecharBusca}
              onSelect={onSelecionarJogador}
            />
          ) : (
            <PlayerRow
              usuario={jogador}
              placeholder={`Jogador ${index + 2}`}
              action={
                jogador ? (
                  <Button type="button" variant="ghost" onClick={() => onRemoverJogador(index)}>
                    Remover
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" onClick={() => onAbrirBusca(index)}>
                    Adicionar
                  </Button>
                )
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}

function DialogActions({
  loading,
  jaParticipa,
  podeCancelarJogoInteiro,
  disabled,
  textoBotaoPrincipal,
  onConfirmar,
  onCancelarJogo,
  onFechar,
}: {
  loading: boolean;
  jaParticipa: boolean;
  podeCancelarJogoInteiro: boolean;
  disabled: boolean;
  textoBotaoPrincipal: string;
  onConfirmar: () => void;
  onCancelarJogo: () => void;
  onFechar: () => void;
}) {
  return (
    <div className="sticky bottom-0 space-y-2 bg-white pt-3">
      <Button
        type="button"
        disabled={disabled}
        onClick={onConfirmar}
        className={jaParticipa ? "h-11 w-full bg-red-600 text-white hover:bg-red-700" : "h-11 w-full"}
      >
        {textoBotaoPrincipal}
      </Button>

      {podeCancelarJogoInteiro ? (
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={onCancelarJogo}
          className="h-11 w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
        >
          Cancelar jogo inteiro
        </Button>
      ) : null}

      <Button type="button" variant="outline" onClick={onFechar} className="h-11 w-full">
        Fechar
      </Button>
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
  const [tipoJogo, setTipoJogo] = useState<TipoJogo>("SIMPLES");
  const [quadraReservaId, setQuadraReservaId] = useState("");
  const [horaInicioReserva, setHoraInicioReserva] = useState("");
  const [duracaoReserva, setDuracaoReserva] = useState<DuracaoReserva>(DURACOES_PADRAO[0]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [buscandoIndex, setBuscandoIndex] = useState<BuscaIndex>(null);
  const [jogadores, setJogadores] = useState<(Usuario | null)[]>([null, null, null]);
  const [participantesAtuais, setParticipantesAtuais] = useState<Participante[]>([]);
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

  const granularidadeReserva = quadraReserva?.granularidade_agendamento_minutos ?? GRANULARIDADE_PADRAO_MINUTOS;
  const minHoraHoje = getMinHoraParaData(data, granularidadeReserva);

  const horaMinimaReserva =
    minHoraHoje && quadraReserva?.abre_as
      ? minutesToTime(Math.max(timeToMinutes(minHoraHoje), timeToMinutes(quadraReserva.abre_as)))
      : (minHoraHoje ?? quadraReserva?.abre_as ?? undefined);

  const horaInicioReservaAtual = useMemo(() => {
    const fallback = horaMinimaReserva ?? quadraReserva?.abre_as ?? "";

    if (!horaInicioReserva) return fallback;
    if (horaMinimaReserva && timeToMinutes(horaInicioReserva) < timeToMinutes(horaMinimaReserva)) {
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
    if (!quadraReserva.aberta) return quadraReserva.motivo || "Quadra fechada nesta data.";
    if (!quadraReserva.abre_as || !quadraReserva.fecha_as) return "Quadra sem horário configurado para esta data.";
    if (!horaInicioReservaAtual) return "Informe o horário inicial.";
    if (tipoJogo === "SIMPLES" && !permiteSimplesAtual) return "Esta quadra não permite jogo simples.";
    if (tipoJogo === "DUPLA" && !permiteDuplaAtual) return "Esta quadra não permite jogo em dupla.";

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

    if (validarConflitoLocal(quadraReserva.eventos_ocupados ?? [], horaInicioReservaAtual, horaFimReserva)) {
      return "Este horário conflita com outra reserva.";
    }

    return "";
  }, [
    entrandoEmJogo,
    granularidadeReserva,
    horaFimReserva,
    horaInicioReservaAtual,
    minHoraHoje,
    permiteDuplaAtual,
    permiteSimplesAtual,
    quadraReserva,
    tipoJogo,
  ]);

  const maximoParticipantes = horario?.maximoParticipantes ?? (tipoJogo === "SIMPLES" ? 2 : 4);
  const participantes = useMemo(
    () => (entrandoEmJogo ? participantesAtuais : (horario?.participantes ?? [])),
    [entrandoEmJogo, horario?.participantes, participantesAtuais],
  );
  const jogadoresConfirmados = participantes.length;
  const vagasDisponiveis = entrandoEmJogo
    ? Math.max(maximoParticipantes - jogadoresConfirmados, 0)
    : (horario?.vagasDisponiveis ?? Math.max(maximoParticipantes - jogadoresConfirmados, 0));
  const temVaga = vagasDisponiveis > 0;

  const jaParticipa = Boolean(
    usuarioLogado?.id && participantes.some((participante) => participante.id === usuarioLogado.id),
  );
  const usuarioCriador = Boolean(usuarioLogado?.id && horario?.criadorUsuarioId === usuarioLogado.id);
  const podeCancelarJogoInteiro = entrandoEmJogo && (usuarioCriador || usuarioEhAdminDaAcademia(usuarioLogado, academiaId));
  const podeGerenciarParticipantes = podeCancelarJogoInteiro;
  const podeAdicionarParticipante = podeGerenciarParticipantes && temVaga;

  const jogadoresExibidos = jogadores.slice(0, tipoJogo === "SIMPLES" ? 1 : 3);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (termo.length < 2) return [];

    return usuarios
      .filter((usuario) => {
        const nome = nomeUsuario(usuario).toLowerCase();
        const email = usuario.email?.toLowerCase() || "";
        const jaSelecionado = jogadores.some((jogador) => jogador?.id === usuario.id);
        const jaParticipaDoJogo = participantes.some((participante) => participante.id === usuario.id);

        if (usuario.id === usuarioLogado?.id || jaSelecionado || jaParticipaDoJogo) return false;
        return nome.includes(termo) || email.includes(termo);
      })
      .slice(0, 10);
  }, [busca, usuarios, jogadores, participantes, usuarioLogado?.id]);

  useEffect(() => {
    if (!open || !horario) return;

    const timeoutId = window.setTimeout(() => {
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

    return () => window.clearTimeout(timeoutId);
  }, [open, horario]);

  useEffect(() => {
    if (!open || !horario || buscandoIndex === null) return;
    if (horario.jogoId && !podeGerenciarParticipantes) return;

    const termo = busca.trim();
    if (termo.length < 2) return;

    let ativo = true;
    const timeoutId = window.setTimeout(() => {
      listarUsuarios(termo)
        .then((res) => ativo && setUsuarios(normalizarUsuarios(res)))
        .catch(() => ativo && setUsuarios([]));
    }, 250);

    return () => {
      ativo = false;
      window.clearTimeout(timeoutId);
    };
  }, [busca, buscandoIndex, horario, open, podeGerenciarParticipantes]);

  function fecharBusca() {
    setBuscandoIndex(null);
    setBusca("");
  }

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

    setJogadores((atual) => atual.map((item, index) => (index === buscandoIndex ? usuario : item)));
    fecharBusca();
  }

  function removerJogador(index: number) {
    setJogadores((atual) => atual.map((item, i) => (i === index ? null : item)));
  }

  function alterarQuadra(quadraId: string) {
    const proximaQuadra = quadras.find((quadra) => quadra.id === quadraId);

    setQuadraReservaId(quadraId);

    if (tipoJogo === "SIMPLES" && proximaQuadra?.permite_simples === false && proximaQuadra?.permite_dupla !== false) {
      setTipoJogo("DUPLA");
    } else if (tipoJogo === "DUPLA" && proximaQuadra?.permite_dupla === false && proximaQuadra?.permite_simples !== false) {
      setTipoJogo("SIMPLES");
    }

    setErro("");
  }

  async function adicionarJogadorAoJogo(usuario: Usuario) {
    if (!horario?.jogoId) return;

    setLoading(true);
    setErro("");

    try {
      const jogoAtualizado = await adicionarParticipanteJogo(horario.jogoId, usuario.id);
      setParticipantesAtuais(normalizarParticipantesConfirmados(jogoAtualizado));
      fecharBusca();
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
      const jogoAtualizado = await removerParticipanteJogo(horario.jogoId, usuarioId);
      const participantesConfirmados = normalizarParticipantesConfirmados(jogoAtualizado);

      setParticipantesAtuais(participantesConfirmados);
      onSuccess?.();

      if (participantesConfirmados.length === 0) onOpenChange(false);
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
        const jogo = await criarJogo({
          academia_id: academiaId,
          quadra_id: quadraReserva!.id,
          tipo_jogo: tipoJogo,
          data,
          hora_inicio: horaInicioReservaAtual,
          duracao_minutos: duracaoReservaAtual,
        });

        const jogadoresSelecionados = jogadoresExibidos.filter(Boolean) as Usuario[];
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

  const titulo = jaParticipa ? "Sua participação" : entrandoEmJogo ? "Jogo criado" : "Agendar jogo";
  const descricao = entrandoEmJogo ? "Confira os jogadores confirmados neste horário." : "Ajuste a reserva e convide os jogadores.";
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
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px] border-0 p-5 sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white">
            <UsersRound className="h-5 w-5 text-zinc-700" />
          </div>
          <DialogTitle className="text-lg font-black text-zinc-950 ">{titulo}</DialogTitle>
          <p className="text-sm text-zinc-500">{descricao}</p>
        </DialogHeader>

        {horario ? (
          <InfoCard
            horario={horario}
            data={data}
            entrandoEmJogo={entrandoEmJogo}
            quadraNome={entrandoEmJogo ? horario.quadraNome : (quadraReserva?.nome ?? horario.quadraNome)}
            horaInicio={horaInicioReservaAtual}
            horaFim={horaFimReserva}
          />
        ) : null}

        {!entrandoEmJogo && horario ? (
          <ReservationForm
            quadras={quadras}
            quadraReserva={quadraReserva}
            quadraReservaId={quadraReservaId}
            horaInicioReservaAtual={horaInicioReservaAtual}
            horaMinimaReserva={horaMinimaReserva}
            horaFimReserva={horaFimReserva}
            granularidadeReserva={granularidadeReserva}
            duracoesReserva={duracoesReserva}
            duracaoReservaAtual={duracaoReservaAtual}
            tipoJogo={tipoJogo}
            permiteSimplesAtual={permiteSimplesAtual}
            permiteDuplaAtual={permiteDuplaAtual}
            loading={loading}
            erroValidacaoReserva={erroValidacaoReserva}
            onQuadraChange={alterarQuadra}
            onHoraChange={(hora) => {
              setHoraInicioReserva(hora);
              setErro("");
            }}
            onDuracaoChange={(duracao) => {
              setDuracaoReserva(duracao);
              setErro("");
            }}
            onTipoJogoChange={(tipo) => setTipoJogo(tipo)}
          />
        ) : null}

        {entrandoEmJogo ? (
          <ExistingGameParticipants
            participantes={participantes}
            jogadoresConfirmados={jogadoresConfirmados}
            maximoParticipantes={maximoParticipantes}
            podeGerenciarParticipantes={podeGerenciarParticipantes}
            podeAdicionarParticipante={podeAdicionarParticipante}
            usuarioLogadoId={usuarioLogado?.id}
            loading={loading}
            buscando={buscandoIndex === "existente"}
            busca={busca}
            usuariosFiltrados={usuariosFiltrados}
            onOpenSearch={() => abrirBusca("existente")}
            onCloseSearch={fecharBusca}
            onBuscaChange={setBusca}
            onSelectUsuario={selecionarJogador}
            onRemoveParticipante={removerParticipanteSelecionado}
          />
        ) : (
          <InvitePlayers
            usuarioLogado={usuarioLogado}
            jogadoresExibidos={jogadoresExibidos}
            buscandoIndex={buscandoIndex}
            busca={busca}
            usuariosFiltrados={usuariosFiltrados}
            loading={loading}
            onAbrirBusca={abrirBusca}
            onFecharBusca={fecharBusca}
            onBuscaChange={setBusca}
            onSelecionarJogador={selecionarJogador}
            onRemoverJogador={removerJogador}
          />
        )}

        {erro ? (
          <Alert variant="destructive">
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        ) : null}

        <DialogActions
          loading={loading}
          jaParticipa={jaParticipa}
          podeCancelarJogoInteiro={podeCancelarJogoInteiro}
          disabled={desabilitarBotaoPrincipal}
          textoBotaoPrincipal={textoBotaoPrincipal}
          onConfirmar={confirmar}
          onCancelarJogo={cancelarJogoSelecionado}
          onFechar={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
