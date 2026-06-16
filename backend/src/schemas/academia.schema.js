"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAcademiaSchema = void 0;
const zod_1 = require("zod");
exports.createAcademiaSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    slug: zod_1.z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
    telefone: zod_1.z.string().optional(),
    email: zod_1.z.string().email("E-mail inválido").optional(),
    endereco: zod_1.z.string().optional(),
    cidade: zod_1.z.string().optional(),
    estado: zod_1.z.string().optional(),
    cep: zod_1.z.string().optional(),
});
//# sourceMappingURL=academia.schema.js.map