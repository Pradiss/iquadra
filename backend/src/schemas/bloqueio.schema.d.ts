import { z } from "zod";
export declare const createBloqueioSchema: z.ZodObject<{
    inicio_em: z.ZodString;
    fim_em: z.ZodString;
    tipo_bloqueio: z.ZodOptional<z.ZodEnum<{
        OUTRO: "OUTRO";
        MANUTENCAO: "MANUTENCAO";
        EVENTO: "EVENTO";
        FERIADO: "FERIADO";
        PARTICULAR: "PARTICULAR";
    }>>;
    motivo: z.ZodString;
}, z.core.$strip>;
export type CreateBloqueioData = z.infer<typeof createBloqueioSchema>;
//# sourceMappingURL=bloqueio.schema.d.ts.map