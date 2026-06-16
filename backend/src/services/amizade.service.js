"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solicitarAmizade = solicitarAmizade;
exports.listarAmizades = listarAmizades;
exports.aceitarAmizade = aceitarAmizade;
exports.recusarAmizade = recusarAmizade;
exports.removerAmizade = removerAmizade;
const prisma_1 = require("../lib/prisma");
const amizade_schema_1 = require("../schemas/amizade.schema");
async function solicitarAmizade(usuarioId, data) {
    if (usuarioId === data.amigo_id) {
        throw new Error("Você não pode adicionar você mesmo como amigo");
    }
    const amigo = await prisma_1.prisma.usuario.findUnique({
        where: {
            id: data.amigo_id,
        },
    });
    if (!amigo) {
        throw new Error("Usuário não encontrado");
    }
    const amizadeExistente = await prisma_1.prisma.amizade.findFirst({
        where: {
            OR: [
                {
                    usuario_id: usuarioId,
                    amigo_id: data.amigo_id,
                },
                {
                    usuario_id: data.amigo_id,
                    amigo_id: usuarioId,
                },
            ],
        },
    });
    if (amizadeExistente) {
        throw new Error("Já existe uma solicitação ou amizade com este usuário");
    }
    return prisma_1.prisma.amizade.create({
        data: {
            usuario_id: usuarioId,
            amigo_id: data.amigo_id,
            status: "PENDENTE",
        },
        include: {
            usuario: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    foto_perfil: true,
                },
            },
            amigo: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    foto_perfil: true,
                },
            },
        },
    });
}
async function listarAmizades(usuarioId) {
    return prisma_1.prisma.amizade.findMany({
        where: {
            OR: [
                {
                    usuario_id: usuarioId,
                },
                {
                    amigo_id: usuarioId,
                },
            ],
        },
        include: {
            usuario: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    foto_perfil: true,
                },
            },
            amigo: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    foto_perfil: true,
                },
            },
        },
        orderBy: {
            criado_em: "desc",
        },
    });
}
async function aceitarAmizade(usuarioId, amizadeId) {
    const amizade = await prisma_1.prisma.amizade.findUnique({
        where: {
            id: amizadeId,
        },
    });
    if (!amizade) {
        throw new Error("Solicitação de amizade não encontrada");
    }
    if (amizade.amigo_id !== usuarioId) {
        throw new Error("Você não pode aceitar esta solicitação");
    }
    if (amizade.status !== "PENDENTE") {
        throw new Error("Esta solicitação não está pendente");
    }
    return prisma_1.prisma.amizade.update({
        where: {
            id: amizadeId,
        },
        data: {
            status: "ACEITA",
        },
        include: {
            usuario: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    foto_perfil: true,
                },
            },
            amigo: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    foto_perfil: true,
                },
            },
        },
    });
}
async function recusarAmizade(usuarioId, amizadeId) {
    const amizade = await prisma_1.prisma.amizade.findUnique({
        where: {
            id: amizadeId,
        },
    });
    if (!amizade) {
        throw new Error("Solicitação de amizade não encontrada");
    }
    if (amizade.amigo_id !== usuarioId) {
        throw new Error("Você não pode recusar esta solicitação");
    }
    if (amizade.status !== "PENDENTE") {
        throw new Error("Esta solicitação não está pendente");
    }
    return prisma_1.prisma.amizade.update({
        where: {
            id: amizadeId,
        },
        data: {
            status: "RECUSADA",
        },
    });
}
async function removerAmizade(usuarioId, amizadeId) {
    const amizade = await prisma_1.prisma.amizade.findUnique({
        where: {
            id: amizadeId,
        },
    });
    if (!amizade) {
        throw new Error("Amizade não encontrada");
    }
    const participaDaAmizade = amizade.usuario_id === usuarioId || amizade.amigo_id === usuarioId;
    if (!participaDaAmizade) {
        throw new Error("Você não pode remover esta amizade");
    }
    await prisma_1.prisma.amizade.delete({
        where: {
            id: amizadeId,
        },
    });
    return true;
}
//# sourceMappingURL=amizade.service.js.map