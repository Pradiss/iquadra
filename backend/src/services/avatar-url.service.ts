import { env } from "../config/env";
import { getOrSetCache } from "../lib/cache";
import { supabaseAdmin } from "../lib/supabase";

export type AvatarFields = {
  foto_perfil?: string | null;
  fotoUrl?: string | null;
  fotoPath?: string | null;
};

export async function withSignedAvatar<T extends AvatarFields>(
  entity: T
): Promise<T> {
  if (!entity.fotoPath) {
    return entity;
  }

  const signedUrl = await getSignedAvatarUrl(entity.fotoPath);

  return {
    ...entity,
    foto_perfil: signedUrl,
    fotoUrl: signedUrl,
  };
}

export async function getSignedAvatarUrl(path: string) {
  const ttlSeconds = env.SUPABASE_AVATAR_SIGNED_URL_TTL_SECONDS;
  const cacheTtlMs = Math.max((ttlSeconds - 60) * 1000, 30 * 1000);

  return getOrSetCache(`avatar:signed:${path}`, cacheTtlMs, async () => {
    const { data, error } = await supabaseAdmin.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .createSignedUrl(path, ttlSeconds);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message || "Nao foi possivel assinar avatar");
    }

    return data.signedUrl;
  });
}
