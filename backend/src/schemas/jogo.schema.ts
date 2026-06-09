import { z } from "zod";

export const createJogoSchema = z.object({
  academia_id: z.string().uuid(),
  quadra_id: z.string().uuid(),
  tipo_jogo: z.enum(["SIMPLES", "DUPLA"]),
  inicio_em: z.string().datetime(),
  fim_em: z.string().datetime(),
  observacoes: z.string().optional(),
});

export type CreateJogoData = z.infer<typeof createJogoSchema>;