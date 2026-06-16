"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerClienteController = registerClienteController;
exports.registerProfessorController = registerProfessorController;
exports.registerAcademiaController = registerAcademiaController;
exports.loginController = loginController;
const express_1 = require("express");
const auth_schema_1 = require("../schemas/auth.schema");
const auth_service_1 = require("../services/auth.service");
async function registerClienteController(req, res) {
    try {
        const data = auth_schema_1.registerClienteSchema.parse(req.body);
        const usuario = await (0, auth_service_1.registerCliente)(data);
        return res.status(201).json({
            success: true,
            message: "Cliente cadastrado com sucesso",
            data: usuario,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao cadastrar cliente",
        });
    }
}
async function registerProfessorController(req, res) {
    try {
        const data = auth_schema_1.registerProfessorSchema.parse(req.body);
        const usuario = await (0, auth_service_1.registerProfessor)(data);
        return res.status(201).json({
            success: true,
            message: "Professor cadastrado com sucesso",
            data: usuario,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao cadastrar professor",
        });
    }
}
async function registerAcademiaController(req, res) {
    try {
        const data = auth_schema_1.registerAcademiaSchema.parse(req.body);
        const result = await (0, auth_service_1.registerAcademia)(data);
        return res.status(201).json({
            success: true,
            message: "Academia cadastrada com sucesso",
            data: result,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao cadastrar academia",
        });
    }
}
async function loginController(req, res) {
    try {
        const data = auth_schema_1.loginSchema.parse(req.body);
        const result = await (0, auth_service_1.loginUser)(data);
        return res.json({
            success: true,
            message: "Login realizado com sucesso",
            data: result,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Erro ao fazer login",
        });
    }
}
//# sourceMappingURL=auth.controller.js.map