-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- DOCUMENTAÇÃO. Reverte 36_notas_importancia_baixo.sql. NÃO CORRIDO pelo Claude Code
-- e NÃO se deve correr outra vez sem decisão do utilizador.
-- AVISO: se já existirem notas com importancia = 'baixo', este SQL FALHA (a regra nova
-- rejeita linhas existentes). Antes, tem de passar essas notas a 'normal'. Depois da reversão
-- a app deixa de poder gravar o nível 3 · Baixo.
alter table public.notas_notas drop constraint notas_notas_importancia_check;
alter table public.notas_notas add constraint notas_notas_importancia_check check (importancia in ('normal','importante','urgente'));
