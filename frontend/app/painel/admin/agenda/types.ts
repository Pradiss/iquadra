import type {
  QuadraAgenda,
  TipoJogoAgenda,
  UsuarioBusca,
} from "@/services/admin-agenda";

export type TipoLinha = "LIVRE" | "JOGO" | "AULA" | "BLOQUEIO" | "PENDENTE";

export type FiltroTipo = "TODOS" | TipoLinha;

export type FiltroStatus =
  | "TODOS"
  | "DISPONIVEL"
  | "CONFIRMADO"
  | "PENDENTE"
  | "BLOQUEADO";

export type TipoNovoEvento = "PARTIDA" | "AULA" | "EVENTO";

export type BuscaUsuarioModo =
  | "PARTICIPANTE"
  | "PROFESSOR"
  | "CLIENTE"
  | null;

export type LinhaAgenda = {
  id: string;
  tipo: TipoLinha;
  status: FiltroStatus;
  quadraId: string;
  quadraNome: string;
  modalidade?: string | null;
  inicio: string;
  fim: string;
  titulo: string;
  subtitulo: string;
  etiqueta: string;
  participantes: string[];
  jogoId?: string;
  aulaId?: string;
  bloqueioId?: string;
};

export type FormEvento = {
  tipo: TipoNovoEvento;
  quadraId: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipoJogo: TipoJogoAgenda;
  participantes: UsuarioBusca[];
  professor?: UsuarioBusca;
  cliente?: UsuarioBusca;
  observacoes: string;
  motivo: string;
};

export type LinhaPorQuadra = {
  quadra: QuadraAgenda;
  items: LinhaAgenda[];
};