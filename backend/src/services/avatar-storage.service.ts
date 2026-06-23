import { env } from "../config/env";
import { badRequest } from "../errors/app-error";
import { prisma } from "../lib/prisma";
import { supabaseAdmin } from "../lib/supabase";

export const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

type AvatarMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number];

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
  validateAvatar(file);
  await ensureAvatarBucket();

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

  const path = `usuarios/${supabaseUserId}/avatar.${getExtension(
    file.mimetype as AvatarMimeType
  )}`;

  const { error } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(path, file.buffer, {
      cacheControl: "3600",
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  if (usuarioAtual.fotoPath && usuarioAtual.fotoPath !== path) {
    await supabaseAdmin.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .remove([usuarioAtual.fotoPath]);
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(path);

  return prisma.usuario.update({
    where: {
      id: usuarioId,
    },
    data: {
      foto_perfil: publicUrl,
      fotoUrl: publicUrl,
      fotoPath: path,
    },
    select: usuarioSelect,
  });
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
  }

  return prisma.usuario.update({
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
}

function validateAvatar(file?: AvatarFile): asserts file is AvatarFile {
  if (!file) {
    throw badRequest("Envie uma imagem de perfil");
  }

  if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.mimetype as AvatarMimeType)) {
    throw badRequest("Formato de imagem invalido");
  }

  if (file.size > env.AVATAR_MAX_BYTES) {
    throw badRequest(
      `Imagem muito grande. O limite e ${Math.floor(
        env.AVATAR_MAX_BYTES / 1024 / 1024
      )}MB`
    );
  }
}

async function ensureAvatarBucket() {
  const bucket = env.SUPABASE_STORAGE_BUCKET;
  const { error: getError } = await supabaseAdmin.storage.getBucket(bucket);

  if (getError) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(
      bucket,
      {
        public: true,
        fileSizeLimit: env.AVATAR_MAX_BYTES,
        allowedMimeTypes: [...ALLOWED_AVATAR_MIME_TYPES],
      }
    );

    if (createError) {
      throw new Error(createError.message);
    }

    return;
  }

  const { error: updateError } = await supabaseAdmin.storage.updateBucket(
    bucket,
    {
      public: true,
      fileSizeLimit: env.AVATAR_MAX_BYTES,
      allowedMimeTypes: [...ALLOWED_AVATAR_MIME_TYPES],
    }
  );

  if (updateError) {
    throw new Error(updateError.message);
  }
}

function getExtension(mimetype: AvatarMimeType) {
  const extensions: Record<AvatarMimeType, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return extensions[mimetype];
}
