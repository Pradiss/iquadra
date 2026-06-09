import { z } from "zod";

export const createBloqueioSchema = z.object({
  inicio_em: z.string().datetime(),
  fim_em: z.string().datetime(),
  tipo_bloqueio: z
    .enum(["MANUTENCAO", "EVENTO", "FERIADO", "PARTICULAR", "OUTRO"])
    .optional(),
  motivo: z.string().min(3, "Motivo é obrigatório"),
});

export type CreateBloqueioData = z.infer<typeof createBloqueioSchema>;