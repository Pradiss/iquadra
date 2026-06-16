import { z } from "zod";

export const createQuadraSchema = z.object({
  nome: z.string().min(2, "Nome da quadra é obrigatório"),
  descricao: z.string().optional(),
  tipo_piso: z.enum(["SAIBRO", "HARD", "GRAMA", "SINTETICA", "AREIA", "OUTRO"]),
  coberta: z.boolean().optional(),
  ordem_exibicao: z.number().optional(),
  capacidade_minima: z.number().int().min(1).optional(),
  capacidade_maxima: z.number().int().min(1).optional(),
  permite_simples: z.boolean().optional(),
  permite_dupla: z.boolean().optional(),
});

export const updateQuadraSchema = createQuadraSchema.partial();

export const updateStatusQuadraSchema = z.object({
  ativa: z.boolean(),
});

export type CreateQuadraData = z.infer<typeof createQuadraSchema>;
export type UpdateQuadraData = z.infer<typeof updateQuadraSchema>;
