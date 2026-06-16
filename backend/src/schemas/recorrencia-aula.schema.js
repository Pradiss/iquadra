"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecorrenciaAulaSchema = void 0;
const zod_1 = require("zod");
exports.createRecorrenciaAulaSchema = zod_1.z.object({
    academia_id: zod_1.z.string().uuid(),
    quadra_id: zod_1.z.string().uuid(),
    professor_id: zod_1.z.string().uuid().optional(),
    dias_semana: zod_1.z.array(zod_1.z.number().min(0).max(6)).min(1),
    data_inicio: zod_1.z.string(),
    data_fim: zod_1.z.string().optional(),
    horario_inicio: zod_1.z.string().min(5),
    horario_fim: zod_1.z.string().min(5),
    observacoes: zod_1.z.string().optional(),
});
//# sourceMappingURL=recorrencia-aula.schema.js.map