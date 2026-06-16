import { z } from "zod";
export declare const registerClienteSchema: z.ZodObject<{
    nome: z.ZodString;
    email: z.ZodString;
    telefone: z.ZodString;
    senha: z.ZodString;
    foto_perfil: z.ZodOptional<z.ZodString>;
    categoria: z.ZodEnum<{
        A: "A";
        B: "B";
        C: "C";
        D: "D";
        INICIANTE: "INICIANTE";
    }>;
    cidade: z.ZodString;
    cep: z.ZodString;
}, z.core.$strip>;
export declare const registerAcademiaSchema: z.ZodObject<{
    nome_dono: z.ZodString;
    email: z.ZodString;
    telefone: z.ZodString;
    senha: z.ZodString;
    foto_perfil: z.ZodOptional<z.ZodString>;
    nome_academia: z.ZodString;
    slug: z.ZodString;
    cnpj: z.ZodOptional<z.ZodString>;
    endereco: z.ZodOptional<z.ZodString>;
    cidade: z.ZodOptional<z.ZodString>;
    estado: z.ZodOptional<z.ZodString>;
    cep: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const registerProfessorSchema: z.ZodObject<{
    nome: z.ZodString;
    email: z.ZodString;
    telefone: z.ZodString;
    senha: z.ZodString;
    foto_perfil: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    especialidades: z.ZodOptional<z.ZodString>;
    cidade: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    senha: z.ZodString;
}, z.core.$strip>;
export type RegisterClienteData = z.infer<typeof registerClienteSchema>;
export type RegisterAcademiaData = z.infer<typeof registerAcademiaSchema>;
export type RegisterProfessorData = z.infer<typeof registerProfessorSchema>;
export type LoginData = z.infer<typeof loginSchema>;
//# sourceMappingURL=auth.schema.d.ts.map