import { z } from "zod";
export declare const createRecorrenciaAulaSchema: z.ZodObject<{
    academia_id: z.ZodString;
    quadra_id: z.ZodString;
    professor_id: z.ZodOptional<z.ZodString>;
    dias_semana: z.ZodArray<z.ZodNumber>;
    data_inicio: z.ZodString;
    data_fim: z.ZodOptional<z.ZodString>;
    horario_inicio: z.ZodString;
    horario_fim: z.ZodString;
    observacoes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateRecorrenciaAulaData = z.infer<typeof createRecorrenciaAulaSchema>;
//# sourceMappingURL=recorrencia-aula.schema.d.ts.map