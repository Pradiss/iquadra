"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAcademiaController = createAcademiaController;
exports.listAcademiasController = listAcademiasController;
exports.getAcademiaController = getAcademiaController;
const express_1 = require("express");
const academia_schema_1 = require("../schemas/academia.schema");
const academia_service_1 = require("../services/academia.service");
async function createAcademiaController(req, res) {
    try {
        const data = academia_schema_1.createAcademiaSchema.parse(req.body);
        const academia = await (0, academia_service_1.createAcademia)(data);
        return res.status(201).json({
            success: true,
            message: "Academia criada com sucesso",
            data: academia,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao criar academia",
        });
    }
}
async function listAcademiasController(req, res) {
    const academias = await (0, academia_service_1.listAcademias)();
    return res.json({
        success: true,
        total: academias.length,
        data: academias,
    });
}
async function getAcademiaController(req, res) {
    try {
        const { id } = req.params;
        const academia = await (0, academia_service_1.getAcademiaById)(id);
        return res.json({
            success: true,
            data: academia,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message || "Academia não encontrada",
        });
    }
}
//# sourceMappingURL=academia.controller.js.map