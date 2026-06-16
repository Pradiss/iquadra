"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAulaSchema = void 0;
const zod_1 = require("zod");
exports.createAulaSchema = zod_1.z.object({
    academia_id: zod_1.z.string().uuid(),
    quadra_id: zod_1.z.string().uuid(),
    professor_id: zod_1.z.string().uuid().optional(),
    cliente_id: zod_1.z.string().uuid().optional(),
    inicio_em: zod_1.z.string().datetime(),
    fim_em: zod_1.z.string().datetime(),
    observacoes: zod_1.z.string().optional(),
});
//# sourceMappingURL=aula.schema.js.map