import { api, unwrapData } from "./api"
import type { AgendaDisponibilidade } from "../types/agenda"

export async function buscarDisponibilidade(quadraId: string, data: string) {
  const response = await api.get(`/quadras/${quadraId}/disponibilidade`, {
    params: {
      data,
    },
  })

  return unwrapData<AgendaDisponibilidade>(response)
}
