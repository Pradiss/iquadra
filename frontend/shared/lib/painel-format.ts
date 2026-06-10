import axios from "axios"
import type { EmpresaMarketplace } from "../types/empresa"

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}

export function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? ""
}

export function getFirstName(nome?: string) {
  return nome?.trim().split(" ")[0] || "Jogador"
}

export function getInitials(nome?: string) {
  if (!nome) {
    return "IQ"
  }

  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("")
}

export function buildIsoDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString()
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function formatPeriodo(inicio: string, fim: string) {
  return `${formatTime(inicio)} - ${formatTime(fim)}`
}

export function formatTipoPiso(tipo?: string) {
  const labels: Record<string, string> = {
    SAIBRO: "Saibro",
    HARD: "Hard",
    GRAMA: "Grama",
    SINTETICA: "Sintetica",
    AREIA: "Areia",
    OUTRO: "Outro piso",
  }

  return labels[tipo ?? ""] ?? tipo ?? "Piso nao informado"
}

export function formatLocation(
  entity?:
    | Pick<EmpresaMarketplace, "cidade" | "estado" | "endereco">
    | null
) {
  const cidadeEstado = [entity?.cidade, entity?.estado].filter(Boolean).join(" - ")

  if (entity?.endereco && cidadeEstado) {
    return `${cidadeEstado} - ${entity.endereco}`
  }

  return cidadeEstado || entity?.endereco || "Localizacao nao informada"
}

export function sortAcademiasByPreference(
  academias: EmpresaMarketplace[],
  cidadeUsuario?: string | null
) {
  const cidadeNormalizada = normalizeText(cidadeUsuario)

  return [...academias].sort((primeira, segunda) => {
    const prioridadePrimeira =
      (cidadeNormalizada &&
      normalizeText(primeira.cidade) === cidadeNormalizada
        ? 2
        : 0) + (primeira.agendaPronta ? 1 : 0)
    const prioridadeSegunda =
      (cidadeNormalizada &&
      normalizeText(segunda.cidade) === cidadeNormalizada
        ? 2
        : 0) + (segunda.agendaPronta ? 1 : 0)

    if (prioridadePrimeira !== prioridadeSegunda) {
      return prioridadeSegunda - prioridadePrimeira
    }

    return primeira.nome.localeCompare(segunda.nome, "pt-BR")
  })
}
