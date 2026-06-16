import { z } from "zod";
export declare const createAcademiaSchema: z.ZodObject<{
    nome: z.ZodString;
    slug: z.ZodString;
    telefone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    endereco: z.ZodOptional<z.ZodString>;
    cidade: z.ZodOptional<z.ZodString>;
    estado: z.ZodOptional<z.ZodString>;
    cep: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateAcademiaData = z.infer<typeof createAcademiaSchema>;
//# sourceMappingURL=academia.schema.d.ts.map