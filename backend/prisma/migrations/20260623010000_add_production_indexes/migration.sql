CREATE INDEX IF NOT EXISTS "quadras_academia_id_ativa_ordem_exibicao_idx"
  ON "quadras" ("academia_id", "ativa", "ordem_exibicao");

CREATE INDEX IF NOT EXISTS "jogos_academia_id_status_inicio_em_idx"
  ON "jogos" ("academia_id", "status", "inicio_em");

CREATE INDEX IF NOT EXISTS "jogos_quadra_id_status_inicio_em_fim_em_idx"
  ON "jogos" ("quadra_id", "status", "inicio_em", "fim_em");

CREATE INDEX IF NOT EXISTS "aulas_academia_id_status_inicio_em_idx"
  ON "aulas" ("academia_id", "status", "inicio_em");

CREATE INDEX IF NOT EXISTS "aulas_quadra_id_status_inicio_em_fim_em_idx"
  ON "aulas" ("quadra_id", "status", "inicio_em", "fim_em");

CREATE INDEX IF NOT EXISTS "participantes_jogos_jogo_id_status_idx"
  ON "participantes_jogos" ("jogo_id", "status");

CREATE INDEX IF NOT EXISTS "participantes_jogos_usuario_id_status_idx"
  ON "participantes_jogos" ("usuario_id", "status");

CREATE INDEX IF NOT EXISTS "convites_jogos_convidado_usuario_id_status_criado_em_idx"
  ON "convites_jogos" ("convidado_usuario_id", "status", "criado_em");
