-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- DOCUMENTAÇÃO. Reverte 38_notas_pasta.sql. NÃO CORRIDO pelo Claude Code
-- e NÃO se deve correr outra vez sem decisão do utilizador.
-- AVISO: apaga a coluna e a separação Privado / Geschäft: depois da reversão todas as notas
-- ficam misturadas e a app deixa de saber a que caixa pertenciam (as notas em si — título,
-- texto, datas, importância, fixada — não se perdem). Mover uma nota de pasta passa a falhar
-- (aparece o aviso de erro) até a coluna existir outra vez.
alter table public.notas_notas drop column pasta;
