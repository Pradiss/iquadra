"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBloqueioController = createBloqueioController;
exports.listBloqueiosController = listBloqueiosController;
exports.deleteBloqueioController = deleteBloqueioController;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const bloqueio_schema_1 = require("../schemas/bloqueio.schema");
const bloqueio_service_1 = require("../services/bloqueio.service");
async function createBloqueioController(req, res) {
    try {
        const { quadraId } = req.params;
        const data = bloqueio_schema_1.createBloqueioSchema.parse(req.body);
        const bloqueio = await (0, bloqueio_service_1.createBloqueio)(req.user.id, quadraId, data);
        return res.status(201).json({
            success: true,
            message: "Bloqueio criado com sucesso",
            data: bloqueio,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao criar bloqueio",
        });
    }
}
async function listBloqueiosController(req, res) {
    try {
        const { quadraId } = req.params;
        const bloqueios = await (0, bloqueio_service_1.listBloqueiosByQuadra)(quadraId);
        return res.json({
            success: true,
            total: bloqueios.length,
            data: bloqueios,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao listar bloqueios",
        });
    }
}
async function deleteBloqueioController(req, res) {
    try {
        const { id } = req.params;
        await (0, bloqueio_service_1.deleteBloqueio)(req.user.id, id);
        return res.json({
            success: true,
            message: "Bloqueio removido com sucesso",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao remover bloqueio",
        });
    }
}
//# sourceMappingURL=bloqueio.controller.js.map