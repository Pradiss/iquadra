import { api, unwrapData, unwrapList } from "./api"
import type {
  BloqueioQuadra,
  CreateBloqueioPayload,
  ListBloqueiosResponse,
} from "../types/bloqueio"

export async function listarBloqueiosQuadra(
  quadraId: string
): Promise<ListBloqueiosResponse> {
  const response = await api.get(`/quadras/${quadraId}/bloqueios`)

  return {
    bloqueios: unwrapList<BloqueioQuadra>(response),
  }
}

export async function criarBloqueioQuadra(
  quadraId: string,
  data: CreateBloqueioPayload
) {
  const response = await api.post(`/quadras/${quadraId}/bloqueios`, data)
  return unwrapData(response)
}

export async function removerBloqueioQuadra(bloqueioId: string) {
  const response = await api.delete(`/bloqueios/${bloqueioId}`)
  return unwrapData(response)
}
