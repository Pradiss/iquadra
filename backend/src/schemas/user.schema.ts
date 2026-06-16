import { z } from "zod";
import {
  cepSchema,
  emailSchema,
  nameSchema,
  optionalSafeUrlSchema,
  phoneSchema,
} from "./common";

export const updateMeSchema = z
  .object({
    nome: nameSchema.optional(),
    email: emailSchema.optional(),
    telefone: phoneSchema.optional(),
    foto_perfil: optionalSafeUrlSchema,
    perfil_cliente: z
      .object({
        categoria: z.enum(["A", "B", "C", "D", "INICIANTE"]).optional(),
        cidade: z.string().trim().min(2).max(120).optional(),
        cep: cepSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const listUsersQuerySchema = z
  .object({
    q: z.string().trim().max(80).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

export type UpdateMeData = z.infer<typeof updateMeSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
