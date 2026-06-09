import { z } from "zod";

export const registerClienteSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  telefone: z.string().min(8),
  senha: z.string().min(6),
  foto_perfil: z.string().optional(),

  categoria: z.enum(["A", "B", "C", "D", "INICIANTE"]),
  cidade: z.string().min(2),
  cep: z.string().min(8),
});

export const registerAcademiaSchema = z.object({
  nome_dono: z.string().min(3),
  email: z.string().email(),
  telefone: z.string().min(8),
  senha: z.string().min(6),
  foto_perfil: z.string().optional(),

  nome_academia: z.string().min(3),
  slug: z.string().min(3),
  cnpj: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

export const registerProfessorSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  telefone: z.string().min(8),
  senha: z.string().min(6),
  foto_perfil: z.string().optional(),

  bio: z.string().optional(),
  especialidades: z.string().optional(),
  cidade: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export type RegisterClienteData = z.infer<typeof registerClienteSchema>;
export type RegisterAcademiaData = z.infer<typeof registerAcademiaSchema>;
export type RegisterProfessorData = z.infer<typeof registerProfessorSchema>;
export type LoginData = z.infer<typeof loginSchema>;