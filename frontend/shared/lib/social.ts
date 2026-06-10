import type { Amizade, UsuarioSocial } from "../types/social"

export function getAmizadeComUsuario(
  amizades: Amizade[],
  usuarioId: string,
  outroUsuarioId: string
) {
  return (
    amizades.find(
      (amizade) =>
        (amizade.usuario_id === usuarioId && amizade.amigo_id === outroUsuarioId) ||
        (amizade.usuario_id === outroUsuarioId && amizade.amigo_id === usuarioId)
    ) ?? null
  )
}

export function getOutroUsuarioDaAmizade(
  amizade: Amizade,
  usuarioId: string
): UsuarioSocial {
  return amizade.usuario_id === usuarioId ? amizade.amigo : amizade.usuario
}

export function isPendingIncoming(
  amizade: Amizade,
  usuarioId: string
) {
  return amizade.status === "PENDENTE" && amizade.amigo_id === usuarioId
}

export function isPendingOutgoing(
  amizade: Amizade,
  usuarioId: string
) {
  return amizade.status === "PENDENTE" && amizade.usuario_id === usuarioId
}
