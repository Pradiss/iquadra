"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusQuadraSchema = exports.updateQuadraSchema = exports.createQuadraSchema = void 0;
const zod_1 = require("zod");
exports.createQuadraSchema = zod_1.z.object({
    nome: zod_1.z.string().min(2, "Nome da quadra é obrigatório"),
    descricao: zod_1.z.string().optional(),
    tipo_piso: zod_1.z.enum(["SAIBRO", "HARD", "GRAMA", "SINTETICA", "AREIA", "OUTRO"]),
    coberta: zod_1.z.boolean().optional(),
    ordem_exibicao: zod_1.z.number().optional(),
});
exports.updateQuadraSchema = exports.createQuadraSchema.partial();
exports.updateStatusQuadraSchema = zod_1.z.object({
    ativa: zod_1.z.boolean(),
});
//# sourceMappingURL=quadra.schema.js.map