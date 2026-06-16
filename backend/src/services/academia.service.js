"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAcademia = createAcademia;
exports.listAcademias = listAcademias;
exports.getAcademiaById = getAcademiaById;
const prisma_1 = require("../lib/prisma");
const academia_schema_1 = require("../schemas/academia.schema");
async function createAcademia(data) {
    const academiaExistente = await prisma_1.prisma.academia.findUnique({
        where: {
            slug: data.slug,
        },
    });
    if (academiaExistente) {
        throw new Error("Já existe uma academia com este slug");
    }
    const academia = await prisma_1.prisma.academia.create({
        data,
    });
    return academia;
}
async function listAcademias() {
    return prisma_1.prisma.academia.findMany({
        where: {
            status: "ATIVO",
        },
        orderBy: {
            nome: "asc",
        },
    });
}
async function getAcademiaById(id) {
    const academia = await prisma_1.prisma.academia.findUnique({
        where: {
            id,
        },
    });
    if (!academia) {
        throw new Error("Academia não encontrada");
    }
    return academia;
}
//# sourceMappingURL=academia.service.js.map