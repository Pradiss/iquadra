export type Usuario = {
  id: string;
  nome: string;
  foto_perfil?: string | null;
  perfil_cliente?: {
    categoria?: string | null;
  } | null;
};

export type Academia = {
  nome?: string;
  cidade?: string;
  estado?: string;
};

export type Participante = {
  id?: string;
  usuario_id?: string;
  status?: string;
  nome?: string;
  foto_perfil?: string | null;
  categoria?: string | null;
  usuario?: Usuario;
};

export type Jogo = {
  id: string;
  data?: string;
  inicio_em?: string;
  fim_em?: string;
  status?: string;
  tipo_jogo?: "SIMPLES" | "DUPLA";
  maximo_participantes?: number;
  observacoes?: string | null;
  criado_por_usuario_id?: string;
  responsavel_usuario_id?: string;
  academia?: Academia;
  quadra?: {
    id?: string;
    nome?: string;
    academia?: Academia;
  };
  horario_quadra?: {
    hora_inicio?: string;
    hora_fim?: string;
  };
  participantes?: Participante[];
};

export type Convite = {
  id: string;
  status?: string;
  jogo?: Jogo;
};

export function getInicioJogo(jogo?: Jogo) {
  return jogo?.inicio_em ?? jogo?.data ?? "";
}

export function getTimestampJogo(jogo?: Jogo) {
  const inicio = getInicioJogo(jogo);
  if (!inicio) return 0;

  const timestamp = new Date(inicio).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function isJogoFuturo(jogo: Jogo) {
  const timestamp = getTimestampJogo(jogo);

  return timestamp > 0 && timestamp >= Date.now();
}

export function isStatusHistorico(status?: string) {
  return ["CANCELADO", "CONCLUIDO", "NAO_COMPARECEU"].includes(status ?? "");
}

export function isJogoPendente(jogo: Jogo) {
  return (
    isJogoFuturo(jogo) &&
    ["ABERTO", "SEM_PARTICIPANTES"].includes(jogo.status ?? "")
  );
}

export function formatDataJogo(jogo?: Jogo) {
  const inicio = getInicioJogo(jogo);
  if (!inicio) return "Data não informada";

  const data = new Date(inicio);
  if (!Number.isFinite(data.getTime())) return inicio;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
}

export function formatHora(valor?: string) {
  if (!valor) return "";
  if (/^\d{2}:\d{2}/.test(valor)) return valor.slice(0, 5);

  const data = new Date(valor);
  if (!Number.isFinite(data.getTime())) return valor;

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

export function formatHorarioJogo(jogo?: Jogo) {
  const inicio = formatHora(jogo?.horario_quadra?.hora_inicio ?? jogo?.inicio_em);
  const fim = formatHora(jogo?.horario_quadra?.hora_fim ?? jogo?.fim_em);

  if (!inicio && !fim) return "Horário não informado";
  if (!fim) return inicio;

  return `${inicio} - ${fim}`;
}

export function formatStatus(status?: string) {
  const labels: Record<string, string> = {
    ABERTO: "Pendente",
    COMPLETO: "Completo",
    CANCELADO: "Cancelado",
    CONCLUIDO: "Concluído",
    SEM_PARTICIPANTES: "Sem participantes",
    NAO_COMPARECEU: "Não compareceu",
  };

  return labels[status ?? ""] ?? "Pendente";
}

export function isUsuarioNoJogo(jogo: Jogo, usuarioId: string) {
  return (
    jogo.criado_por_usuario_id === usuarioId ||
    jogo.responsavel_usuario_id === usuarioId ||
    jogo.participantes?.some(
      (participante) =>
        participante.usuario_id === usuarioId ||
        participante.usuario?.id === usuarioId
    )
  );
}

export function sortJogosAsc(a: Jogo, b: Jogo) {
  return getTimestampJogo(a) - getTimestampJogo(b);
}

export function sortJogosDesc(a: Jogo, b: Jogo) {
  return getTimestampJogo(b) - getTimestampJogo(a);
}
