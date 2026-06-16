"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJogo = createJogo;
exports.listJogos = listJogos;
exports.getJogoById = getJogoById;
exports.participarJogo = participarJogo;
exports.sairJogo = sairJogo;
exports.cancelarJogo = cancelarJogo;
const prisma_1 = require("../lib/prisma");
const jogo_schema_1 = require("../schemas/jogo.schema");
function validarPeriodo(inicio, fim) {
    if (fim <= inicio) {
        throw new Error("Horário final deve ser maior que o horário inicial");
    }
}
function getMaximoParticipantes(tipo) {
    return tipo === "SIMPLES" ? 2 : 4;
}
async function validarConflitoAgenda(quadraId, inicio, fim) {
    const jogoConflitante = await prisma_1.prisma.jogo.findFirst({
        where: {
            quadra_id: quadraId,
            status: {
                in: ["ABERTO", "COMPLETO"],
            },
            inicio_em: {
                lt: fim,
            },
            fim_em: {
                gt: inicio,
            },
        },
    });
    if (jogoConflitante) {
        throw new Error("Já existe um jogo nesse horário");
    }
    const aulaConflitante = await prisma_1.prisma.aula.findFirst({
        where: {
            quadra_id: quadraId,
            status: "CONFIRMADA",
            inicio_em: {
                lt: fim,
            },
            fim_em: {
                gt: inicio,
            },
        },
    });
    if (aulaConflitante) {
        throw new Error("Já existe uma aula nesse horário");
    }
    const bloqueioConflitante = await prisma_1.prisma.bloqueioQuadra.findFirst({
        where: {
            quadra_id: quadraId,
            inicio_em: {
                lt: fim,
            },
            fim_em: {
                gt: inicio,
            },
        },
    });
    if (bloqueioConflitante) {
        throw new Error("Este horário está bloqueado");
    }
}
async function createJogo(usuarioId, data) {
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
    await validarConflitoAgenda(data.quadra_id, inicio, fim);
    const maximoParticipantes = getMaximoParticipantes(data.tipo_jogo);
    const jogo = await prisma_1.prisma.$transaction(async (tx) => {
        const novoJogo = await tx.jogo.create({
            data: {
                academia_id: data.academia_id,
                quadra_id: data.quadra_id,
                criado_por_usuario_id: usuarioId,
                responsavel_usuario_id: usuarioId,
                tipo_jogo: data.tipo_jogo,
                inicio_em: inicio,
                fim_em: fim,
                maximo_participantes: maximoParticipantes,
                observacoes: data.observacoes,
            },
        });
        await tx.participanteJogo.create({
            data: {
                jogo_id: novoJogo.id,
                usuario_id: usuarioId,
                papel: "CRIADOR",
                status: "CONFIRMADO",
            },
        });
        return novoJogo;
    });
    return getJogoById(jogo.id);
}
async function listJogos(params) {
    const where = {};
    if (params.academia_id) {
        where.academia_id = params.academia_id;
    }
    if (params.status) {
        where.status = params.status;
    }
    if (params.data) {
        where.inicio_em = {
            gte: new Date(`${params.data}T00:00:00`),
            lte: new Date(`${params.data}T23:59:59`),
        };
    }
    return prisma_1.prisma.jogo.findMany({
        where,
        include: {
            academia: true,
            quadra: true,
            participantes: {
                where: {
                    status: "CONFIRMADO",
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            foto_perfil: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            inicio_em: "asc",
        },
    });
}
async function getJogoById(id) {
    const jogo = await prisma_1.prisma.jogo.findUnique({
        where: {
            id,
        },
        include: {
            academia: true,
            quadra: true,
            participantes: {
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            foto_perfil: true,
                        },
                    },
                },
            },
        },
    });
    if (!jogo) {
        throw new Error("Jogo não encontrado");
    }
    return jogo;
}
async function participarJogo(usuarioId, jogoId) {
    const jogo = await prisma_1.prisma.jogo.findUnique({
        where: {
            id: jogoId,
        },
        include: {
            participantes: {
                where: {
                    status: "CONFIRMADO",
                },
            },
        },
    });
    if (!jogo) {
        throw new Error("Jogo não encontrado");
    }
    if (jogo.status !== "ABERTO") {
        throw new Error("Este jogo não está aberto para participantes");
    }
    const jaParticipa = jogo.participantes.some((participante) => participante.usuario_id === usuarioId);
    if (jaParticipa) {
        throw new Error("Você já participa deste jogo");
    }
    if (jogo.participantes.length >= jogo.maximo_participantes) {
        throw new Error("Este jogo já está completo");
    }
    await prisma_1.prisma.participanteJogo.create({
        data: {
            jogo_id: jogoId,
            usuario_id: usuarioId,
            papel: "JOGADOR",
            status: "CONFIRMADO",
        },
    });
    const totalParticipantes = jogo.participantes.length + 1;
    if (totalParticipantes >= jogo.maximo_participantes) {
        await prisma_1.prisma.jogo.update({
            where: {
                id: jogoId,
            },
            data: {
                status: "COMPLETO",
            },
        });
    }
    return getJogoById(jogoId);
}
async function sairJogo(usuarioId, jogoId) {
    const participante = await prisma_1.prisma.participanteJogo.findUnique({
        where: {
            jogo_id_usuario_id: {
                jogo_id: jogoId,
                usuario_id: usuarioId,
            },
        },
    });
    if (!participante || participante.status !== "CONFIRMADO") {
        throw new Error("Você não participa deste jogo");
    }
    await prisma_1.prisma.participanteJogo.update({
        where: {
            id: participante.id,
        },
        data: {
            status: "SAIU",
        },
    });
    const participantesAtivos = await prisma_1.prisma.participanteJogo.count({
        where: {
            jogo_id: jogoId,
            status: "CONFIRMADO",
        },
    });
    if (participantesAtivos === 0) {
        await prisma_1.prisma.jogo.update({
            where: {
                id: jogoId,
            },
            data: {
                status: "SEM_PARTICIPANTES",
            },
        });
    }
    else {
        await prisma_1.prisma.jogo.update({
            where: {
                id: jogoId,
            },
            data: {
                status: "ABERTO",
            },
        });
    }
    return getJogoById(jogoId);
}
async function cancelarJogo(usuarioId, jogoId) {
    const jogo = await prisma_1.prisma.jogo.findUnique({
        where: {
            id: jogoId,
        },
    });
    if (!jogo) {
        throw new Error("Jogo não encontrado");
    }
    const podeCancelar = jogo.criado_por_usuario_id === usuarioId ||
        jogo.responsavel_usuario_id === usuarioId;
    if (!podeCancelar) {
        throw new Error("Você não tem permissão para cancelar este jogo");
    }
    await prisma_1.prisma.jogo.update({
        where: {
            id: jogoId,
        },
        data: {
            status: "CANCELADO",
        },
    });
    return getJogoById(jogoId);
}
//# sourceMappingURL=jogo.service.js.map