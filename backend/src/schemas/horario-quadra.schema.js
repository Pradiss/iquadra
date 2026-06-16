"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHorarioQuadraSchema = exports.createHorarioQuadraSchema = void 0;
const zod_1 = require("zod");
exports.createHorarioQuadraSchema = zod_1.z.object({
    dia_semana: zod_1.z.number().min(0).max(6),
    abre_as: zod_1.z.string().min(5),
    fecha_as: zod_1.z.string().min(5),
    duracao_slot_minutos: zod_1.z.number().min(30).optional(),
    ativo: zod_1.z.boolean().optional(),
});
exports.updateHorarioQuadraSchema = exports.createHorarioQuadraSchema.partial();
//# sourceMappingURL=horario-quadra.schema.js.map