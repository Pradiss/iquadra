import { z } from "zod";
import {
  dateOnlySchema,
  dateTimeSchema,
  optionalMediumTextSchema,
  timeSchema,
  uuidSchema,
} from "./common";

const createAulaBaseSchema = z
  .object({
    academia_id: uuidSchema,
    quadra_id: uuidSchema,
    professor_id: uuidSchema.optional(),
    cliente_id: uuidSchema.optional(),
    observacoes: optionalMediumTextSchema,
  })
  .strict();

export const createAulaSchema = z.union([
  createAulaBaseSchema
    .extend({
      data: dateOnlySchema,
      hora_inicio: timeSchema,
      hora_fim: timeSchema,
    })
    .strict(),
  createAulaBaseSchema
    .extend({
      inicio_em: dateTimeSchema,
      fim_em: dateTimeSchema,
    })
    .strict(),
]);

export const listAulasQuerySchema = z
  .object({
    academia_id: uuidSchema.optional(),
    quadra_id: uuidSchema.optional(),
    professor_id: uuidSchema.optional(),
    cliente_id: uuidSchema.optional(),
    data: dateOnlySchema.optional(),
  })
  .strict();

export type CreateAulaData = z.infer<typeof createAulaSchema>;
export type ListAulasQuery = z.infer<typeof listAulasQuerySchema>;
