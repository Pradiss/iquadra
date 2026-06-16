import { z } from "zod";
import { optionalMediumTextSchema } from "./common";

export const createQuadraSchema = z
  .object({
    nome: z.string().trim().min(2, "Nome da quadra e obrigatorio").max(120),
    descricao: optionalMediumTextSchema,
    tipo_piso: z.enum(["SAIBRO", "HARD", "GRAMA", "SINTETICA", "AREIA", "OUTRO"]),
    coberta: z.boolean().optional(),
    ordem_exibicao: z.number().int().min(0).max(1000).optional(),
    capacidade_minima: z.number().int().min(2).max(4).optional(),
    capacidade_maxima: z.number().int().min(2).max(4).optional(),
    permite_simples: z.boolean().optional(),
    permite_dupla: z.boolean().optional(),
  })
  .strict();

export const updateQuadraSchema = createQuadraSchema.partial();

export const updateStatusQuadraSchema = z
  .object({
    ativa: z.boolean(),
  })
  .strict();

export type CreateQuadraData = z.infer<typeof createQuadraSchema>;
export type UpdateQuadraData = z.infer<typeof updateQuadraSchema>;
