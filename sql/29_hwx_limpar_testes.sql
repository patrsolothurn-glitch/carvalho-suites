-- NÃO CORRIDO — o Claude verifica antes.
-- Hauswart Extra — limpeza dos dados de TESTE: apaga só as linhas de teste de hwx_ofertas, hwx_trabalhos e hwx_series
-- e repõe os contadores de número (O e T) para o mecanismo da base voltar a dar o número a seguir ao último que fica.
--
-- QUEM É DE TESTE (identificado primeiro, por id, com igualdades exatas — nenhum LIKE largo):
--   · oferta   O2026-0004
--   · trabalhos T2026-0001, T2026-0002 e T2026-0003
--   · a série «Putzen und Fegen» do cliente #1
--
-- COMO OS CONTADORES FUNCIONAM HOJE (triggers de sql/26 e sql/27, ambos before insert, sem security definer):
--   · hwx_ofertas_numero() e hwx_trabalhos_numero() só atuam quando o número vem vazio.
--   · Leem hwx_config.ultimo_oferta_ano/ultimo_oferta_seq (ofertas) e hwx_config.ultimo_trab_ano/ultimo_trab_seq (trabalhos).
--   · Ano da linha = ano da data da oferta/do trabalho. Se o ano é igual ao do contador:
--         seq nova = greatest(contador, maior número desse ano que ainda exista) + 1
--     senão (ano novo): seq nova = maior número desse ano que exista + 1.
--   · Depois de dar o número, gravam o contador (ano, seq). O contador NUNCA desce sozinho — por isso apagar linhas de teste
--     não faz o número voltar atrás. Esta limpeza repõe o contador à mão, exatamente nessas colunas.
--   · Repor = ultimo_*_seq passa a ser o MAIOR número de 2026 que ainda existe (ou 0 se não ficar nenhum). Assim o próximo
--     é esse + 1 (O2026-0001 / T2026-0001 só se não ficar nenhum desse tipo em 2026; nunca se repete um número que exista).
--
-- NÃO TOCA em clientes, locais, serviços nem em hauswart_data. Em hwx_config só mexe nas duas colunas-contador
-- (ultimo_oferta_seq e ultimo_trab_seq); nenhuma outra coluna.
-- SEGURANÇA: se existir um trabalho que NÃO seja de teste ligado à série de teste, aborta sem apagar nada
-- (o trigger de apagar séries deixaria esse trabalho avulso).
-- Idempotente: pode correr-se duas vezes (a segunda não encontra nada para apagar).

begin;

-- 0) fotografia "antes" (fica na sessão para a verificação final, depois do commit)
select set_config('hwx.antes', json_build_object(
  'ofertas',   (select count(*) from public.hwx_ofertas),
  'trabalhos', (select count(*) from public.hwx_trabalhos),
  'series',    (select count(*) from public.hwx_series),
  'clientes',  (select count(*) from public.hwx_clientes),
  'locais',    (select count(*) from public.hwx_locais),
  'servicos',  (select count(*) from public.hwx_servicos),
  'ctr_o', (select string_agg(ultimo_oferta_ano || '/' || ultimo_oferta_seq, ' ') from public.hwx_config),
  'ctr_t', (select string_agg(ultimo_trab_ano || '/' || ultimo_trab_seq, ' ') from public.hwx_config)
)::text, false);

-- 1) identifica as linhas de teste por id (igualdades exatas)
create temp table hwx_limpar_o on commit drop as
  select id from public.hwx_ofertas where numero = 'O2026-0004';
create temp table hwx_limpar_t on commit drop as
  select id from public.hwx_trabalhos where numero in ('T2026-0001', 'T2026-0002', 'T2026-0003');
create temp table hwx_limpar_s on commit drop as
  select s.id from public.hwx_series s join public.hwx_clientes c on c.id = s.cliente_id
  where c.numero = 1 and s.descricao = 'Putzen und Fegen';

-- 2) segurança: nada de trabalhos "a sério" pendurados na série de teste
do $$
begin
  if exists (select 1 from public.hwx_trabalhos t
             where t.serie_id in (select id from hwx_limpar_s) and t.id not in (select id from hwx_limpar_t)) then
    raise exception 'Abortado, nada foi apagado: há trabalhos que não são de teste ligados à série «Putzen und Fegen». Revê-os antes.';
  end if;
