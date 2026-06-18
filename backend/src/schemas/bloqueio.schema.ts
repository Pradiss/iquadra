import { z } from "zod";
import {
  dateOnlySchema,
  dateTimeSchema,
  mediumTextSchema,
  timeSchema,
} from "./common";

const createBloqueioBaseSchema = z
  .object({
    tipo_bloqueio: z
      .enum(["MANUTENCAO", "EVENTO", "FERIADO", "PARTICULAR", "OUTRO"])
      .optional(),
    motivo: mediumTextSchema,
  })
  .strict();

export const createBloqueioSchema = z.union([
  createBloqueioBaseSchema
    .extend({
      data: dateOnlySchema,
      hora_inicio: timeSchema,
      hora_fim: timeSchema,
    })
    .strict(),
  createBloqueioBaseSchema
    .extend({
      inicio_em: dateTimeSchema,
      fim_em: dateTimeSchema,
    })
    .strict(),
]);

export type CreateBloqueioData = z.infer<typeof createBloqueioSchema>;
