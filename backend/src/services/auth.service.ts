import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { getRequiredEnv } from "../lib/env";
import { prisma } from "../lib/prisma";
import {
  LoginData,
  RegisterAcademiaData,
  RegisterClienteData,
  RegisterProfessorData,
} from "../schemas/auth.schema";

const jwtSecret = getRequiredEnv("JWT_SECRET");

async function validarEmailDisponivel(email: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (usuario) {
    throw new Error("Este e-mail já está cadastrado");
  }
}

function gerarToken(usuario: { id: string; email: string }) {
  return jwt.sign(
    {
      sub: usuario.id,
      email: usuario.email,
    },
    jwtSecret,
    {
      expiresIn: "7d",
    }
  );
}

export async function registerCliente(data: RegisterClienteData) {
  await validarEmailDisponivel(data.email);

  const senhaHash = await bcrypt.hash(data.senha, 10);

  const usuario = await prisma.usuario.create({
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

export async function registerProfessor(data: RegisterProfessorData) {
  await validarEmailDisponivel(data.email);

  const senhaHash = await bcrypt.hash(data.senha, 10);

  const usuario = await prisma.usuario.create({
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

export async function registerAcademia(data: RegisterAcademiaData) {
  await validarEmailDisponivel(data.email);

  const slugExistente = await prisma.academia.findUnique({
    where: { slug: data.slug },
  });

  if (slugExistente) {
    throw new Error("Já existe uma academia com este slug");
  }

  if (data.cnpj) {
    const cnpjExistente = await prisma.academia.findUnique({
      where: { cnpj: data.cnpj },
    });

    if (cnpjExistente) {
      throw new Error("Já existe uma academia com este CNPJ");
    }
  }

  const senhaHash = await bcrypt.hash(data.senha, 10);

  const result = await prisma.$transaction(async (tx) => {
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

export async function loginUser(data: LoginData) {
  const usuario = await prisma.usuario.findUnique({
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

  const senhaValida = await bcrypt.compare(data.senha, usuario.senha_hash);

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
