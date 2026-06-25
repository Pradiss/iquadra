import { env } from "../config/env";
import { badRequest } from "../errors/app-error";
import { invalidateCacheByPrefix, invalidateUserCache } from "../lib/cache";
import { prisma } from "../lib/prisma";
import { supabaseAdmin } from "../lib/supabase";
import { withSignedAvatar } from "./avatar-url.service";

export const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AvatarMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number];

export type AvatarFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

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

export async function uploadAvatar(
  usuarioId: string,
  supabaseUserId: string,
  file?: AvatarFile
) {
  validateAvatarFile(file);

  const usuarioAtual = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
    select: {
      fotoPath: true,
    },
  });

  if (!usuarioAtual) {
    throw badRequest("Usuario nao encontrado");
  }

  const path = `usuarios/${supabaseUserId}/avatar-${Date.now()}.${getAvatarFileExtension(
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

  if (usuarioAtual.fotoPath && usuarioAtual.fotoPath !== path) {
    await supabaseAdmin.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .remove([usuarioAtual.fotoPath]);
  }

  if (usuarioAtual.fotoPath) {
    invalidateCacheByPrefix(`avatar:signed:${usuarioAtual.fotoPath}`);
  }

  const usuario = await prisma.usuario.update({
    where: {
      id: usuarioId,
    },
    data: {
      foto_perfil: null,
      fotoUrl: null,
      fotoPath: path,
    },
    select: usuarioSelect,
  });

  invalidateUserCache(usuarioId);

  return withSignedAvatar(usuario);
}

export async function removeAvatar(usuarioId: string) {
  const usuarioAtual = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
    select: {
      fotoPath: true,
    },
  });

  if (!usuarioAtual) {
    throw badRequest("Usuario nao encontrado");
  }

  if (usuarioAtual.fotoPath) {
    const { error } = await supabaseAdmin.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .remove([usuarioAtual.fotoPath]);

    if (error) {
      throw new Error(error.message);
    }

    invalidateCacheByPrefix(`avatar:signed:${usuarioAtual.fotoPath}`);
  }

  const usuario = await prisma.usuario.update({
    where: {
      id: usuarioId,
    },
    data: {
      foto_perfil: null,
      fotoUrl: null,
      fotoPath: null,
    },
    select: usuarioSelect,
  });

  invalidateUserCache(usuarioId);

  return usuario;
}

export function validateAvatarFile(
  file?: AvatarFile,
  requiredMessage = "Envie uma imagem de perfil"
): asserts file is AvatarFile {
  if (!file) {
    throw badRequest(requiredMessage);
  }

  if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.mimetype as AvatarMimeType)) {
    throw badRequest("Formato de imagem invalido");
  }

  if (!matchesMimeSignature(file.buffer, file.mimetype as AvatarMimeType)) {
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

export function getAvatarFileExtension(mimetype: AvatarMimeType) {
  const extensions: Record<AvatarMimeType, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return extensions[mimetype];
}

function matchesMimeSignature(buffer: Buffer, mimetype: AvatarMimeType) {
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
