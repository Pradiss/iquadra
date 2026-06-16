"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convidarJogadorController = convidarJogadorController;
exports.listarConvitesJogosController = listarConvitesJogosController;
exports.aceitarConviteJogoController = aceitarConviteJogoController;
exports.recusarConviteJogoController = recusarConviteJogoController;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const convite_jogo_schema_1 = require("../schemas/convite-jogo.schema");
const convite_jogo_service_1 = require("../services/convite-jogo.service");
async function convidarJogadorController(req, res) {
    try {
        const { id } = req.params;
        const data = convite_jogo_schema_1.convidarJogadorSchema.parse(req.body);
        const convite = await (0, convite_jogo_service_1.convidarJogadorParaJogo)(req.user.id, id, data);
        return res.status(201).json({
            success: true,
            message: "Convite enviado com sucesso",
            data: convite,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao enviar convite",
        });
    }
}
async function listarConvitesJogosController(req, res) {
    try {
        const convites = await (0, convite_jogo_service_1.listarConvitesJogos)(req.user.id);
        return res.json({
            success: true,
            total: convites.length,
            data: convites,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao listar convites",
        });
    }
}
async function aceitarConviteJogoController(req, res) {
    try {
        const { id } = req.params;
        const convite = await (0, convite_jogo_service_1.aceitarConviteJogo)(req.user.id, id);
        return res.json({
            success: true,
            message: "Convite aceito com sucesso",
            data: convite,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao aceitar convite",
        });
    }
}
async function recusarConviteJogoController(req, res) {
    try {
        const { id } = req.params;
        const convite = await (0, convite_jogo_service_1.recusarConviteJogo)(req.user.id, id);
        return res.json({
            success: true,
            message: "Convite recusado",
            data: convite,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao recusar convite",
        });
    }
}
//# sourceMappingURL=convite-jogo.controller.js.map