import type { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";
import { supabaseAdmin } from "../lib/supabase";
import { listUsersQuerySchema, updateMeSchema } from "../schemas/user.schema";

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

async function getUsuarioCompleto(id: string) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      id,
    },
    select: usuarioSelect,
  });

  if (!usuario) {
    throw new Error("Usuario nao encontrado");
  }

  return usuario;
}

export async function listUsersController(req: AuthRequest, res: Response) {
  const query = listUsersQuerySchema.parse(req.query);
  const termo = query.q?.trim();

  const where: any = {
    status: "ATIVO",
    perfil_cliente: {
      isNot: null,
    },
  };

  if (termo) {
    where.OR = [
      {
        nome: {
          contains: termo,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: termo,
          mode: "insensitive",
        },
      },
    ];
  }

  const usuarios = await prisma.usuario.findMany({
    where,
    take: query.limit,
    orderBy: {
      nome: "asc",
    },
    select: {
      id: true,
      nome: true,
      foto_perfil: true,
      fotoUrl: true,
      perfil_cliente: {
        select: {
          categoria: true,
        },
      },
    },
  });

  return res.json({
    success: true,
    total: usuarios.length,
    data: usuarios,
  });
}

export async function meController(req: AuthRequest, res: Response) {
  const usuario = await getUsuarioCompleto(req.user!.id);

  return res.json({
    success: true,
    data: usuario,
    user: usuario,
  });
}

export async function updateMeController(req: AuthRequest, res: Response) {
  const data = updateMeSchema.parse(req.body);
  const usuarioId = req.user!.id;

  const usuarioAtual = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
    include: {
      perfil_cliente: true,
    },
  });

  if (!usuarioAtual) {
    return res.status(404).json({
      success: false,
      message: "Usuario nao encontrado",
    });
  }

  if (data.email && data.email !== usuarioAtual.email) {
    const usuarioEmail = await prisma.usuario.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
      },
    });

    if (usuarioEmail && usuarioEmail.id !== usuarioId) {
      return res.status(400).json({
        success: false,
        message: "Este e-mail ja esta cadastrado",
      });
    }
  }

  const usuarioData: any = {};

  if (data.nome !== undefined) {
    usuarioData.nome = data.nome;
  }

  if (data.email !== undefined) {
    usuarioData.email = data.email;
  }

  if (data.telefone !== undefined) {
    usuarioData.telefone = data.telefone;
  }

  if (data.foto_perfil !== undefined) {
    usuarioData.foto_perfil = data.foto_perfil;
    usuarioData.fotoUrl = data.foto_perfil;
    usuarioData.fotoPath = null;
  }

  const perfilClienteData: any = {};

  if (data.perfil_cliente?.categoria !== undefined) {
    perfilClienteData.categoria = data.perfil_cliente.categoria;
  }

  if (data.perfil_cliente?.cidade !== undefined) {
    perfilClienteData.cidade = data.perfil_cliente.cidade;
  }

  if (data.perfil_cliente?.cep !== undefined) {
    perfilClienteData.cep = data.perfil_cliente.cep;
  }

  const temDadosUsuario = Object.keys(usuarioData).length > 0;
  const temDadosPerfilCliente = Object.keys(perfilClienteData).length > 0;

  if (temDadosPerfilCliente && !usuarioAtual.perfil_cliente) {
    return res.status(400).json({
      success: false,
      message: "Perfil de jogador nao encontrado",
    });
  }

  if (data.email !== undefined || data.nome !== undefined) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      req.user!.supabaseUserId,
      {
        email: data.email,
        user_metadata: {
          nome: data.nome ?? usuarioAtual.nome,
        },
      }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  await prisma.$transaction(async (tx) => {
    if (temDadosUsuario) {
      await tx.usuario.update({
        where: {
          id: usuarioId,
        },
        data: usuarioData,
      });
    }

    if (temDadosPerfilCliente) {
      await tx.perfilCliente.update({
        where: {
          usuario_id: usuarioId,
        },
        data: perfilClienteData,
      });
    }
  });

  const usuario = await getUsuarioCompleto(usuarioId);

  return res.json({
    success: true,
    message: "Perfil atualizado com sucesso",
    data: usuario,
    user: usuario,
  });
}
