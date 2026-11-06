-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- Cópia de documentação: coluna pasta na tabela da app Notas Carvalho (src/23-app-notas.js).
-- No cartão do Patricio as notas ficam separadas em duas caixas: 'privado' (por omissão) e
-- 'geschaeft'. As notas que já existiam ficaram todas em 'privado'.
-- JÁ CORRIDO no Supabase pelo utilizador — NÃO correr outra vez e NÃO foi corrido
-- pelo Claude Code. As políticas de RLS (sql/33 e sql/34) NÃO mudam.
alter table public.notas_notas add column pasta text not null default 'privado' check (pasta in ('privado','geschaeft'));
