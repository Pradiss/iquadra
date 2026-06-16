"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDisponibilidadeQuadraController = getDisponibilidadeQuadraController;
const express_1 = require("express");
const disponibilidade_service_1 = require("../services/disponibilidade.service");
async function getDisponibilidadeQuadraController(req, res) {
    try {
        const { id } = req.params;
        const { data } = req.query;
        if (!data || typeof data !== "string") {
            return res.status(400).json({
                success: false,
                message: "Informe a data no formato YYYY-MM-DD",
            });
        }
        const disponibilidade = await (0, disponibilidade_service_1.getDisponibilidadeQuadra)(id, data);
        return res.json({
            success: true,
            data: disponibilidade,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao consultar disponibilidade",
        });
    }
}
//# sourceMappingURL=disponibilidade.controller.js.map