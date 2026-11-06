-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- DOCUMENTAÇÃO. Reverte 37_notas_feita_em.sql. NÃO CORRIDO pelo Claude Code
-- e NÃO se deve correr outra vez sem decisão do utilizador.
-- AVISO: apaga a coluna e TODOS os valores guardados nela: as notas arquivadas deixam de
-- estar arquivadas e voltam a aparecer na lista principal. As notas em si (título, texto,
-- datas, importância, fixada) não se perdem. Marcar como feita passa a falhar (aparece o
-- aviso de erro) até a coluna existir outra vez.
alter table public.notas_notas drop column feita_em;
