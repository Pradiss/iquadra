import { z } from "zod";

export const createRecorrenciaAulaSchema = z.object({
  academia_id: z.string().uuid(),
  quadra_id: z.string().uuid(),
  professor_id: z.string().uuid().optional(),

  dias_semana: z.array(z.number().min(0).max(6)).min(1),

  data_inicio: z.string(),
  data_fim: z.string().optional(),

  horario_inicio: z.string().min(5),
  horario_fim: z.string().min(5),

  observacoes: z.string().optional(),
});

export type CreateRecorrenciaAulaData = z.infer<
  typeof createRecorrenciaAulaSchema
>;