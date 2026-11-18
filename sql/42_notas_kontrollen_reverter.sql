-- ===================== SQL para correr (REVERTER — AINDA NÃO CORRIDO) =====================
-- Reverte sql/42_notas_kontrollen.sql. NÃO foi corrido pelo Claude Code e só se corre por decisão do utilizador.
-- AVISO: APAGA as duas tabelas e TODOS os controlos e vezes registados nelas (não há Lixo para isto).
-- Não afeta notas_notas nem nenhuma outra tabela. Sem a tabela, o ecrã Kontrollen da app mostra o erro real
-- ao carregar ("Não foi possível carregar os controlos") até a tabela existir outra vez ou o código ser revertido.
-- Antes de apagar, conta o que vai perder (só leitura):
select (select count(*) from public.notas_kontroll_tipos) as tipos, (select count(*) from public.notas_kontroll_registos) as registos;

-- Apaga (as políticas e os índices vão com as tabelas):
begin;
drop table if exists public.notas_kontroll_registos;
drop table if exists public.notas_kontroll_tipos;
commit;
