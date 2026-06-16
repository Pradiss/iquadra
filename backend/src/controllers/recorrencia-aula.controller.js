"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecorrenciaAulaController = createRecorrenciaAulaController;
exports.listRecorrenciasAulaController = listRecorrenciasAulaController;
exports.cancelarRecorrenciaAulaController = cancelarRecorrenciaAulaController;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const recorrencia_aula_schema_1 = require("../schemas/recorrencia-aula.schema");
const recorrencia_aula_service_1 = require("../services/recorrencia-aula.service");
async function createRecorrenciaAulaController(req, res) {
    try {
        const data = recorrencia_aula_schema_1.createRecorrenciaAulaSchema.parse(req.body);
        const recorrencia = await (0, recorrencia_aula_service_1.createRecorrenciaAula)(req.user.id, data);
        return res.status(201).json({
            success: true,
            message: "Recorrência criada com sucesso",
            data: recorrencia,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao criar recorrência",
        });
    }
}
async function listRecorrenciasAulaController(req, res) {
    try {
        const { academia_id, quadra_id, professor_id } = req.query;
        const recorrencias = await (0, recorrencia_aula_service_1.listRecorrenciasAula)({
            academia_id: academia_id,
            quadra_id: quadra_id,
            professor_id: professor_id,
        });
        return res.json({
            success: true,
            total: recorrencias.length,
            data: recorrencias,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao listar recorrências",
        });
    }
}
async function cancelarRecorrenciaAulaController(req, res) {
    try {
        const { id } = req.params;
        const recorrencia = await (0, recorrencia_aula_service_1.cancelarRecorrenciaAula)(req.user.id, id);
        return res.json({
            success: true,
            message: "Recorrência cancelada com sucesso",
            data: recorrencia,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao cancelar recorrência",
        });
    }
}
//# sourceMappingURL=recorrencia-aula.controller.js.map