"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuadra = createQuadra;
exports.listQuadrasByAcademia = listQuadrasByAcademia;
exports.getQuadraById = getQuadraById;
exports.updateQuadra = updateQuadra;
exports.updateStatusQuadra = updateStatusQuadra;
const prisma_1 = require("../lib/prisma");
const quadra_schema_1 = require("../schemas/quadra.schema");
async function verificarPermissaoAcademia(usuarioId, academiaId) {
    const vinculo = await prisma_1.prisma.academiaUsuario.findFirst({
        where: {
            usuario_id: usuarioId,
            academia_id: academiaId,
            status: "ATIVO",
            perfil: {
                in: ["DONO", "ADMIN_ACADEMIA", "FUNCIONARIO"],
            },
        },
    });
    if (!vinculo) {
        throw new Error("Você não tem permissão para gerenciar esta academia");
    }
}
async function createQuadra(usuarioId, academiaId, data) {
    await verificarPermissaoAcademia(usuarioId, academiaId);
    return prisma_1.prisma.quadra.create({
        data: {
            academia_id: academiaId,
            nome: data.nome,
            descricao: data.descricao,
            tipo_piso: data.tipo_piso,
            coberta: data.coberta ?? false,
            ordem_exibicao: data.ordem_exibicao ?? 0,
        },
    });
}
async function listQuadrasByAcademia(academiaId) {
    return prisma_1.prisma.quadra.findMany({
        where: {
            academia_id: academiaId,
        },
        orderBy: {
            ordem_exibicao: "asc",
        },
    });
}
async function getQuadraById(id) {
    const quadra = await prisma_1.prisma.quadra.findUnique({
        where: { id },
        include: {
            academia: true,
            horarios: true,
        },
    });
    if (!quadra) {
        throw new Error("Quadra não encontrada");
    }
    return quadra;
}
async function updateQuadra(usuarioId, quadraId, data) {
    const quadra = await prisma_1.prisma.quadra.findUnique({
        where: { id: quadraId },
    });
    if (!quadra) {
        throw new Error("Quadra não encontrada");
    }
    await verificarPermissaoAcademia(usuarioId, quadra.academia_id);
    return prisma_1.prisma.quadra.update({
        where: { id: quadraId },
        data,
    });
}
async function updateStatusQuadra(usuarioId, quadraId, ativa) {
    const quadra = await prisma_1.prisma.quadra.findUnique({
        where: { id: quadraId },
    });
    if (!quadra) {
        throw new Error("Quadra não encontrada");
    }
    await verificarPermissaoAcademia(usuarioId, quadra.academia_id);
    return prisma_1.prisma.quadra.update({
        where: { id: quadraId },
        data: { ativa },
    });
}
//# sourceMappingURL=quadra.service.js.map