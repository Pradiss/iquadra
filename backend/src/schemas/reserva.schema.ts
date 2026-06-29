import { z } from "zod";

export const DURACOES_RESERVA_MINUTOS = [60, 90, 120] as const;

export type DuracaoReservaMinutos =
  (typeof DURACOES_RESERVA_MINUTOS)[number];

export const duracaoReservaSchema = z.union([
  z.literal(60),
  z.literal(90),
  z.literal(120),
]);

export const duracoesReservaSchema = z
  .array(duracaoReservaSchema)
  .min(1, "Selecione pelo menos uma duracao de reserva")
  .max(DURACOES_RESERVA_MINUTOS.length)
  .transform((duracoes) =>
    [...new Set(duracoes)].sort((a, b) => a - b),
  );

export function normalizarDuracoesReserva(
  duracoes?: readonly number[] | null,
): DuracaoReservaMinutos[] {
  const permitidas = new Set<number>(DURACOES_RESERVA_MINUTOS);
  const normalizadas = (duracoes ?? []).filter((duracao) =>
    permitidas.has(duracao),
  ) as DuracaoReservaMinutos[];

  const unicas = [...new Set(normalizadas)].sort((a, b) => a - b);

  return unicas.length > 0 ? unicas : [...DURACOES_RESERVA_MINUTOS];
}
