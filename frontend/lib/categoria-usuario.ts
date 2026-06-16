export const CATEGORIAS_USUARIO = [
  "INICIANTE",
  "D",
  "C",
  "B",
  "A",
] as const;

export type CategoriaUsuario = (typeof CATEGORIAS_USUARIO)[number];

export function isCategoriaUsuario(value: unknown): value is CategoriaUsuario {
  return CATEGORIAS_USUARIO.includes(value as CategoriaUsuario);
}