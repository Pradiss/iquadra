import { z } from "zod";

export const createAulaSchema = z.object({
  academia_id: z.string().uuid(),
  quadra_id: z.string().uuid(),
  professor_id: z.string().uuid().optional(),
  cliente_id: z.string().uuid().optional(),
  inicio_em: z.string().datetime(),
  fim_em: z.string().datetime(),
  observacoes: z.string().optional(),
});

export type CreateAulaData = z.infer<typeof createAulaSchema>;