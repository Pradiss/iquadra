import { z } from "zod";

export const createAcademiaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

export type CreateAcademiaData = z.infer<typeof createAcademiaSchema>;