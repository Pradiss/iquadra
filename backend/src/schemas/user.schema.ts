import { z } from "zod";

export const updateMeSchema = z.object({
  nome: z.string().trim().min(3).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  telefone: z.string().trim().min(8).optional(),
  foto_perfil: z.string().trim().optional(),
  perfil_cliente: z
    .object({
      categoria: z.enum(["A", "B", "C", "D", "INICIANTE"]).optional(),
      cidade: z.string().trim().min(2).optional(),
      cep: z.string().trim().min(8).optional(),
    })
    .optional(),
});

export type UpdateMeData = z.infer<typeof updateMeSchema>;
