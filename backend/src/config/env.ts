import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3002),
  DATABASE_URL: z.string().min(1, "DATABASE_URL e obrigatoria"),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),
  SUPABASE_URL: z.string().url("SUPABASE_URL invalida"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY e obrigatoria"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY e obrigatoria"),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("avatars"),
  AVATAR_MAX_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024)
    .default(2 * 1024 * 1024),
  AUTH_COOKIE_DOMAIN: z.preprocess(emptyToUndefined, z.string().optional()),
  AUTH_COOKIE_SECURE: z.preprocess(
    emptyToUndefined,
    z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional()
  ),
  AUTH_COOKIE_SAME_SITE: z
    .enum(["lax", "strict", "none"])
    .default("lax"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001,http://localhost:3002"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Variaveis de ambiente invalidas: ${details}`);
}

export const env = {
  ...parsed.data,
  CORS_ORIGINS: parsed.data.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

function emptyToUndefined(value: unknown) {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}
