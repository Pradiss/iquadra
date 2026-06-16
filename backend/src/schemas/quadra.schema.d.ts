import { z } from "zod";
export declare const createQuadraSchema: z.ZodObject<{
    nome: z.ZodString;
    descricao: z.ZodOptional<z.ZodString>;
    tipo_piso: z.ZodEnum<{
        SAIBRO: "SAIBRO";
        HARD: "HARD";
        GRAMA: "GRAMA";
        SINTETICA: "SINTETICA";
        AREIA: "AREIA";
        OUTRO: "OUTRO";
    }>;
    coberta: z.ZodOptional<z.ZodBoolean>;
    ordem_exibicao: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateQuadraSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    descricao: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tipo_piso: z.ZodOptional<z.ZodEnum<{
        SAIBRO: "SAIBRO";
        HARD: "HARD";
        GRAMA: "GRAMA";
        SINTETICA: "SINTETICA";
        AREIA: "AREIA";
        OUTRO: "OUTRO";
    }>>;
    coberta: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    ordem_exibicao: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const updateStatusQuadraSchema: z.ZodObject<{
    ativa: z.ZodBoolean;
}, z.core.$strip>;
export type CreateQuadraData = z.infer<typeof createQuadraSchema>;
export type UpdateQuadraData = z.infer<typeof updateQuadraSchema>;
//# sourceMappingURL=quadra.schema.d.ts.map