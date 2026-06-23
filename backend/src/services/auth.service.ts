import bcrypt from "bcrypt";
import type { Session, User } from "@supabase/supabase-js";

import { prisma } from "../lib/prisma";
import { invalidateAcademiaCache } from "../lib/cache";
import { supabaseAdmin, supabaseAuth } from "../lib/supabase";
import { withSignedAvatar } from "./avatar-url.service";
import {
  LoginData,
  RegisterAcademiaData,
  RegisterClienteData,
  RegisterProfessorData,
} from "../schemas/auth.schema";

const usuarioSelect = {
  id: true,
  supabaseUserId: true,
  nome: true,
  email: true,
  telefone: true,
  foto_perfil: true,
  fotoUrl: true,
  fotoPath: true,
  status: true,
  perfil_cliente: true,
  perfil_professor: true,
  academias: {
    include: {
      academia: true,
    },
  },
  criado_em: true,
  atualizado_em: true,
};

type SupabaseAuthResult = {
  user: User;
  session: Session;
};

async function validarEmailDisponivel(email: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (usuario) {
    throw new Error("Este e-mail ja esta cadastrado");
  }
}

async function createSupabaseUserAndSession(
  email: string,
  password: string,
  metadata: Record<string, string>
): Promise<SupabaseAuthResult> {
  const { data: created, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

  if (createError || !created.user) {
    throw new Error(formatSupabaseAuthError(createError?.message));
  }

  try {
    const auth = await signInWithSupabase(email, password);

    if (!auth) {
      throw new Error("Nao foi possivel iniciar a sessao do cadastro");
    }

    return auth;
  } catch (error) {
    await deleteSupabaseUserSilently(created.user.id);
    throw error;
  }
}

async function signInWithSupabase(
  email: string,
  password: string
): Promise<SupabaseAuthResult | null> {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user || !data.session) {
    return null;
  }

  return {
    user: data.user,
    session: data.session,
  };
}

async function deleteSupabaseUserSilently(userId: string) {
  try {
    await supabaseAdmin.auth.admin.deleteUser(userId);
  } catch {
    // Best effort rollback for a failed local registration.
  }
}

async function migrateLegacyLogin(data: LoginData) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      email: data.email,
    },
    select: {
      id: true,
      supabaseUserId: true,
      email: true,
      nome: true,
      senha_hash: true,
      status: true,
    },
  });

  if (!usuario?.senha_hash) {
    return null;
  }

  const senhaValida = await bcrypt.compare(data.senha, usuario.senha_hash);

  if (!senhaValida) {
    return null;
  }

  if (usuario.status !== "ATIVO") {
    throw new Error("Usuario bloqueado ou inativo");
  }

  let supabaseUserId = usuario.supabaseUserId;

  if (supabaseUserId) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      supabaseUserId,
      {
        password: data.senha,
        user_metadata: {
          nome: usuario.nome,
        },
      }
    );

    if (error) {
      throw new Error("Nao foi possivel migrar a senha para o Supabase");
    }
  } else {
    const { data: created, error } =
      await supabaseAdmin.auth.admin.createUser({
        email: usuario.email,
        password: data.senha,
        email_confirm: true,
        user_metadata: {
          nome: usuario.nome,
        },
      });

    if (error || !created.user) {
      return null;
    }

    supabaseUserId = created.user.id;

    await prisma.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        supabaseUserId,
      },
    });
  }

  return signInWithSupabase(data.email, data.senha);
}

async function getUsuarioBySupabaseAuth(auth: SupabaseAuthResult) {
  const usuario = await prisma.usuario.findFirst({
    where: {
      OR: [
        {
          supabaseUserId: auth.user.id,
        },
        {
          email: auth.user.email ?? "",
        },
      ],
    },
    select: usuarioSelect,
  });

  if (!usuario) {
    throw new Error("Usuario nao encontrado");
  }

  if (usuario.status !== "ATIVO") {
    throw new Error("Usuario bloqueado ou inativo");
  }

  if (!usuario.supabaseUserId) {
    await prisma.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        supabaseUserId: auth.user.id,
      },
    });

    return withSignedAvatar({
      ...usuario,
      supabaseUserId: auth.user.id,
    });
  }

  return withSignedAvatar(usuario);
}

