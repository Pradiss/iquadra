"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meController = meController;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const prisma_1 = require("../lib/prisma");
async function meController(req, res) {
    const usuario = await prisma_1.prisma.usuario.findUnique({
        where: {
            id: req.user.id,
        },
        select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            foto_perfil: true,
            status: true,
            perfil_cliente: true,
            perfil_professor: true,
            academias: {
                include: {
                    academia: true,
                },
            },
            criado_em: true,
            atualizado_em: true,
        },
    });
    if (!usuario) {
        return res.status(404).json({
            success: false,
            message: "Usuario nao encontrado",
        });
    }
    return res.json({
        success: true,
        data: usuario,
        user: usuario,
    });
}
//# sourceMappingURL=user.controller.js.map