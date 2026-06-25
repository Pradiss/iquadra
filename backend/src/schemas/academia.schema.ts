import { z } from "zod";
import {
  cepSchema,
  cnpjSchema,
  emailSchema,
  mediumTextSchema,
  optionalCepSchema,
  optionalCnpjSchema,
  optionalMediumTextSchema,
  optionalShortTextSchema,
  phoneSchema,
  shortTextSchema,
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

const optionalNullableEmailSchema = z.preprocess(
  emptyToNull,
  emailSchema.nullable().optional()
);

const optionalNullablePhoneSchema = z.preprocess(
  emptyToNull,
  phoneSchema.nullable().optional()
);

const optionalNullableCnpjSchema = z.preprocess(
  emptyToNull,
  cnpjSchema.nullable().optional()
);

const optionalNullableCepSchema = z.preprocess(
  emptyToNull,
  cepSchema.nullable().optional()
);

const optionalNullableShortTextSchema = z.preprocess(
  emptyToNull,
  shortTextSchema.nullable().optional()
);

const optionalNullableMediumTextSchema = z.preprocess(
  emptyToNull,
  mediumTextSchema.nullable().optional()
);

const nullableEstadoSchema = z.preprocess(
  emptyToNull,
  z
    .string()
    .trim()
    .length(2, "Estado deve ter 2 letras")
    .transform((value) => value.toUpperCase())
    .nullable()
    .optional()
);

export const updateAcademiaSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(3, "Nome deve ter pelo menos 3 caracteres")
      .max(120)
      .optional(),
    slug: slugSchema.optional(),
    cnpj: optionalNullableCnpjSchema,
    telefone: optionalNullablePhoneSchema,
    email: optionalNullableEmailSchema,
    endereco: optionalNullableMediumTextSchema,
    cidade: optionalNullableShortTextSchema,
    estado: nullableEstadoSchema,
    cep: optionalNullableCepSchema,
  })
  .strict();

function emptyToUndefined(value: unknown) {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}

function emptyToNull(value: unknown) {
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return value;
}

export type CreateAcademiaData = z.infer<typeof createAcademiaSchema>;
export type UpdateAcademiaData = z.infer<typeof updateAcademiaSchema>;
