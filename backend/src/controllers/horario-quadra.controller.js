"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHorarioQuadraController = createHorarioQuadraController;
exports.listHorariosQuadraController = listHorariosQuadraController;
exports.updateHorarioQuadraController = updateHorarioQuadraController;
exports.deleteHorarioQuadraController = deleteHorarioQuadraController;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const horario_quadra_schema_1 = require("../schemas/horario-quadra.schema");
const horario_quadra_service_1 = require("../services/horario-quadra.service");
async function createHorarioQuadraController(req, res) {
    try {
        const { quadraId } = req.params;
        const data = horario_quadra_schema_1.createHorarioQuadraSchema.parse(req.body);
        const horario = await (0, horario_quadra_service_1.createHorarioQuadra)(req.user.id, quadraId, data);
        return res.status(201).json({
            success: true,
            message: "Horário criado com sucesso",
            data: horario,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao criar horário",
        });
    }
}
async function listHorariosQuadraController(req, res) {
    try {
        const { quadraId } = req.params;
        const horarios = await (0, horario_quadra_service_1.listHorariosQuadra)(quadraId);
        return res.json({
            success: true,
            total: horarios.length,
            data: horarios,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao listar horários",
        });
    }
}
async function updateHorarioQuadraController(req, res) {
    try {
        const { id } = req.params;
        const data = horario_quadra_schema_1.updateHorarioQuadraSchema.parse(req.body);
        const horario = await (0, horario_quadra_service_1.updateHorarioQuadra)(req.user.id, id, data);
        return res.json({
            success: true,
            message: "Horário atualizado com sucesso",
            data: horario,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao atualizar horário",
        });
    }
}
async function deleteHorarioQuadraController(req, res) {
    try {
        const { id } = req.params;
        await (0, horario_quadra_service_1.deleteHorarioQuadra)(req.user.id, id);
        return res.json({
            success: true,
            message: "Horário removido com sucesso",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao remover horário",
        });
    }
}
//# sourceMappingURL=horario-quadra.controller.js.map