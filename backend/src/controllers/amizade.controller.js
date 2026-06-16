"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solicitarAmizadeController = solicitarAmizadeController;
exports.listarAmizadesController = listarAmizadesController;
exports.aceitarAmizadeController = aceitarAmizadeController;
exports.recusarAmizadeController = recusarAmizadeController;
exports.removerAmizadeController = removerAmizadeController;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const amizade_schema_1 = require("../schemas/amizade.schema");
const amizade_service_1 = require("../services/amizade.service");
async function solicitarAmizadeController(req, res) {
    try {
        const data = amizade_schema_1.createAmizadeSchema.parse(req.body);
        const amizade = await (0, amizade_service_1.solicitarAmizade)(req.user.id, data);
        return res.status(201).json({
            success: true,
            message: "Solicitação de amizade enviada",
            data: amizade,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao enviar solicitação",
        });
    }
}
async function listarAmizadesController(req, res) {
    try {
        const amizades = await (0, amizade_service_1.listarAmizades)(req.user.id);
        return res.json({
            success: true,
            total: amizades.length,
            data: amizades,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao listar amizades",
        });
    }
}
async function aceitarAmizadeController(req, res) {
    try {
        const { id } = req.params;
        const amizade = await (0, amizade_service_1.aceitarAmizade)(req.user.id, id);
        return res.json({
            success: true,
            message: "Solicitação aceita",
            data: amizade,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao aceitar solicitação",
        });
    }
}
async function recusarAmizadeController(req, res) {
    try {
        const { id } = req.params;
        const amizade = await (0, amizade_service_1.recusarAmizade)(req.user.id, id);
        return res.json({
            success: true,
            message: "Solicitação recusada",
            data: amizade,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao recusar solicitação",
        });
    }
}
async function removerAmizadeController(req, res) {
    try {
        const { id } = req.params;
        await (0, amizade_service_1.removerAmizade)(req.user.id, id);
        return res.json({
            success: true,
            message: "Amizade removida",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao remover amizade",
        });
    }
}
//# sourceMappingURL=amizade.controller.js.map