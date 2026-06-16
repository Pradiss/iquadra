"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJogoController = createJogoController;
exports.listJogosController = listJogosController;
exports.getJogoController = getJogoController;
exports.participarJogoController = participarJogoController;
exports.sairJogoController = sairJogoController;
exports.cancelarJogoController = cancelarJogoController;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const jogo_schema_1 = require("../schemas/jogo.schema");
const jogo_service_1 = require("../services/jogo.service");
async function createJogoController(req, res) {
    try {
        const data = jogo_schema_1.createJogoSchema.parse(req.body);
        const jogo = await (0, jogo_service_1.createJogo)(req.user.id, data);
        return res.status(201).json({
            success: true,
            message: "Jogo criado com sucesso",
            data: jogo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao criar jogo",
        });
    }
}
async function listJogosController(req, res) {
    try {
        const { academia_id, data, status } = req.query;
        const jogos = await (0, jogo_service_1.listJogos)({
            academia_id: academia_id,
            data: data,
            status: status,
        });
        return res.json({
            success: true,
            total: jogos.length,
            data: jogos,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao listar jogos",
        });
    }
}
async function getJogoController(req, res) {
    try {
        const { id } = req.params;
        const jogo = await (0, jogo_service_1.getJogoById)(id);
        return res.json({
            success: true,
            data: jogo,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message || "Jogo não encontrado",
        });
    }
}
async function participarJogoController(req, res) {
    try {
        const { id } = req.params;
        const jogo = await (0, jogo_service_1.participarJogo)(req.user.id, id);
        return res.json({
            success: true,
            message: "Você entrou no jogo",
            data: jogo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao participar do jogo",
        });
    }
}
async function sairJogoController(req, res) {
    try {
        const { id } = req.params;
        const jogo = await (0, jogo_service_1.sairJogo)(req.user.id, id);
        return res.json({
            success: true,
            message: "Você saiu do jogo",
            data: jogo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao sair do jogo",
        });
    }
}
async function cancelarJogoController(req, res) {
    try {
        const { id } = req.params;
        const jogo = await (0, jogo_service_1.cancelarJogo)(req.user.id, id);
        return res.json({
            success: true,
            message: "Jogo cancelado com sucesso",
            data: jogo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao cancelar jogo",
        });
    }
}
//# sourceMappingURL=jogo.controller.js.map