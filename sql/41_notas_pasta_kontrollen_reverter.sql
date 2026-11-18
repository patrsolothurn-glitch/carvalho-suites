-- ===================== SQL para correr (REVERTER — AINDA NÃO CORRIDO) =====================
-- Reverte sql/41_notas_pasta_kontrollen.sql. NÃO foi corrido pelo Claude Code e só se corre por decisão do utilizador.
-- AVISO: a restrição antiga não aceita 'kontrollen'. Se já existirem notas na caixa Kontrollen, o BLOCO 2 falha
-- (a transação desfaz-se e fica tudo como estava). Para reverter mesmo, essas notas têm de passar para 'privado'
-- (BLOCO 1b, que ALTERA dados: depois essas notas aparecem na caixa Privado, nada se apaga). Sem reverter o código
-- (app), a caixa Kontrollen continua a aparecer mas criar lá notas passa a falhar com erro de restrição.

-- BLOCO 1 — só leitura: quantas notas estão em Kontrollen (0 = pode ir direto ao bloco 2).
select count(*) as notas_em_kontrollen from public.notas_notas where pasta = 'kontrollen';

-- BLOCO 1b — SÓ se o bloco 1 deu mais de 0 e aceitas que passem para a caixa Privado (altera dados):
-- update public.notas_notas set pasta = 'privado' where pasta = 'kontrollen';

-- BLOCO 2 — volta à restrição de sql/38.
begin;
alter table public.notas_notas drop constraint notas_notas_pasta_check;
alter table public.notas_notas add constraint notas_notas_pasta_check check (pasta in ('privado','geschaeft'));
commit;
