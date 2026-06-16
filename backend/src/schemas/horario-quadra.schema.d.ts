import { z } from "zod";
export declare const createHorarioQuadraSchema: z.ZodObject<{
    dia_semana: z.ZodNumber;
    abre_as: z.ZodString;
    fecha_as: z.ZodString;
    duracao_slot_minutos: z.ZodOptional<z.ZodNumber>;
    ativo: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateHorarioQuadraSchema: z.ZodObject<{
    dia_semana: z.ZodOptional<z.ZodNumber>;
    abre_as: z.ZodOptional<z.ZodString>;
    fecha_as: z.ZodOptional<z.ZodString>;
    duracao_slot_minutos: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    ativo: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export type CreateHorarioQuadraData = z.infer<typeof createHorarioQuadraSchema>;
export type UpdateHorarioQuadraData = z.infer<typeof updateHorarioQuadraSchema>;
//# sourceMappingURL=horario-quadra.schema.d.ts.map