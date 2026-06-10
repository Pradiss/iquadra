import { api, unwrapData, unwrapList } from "./api"
import type { Amizade, ListAmizadesResponse } from "../types/social"

export async function listarAmizades(): Promise<ListAmizadesResponse> {
  const response = await api.get("/amizades")

  return {
    amizades: unwrapList<Amizade>(response),
  }
}

export async function solicitarAmizade(amigoId: string) {
  const response = await api.post("/amizades", { amigo_id: amigoId })
  return unwrapData(response)
}

export async function aceitarAmizade(amizadeId: string) {
  const response = await api.patch(`/amizades/${amizadeId}/aceitar`)
  return unwrapData(response)
}

export async function recusarAmizade(amizadeId: string) {
  const response = await api.patch(`/amizades/${amizadeId}/recusar`)
  return unwrapData(response)
}

export async function removerAmizade(amizadeId: string) {
  const response = await api.delete(`/amizades/${amizadeId}`)
  return unwrapData(response)
}
