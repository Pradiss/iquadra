"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCliente = registerCliente;
exports.registerProfessor = registerProfessor;
exports.registerAcademia = registerAcademia;
exports.loginUser = loginUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const auth_schema_1 = require("../schemas/auth.schema");
async function validarEmailDisponivel(email) {
    const usuario = await prisma_1.prisma.usuario.findUnique({
        where: { email },
    });
    if (usuario) {
        throw new Error("Este e-mail já está cadastrado");
    }
}
function gerarToken(usuario) {
    return jsonwebtoken_1.default.sign({
        sub: usuario.id,
        email: usuario.email,
    }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
}
async function registerCliente(data) {
    await validarEmailDisponivel(data.email);
    const senhaHash = await bcrypt_1.default.hash(data.senha, 10);
    const usuario = await prisma_1.prisma.usuario.create({
        data: {
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            senha_hash: senhaHash,
            foto_perfil: data.foto_perfil,
            perfil_cliente: {
                create: {
                    categoria: data.categoria,
                    cidade: data.cidade,
                    cep: data.cep,
                },
            },
        },
        select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            foto_perfil: true,
            status: true,
            perfil_cliente: true,
            criado_em: true,
        },
    });
    return usuario;
}
async function registerProfessor(data) {
    await validarEmailDisponivel(data.email);
    const senhaHash = await bcrypt_1.default.hash(data.senha, 10);
    const usuario = await prisma_1.prisma.usuario.create({
        data: {
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            senha_hash: senhaHash,
            foto_perfil: data.foto_perfil,
            perfil_professor: {
                create: {
                    bio: data.bio,
                    especialidades: data.especialidades,
                    cidade: data.cidade,
                },
            },
        },
        select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            foto_perfil: true,
            status: true,
            perfil_professor: true,
            criado_em: true,
        },
    });
    return usuario;
}
async function registerAcademia(data) {
    await validarEmailDisponivel(data.email);
    const slugExistente = await prisma_1.prisma.academia.findUnique({
        where: { slug: data.slug },
    });
    if (slugExistente) {
        throw new Error("Já existe uma academia com este slug");
    }
    if (data.cnpj) {
        const cnpjExistente = await prisma_1.prisma.academia.findUnique({
            where: { cnpj: data.cnpj },
        });
        if (cnpjExistente) {
            throw new Error("Já existe uma academia com este CNPJ");
        }
    }
    const senhaHash = await bcrypt_1.default.hash(data.senha, 10);
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const usuario = await tx.usuario.create({
            data: {
                nome: data.nome_dono,
                email: data.email,
                telefone: data.telefone,
                senha_hash: senhaHash,
                foto_perfil: data.foto_perfil,
            },
        });
        const academia = await tx.academia.create({
            data: {
                nome: data.nome_academia,
                slug: data.slug,
                cnpj: data.cnpj,
                telefone: data.telefone,
                email: data.email,
                endereco: data.endereco,
                cidade: data.cidade,
                estado: data.estado,
                cep: data.cep,
            },
        });
        await tx.academiaUsuario.create({
            data: {
                usuario_id: usuario.id,
                academia_id: academia.id,
                perfil: "DONO",
            },
        });
        return {
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                foto_perfil: usuario.foto_perfil,
                status: usuario.status,
            },
            academia,
        };
    });
    return result;
}
async function loginUser(data) {
    const usuario = await prisma_1.prisma.usuario.findUnique({
        where: {
            email: data.email,
        },
        include: {
            perfil_cliente: true,
            perfil_professor: true,
            academias: {
                include: {
                    academia: true,
                },
            },
        },
    });
    if (!usuario) {
        throw new Error("E-mail ou senha inválidos");
    }
    const senhaValida = await bcrypt_1.default.compare(data.senha, usuario.senha_hash);
    if (!senhaValida) {
        throw new Error("E-mail ou senha inválidos");
    }
    if (usuario.status !== "ATIVO") {
        throw new Error("Usuário bloqueado ou inativo");
    }
    const token = gerarToken({
        id: usuario.id,
        email: usuario.email,
    });
    return {
        token,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            foto_perfil: usuario.foto_perfil,
            status: usuario.status,
            perfil_cliente: usuario.perfil_cliente,
            perfil_professor: usuario.perfil_professor,
            academias: usuario.academias,
        },
    };
}
//# sourceMappingURL=auth.service.js.map