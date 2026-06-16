"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuadraController = createQuadraController;
exports.listQuadrasController = listQuadrasController;
exports.getQuadraController = getQuadraController;
exports.updateQuadraController = updateQuadraController;
exports.updateStatusQuadraController = updateStatusQuadraController;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const quadra_schema_1 = require("../schemas/quadra.schema");
const quadra_service_1 = require("../services/quadra.service");
async function createQuadraController(req, res) {
    try {
        const { academiaId } = req.params;
        const data = quadra_schema_1.createQuadraSchema.parse(req.body);
        const quadra = await (0, quadra_service_1.createQuadra)(req.user.id, academiaId, data);
        return res.status(201).json({
            success: true,
            message: "Quadra criada com sucesso",
            data: quadra,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao criar quadra",
        });
    }
}
async function listQuadrasController(req, res) {
    try {
        const { academiaId } = req.params;
        const quadras = await (0, quadra_service_1.listQuadrasByAcademia)(academiaId);
        return res.json({
            success: true,
            total: quadras.length,
            data: quadras,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao listar quadras",
        });
    }
}
async function getQuadraController(req, res) {
    try {
        const { id } = req.params;
        const quadra = await (0, quadra_service_1.getQuadraById)(id);
        return res.json({
            success: true,
            data: quadra,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message || "Quadra não encontrada",
        });
    }
}
async function updateQuadraController(req, res) {
    try {
        const { id } = req.params;
        const data = quadra_schema_1.updateQuadraSchema.parse(req.body);
        const quadra = await (0, quadra_service_1.updateQuadra)(req.user.id, id, data);
        return res.json({
            success: true,
            message: "Quadra atualizada com sucesso",
            data: quadra,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao atualizar quadra",
        });
    }
}
async function updateStatusQuadraController(req, res) {
    try {
        const { id } = req.params;
        const { ativa } = quadra_schema_1.updateStatusQuadraSchema.parse(req.body);
        const quadra = await (0, quadra_service_1.updateStatusQuadra)(req.user.id, id, ativa);
        return res.json({
            success: true,
            message: "Status da quadra atualizado com sucesso",
            data: quadra,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao atualizar status da quadra",
        });
    }
}
//# sourceMappingURL=quadra.controller.js.map