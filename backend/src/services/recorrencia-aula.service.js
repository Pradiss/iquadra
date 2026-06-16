"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecorrenciaAula = createRecorrenciaAula;
exports.listRecorrenciasAula = listRecorrenciasAula;
exports.getRecorrenciaAulaById = getRecorrenciaAulaById;
exports.cancelarRecorrenciaAula = cancelarRecorrenciaAula;
const prisma_1 = require("../lib/prisma");
const recorrencia_aula_schema_1 = require("../schemas/recorrencia-aula.schema");
function timeToDate(data, hora) {
    return new Date(`${data}T${hora}:00`);
}
function addDays(date, days) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}
function formatDate(date) {
    return date.toISOString().split("T")[0];
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
        throw new Error("Você não tem permissão para criar recorrência nesta academia");
    }
}
async function validarConflitos(quadraId, inicio, fim) {
    const jogo = await prisma_1.prisma.jogo.findFirst({
        where: {
            quadra_id: quadraId,
            status: { in: ["ABERTO", "COMPLETO"] },
            inicio_em: { lt: fim },
            fim_em: { gt: inicio },
        },
    });
    if (jogo)
        throw new Error(`Conflito com jogo em ${inicio.toISOString()}`);
    const aula = await prisma_1.prisma.aula.findFirst({
        where: {
            quadra_id: quadraId,
            status: "CONFIRMADA",
            inicio_em: { lt: fim },
            fim_em: { gt: inicio },
        },
    });
    if (aula)
        throw new Error(`Conflito com aula em ${inicio.toISOString()}`);
    const bloqueio = await prisma_1.prisma.bloqueioQuadra.findFirst({
        where: {
            quadra_id: quadraId,
            inicio_em: { lt: fim },
            fim_em: { gt: inicio },
        },
    });
    if (bloqueio)
        throw new Error(`Conflito com bloqueio em ${inicio.toISOString()}`);
}
async function createRecorrenciaAula(usuarioId, data) {
    await verificarPermissaoAcademia(usuarioId, data.academia_id);
    const quadra = await prisma_1.prisma.quadra.findUnique({
        where: { id: data.quadra_id },
    });
    if (!quadra)
        throw new Error("Quadra não encontrada");
    if (!quadra.ativa)
        throw new Error("Quadra inativa");
    if (quadra.academia_id !== data.academia_id) {
        throw new Error("Quadra não pertence à academia informada");
    }
    const inicioBase = new Date(`${data.data_inicio}T00:00:00`);
    const fimBase = data.data_fim
        ? new Date(`${data.data_fim}T00:00:00`)
        : addDays(inicioBase, 90);
    const aulasParaCriar = [];
    let dataAtual = inicioBase;
    while (dataAtual <= fimBase) {
        const diaSemana = dataAtual.getDay();
        if (data.dias_semana.includes(diaSemana)) {
            const dataFormatada = formatDate(dataAtual);
            const inicio = timeToDate(dataFormatada, data.horario_inicio);
            const fim = timeToDate(dataFormatada, data.horario_fim);
            if (fim <= inicio) {
                throw new Error("Horário final deve ser maior que o horário inicial");
            }
            await validarConflitos(data.quadra_id, inicio, fim);
            aulasParaCriar.push({
                inicio_em: inicio,
                fim_em: fim,
            });
        }
        dataAtual = addDays(dataAtual, 1);
    }
    if (aulasParaCriar.length === 0) {
        throw new Error("Nenhuma aula foi gerada para os dias informados");
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const recorrencia = await tx.recorrenciaAula.create({
            data: {
                academia_id: data.academia_id,
                quadra_id: data.quadra_id,
                professor_id: data.professor_id,
                dias_semana: data.dias_semana.join(","),
                data_inicio: inicioBase,
                data_fim: fimBase,
                horario_inicio: data.horario_inicio,
                horario_fim: data.horario_fim,
            },
        });
        await tx.aula.createMany({
            data: aulasParaCriar.map((aula) => ({
                academia_id: data.academia_id,
                quadra_id: data.quadra_id,
                professor_id: data.professor_id,
                inicio_em: aula.inicio_em,
                fim_em: aula.fim_em,
                recorrente: true,
                recorrencia_id: recorrencia.id,
                observacoes: data.observacoes,
            })),
        });
        return recorrencia;
    });
    return getRecorrenciaAulaById(result.id);
}
async function listRecorrenciasAula(params) {
    const where = {};
    if (params.academia_id)
        where.academia_id = params.academia_id;
    if (params.quadra_id)
        where.quadra_id = params.quadra_id;
    if (params.professor_id)
        where.professor_id = params.professor_id;
    return prisma_1.prisma.recorrenciaAula.findMany({
        where,
        include: {
            academia: true,
            quadra: true,
            aulas: true,
        },
        orderBy: {
            criado_em: "desc",
        },
    });
}
async function getRecorrenciaAulaById(id) {
    const recorrencia = await prisma_1.prisma.recorrenciaAula.findUnique({
        where: { id },
        include: {
            academia: true,
            quadra: true,
            aulas: true,
        },
    });
    if (!recorrencia) {
        throw new Error("Recorrência não encontrada");
    }
    return recorrencia;
}
async function cancelarRecorrenciaAula(usuarioId, recorrenciaId) {
    const recorrencia = await prisma_1.prisma.recorrenciaAula.findUnique({
        where: { id: recorrenciaId },
    });
    if (!recorrencia) {
        throw new Error("Recorrência não encontrada");
    }
    await verificarPermissaoAcademia(usuarioId, recorrencia.academia_id);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.recorrenciaAula.update({
            where: { id: recorrenciaId },
            data: { status: "CANCELADA" },
        }),
        prisma_1.prisma.aula.updateMany({
            where: {
                recorrencia_id: recorrenciaId,
                status: "CONFIRMADA",
            },
            data: {
                status: "CANCELADA",
            },
        }),
    ]);
    return getRecorrenciaAulaById(recorrenciaId);
}
//# sourceMappingURL=recorrencia-aula.service.js.map