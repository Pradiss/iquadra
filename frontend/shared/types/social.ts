import type { JogoDetalhado } from "./agenda"

export type UsuarioSocial = {
  id: string
  nome: string
  email: string
  foto_perfil?: string | null
}

export type StatusAmizade = "PENDENTE" | "ACEITA" | "RECUSADA" | "BLOQUEADA"

export type Amizade = {
  id: string
  usuario_id: string
  amigo_id: string
  status: StatusAmizade
  criado_em?: string
  atualizado_em?: string
  usuario: UsuarioSocial
  amigo: UsuarioSocial
}

export type StatusConviteJogo = "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO"

export type ConviteJogo = {
  id: string
  jogo_id: string
  convidado_usuario_id: string
  enviado_por_id: string
  status: StatusConviteJogo
  criado_em?: string
  atualizado_em?: string
  jogo: JogoDetalhado
  enviadoPor: UsuarioSocial
  convidado?: UsuarioSocial
}

export type ListAmizadesResponse = {
  amizades: Amizade[]
}

export type ListConvitesJogoResponse = {
  convites: ConviteJogo[]
}
