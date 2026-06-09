import { api, unwrapData, unwrapList } from "./api"
import type {
  AulaAgenda,
  CreateAulaPayload,
  CreateRecorrenciaAulaPayload,
  ListAulasResponse,
  ListRecorrenciasAulaResponse,
  RecorrenciaAula,
} from "../types/aula"

export type ListAulasFilters = {
  academiaId?: string
  quadraId?: string
  professorId?: string
  clienteId?: string
  data?: string
}

export type ListRecorrenciasFilters = {
  academiaId?: string
  quadraId?: string
  professorId?: string
}

export async function listarAulas(
  filters: ListAulasFilters = {}
): Promise<ListAulasResponse> {
  const response = await api.get("/aulas", {
    params: {
      academia_id: filters.academiaId,
      quadra_id: filters.quadraId,
      professor_id: filters.professorId,
      cliente_id: filters.clienteId,
      data: filters.data,
    },
  })

  return {
    aulas: unwrapList<AulaAgenda>(response),
  }
}

export async function buscarAula(aulaId: string) {
  const response = await api.get(`/aulas/${aulaId}`)
  return unwrapData<AulaAgenda>(response)
}

export async function criarAula(data: CreateAulaPayload) {
  const response = await api.post("/aulas", data)
  return unwrapData(response)
}

export async function cancelarAula(aulaId: string) {
  const response = await api.patch(`/aulas/${aulaId}/cancelar`)
  return unwrapData(response)
}

export async function listarRecorrenciasAula(
  filters: ListRecorrenciasFilters = {}
): Promise<ListRecorrenciasAulaResponse> {
  const response = await api.get("/aulas/recorrencias", {
    params: {
      academia_id: filters.academiaId,
      quadra_id: filters.quadraId,
      professor_id: filters.professorId,
    },
  })

  return {
    recorrencias: unwrapList<RecorrenciaAula>(response),
  }
}

export async function criarRecorrenciaAula(data: CreateRecorrenciaAulaPayload) {
  const response = await api.post("/aulas/recorrencias", data)
  return unwrapData(response)
}

export async function cancelarRecorrenciaAula(recorrenciaId: string) {
  const response = await api.patch(`/aulas/recorrencias/${recorrenciaId}/cancelar`)
  return unwrapData(response)
}