end $$;

-- 3) apaga (por id): primeiro os trabalhos, depois a série, por fim a oferta
delete from public.hwx_trabalhos where id in (select id from hwx_limpar_t);
delete from public.hwx_series    where id in (select id from hwx_limpar_s);
delete from public.hwx_ofertas   where id in (select id from hwx_limpar_o);

-- 4) repõe os contadores (só se o contador está no ano 2026): maior número de 2026 que ainda existe, ou 0
update public.hwx_config c
   set ultimo_oferta_seq = coalesce((select max(substring(o.numero from '^O2026-(\d+)$')::integer)
                                       from public.hwx_ofertas o
                                      where o.user_id = c.user_id and o.numero ~ '^O2026-\d+$'), 0)
 where c.ultimo_oferta_ano = 2026;
update public.hwx_config c
   set ultimo_trab_seq = coalesce((select max(substring(t.numero from '^T2026-(\d+)$')::integer)
                                     from public.hwx_trabalhos t
                                    where t.user_id = c.user_id and t.numero ~ '^T2026-\d+$'), 0)
 where c.ultimo_trab_ano = 2026;

commit;

-- 5) verificação (depois do commit; o SQL Editor só mostra o último select): antes / depois
select * from (
  select 1 as o, 'ofertas' as item, (current_setting('hwx.antes', true)::json ->> 'ofertas') as antes, (select count(*) from public.hwx_ofertas)::text as depois
  union all select 2, 'trabalhos', (current_setting('hwx.antes', true)::json ->> 'trabalhos'), (select count(*) from public.hwx_trabalhos)::text
  union all select 3, 'séries', (current_setting('hwx.antes', true)::json ->> 'series'), (select count(*) from public.hwx_series)::text
  union all select 4, 'clientes (não mudam)', (current_setting('hwx.antes', true)::json ->> 'clientes'), (select count(*) from public.hwx_clientes)::text
  union all select 5, 'locais (não mudam)', (current_setting('hwx.antes', true)::json ->> 'locais'), (select count(*) from public.hwx_locais)::text
  union all select 6, 'serviços (não mudam)', (current_setting('hwx.antes', true)::json ->> 'servicos'), (select count(*) from public.hwx_servicos)::text
  union all select 7, 'contador O (ano/seq)', (current_setting('hwx.antes', true)::json ->> 'ctr_o'), (select string_agg(ultimo_oferta_ano || '/' || ultimo_oferta_seq, ' ') from public.hwx_config)
  union all select 8, 'contador T (ano/seq)', (current_setting('hwx.antes', true)::json ->> 'ctr_t'), (select string_agg(ultimo_trab_ano || '/' || ultimo_trab_seq, ' ') from public.hwx_config)
  union all select 9, 'testes que ainda existem (esperado 0)', null,
         ((select count(*) from public.hwx_ofertas where numero = 'O2026-0004')
        + (select count(*) from public.hwx_trabalhos where numero in ('T2026-0001', 'T2026-0002', 'T2026-0003'))
        + (select count(*) from public.hwx_series s join public.hwx_clientes c on c.id = s.cliente_id where c.numero = 1 and s.descricao = 'Putzen und Fegen'))::text
  union all select 10, 'próximo número O (se for 2026)', null,
         (select string_agg('O2026-' || lpad((greatest(c.ultimo_oferta_seq, coalesce((select max(substring(o.numero from '^O2026-(\d+)$')::integer) from public.hwx_ofertas o where o.user_id = c.user_id and o.numero ~ '^O2026-\d+$'), 0)) + 1)::text, 4, '0'), ' ') from public.hwx_config c)
  union all select 11, 'próximo número T (se for 2026)', null,
         (select string_agg('T2026-' || lpad((greatest(c.ultimo_trab_seq, coalesce((select max(substring(t.numero from '^T2026-(\d+)$')::integer) from public.hwx_trabalhos t where t.user_id = c.user_id and t.numero ~ '^T2026-\d+$'), 0)) + 1)::text, 4, '0'), ' ') from public.hwx_config c)
) v order by o;
