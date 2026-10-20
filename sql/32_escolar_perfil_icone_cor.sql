-- DOCUMENTAÇÃO. Já executado em produção a 15/10/2026 pelo Patricio no SQL
-- Editor do Supabase. O Claude Code NÃO executa este ficheiro.
-- Colunas de personalização do cartão de aluno em Vida Escolar (PR
-- "editor de ícone e cor por aluno"): NULL = usa o padrão de ALUNOS_DEF.
-- Reverter: 32_escolar_perfil_icone_cor_reverter.sql.
begin;

alter table public.escolar_perfil
  add column if not exists emoji text,
  add column if not exists cor text;

commit;
