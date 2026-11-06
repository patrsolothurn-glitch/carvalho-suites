-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- Cópia de documentação: duas colunas novas na tabela da app Notas Carvalho
-- (src/23-app-notas.js): importancia (normal | importante | urgente) e fixada.
-- JÁ CORRIDO no Supabase pelo utilizador — NÃO correr outra vez e NÃO foi corrido
-- pelo Claude Code. As políticas de RLS (sql/33 e sql/34) NÃO mudam.
alter table public.notas_notas add column importancia text not null default 'normal' check (importancia in ('normal','importante','urgente'));
alter table public.notas_notas add column fixada boolean not null default false;
