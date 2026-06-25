import { z } from "zod";
import {
  dateOnlySchema,
  dateTimeSchema,
  optionalMediumTextSchema,
  timeSchema,
  uuidSchema,
} from "./common";

const createJogoBaseSchema = z
  .object({
    academia_id: uuidSchema,
    quadra_id: uuidSchema,
    tipo_jogo: z.enum(["SIMPLES", "DUPLA"]),
    observacoes: optionalMediumTextSchema,
  })
  .strict();

export const DURACOES_RESERVA_MINUTOS = [60, 90, 120] as const;

const duracaoReservaSchema = z.union([
  z.literal(60),
  z.literal(90),
  z.literal(120),
]);

export const createJogoSchema = z.union([
  createJogoBaseSchema
    .extend({
      data: dateOnlySchema,
      hora_inicio: timeSchema,
      duracao_minutos: duracaoReservaSchema,
    })
    .strict(),
  createJogoBaseSchema
    .extend({
      data: dateOnlySchema,
      hora_inicio: timeSchema,
      hora_fim: timeSchema,
    })
    .strict(),
  createJogoBaseSchema
    .extend({
      inicio_em: dateTimeSchema,
      fim_em: dateTimeSchema,
    })
    .strict(),
]);

export const listJogosQuerySchema = z
  .object({
    academia_id: uuidSchema.optional(),
    data: dateOnlySchema.optional(),
    status: z.enum(["ABERTO", "COMPLETO", "CANCELADO", "CONCLUIDO"]).optional(),
    meus: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    cursor: uuidSchema.optional(),
  })
  .strict();

export const adicionarParticipanteJogoSchema = z
  .object({
    usuario_id: uuidSchema,
  })
  .strict();

export type CreateJogoData = z.infer<typeof createJogoSchema>;
export type ListJogosQuery = z.infer<typeof listJogosQuerySchema>;
export type AdicionarParticipanteJogoData = z.infer<
  typeof adicionarParticipanteJogoSchema
>;
