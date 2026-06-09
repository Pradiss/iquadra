import { z } from "zod";

export const createHorarioQuadraSchema = z.object({
  dia_semana: z.number().min(0).max(6),
  abre_as: z.string().min(5),
  fecha_as: z.string().min(5),
  duracao_slot_minutos: z.number().min(30).optional(),
  ativo: z.boolean().optional(),
});

export const updateHorarioQuadraSchema = createHorarioQuadraSchema.partial();

export type CreateHorarioQuadraData = z.infer<typeof createHorarioQuadraSchema>;
export type UpdateHorarioQuadraData = z.infer<typeof updateHorarioQuadraSchema>;