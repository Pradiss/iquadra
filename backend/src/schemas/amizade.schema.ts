import { z } from "zod";

export const createAmizadeSchema = z.object({
  amigo_id: z.string().uuid(),
});

export type CreateAmizadeData = z.infer<typeof createAmizadeSchema>;