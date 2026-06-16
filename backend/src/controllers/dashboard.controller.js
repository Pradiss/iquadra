"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAcademiaController = getDashboardAcademiaController;
exports.getAgendaAcademiaController = getAgendaAcademiaController;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const dashboard_service_1 = require("../services/dashboard.service");
async function getDashboardAcademiaController(req, res) {
    try {
        const { academiaId } = req.params;
        const dashboard = await (0, dashboard_service_1.getDashboardAcademia)(req.user.id, academiaId);
        return res.json({
            success: true,
            data: dashboard,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao buscar dashboard",
        });
    }
}
async function getAgendaAcademiaController(req, res) {
    try {
        const { academiaId } = req.params;
        const { data } = req.query;
        if (!data || typeof data !== "string") {
            return res.status(400).json({
                success: false,
                message: "Informe a data no formato YYYY-MM-DD",
            });
        }
        const agenda = await (0, dashboard_service_1.getAgendaAcademia)(req.user.id, academiaId, data);
        return res.json({
            success: true,
            data: agenda,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao buscar agenda da academia",
        });
    }
}
//# sourceMappingURL=dashboard.controller.js.map