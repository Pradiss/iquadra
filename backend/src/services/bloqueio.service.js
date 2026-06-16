"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBloqueio = createBloqueio;
exports.listBloqueiosByQuadra = listBloqueiosByQuadra;
exports.deleteBloqueio = deleteBloqueio;
const prisma_1 = require("../lib/prisma");
const bloqueio_schema_1 = require("../schemas/bloqueio.schema");
function validarPeriodo(inicio, fim) {
    if (fim <= inicio) {
        throw new Error("Horário final deve ser maior que o horário inicial");
    }
}
async function verificarPermissaoPorQuadra(usuarioId, quadraId) {
    const quadra = await prisma_1.prisma.quadra.findUnique({
        where: { id: quadraId },
    });
    if (!quadra) {
        throw new Error("Quadra não encontrada");
    }
    const vinculo = await prisma_1.prisma.academiaUsuario.findFirst({
        where: {
            usuario_id: usuarioId,
            academia_id: quadra.academia_id,
            status: "ATIVO",
            perfil: {
                in: ["DONO", "ADMIN_ACADEMIA", "FUNCIONARIO"],
            },
        },
    });
    if (!vinculo) {
        throw new Error("Você não tem permissão para gerenciar esta quadra");
    }
    return quadra;
}
async function validarConflitos(quadraId, inicio, fim) {
    const jogoConflitante = await prisma_1.prisma.jogo.findFirst({
        where: {
            quadra_id: quadraId,
            status: {
                in: ["ABERTO", "COMPLETO"],
            },
            inicio_em: { lt: fim },
            fim_em: { gt: inicio },
        },
    });
    if (jogoConflitante) {
        throw new Error("Não é possível bloquear: já existe jogo nesse período");
    }
    const aulaConflitante = await prisma_1.prisma.aula.findFirst({
        where: {
            quadra_id: quadraId,
            status: "CONFIRMADA",
            inicio_em: { lt: fim },
            fim_em: { gt: inicio },
        },
    });
    if (aulaConflitante) {
        throw new Error("Não é possível bloquear: já existe aula nesse período");
    }
    const bloqueioConflitante = await prisma_1.prisma.bloqueioQuadra.findFirst({
        where: {
            quadra_id: quadraId,
            inicio_em: { lt: fim },
            fim_em: { gt: inicio },
        },
    });
    if (bloqueioConflitante) {
        throw new Error("Já existe bloqueio nesse período");
    }
}
async function createBloqueio(usuarioId, quadraId, data) {
    await verificarPermissaoPorQuadra(usuarioId, quadraId);
    const inicio = new Date(data.inicio_em);
    const fim = new Date(data.fim_em);
    validarPeriodo(inicio, fim);
    await validarConflitos(quadraId, inicio, fim);
    return prisma_1.prisma.bloqueioQuadra.create({
        data: {
            quadra_id: quadraId,
            inicio_em: inicio,
            fim_em: fim,
            tipo_bloqueio: data.tipo_bloqueio ?? "OUTRO",
            motivo: data.motivo,
            criado_por_usuario_id: usuarioId,
        },
    });
}
async function listBloqueiosByQuadra(quadraId) {
    return prisma_1.prisma.bloqueioQuadra.findMany({
        where: {
            quadra_id: quadraId,
        },
        include: {
            criado_por: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                },
            },
        },
        orderBy: {
            inicio_em: "asc",
        },
    });
}
async function deleteBloqueio(usuarioId, bloqueioId) {
    const bloqueio = await prisma_1.prisma.bloqueioQuadra.findUnique({
        where: { id: bloqueioId },
    });
    if (!bloqueio) {
        throw new Error("Bloqueio não encontrado");
    }
    await verificarPermissaoPorQuadra(usuarioId, bloqueio.quadra_id);
    await prisma_1.prisma.bloqueioQuadra.delete({
        where: { id: bloqueioId },
    });
    return true;
}
//# sourceMappingURL=bloqueio.service.js.map