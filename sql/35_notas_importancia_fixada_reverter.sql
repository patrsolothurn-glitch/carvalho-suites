-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- DOCUMENTAÇÃO. Reverte 35_notas_importancia_fixada.sql. NÃO CORRIDO pelo Claude Code
-- e NÃO se deve correr outra vez sem decisão do utilizador.
-- AVISO: apaga as duas colunas e TODOS os valores guardados nelas (importância e notas
-- fixadas). As notas em si (título, texto, datas) não se perdem. A app trata colunas em
-- falta como importancia 'normal' e fixada false, mas gravar importância ou fixar passa a
-- falhar (o aviso de erro aparece) até as colunas existirem outra vez.
alter table public.notas_notas drop column importancia;
alter table public.notas_notas drop column fixada;
