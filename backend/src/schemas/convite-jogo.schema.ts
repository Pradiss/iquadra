import { z } from "zod";

export const convidarJogadorSchema = z.object({
  convidado_usuario_id: z.string().uuid(),
});

export type ConvidarJogadorData = z.infer<typeof convidarJogadorSchema>;