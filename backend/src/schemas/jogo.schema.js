"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJogoSchema = void 0;
const zod_1 = require("zod");
exports.createJogoSchema = zod_1.z.object({
    academia_id: zod_1.z.string().uuid(),
    quadra_id: zod_1.z.string().uuid(),
    tipo_jogo: zod_1.z.enum(["SIMPLES", "DUPLA"]),
    inicio_em: zod_1.z.string().datetime(),
    fim_em: zod_1.z.string().datetime(),
    observacoes: zod_1.z.string().optional(),
});
//# sourceMappingURL=jogo.schema.js.map