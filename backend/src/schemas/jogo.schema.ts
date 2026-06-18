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

export const createJogoSchema = z.union([
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
