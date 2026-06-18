import { z } from "zod";
import {
  dateOnlySchema,
  dateTimeSchema,
  optionalMediumTextSchema,
  uuidSchema,
} from "./common";

export const createJogoSchema = z
  .object({
    academia_id: uuidSchema,
    quadra_id: uuidSchema,
    tipo_jogo: z.enum(["SIMPLES", "DUPLA"]),
    inicio_em: dateTimeSchema,
    fim_em: dateTimeSchema,
    observacoes: optionalMediumTextSchema,
  })
  .strict();

export const listJogosQuerySchema = z
  .object({
    academia_id: uuidSchema.optional(),
    data: dateOnlySchema.optional(),
    status: z.enum(["ABERTO", "COMPLETO", "CANCELADO", "CONCLUIDO"]).optional(),
  })
  .strict();

export const adicionarParticipanteJogoSchema = z
  .object({
    usuario_id: uuidSchema,
  })
  .strict();

export type CreateJogoData = z.infer<typeof createJogoSchema>;
export type ListJogosQuery = z.infer<typeof listJogosQuerySchema>;
export type AdicionarParticipanteJogoData = z.infer<
  typeof adicionarParticipanteJogoSchema
>;
