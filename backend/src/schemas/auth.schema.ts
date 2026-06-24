import { z } from "zod";
import {
  cepSchema,
  emailSchema,
  nameSchema,
  optionalCepSchema,
  optionalCnpjSchema,
  optionalMediumTextSchema,
  optionalSafeUrlSchema,
  optionalShortTextSchema,
  passwordSchema,
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

export const registerClienteSchema = z
  .object({
    nome: nameSchema,
    email: emailSchema,
    telefone: phoneSchema,
    senha: passwordSchema,
    foto_perfil: optionalSafeUrlSchema,

    categoria: z.enum(["A", "B", "C", "D", "INICIANTE"]),
    cidade: z.string().trim().min(2).max(120),
    cep: cepSchema,
  })
  .strict();

export const registerAcademiaSchema = z
  .object({
    nome_dono: nameSchema,
    email: emailSchema,
    telefone: phoneSchema,
    senha: passwordSchema,
    foto_perfil: optionalSafeUrlSchema,

    nome_academia: nameSchema,
    slug: slugSchema,
    cnpj: optionalCnpjSchema,
    endereco: optionalMediumTextSchema,
    cidade: optionalShortTextSchema,
    estado: estadoSchema,
    cep: optionalCepSchema,
  })
  .strict();

export const registerProfessorSchema = z
  .object({
    nome: nameSchema,
    email: emailSchema,
    telefone: phoneSchema,
    senha: passwordSchema,
    foto_perfil: optionalSafeUrlSchema,

    bio: optionalMediumTextSchema,
    especialidades: optionalMediumTextSchema,
    cidade: optionalShortTextSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    senha: z.string().min(1).max(128),
    manterLogado: z.boolean().optional().default(false),
  })
  .strict();

function emptyToUndefined(value: unknown) {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}

export type RegisterClienteData = z.infer<typeof registerClienteSchema>;
export type RegisterAcademiaData = z.infer<typeof registerAcademiaSchema>;
export type RegisterProfessorData = z.infer<typeof registerProfessorSchema>;
export type LoginData = z.infer<typeof loginSchema>;
