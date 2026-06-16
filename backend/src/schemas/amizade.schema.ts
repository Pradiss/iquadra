import { z } from "zod";
import { uuidSchema } from "./common";

export const createAmizadeSchema = z
  .object({
    amigo_id: uuidSchema,
  })
  .strict();

export type CreateAmizadeData = z.infer<typeof createAmizadeSchema>;
