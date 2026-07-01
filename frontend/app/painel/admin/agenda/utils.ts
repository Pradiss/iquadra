import { getUsuario } from "@/lib/auth-storage";
import { getAdminAcademias } from "@/lib/user-role";
import type { AcademiaBusca } from "@/components/jogador/painel/academia-search-modal";

import type { FormEvento, TipoLinha } from "./types";

export function getHoje() {
  return formatDateOnly(new Date());
}

export function formatDateOnly(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function parseDateOnly(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: string, days: number) {
  const parsed = parseDateOnly(date);
  parsed.setDate(parsed.getDate() + days);
  return formatDateOnly(parsed);
}

export function getWeekDays(date: string) {
  const selected = parseDateOnly(date);
  const start = new Date(selected);
  start.setDate(selected.getDate() - selected.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const item = new Date(start);
    item.setDate(start.getDate() + index);
    return formatDateOnly(item);
  });
}

export function timeToMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const remaining = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${remaining}`;
}

export function formatModalidade(value?: string | null) {
  if (!value) return "";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatMonth(date: string) {
  return parseDateOnly(date)
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "")
    .toUpperCase();
}

export function formatWeekday(date: string) {
  return parseDateOnly(date)
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "")
    .slice(0, 1)
    .toUpperCase();
}

export function getErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return "Não foi possível concluir a ação.";
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
    maybeApiError.response?.data?.message ||
    maybeApiError.message ||
    "Não foi possível concluir a ação."
  );
}

export function montarAcademiasAdmin() {
  const usuario = getUsuario();
  const vinculos = getAdminAcademias(usuario);

  return vinculos
    .map((vinculo, index): AcademiaBusca => {
      const academia = vinculo.academia;

      return {
        id:
          vinculo.academia_id ||
          academia?.id ||
          vinculo.id ||
          `academia-admin-${index}`,
        nome: academia?.nome || `Academia ${index + 1}`,
        cidade: academia?.cidade,
        estado: academia?.estado,
      };
    })
    .filter((academia) => Boolean(academia.id));
}

export function createInitialForm(data: string, quadraId = ""): FormEvento {
  return {
    tipo: "PARTIDA",
    quadraId,
    data,
    horaInicio: "08:00",
    horaFim: "09:00",
    tipoJogo: "SIMPLES",
    participantes: [],
    observacoes: "",
    motivo: "Evento",
  };
}

export function setFormEndByDuration(form: FormEvento, duration: number) {
  return {
    ...form,
    horaFim: minutesToTime(timeToMinutes(form.horaInicio) + duration),
  };
}

export function getLinhaClasses(tipo: TipoLinha) {
  if (tipo === "JOGO") return "bg-blue-100 text-blue-950";
  if (tipo === "AULA") return "bg-green-100 text-green-950";
  if (tipo === "BLOQUEIO") return "bg-red-100 text-red-950";
  if (tipo === "PENDENTE") return "bg-yellow-100 text-yellow-950";
  return "bg-zinc-200 text-zinc-950";
}

export function getEtiquetaClasses(tipo: TipoLinha) {
  if (tipo === "JOGO") return "bg-blue-200 text-blue-800";
  if (tipo === "AULA") return "bg-green-200 text-green-800";
  if (tipo === "BLOQUEIO") return "bg-red-200 text-red-800";
  if (tipo === "PENDENTE") return "bg-yellow-200 text-yellow-800";
  return "bg-white/70 text-zinc-700";
}