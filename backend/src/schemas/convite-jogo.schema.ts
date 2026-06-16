import { z } from "zod";
import { uuidSchema } from "./common";

export const convidarJogadorSchema = z
  .object({
    convidado_usuario_id: uuidSchema,
  })
  .strict();

export type ConvidarJogadorData = z.infer<typeof convidarJogadorSchema>;
