type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const cache = new Map<string, CacheEntry<unknown>>();

export const CACHE_TTL = {
  academias: 5 * 60 * 1000,
  quadras: 2 * 60 * 1000,
  disponibilidade: 20 * 1000,
};

export async function getOrSetCache<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
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
