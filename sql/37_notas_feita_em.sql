-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- Cópia de documentação: coluna feita_em na tabela da app Notas Carvalho (src/23-app-notas.js).
-- feita_em nula = nota ativa; preenchida = nota feita, que vai para o ARQUIVO. O Arquivo NÃO é
-- o Lixo: não usa deleted_at e a purga (30 dias) nunca lhe toca.
-- JÁ CORRIDO no Supabase pelo utilizador — NÃO correr outra vez e NÃO foi corrido
-- pelo Claude Code. As políticas de RLS (sql/33 e sql/34) NÃO mudam.
alter table public.notas_notas add column feita_em timestamptz;
