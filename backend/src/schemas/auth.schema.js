"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerProfessorSchema = exports.registerAcademiaSchema = exports.registerClienteSchema = void 0;
const zod_1 = require("zod");
exports.registerClienteSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    telefone: zod_1.z.string().min(8),
    senha: zod_1.z.string().min(6),
    foto_perfil: zod_1.z.string().optional(),
    categoria: zod_1.z.enum(["A", "B", "C", "D", "INICIANTE"]),
    cidade: zod_1.z.string().min(2),
    cep: zod_1.z.string().min(8),
});
exports.registerAcademiaSchema = zod_1.z.object({
    nome_dono: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    telefone: zod_1.z.string().min(8),
    senha: zod_1.z.string().min(6),
    foto_perfil: zod_1.z.string().optional(),
    nome_academia: zod_1.z.string().min(3),
    slug: zod_1.z.string().min(3),
    cnpj: zod_1.z.string().optional(),
    endereco: zod_1.z.string().optional(),
    cidade: zod_1.z.string().optional(),
    estado: zod_1.z.string().optional(),
    cep: zod_1.z.string().optional(),
});
exports.registerProfessorSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    telefone: zod_1.z.string().min(8),
    senha: zod_1.z.string().min(6),
    foto_perfil: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    especialidades: zod_1.z.string().optional(),
    cidade: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    senha: zod_1.z.string().min(1),
});
//# sourceMappingURL=auth.schema.js.map