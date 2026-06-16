import { z } from "zod";
import {
  emailSchema,
  optionalCepSchema,
  optionalCnpjSchema,
  optionalMediumTextSchema,
  optionalShortTextSchema,
  phoneSchema,
  slugSchema,
} from "./common";

const estadoSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .length(2, "Estado deve ter 2 letras")
    .transform((value) => value.toUpperCase())
    .optional()
);

export const createAcademiaSchema = z
  .object({
    nome: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(120),
    slug: slugSchema,
    cnpj: optionalCnpjSchema,
    telefone: phoneSchema.optional(),
    email: emailSchema.optional(),
    endereco: optionalMediumTextSchema,
    cidade: optionalShortTextSchema,
    estado: estadoSchema,
    cep: optionalCepSchema,
  })
  .strict();

function emptyToUndefined(value: unknown) {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}

export type CreateAcademiaData = z.infer<typeof createAcademiaSchema>;
