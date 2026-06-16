import { z } from "zod";
import {
  dateOnlySchema,
  dateTimeSchema,
  optionalMediumTextSchema,
  uuidSchema,
} from "./common";

export const createAulaSchema = z
  .object({
    academia_id: uuidSchema,
    quadra_id: uuidSchema,
    professor_id: uuidSchema.optional(),
    cliente_id: uuidSchema.optional(),
    inicio_em: dateTimeSchema,
    fim_em: dateTimeSchema,
    observacoes: optionalMediumTextSchema,
  })
  .strict();

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
