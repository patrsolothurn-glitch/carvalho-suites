-- DOCUMENTAÇÃO. Reverte 32_escolar_perfil_icone_cor.sql. NÃO CORRIDO pelo
-- Claude Code. AVISO: apaga os dados já guardados nessas 2 colunas (o
-- ícone/cor personalizados de cada aluno voltam a não existir na base —
-- o código volta a usar sempre o padrão de ALUNOS_DEF).
begin;

alter table public.escolar_perfil
  drop column if exists emoji,
  drop column if exists cor;

commit;
