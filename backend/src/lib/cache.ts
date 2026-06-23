import { redis } from "./redis";

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_PREFIX = "playfy:cache:";

export const CACHE_TTL = {
  academias: 5 * 60 * 1000,
  quadras: 2 * 60 * 1000,
  disponibilidade: 20 * 1000,
  usuarios: 30 * 1000,
};

export async function getOrSetCache<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  if (redis) {
    const redisKey = toRedisKey(key);
    const cached = await redis.get<T>(redisKey);

    if (cached !== null) {
      return cached;
    }

    const value = await loader();
    await redis.psetex(redisKey, ttlMs, value);

    return value;
  }

  const now = Date.now();
  const entry = cache.get(key);

  if (entry && entry.expiresAt > now) {
    return entry.value as T;
  }

  const value = await loader();
  cache.set(key, {
    expiresAt: now + ttlMs,
    value,
  });

  return value;
}

export function invalidateCacheByPrefix(prefix: string) {
  if (redis) {
    void invalidateRedisByPrefix(prefix).catch((error) => {
      console.error("Falha ao invalidar cache Redis", error);
    });
  }

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export function invalidateAcademiaCache(academiaId?: string | null) {
  invalidateCacheByPrefix("academias:");

  if (!academiaId) {
    invalidateCacheByPrefix("quadras:");
    invalidateCacheByPrefix("disponibilidade:");
    return;
  }

  invalidateCacheByPrefix(`academia:${academiaId}:`);
  invalidateCacheByPrefix(`quadras:${academiaId}:`);
  invalidateCacheByPrefix(`disponibilidade:academia:${academiaId}:`);
}

export function invalidateQuadraCache(
  quadraId: string,
  academiaId?: string | null
) {
  if (academiaId) {
    invalidateAcademiaCache(academiaId);
  } else {
    invalidateCacheByPrefix("quadras:");
    invalidateCacheByPrefix("disponibilidade:academia:");
  }

  invalidateCacheByPrefix(`disponibilidade:quadra:${quadraId}:`);
}

export function invalidateUserCache(usuarioId: string) {
  invalidateCacheByPrefix(`usuario:${usuarioId}:`);
}

function toRedisKey(key: string) {
  return `${CACHE_PREFIX}${key}`;
}

async function invalidateRedisByPrefix(prefix: string) {
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis!.scan(cursor, {
      match: `${toRedisKey(prefix)}*`,
      count: 100,
    });

    if (keys.length > 0) {
      await redis!.del(...keys);
    }

    cursor = String(nextCursor);
  } while (cursor !== "0");
}
