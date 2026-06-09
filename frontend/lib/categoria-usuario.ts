export const CATEGORIAS_USUARIO = ["A", "B", "C", "D", "INICIANTE"] as const

export type CategoriaUsuario = (typeof CATEGORIAS_USUARIO)[number]

export function isCategoriaUsuario(value: string): value is CategoriaUsuario {
  return CATEGORIAS_USUARIO.includes(value as CategoriaUsuario)
}
