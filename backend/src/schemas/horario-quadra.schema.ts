import { z } from "zod";
import { timeSchema } from "./common";

export const createHorarioQuadraSchema = z
  .object({
    dia_semana: z.number().int().min(0).max(6),
    abre_as: timeSchema,
    fecha_as: timeSchema,
    duracao_slot_minutos: z.number().int().min(30).max(240).optional(),
    ativo: z.boolean().optional(),
  })
  .strict();

export const updateHorarioQuadraSchema = createHorarioQuadraSchema.partial();

export type CreateHorarioQuadraData = z.infer<typeof createHorarioQuadraSchema>;
export type UpdateHorarioQuadraData = z.infer<typeof updateHorarioQuadraSchema>;
