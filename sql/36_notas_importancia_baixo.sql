-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- Cópia de documentação: a coluna importancia passa a aceitar também 'baixo'
-- (níveis da app Notas Carvalho: 1 importante / 2 normal / 3 baixo; 'urgente' fica como valor
-- antigo e a app trata-o como 'importante').
-- JÁ CORRIDO no Supabase pelo utilizador — NÃO correr outra vez e NÃO foi corrido
-- pelo Claude Code. Substitui a regra criada em sql/35_notas_importancia_fixada.sql.
alter table public.notas_notas drop constraint notas_notas_importancia_check;
alter table public.notas_notas add constraint notas_notas_importancia_check check (importancia in ('normal','importante','urgente','baixo'));