function getFotoData(foto?: string) {
  return {
    foto_perfil: foto,
    fotoUrl: foto,
  };
}

function formatSupabaseAuthError(message?: string) {
  if (!message) {
    return "Nao foi possivel criar o usuario no Supabase";
  }

  if (/already|registered|exists/i.test(message)) {
    return "Este e-mail ja esta cadastrado";
  }

  return message;
}

export async function registerCliente(data: RegisterClienteData) {
  await validarEmailDisponivel(data.email);

  const auth = await createSupabaseUserAndSession(data.email, data.senha, {
    nome: data.nome,
    perfil: "cliente",
  });

  try {
    const usuario = await prisma.usuario.create({
      data: {
        supabaseUserId: auth.user.id,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        ...getFotoData(data.foto_perfil),
        perfil_cliente: {
          create: {
            categoria: data.categoria,
            cidade: data.cidade,
            cep: data.cep,
          },
        },
      },
      select: usuarioSelect,
    });

    return {
      session: auth.session,
      usuario,
    };
  } catch (error) {
    await deleteSupabaseUserSilently(auth.user.id);
    throw error;
  }
}

export async function registerProfessor(data: RegisterProfessorData) {
  await validarEmailDisponivel(data.email);

  const auth = await createSupabaseUserAndSession(data.email, data.senha, {
    nome: data.nome,
    perfil: "professor",
  });

  try {
    const usuario = await prisma.usuario.create({
      data: {
        supabaseUserId: auth.user.id,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        ...getFotoData(data.foto_perfil),
        perfil_professor: {
          create: {
            bio: data.bio,
            especialidades: data.especialidades,
            cidade: data.cidade,
          },
        },
      },
      select: usuarioSelect,
    });

    return {
      session: auth.session,
      usuario,
    };
  } catch (error) {
    await deleteSupabaseUserSilently(auth.user.id);
    throw error;
  }
}

export async function registerAcademia(data: RegisterAcademiaData) {
  await validarEmailDisponivel(data.email);

  const slugExistente = await prisma.academia.findUnique({
    where: { slug: data.slug },
  });

  if (slugExistente) {
    throw new Error("Ja existe uma academia com este slug");
  }

  if (data.cnpj) {
    const cnpjExistente = await prisma.academia.findUnique({
      where: { cnpj: data.cnpj },
    });

    if (cnpjExistente) {
      throw new Error("Ja existe uma academia com este CNPJ");
    }
  }

  const auth = await createSupabaseUserAndSession(data.email, data.senha, {
    nome: data.nome_dono,
    perfil: "dono_academia",
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          supabaseUserId: auth.user.id,
          nome: data.nome_dono,
          email: data.email,
          telefone: data.telefone,
          ...getFotoData(data.foto_perfil),
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

      const usuarioCompleto = await tx.usuario.findUniqueOrThrow({
        where: {
          id: usuario.id,
        },
        select: usuarioSelect,
      });

      return {
        usuario: usuarioCompleto,
        academia,
      };
    });

    invalidateAcademiaCache(result.academia.id);

    return {
      session: auth.session,
      ...result,
    };
  } catch (error) {
    await deleteSupabaseUserSilently(auth.user.id);
    throw error;
  }
}

export async function loginUser(data: LoginData) {
  const auth =
    (await signInWithSupabase(data.email, data.senha)) ??
    (await migrateLegacyLogin(data));

  if (!auth) {
    throw new Error("E-mail ou senha invalidos");
  }

  const usuario = await getUsuarioBySupabaseAuth(auth);

  return {
    session: auth.session,
    usuario,
  };
}
