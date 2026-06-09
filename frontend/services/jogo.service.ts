import { api, unwrapData, unwrapList } from "./api"
import type {
  JogoDetalhado,
  JogosAbertosResponse,
  MeusJogosResponse,
} from "../types/agenda"

export type CreateJogoData = {
  academia_id: string
  quadra_id: string
  tipo_jogo: "SIMPLES" | "DUPLA"
  inicio_em: string
  fim_em: string
  observacoes?: string
}

export type ListJogosFilters = {
  academiaId?: string
  data?: string
  status?: "ABERTO" | "COMPLETO" | "CANCELADO" | "CONCLUIDO"
}

export async function listarJogos(filters: ListJogosFilters = {}) {
  const response = await api.get("/jogos", {
    params: {
      academia_id: filters.academiaId,
      data: filters.data,
      status: filters.status,
    },
  })

  return unwrapList<JogoDetalhado>(response)
}

export async function buscarJogo(jogoId: string) {
  const response = await api.get(`/jogos/${jogoId}`)
  return unwrapData<JogoDetalhado>(response)
}

export async function listarJogosAbertos(
  academiaId: string,
  data?: string
): Promise<JogosAbertosResponse> {
  const jogos = await listarJogos({
    academiaId,
    data,
    status: "ABERTO",
  })

  return { jogos }
}

export async function listarMeusJogos(
  usuarioId: string,
  filters: ListJogosFilters = {}
): Promise<MeusJogosResponse> {
  const jogos = await listarJogos(filters)

  return {
    jogos: jogos.filter((jogo) =>
      jogo.participantes.some(
        (participante) =>
          participante.usuario.id === usuarioId &&
          (participante.status ?? "CONFIRMADO") === "CONFIRMADO"
      )
    ),
  }
}

export async function entrarNoJogo(jogoId: string) {
  const response = await api.post(`/jogos/${jogoId}/participar`)
  return unwrapData(response)
}

export async function sairDoJogo(jogoId: string) {
  const response = await api.delete(`/jogos/${jogoId}/participar`)
  return unwrapData(response)
}

export async function cancelarJogo(jogoId: string) {
  const response = await api.patch(`/jogos/${jogoId}/cancelar`)
  return unwrapData(response)
}

export async function criarJogo(data: CreateJogoData) {
  const response = await api.post("/jogos", data)
  return unwrapData(response)
}
