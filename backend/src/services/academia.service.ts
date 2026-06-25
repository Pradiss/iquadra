import { env } from "../config/env";
import { badRequest, forbidden } from "../errors/app-error";
import { prisma } from "../lib/prisma";
import {
  CACHE_TTL,
  getOrSetCache,
  invalidateAcademiaCache,
  invalidateCacheByPrefix,
} from "../lib/cache";
import { supabaseAdmin } from "../lib/supabase";
import {
  CreateAcademiaData,
  UpdateAcademiaData,
} from "../schemas/academia.schema";
import {
  getAvatarFileExtension,
  validateAvatarFile,
  type AvatarFile,
  type AvatarMimeType,
} from "./avatar-storage.service";

type AcademiaWithLogoPath = {
  logoPath?: string | null;
};

const academiaPublicSelect = {
  id: true,
  nome: true,
  slug: true,
  cnpj: true,
  telefone: true,
  email: true,
  endereco: true,
  cidade: true,
  estado: true,
  cep: true,
  status: true,
  logoPath: true,
  criado_em: true,
  atualizado_em: true,
};

export async function createAcademia(data: CreateAcademiaData) {
  const academiaExistente = await prisma.academia.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (academiaExistente) {
    throw new Error("Já existe uma academia com este slug");
  }

  const academia = await prisma.academia.create({
    data,
  });

  invalidateAcademiaCache(academia.id);

  return academia;
}

export async function listAcademias() {
  return getOrSetCache("academias:list:ativas", CACHE_TTL.academias, async () => {
    const academias = await prisma.academia.findMany({
      where: {
        status: "ATIVO",
      },
      select: {
        id: true,
        nome: true,
        slug: true,
        cidade: true,
        estado: true,
        status: true,
        logoPath: true,
      },
      orderBy: {
        nome: "asc",
      },
    });

    return Promise.all(academias.map(withSignedAcademiaLogo));
  });
}

export async function getAcademiaById(id: string) {
  const academia = await getOrSetCache(
    `academia:${id}:public`,
    CACHE_TTL.academias,
    () =>
      prisma.academia.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          nome: true,
          slug: true,
          cidade: true,
          estado: true,
          telefone: true,
          email: true,
          endereco: true,
          cep: true,
          cnpj: true,
          status: true,
          logoPath: true,
          criado_em: true,
          atualizado_em: true,
        },
      })
  );

  if (!academia) {
    throw new Error("Academia não encontrada");
  }

  return withSignedAcademiaLogo(academia);
}

export async function updateAcademia(
  usuarioId: string,
  academiaId: string,
  data: UpdateAcademiaData
) {
  await verificarDonoAcademia(usuarioId, academiaId);

  const academiaAtual = await prisma.academia.findUnique({
    where: {
      id: academiaId,
    },
    select: {
      id: true,
      slug: true,
      cnpj: true,
    },
  });

  if (!academiaAtual) {
    throw badRequest("Academia nao encontrada");
  }

  if (data.slug && data.slug !== academiaAtual.slug) {
    const academiaSlug = await prisma.academia.findUnique({
      where: {
        slug: data.slug,
      },
      select: {
        id: true,
      },
    });

    if (academiaSlug && academiaSlug.id !== academiaId) {
      throw badRequest("Ja existe uma academia com este slug");
    }
  }

  if (data.cnpj && data.cnpj !== academiaAtual.cnpj) {
    const academiaCnpj = await prisma.academia.findUnique({
      where: {
        cnpj: data.cnpj,
      },
      select: {
        id: true,
      },
    });

    if (academiaCnpj && academiaCnpj.id !== academiaId) {
      throw badRequest("Ja existe uma academia com este CNPJ");
    }
  }

  const academia = await prisma.academia.update({
    where: {
      id: academiaId,
    },
    data,
    select: academiaPublicSelect,
  });

  invalidateAcademiaCache(academiaId);

  return withSignedAcademiaLogo(academia);
}

export async function uploadAcademiaLogo(
  usuarioId: string,
  academiaId: string,
  file?: AvatarFile
) {
  validateAvatarFile(file, "Envie uma imagem da academia");

  const academiaAtual = await prisma.academia.findUnique({
    where: {
      id: academiaId,
    },
    select: {
      id: true,
      logoPath: true,
    },
  });

  if (!academiaAtual) {
    throw badRequest("Academia nao encontrada");
  }

  await verificarDonoAcademia(usuarioId, academiaId);

  const path = `academias/${academiaId}/logo-${Date.now()}.${getAvatarFileExtension(
    file.mimetype as AvatarMimeType
  )}`;

  const { error } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(path, file.buffer, {
      cacheControl: "3600",
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  if (academiaAtual.logoPath && academiaAtual.logoPath !== path) {
    await supabaseAdmin.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .remove([academiaAtual.logoPath]);

    invalidateCacheByPrefix(`academia:logo:signed:${academiaAtual.logoPath}`);
  }

  const academia = await prisma.academia.update({
    where: {
      id: academiaId,
    },
    data: {
      logoPath: path,
    },
    select: academiaPublicSelect,
  });

  invalidateAcademiaCache(academiaId);

  return withSignedAcademiaLogo(academia);
}

export async function withSignedAcademiaLogo<T extends AcademiaWithLogoPath>(
  academia: T
) {
  const { logoPath, ...data } = academia;
  const logo_url = logoPath ? await getSignedAcademiaLogoUrl(logoPath) : null;

  return {
    ...data,
    logo_url,
  };
}

async function getSignedAcademiaLogoUrl(path: string) {
  const ttlSeconds = env.SUPABASE_AVATAR_SIGNED_URL_TTL_SECONDS;
  const cacheTtlMs = Math.max((ttlSeconds - 60) * 1000, 30 * 1000);

  return getOrSetCache(`academia:logo:signed:${path}`, cacheTtlMs, async () => {
    const { data, error } = await supabaseAdmin.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .createSignedUrl(path, ttlSeconds);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message || "Nao foi possivel assinar logo");
    }

    return data.signedUrl;
  });
}

async function verificarDonoAcademia(usuarioId: string, academiaId: string) {
  const vinculoDono = await prisma.academiaUsuario.findFirst({
    where: {
      usuario_id: usuarioId,
      academia_id: academiaId,
      status: "ATIVO",
      perfil: "DONO",
    },
    select: {
      id: true,
    },
  });

  if (!vinculoDono) {
    throw forbidden("Voce nao tem permissao para alterar esta academia");
  }
}
