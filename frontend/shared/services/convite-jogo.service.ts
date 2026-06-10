import { api, unwrapData, unwrapList } from "./api"
import type { ConviteJogo, ListConvitesJogoResponse } from "../types/social"

export async function convidarJogadorParaJogo(
  jogoId: string,
  convidadoUsuarioId: string
) {
  const response = await api.post(`/jogos/${jogoId}/convidar`, {
    convidado_usuario_id: convidadoUsuarioId,
  })

  return unwrapData(response)
}

export async function listarConvitesJogo(): Promise<ListConvitesJogoResponse> {
  const response = await api.get("/convites-jogos")

  return {
    convites: unwrapList<ConviteJogo>(response),
  }
}

export async function aceitarConviteJogo(conviteId: string) {
  const response = await api.patch(`/convites-jogos/${conviteId}/aceitar`)
  return unwrapData(response)
}

export async function recusarConviteJogo(conviteId: string) {
  const response = await api.patch(`/convites-jogos/${conviteId}/recusar`)
  return unwrapData(response)
}
