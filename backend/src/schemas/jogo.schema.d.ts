import { z } from "zod";
export declare const createJogoSchema: z.ZodObject<{
    academia_id: z.ZodString;
    quadra_id: z.ZodString;
    tipo_jogo: z.ZodEnum<{
        SIMPLES: "SIMPLES";
        DUPLA: "DUPLA";
    }>;
    inicio_em: z.ZodString;
    fim_em: z.ZodString;
    observacoes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateJogoData = z.infer<typeof createJogoSchema>;
//# sourceMappingURL=jogo.schema.d.ts.map