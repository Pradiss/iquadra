import { z } from "zod";
export declare const createAmizadeSchema: z.ZodObject<{
    amigo_id: z.ZodString;
}, z.core.$strip>;
export type CreateAmizadeData = z.infer<typeof createAmizadeSchema>;
//# sourceMappingURL=amizade.schema.d.ts.map