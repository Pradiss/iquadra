import { z } from "zod";
export declare const createAulaSchema: z.ZodObject<{
    academia_id: z.ZodString;
    quadra_id: z.ZodString;
    professor_id: z.ZodOptional<z.ZodString>;
    cliente_id: z.ZodOptional<z.ZodString>;
    inicio_em: z.ZodString;
    fim_em: z.ZodString;
    observacoes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateAulaData = z.infer<typeof createAulaSchema>;
//# sourceMappingURL=aula.schema.d.ts.map