import { z } from "zod";
export declare const convidarJogadorSchema: z.ZodObject<{
    convidado_usuario_id: z.ZodString;
}, z.core.$strip>;
export type ConvidarJogadorData = z.infer<typeof convidarJogadorSchema>;
//# sourceMappingURL=convite-jogo.schema.d.ts.map