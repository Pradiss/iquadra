import type { FiltroStatus, FiltroTipo } from "./types";

export const tipoOptions: { value: FiltroTipo; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "LIVRE", label: "Horário livre" },
  { value: "JOGO", label: "Jogo" },
  { value: "AULA", label: "Aula" },
  { value: "BLOQUEIO", label: "Bloqueio/Evento" },
  { value: "PENDENTE", label: "Reserva pendente" },
];

export const statusOptions: { value: FiltroStatus; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "CONFIRMADO", label: "Confirmado" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "BLOQUEADO", label: "Bloqueado" },
];