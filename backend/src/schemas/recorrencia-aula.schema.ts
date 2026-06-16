import { z } from "zod";
import {
  dateOnlySchema,
  optionalMediumTextSchema,
  timeSchema,
  uuidSchema,
} from "./common";

export const createRecorrenciaAulaSchema = z
  .object({
    academia_id: uuidSchema,
    quadra_id: uuidSchema,
    professor_id: uuidSchema.optional(),

    dias_semana: z.array(z.number().int().min(0).max(6)).min(1).max(7),

    data_inicio: dateOnlySchema,
    data_fim: dateOnlySchema.optional(),

    horario_inicio: timeSchema,
    horario_fim: timeSchema,

    observacoes: optionalMediumTextSchema,
  })
  .strict();

export const listRecorrenciasAulaQuerySchema = z
  .object({
    academia_id: uuidSchema.optional(),
    quadra_id: uuidSchema.optional(),
    professor_id: uuidSchema.optional(),
  })
  .strict();

export type CreateRecorrenciaAulaData = z.infer<
  typeof createRecorrenciaAulaSchema
>;
export type ListRecorrenciasAulaQuery = z.infer<
  typeof listRecorrenciasAulaQuerySchema
>;
