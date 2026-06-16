"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHorarioQuadra = createHorarioQuadra;
exports.listHorariosQuadra = listHorariosQuadra;
exports.updateHorarioQuadra = updateHorarioQuadra;
exports.deleteHorarioQuadra = deleteHorarioQuadra;
const prisma_1 = require("../lib/prisma");
const horario_quadra_schema_1 = require("../schemas/horario-quadra.schema");
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
async function createHorarioQuadra(usuarioId, quadraId, data) {
    await verificarPermissaoPorQuadra(usuarioId, quadraId);
    return prisma_1.prisma.horarioQuadra.create({
        data: {
            quadra_id: quadraId,
            dia_semana: data.dia_semana,
            abre_as: data.abre_as,
            fecha_as: data.fecha_as,
            duracao_slot_minutos: data.duracao_slot_minutos ?? 60,
            ativo: data.ativo ?? true,
        },
    });
}
async function listHorariosQuadra(quadraId) {
    return prisma_1.prisma.horarioQuadra.findMany({
        where: {
            quadra_id: quadraId,
        },
        orderBy: {
            dia_semana: "asc",
        },
    });
}
async function updateHorarioQuadra(usuarioId, horarioId, data) {
    const horario = await prisma_1.prisma.horarioQuadra.findUnique({
        where: { id: horarioId },
    });
    if (!horario) {
        throw new Error("Horário não encontrado");
    }
    await verificarPermissaoPorQuadra(usuarioId, horario.quadra_id);
    return prisma_1.prisma.horarioQuadra.update({
        where: { id: horarioId },
        data,
    });
}
async function deleteHorarioQuadra(usuarioId, horarioId) {
    const horario = await prisma_1.prisma.horarioQuadra.findUnique({
        where: { id: horarioId },
    });
    if (!horario) {
        throw new Error("Horário não encontrado");
    }
    await verificarPermissaoPorQuadra(usuarioId, horario.quadra_id);
    await prisma_1.prisma.horarioQuadra.delete({
        where: { id: horarioId },
    });
    return true;
}
//# sourceMappingURL=horario-quadra.service.js.map