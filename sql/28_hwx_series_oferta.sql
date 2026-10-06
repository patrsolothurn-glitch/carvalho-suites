-- Hauswart Extra — melhorias das séries: linhas e oferta de origem na série + marca "incluído na Pauschale Hauswart".
-- NÃO CORRIDO. Rever antes de correr no SQL Editor. Reverter: 28_hwx_series_oferta_reverter.sql
-- Pré-requisitos: sql/26_hwx_ofertas.sql e sql/27_hwx_agenda.sql já corridos (hwx_ofertas, hwx_series, hwx_trabalhos).
--
-- SÓ ACRESCENTA COLUNAS (add column if not exists): nada é apagado nem alterado nos dados existentes; sem triggers novos,
-- sem políticas novas (a RLS das hwx_ continua só admin, as políticas existentes já cobrem as colunas novas).
-- Não toca em hauswart_data, nem em hwx_clientes / hwx_locais / hwx_servicos / hwx_ofertas / hwx_config.
-- Idempotente: pode correr-se duas vezes.
--
-- COMPATÍVEL com a app publicada (build 382), que pode continuar a ser usada depois deste SQL:
--   · as colunas novas têm default (linhas = [], oferta_id = null, incluido_pauschale = false); a build 382 faz select *
--     e só escreve as suas colunas.

begin;

-- ══════════════ 1) hwx_series: linhas (copiadas da oferta, editáveis) e oferta de origem ══════════════
-- linhas: mesmo formato das linhas das ofertas/trabalhos
--   {tipo:'servico'|'livre'|'anfahrt', servico_id, descricao, unidade, qtd, preco, acrescimo_hora, total}
alter table public.hwx_series
  add column if not exists linhas    jsonb not null default '[]'::jsonb check (jsonb_typeof(linhas) = 'array'),
  add column if not exists oferta_id uuid references public.hwx_ofertas(id) on delete set null;
create index if not exists hwx_series_oferta on public.hwx_series (oferta_id);

-- ══════════════ 2) incluído na Pauschale Hauswart (série e trabalho) ══════════════
-- true = o trabalho é feito dentro da Pauschale da app Hauswart: CHF 0 e fora dos totais do Extra (não se conta 2×)
alter table public.hwx_series
  add column if not exists incluido_pauschale boolean not null default false;
alter table public.hwx_trabalhos
  add column if not exists incluido_pauschale boolean not null default false;

commit;

-- ══════════════ 3) Verificação (fora da transação, depois do commit; o SQL Editor só mostra o último select) ══════════════
select * from (
  select 1 as o, 'coluna nova'::text as tipo, (table_name || '.' || column_name)::text as item,
         (data_type || ' default ' || coalesce(column_default, '-'))::text as detalhe
  from information_schema.columns
  where table_schema = 'public'
    and ((table_name = 'hwx_series'    and column_name in ('linhas', 'oferta_id', 'incluido_pauschale'))
      or (table_name = 'hwx_trabalhos' and column_name = 'incluido_pauschale'))
  union all
  select 2, 'dados existentes (não mudam)', 'hwx_series / hwx_trabalhos'::text,
         ((select count(*) from public.hwx_series)::text || ' / ' || (select count(*) from public.hwx_trabalhos)::text)::text
  union all
  select 3, 'políticas (esperado 4 em cada)', c.relname::text,
         ((select count(*) from pg_policies pp where pp.schemaname = 'public' and pp.tablename = c.relname)::text || ' políticas, rls=' || c.relrowsecurity::text)::text
  from pg_class c where c.oid in ('public.hwx_series'::regclass, 'public.hwx_trabalhos'::regclass)
) v order by o, item;
