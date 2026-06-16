"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAula = createAula;
exports.listAulas = listAulas;
exports.getAulaById = getAulaById;
exports.cancelarAula = cancelarAula;
const prisma_1 = require("../lib/prisma");
const aula_schema_1 = require("../schemas/aula.schema");
function validarPeriodo(inicio, fim) {
    if (fim <= inicio) {
        throw new Error("Horário final deve ser maior que o horário inicial");
    }
}
async function verificarPermissaoAcademia(usuarioId, academiaId) {
    const vinculo = await prisma_1.prisma.academiaUsuario.findFirst({
        where: {
            usuario_id: usuarioId,
            academia_id: academiaId,
            status: "ATIVO",
            perfil: {
                in: ["DONO", "ADMIN_ACADEMIA", "FUNCIONARIO", "PROFESSOR"],
            },
        },
    });
    if (!vinculo) {
        throw new Error("Você não tem permissão para criar aula nesta academia");
    }
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
        throw new Error("Já existe um jogo nesse horário");
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
        throw new Error("Já existe uma aula nesse horário");
    }
    const bloqueioConflitante = await prisma_1.prisma.bloqueioQuadra.findFirst({
        where: {
            quadra_id: quadraId,
            inicio_em: { lt: fim },
            fim_em: { gt: inicio },
        },
    });
    if (bloqueioConflitante) {
        throw new Error("Este horário está bloqueado");
    }
}
async function createAula(usuarioId, data) {
    const inicio = new Date(data.inicio_em);
    const fim = new Date(data.fim_em);
    validarPeriodo(inicio, fim);
    const quadra = await prisma_1.prisma.quadra.findUnique({
        where: {
            id: data.quadra_id,
        },
    });
    if (!quadra) {
        throw new Error("Quadra não encontrada");
    }
    if (!quadra.ativa) {
        throw new Error("Quadra inativa");
    }
    if (quadra.academia_id !== data.academia_id) {
        throw new Error("Quadra não pertence à academia informada");
    }
    await verificarPermissaoAcademia(usuarioId, data.academia_id);
    await validarConflitos(data.quadra_id, inicio, fim);
    return prisma_1.prisma.aula.create({
        data: {
            academia_id: data.academia_id,
            quadra_id: data.quadra_id,
            professor_id: data.professor_id,
            cliente_id: data.cliente_id,
            inicio_em: inicio,
            fim_em: fim,
            observacoes: data.observacoes,
        },
        include: {
            academia: true,
            quadra: true,
            professor: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    foto_perfil: true,
                },
            },
            cliente: {
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
async function listAulas(params) {
    const where = {};
    if (params.academia_id)
        where.academia_id = params.academia_id;
    if (params.quadra_id)
        where.quadra_id = params.quadra_id;
    if (params.professor_id)
        where.professor_id = params.professor_id;
    if (params.cliente_id)
        where.cliente_id = params.cliente_id;
    if (params.data) {
        where.inicio_em = {
            gte: new Date(`${params.data}T00:00:00`),
            lte: new Date(`${params.data}T23:59:59`),
        };
    }
    return prisma_1.prisma.aula.findMany({
        where,
        include: {
            academia: true,
            quadra: true,
            professor: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    foto_perfil: true,
                },
            },
            cliente: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    foto_perfil: true,
                },
            },
        },
        orderBy: {
            inicio_em: "asc",
        },
    });
}
async function getAulaById(id) {
    const aula = await prisma_1.prisma.aula.findUnique({
        where: { id },
        include: {
            academia: true,
            quadra: true,
            professor: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    foto_perfil: true,
                },
            },
            cliente: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    foto_perfil: true,
                },
            },
        },
    });
    if (!aula) {
        throw new Error("Aula não encontrada");
    }
    return aula;
}
async function cancelarAula(usuarioId, aulaId) {
    const aula = await prisma_1.prisma.aula.findUnique({
        where: {
            id: aulaId,
        },
    });
    if (!aula) {
        throw new Error("Aula não encontrada");
    }
    await verificarPermissaoAcademia(usuarioId, aula.academia_id);
    await prisma_1.prisma.aula.update({
        where: {
            id: aulaId,
        },
        data: {
            status: "CANCELADA",
        },
    });
    return getAulaById(aulaId);
}
//# sourceMappingURL=aula.service.js.map