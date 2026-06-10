import { api, unwrapData, unwrapList } from "./api"
import type {
  HorarioQuadraDetalhe,
  ListHorariosQuadraResponse,
  ListQuadrasResponse,
  QuadraDetalhe,
  QuadraResumo,
  TipoPisoQuadra,
} from "../types/quadra"

export type CreateQuadraData = {
  nome: string
  descricao?: string
  tipo_piso: TipoPisoQuadra
  coberta?: boolean
  ordem_exibicao?: number
}

export type UpdateQuadraData = Partial<CreateQuadraData>

export type CreateHorarioQuadraData = {
  dia_semana: number
  abre_as: string
  fecha_as: string
  duracao_slot_minutos?: number
  ativo?: boolean
}

export type UpdateHorarioQuadraData = Partial<CreateHorarioQuadraData>

export async function listarQuadrasAcademia(
  academiaId: string
): Promise<ListQuadrasResponse> {
  const response = await api.get(`/academias/${academiaId}/quadras`)

  return {
    quadras: unwrapList(response),
  }
}

export async function buscarQuadraDetalhe(quadraId: string) {
  const response = await api.get(`/quadras/${quadraId}`)
  return unwrapData<QuadraDetalhe>(response)
}

export async function criarQuadra(
  academiaId: string,
  data: CreateQuadraData
): Promise<QuadraResumo> {
  const response = await api.post(`/academias/${academiaId}/quadras`, data)
  return unwrapData<QuadraResumo>(response)
}

export async function atualizarQuadra(
  quadraId: string,
  data: UpdateQuadraData
) {
  const response = await api.put(`/quadras/${quadraId}`, data)
  return unwrapData(response)
}

export async function atualizarStatusQuadra(quadraId: string, ativa: boolean) {
  const response = await api.patch(`/quadras/${quadraId}/status`, { ativa })
  return unwrapData(response)
}

export async function listarHorariosQuadra(
  quadraId: string
): Promise<ListHorariosQuadraResponse> {
  const response = await api.get(`/quadras/${quadraId}/horarios`)

  return {
    horarios: unwrapList<HorarioQuadraDetalhe>(response),
  }
}

export async function criarHorarioQuadra(
  quadraId: string,
  data: CreateHorarioQuadraData
) {
  const response = await api.post(`/quadras/${quadraId}/horarios`, data)
  return unwrapData(response)
}

export async function atualizarHorarioQuadra(
  horarioId: string,
  data: UpdateHorarioQuadraData
) {
  const response = await api.put(`/horarios-quadra/${horarioId}`, data)
  return unwrapData(response)
}

export async function removerHorarioQuadra(horarioId: string) {
  const response = await api.delete(`/horarios-quadra/${horarioId}`)
  return unwrapData(response)
}

export const listarQuadrasAdmin = listarQuadrasAcademia
export const criarQuadraAdmin = criarQuadra
export const criarHorarioQuadraAdmin = criarHorarioQuadra
