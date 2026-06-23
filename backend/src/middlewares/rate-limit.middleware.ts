import rateLimit, { ipKeyGenerator, type Options, type Store } from "express-rate-limit";

import { redis } from "../lib/redis";

class RedisRateLimitStore implements Store {
  localKeys = false;
  private windowMs = 15 * 60 * 1000;

  constructor(private readonly storePrefix: string) {}

  init(options: Options) {
    this.windowMs = options.windowMs;
  }

  async increment(key: string) {
    if (!redis) {
      throw new Error("Redis rate limit store usado sem Redis configurado");
    }

    const redisKey = this.key(key);
    const totalHits = await redis.incr(redisKey);

    if (totalHits === 1) {
      await redis.pexpire(redisKey, this.windowMs);
    }

    const ttl = await redis.pttl(redisKey);
    const resetTime = new Date(Date.now() + Math.max(ttl, this.windowMs));

    return {
      totalHits,
      resetTime,
    };
  }

  async decrement(key: string) {
    if (!redis) return;

    const redisKey = this.key(key);
    const value = await redis.decr(redisKey);

    if (value <= 0) {
      await redis.del(redisKey);
    }
  }

  async resetKey(key: string) {
    if (!redis) return;

    await redis.del(this.key(key));
  }

  private key(key: string) {
    return `playfy:rate-limit:${this.storePrefix}:${key}`;
  }
}

function makeStore(prefix: string) {
  return redis ? { store: new RedisRateLimitStore(prefix) } : {};
}

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ""),
  ...makeStore("general"),
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Muitas requisicoes. Tente novamente em alguns minutos.",
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ""),
  ...makeStore("auth"),
  message: {
    success: false,
    code: "AUTH_RATE_LIMITED",
    message: "Muitas tentativas. Tente novamente em alguns minutos.",
  },
});
