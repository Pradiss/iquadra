ALTER TABLE "usuarios"
  ADD COLUMN IF NOT EXISTS "supabase_user_id" TEXT,
  ADD COLUMN IF NOT EXISTS "foto_url" TEXT,
  ADD COLUMN IF NOT EXISTS "foto_path" TEXT,
  ALTER COLUMN "senha_hash" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_supabase_user_id_key"
  ON "usuarios" ("supabase_user_id");
