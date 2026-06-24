import { env } from "../config/env";
import { badRequest, forbidden } from "../errors/app-error";
import {
  getOrSetCache,
  invalidateAcademiaCache,
  invalidateCacheByPrefix,
} from "../lib/cache";
import { prisma } from "../lib/prisma";
import { supabaseAdmin } from "../lib/supabase";
import {
  ALLOWED_AVATAR_MIME_TYPES,
  type AvatarFile,
} from "./avatar-storage.service";

type ImageMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number];

type AcademiaWithLogoPath = {
  logoPath?: string | null;
};

export async function uploadAcademiaLogo(
  usuarioId: string,
  academiaId: string,
  file?: AvatarFile
) {
  validateLogo(file);

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

  await verificarPermissaoAcademiaLogo(usuarioId, academiaId);

  const path = `academias/${academiaId}/logo-${Date.now()}.${getExtension(
    file.mimetype as ImageMimeType
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
    select: {
      id: true,
      nome: true,
      slug: true,
      cidade: true,
      estado: true,
      status: true,
      logoPath: true,
      criado_em: true,
    },
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

export async function getSignedAcademiaLogoUrl(path: string) {
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

async function verificarPermissaoAcademiaLogo(
  usuarioId: string,
  academiaId: string
) {
  const vinculo = await prisma.academiaUsuario.findFirst({
    where: {
      usuario_id: usuarioId,
      academia_id: academiaId,
      status: "ATIVO",
      perfil: {
        in: ["DONO", "ADMIN_ACADEMIA"],
      },
    },
  });

  if (!vinculo) {
    throw forbidden("Voce nao tem permissao para alterar esta academia");
  }
}

function validateLogo(file?: AvatarFile): asserts file is AvatarFile {
  if (!file) {
    throw badRequest("Envie uma imagem da academia");
  }

  if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.mimetype as ImageMimeType)) {
    throw badRequest("Formato de imagem invalido");
  }

  if (!matchesMimeSignature(file.buffer, file.mimetype as ImageMimeType)) {
    throw badRequest("Conteudo da imagem nao corresponde ao formato enviado");
  }

  if (file.size > env.AVATAR_MAX_BYTES) {
    throw badRequest(
      `Imagem muito grande. O limite e ${Math.floor(
        env.AVATAR_MAX_BYTES / 1024 / 1024
      )}MB`
    );
  }
}

function getExtension(mimetype: ImageMimeType) {
  const extensions: Record<ImageMimeType, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return extensions[mimetype];
}

function matchesMimeSignature(buffer: Buffer, mimetype: ImageMimeType) {
  if (buffer.length < 12) {
    return false;
  }

  if (mimetype === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimetype === "image/png") {
    return buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
  }

  if (mimetype === "image/webp") {
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return ["GIF87a", "GIF89a"].includes(
    buffer.subarray(0, 6).toString("ascii")
  );
}
