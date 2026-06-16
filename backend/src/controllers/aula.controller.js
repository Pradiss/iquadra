"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAulaController = createAulaController;
exports.listAulasController = listAulasController;
exports.getAulaController = getAulaController;
exports.cancelarAulaController = cancelarAulaController;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const aula_schema_1 = require("../schemas/aula.schema");
const aula_service_1 = require("../services/aula.service");
async function createAulaController(req, res) {
    try {
        const data = aula_schema_1.createAulaSchema.parse(req.body);
        const aula = await (0, aula_service_1.createAula)(req.user.id, data);
        return res.status(201).json({
            success: true,
            message: "Aula criada com sucesso",
            data: aula,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao criar aula",
        });
    }
}
async function listAulasController(req, res) {
    try {
        const { academia_id, quadra_id, professor_id, cliente_id, data } = req.query;
        const aulas = await (0, aula_service_1.listAulas)({
            academia_id: academia_id,
            quadra_id: quadra_id,
            professor_id: professor_id,
            cliente_id: cliente_id,
            data: data,
        });
        return res.json({
            success: true,
            total: aulas.length,
            data: aulas,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao listar aulas",
        });
    }
}
async function getAulaController(req, res) {
    try {
        const { id } = req.params;
        const aula = await (0, aula_service_1.getAulaById)(id);
        return res.json({
            success: true,
            data: aula,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message || "Aula não encontrada",
        });
    }
}
async function cancelarAulaController(req, res) {
    try {
        const { id } = req.params;
        const aula = await (0, aula_service_1.cancelarAula)(req.user.id, id);
        return res.json({
            success: true,
            message: "Aula cancelada com sucesso",
            data: aula,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao cancelar aula",
        });
    }
}
//# sourceMappingURL=aula.controller.js.map