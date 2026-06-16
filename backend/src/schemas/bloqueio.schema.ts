import { z } from "zod";
import { dateTimeSchema, mediumTextSchema } from "./common";

export const createBloqueioSchema = z
  .object({
    inicio_em: dateTimeSchema,
    fim_em: dateTimeSchema,
    tipo_bloqueio: z
      .enum(["MANUTENCAO", "EVENTO", "FERIADO", "PARTICULAR", "OUTRO"])
      .optional(),
    motivo: mediumTextSchema,
  })
  .strict();

export type CreateBloqueioData = z.infer<typeof createBloqueioSchema>;
