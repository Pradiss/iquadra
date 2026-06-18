import { z } from "zod";
import { isValidDateOnly } from "../utils/date-time";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const uuidSchema = z.string().uuid("ID invalido");

export const emailSchema = z
  .string()
  .trim()
  .email("E-mail invalido")
  .max(254)
  .transform((email) => email.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres")
  .max(128, "A senha pode ter no maximo 128 caracteres");

export const nameSchema = z.string().trim().min(3).max(120);

export const shortTextSchema = z.string().trim().min(1).max(120);
export const mediumTextSchema = z.string().trim().min(1).max(255);
export const longTextSchema = z.string().trim().min(1).max(1000);

export const optionalShortTextSchema = z.preprocess(
  emptyToUndefined,
  shortTextSchema.optional()
);

export const optionalMediumTextSchema = z.preprocess(
  emptyToUndefined,
  mediumTextSchema.optional()
);

export const optionalLongTextSchema = z.preprocess(
  emptyToUndefined,
  longTextSchema.optional()
);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(80)
  .regex(slugRegex, "Slug deve conter apenas letras minusculas, numeros e hifens");

export const phoneSchema = digitsSchema([10, 11], "Telefone invalido");
export const cepSchema = digitsSchema([8], "CEP invalido");
export const cnpjSchema = digitsSchema([14], "CNPJ invalido");

export const optionalCnpjSchema = z.preprocess(
  emptyToUndefined,
  cnpjSchema.optional()
);

export const optionalCepSchema = z.preprocess(
  emptyToUndefined,
  cepSchema.optional()
);

export const dateOnlySchema = z
  .string()
  .regex(dateRegex, "Data deve estar no formato YYYY-MM-DD")
  .refine((value) => isValidDateOnly(value), {
    message: "Data invalida",
  });

export const dateTimeSchema = z
  .string()
  .datetime({ message: "Data e hora invalidas" });

export const timeSchema = z
  .string()
  .regex(timeRegex, "Horario deve estar no formato HH:mm");

export const safeUrlSchema = z
  .string()
  .trim()
  .url("URL invalida")
  .max(2048)
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "URL deve usar http ou https");

export const optionalSafeUrlSchema = z.preprocess(
  emptyToUndefined,
  safeUrlSchema.optional()
);

function emptyToUndefined(value: unknown) {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}

function digitsSchema(lengths: number[], message: string) {
  return z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => lengths.includes(value.length), { message });
}
