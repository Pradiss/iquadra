"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBloqueioSchema = void 0;
const zod_1 = require("zod");
exports.createBloqueioSchema = zod_1.z.object({
    inicio_em: zod_1.z.string().datetime(),
    fim_em: zod_1.z.string().datetime(),
    tipo_bloqueio: zod_1.z
        .enum(["MANUTENCAO", "EVENTO", "FERIADO", "PARTICULAR", "OUTRO"])
        .optional(),
    motivo: zod_1.z.string().min(3, "Motivo é obrigatório"),
});
//# sourceMappingURL=bloqueio.schema.js.map