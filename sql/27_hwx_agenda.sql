-- Hauswart Extra — fase 3: Agenda das sextas, trabalhos e clientes fixos (séries).
-- Tabelas hwx_series e hwx_trabalhos + numeração automática T<ano>-<seq> + horas por sexta em hwx_config.
-- NÃO CORRIDO. Rever antes de correr no SQL Editor. Reverter: 27_hwx_agenda_reverter.sql
-- Pré-requisitos: sql/24, 25 e 26 já corridos (hwx_touch, hwx_config, hwx_clientes, hwx_locais, hwx_servicos, hwx_ofertas).
--
-- SÓ ACRESCENTA: nenhuma coluna nem tabela existente é apagada ou alterada nos seus dados.
--
-- COMPATÍVEL com a app publicada (que ainda não conhece este SQL) e com os dados reais das hwx_:
--   · hwx_config ganha 3 colunas, todas com default; a app publicada faz select * e só escreve as suas colunas;
--   · hwx_series e hwx_trabalhos são tabelas novas que a app publicada não conhece;
--   · nada muda em hwx_clientes, hwx_locais, hwx_servicos nem hwx_ofertas.
-- As séries guardam só a REGRA (início, intervalo, fim). As datas futuras são calculadas no ecrã; não se criam
-- linhas futuras. Uma linha em hwx_trabalhos com o mesmo (serie_id, data_serie) manda sobre a data calculada.

begin;

-- ══════════════ 1) hwx_config: contador dos trabalhos e horas por sexta ══════════════
alter table public.hwx_config
  add column if not exists ultimo_trab_ano integer not null default 0,
  add column if not exists ultimo_trab_seq integer not null default 0,
  add column if not exists horas_sexta     numeric(4,1) not null default 8 check (horas_sexta >= 0 and horas_sexta <= 24);

-- ══════════════ 2) hwx_series: clientes fixos (de N em N dias) ══════════════
create table if not exists public.hwx_series (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  cliente_id      uuid not null references public.hwx_clientes(id) on delete restrict,   -- não deixa apagar um cliente com série
  local_id        uuid references public.hwx_locais(id) on delete set null,
  servico_id      uuid references public.hwx_servicos(id) on delete set null,
  descricao       text not null default '',
  inicio          date not null,                                                          -- 1.ª ocorrência (âncora)
  fim             date,                                                                   -- null = sem fim
  intervalo_dias  integer not null default 14 check (intervalo_dias between 1 and 366),
  hora            time,
  horas_previstas numeric(5,2) check (horas_previstas is null or horas_previstas > 0),
  ativa           boolean not null default true,
  notas           text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint hwx_series_fim_ok check (fim is null or fim >= inicio)
);
create index if not exists hwx_series_cliente on public.hwx_series (cliente_id);
create index if not exists hwx_series_user    on public.hwx_series (user_id, ativa);

drop trigger if exists hwx_series_touch on public.hwx_series;
create trigger hwx_series_touch before update on public.hwx_series
  for each row execute function public.hwx_touch();

-- Apagar uma série NÃO apaga os trabalhos já criados (feitos, movidos, cancelados): ficam como trabalhos avulsos.
-- A FK faz serie_id = null; como o check exige (serie_id is null) = (data_serie is null), este trigger limpa também
-- data_serie ANTES de apagar (sem ele o delete falharia). Sem security definer.
create or replace function public.hwx_series_antes_apagar() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  update public.hwx_trabalhos set serie_id = null, data_serie = null where serie_id = old.id;
  return old;
end $$;

drop trigger if exists hwx_series_del on public.hwx_series;
create trigger hwx_series_del before delete on public.hwx_series
  for each row execute function public.hwx_series_antes_apagar();

-- ══════════════ 3) hwx_trabalhos: trabalhos feitos, planeados e exceções de séries ══════════════
create table if not exists public.hwx_trabalhos (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  numero          text not null,                 -- preenchido pelo trigger (T2026-0001)
  cliente_id      uuid references public.hwx_clientes(id) on delete set null,
  -- fotografias no momento do trabalho: mudar o cliente ou o local depois não altera trabalhos antigos
  cliente_snap    jsonb not null default '{}'::jsonb check (jsonb_typeof(cliente_snap) = 'object'),
  local_id        uuid references public.hwx_locais(id) on delete set null,
  local_snap      jsonb not null default '{}'::jsonb check (jsonb_typeof(local_snap) = 'object'),
  oferta_id       uuid references public.hwx_ofertas(id) on delete set null,
  serie_id        uuid references public.hwx_series(id) on delete set null,
  data_serie      date,                          -- data ORIGINAL da ocorrência da série (chave da exceção)
  data            date not null,                 -- data efetiva (pode diferir de data_serie se foi movida)
  hora            time,
  estado          text not null default 'planeado' check (estado in ('planeado','feito','cancelado')),
  titulo          text not null default '',
  -- mesmo formato das ofertas: {tipo:'servico'|'livre'|'anfahrt', servico_id, descricao, unidade, qtd, preco, acrescimo_hora, total}
  linhas          jsonb not null default '[]'::jsonb check (jsonb_typeof(linhas) = 'array'),
  horas_reais     numeric(6,2) check (horas_reais is null or horas_reais >= 0),
  material        numeric(10,2) not null default 0 check (material >= 0),
  total           numeric(12,2) not null default 0 check (total >= 0),
  pago            boolean not null default false,
  data_pago       date,
  notas_cliente   text not null default '',      -- pode ir para o cliente
  notas_internas  text not null default '',      -- NUNCA sai da app
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint hwx_trabalhos_numero_unico unique (user_id, numero),
  constraint hwx_trabalhos_serie_coerente check ((serie_id is null) = (data_serie is null))
);
-- no máximo UMA linha por data de série: mover, cancelar ou concluir nunca duplica a ocorrência
create unique index if not exists hwx_trabalhos_serie_data on public.hwx_trabalhos (serie_id, data_serie) where serie_id is not null;
create index if not exists hwx_trabalhos_data    on public.hwx_trabalhos (user_id, data);
create index if not exists hwx_trabalhos_cliente on public.hwx_trabalhos (cliente_id);
create index if not exists hwx_trabalhos_estado  on public.hwx_trabalhos (user_id, estado, data);

drop trigger if exists hwx_trabalhos_touch on public.hwx_trabalhos;
create trigger hwx_trabalhos_touch before update on public.hwx_trabalhos
  for each row execute function public.hwx_touch();

-- ══════════════ 4) Numeração automática pela BASE: T<ano>-<seq de 4 dígitos> ══════════════
-- Mesma lógica das ofertas, com contador próprio em hwx_config (ultimo_trab_ano/seq). Sem security definer: corre com
-- os direitos de quem grava o trabalho (só admin). Ano = ano da data do trabalho. Ano novo → recomeça em 1; mesmo ano →
-- seq + 1. O contador nunca desce, por isso números de trabalhos apagados não voltam a ser usados.
-- Caso raro: trabalho com data de um ano ANTERIOR ao do contador → usa o maior número desse ano que ainda exista + 1
-- (não mexe no contador), para nunca repetir um número existente.
create or replace function public.hwx_trabalhos_numero() returns trigger
language plpgsql set search_path = public, pg_temp as $$
declare v_ano integer; v_uano integer; v_useq integer; v_max integer; v_seq integer;
begin
  if new.numero is not null and btrim(new.numero) <> '' then
    return new;
  end if;
  v_ano := extract(year from new.data)::integer;
  insert into public.hwx_config (user_id) values (new.user_id) on conflict (user_id) do nothing;
  select ultimo_trab_ano, ultimo_trab_seq into v_uano, v_useq
  from public.hwx_config where user_id = new.user_id for update;
  v_uano := coalesce(v_uano, 0);
  v_useq := coalesce(v_useq, 0);
  select coalesce(max(substring(t.numero from '^T\d{4}-(\d+)$')::integer), 0) into v_max
  from public.hwx_trabalhos t where t.user_id = new.user_id and t.numero like 'T' || v_ano || '-%';
  if v_ano = v_uano then
    v_seq := greatest(v_useq, v_max) + 1;
  else
    v_seq := v_max + 1;
  end if;
  new.numero := 'T' || v_ano || '-' || lpad(v_seq::text, 4, '0');
  if v_ano >= v_uano then
    update public.hwx_config set ultimo_trab_ano = v_ano, ultimo_trab_seq = v_seq where user_id = new.user_id;
  end if;
  return new;
end $$;

drop trigger if exists hwx_trabalhos_numero_ins on public.hwx_trabalhos;
create trigger hwx_trabalhos_numero_ins before insert on public.hwx_trabalhos
  for each row execute function public.hwx_trabalhos_numero();

-- ══════════════ 5) RLS exatamente igual às outras hwx_ (padrão de 23_wplan_pensum.sql) ══════════════
alter table public.hwx_series enable row level security;
revoke all on public.hwx_series from public, anon;
grant select, insert, update, delete on public.hwx_series to authenticated;
drop policy if exists hwx_series_select on public.hwx_series;
drop policy if exists hwx_series_insert on public.hwx_series;
drop policy if exists hwx_series_update on public.hwx_series;
drop policy if exists hwx_series_delete on public.hwx_series;
create policy hwx_series_select on public.hwx_series for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy hwx_series_insert on public.hwx_series for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy hwx_series_update on public.hwx_series for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy hwx_series_delete on public.hwx_series for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));

alter table public.hwx_trabalhos enable row level security;
revoke all on public.hwx_trabalhos from public, anon;
grant select, insert, update, delete on public.hwx_trabalhos to authenticated;
drop policy if exists hwx_trabalhos_select on public.hwx_trabalhos;
drop policy if exists hwx_trabalhos_insert on public.hwx_trabalhos;
drop policy if exists hwx_trabalhos_update on public.hwx_trabalhos;
drop policy if exists hwx_trabalhos_delete on public.hwx_trabalhos;
create policy hwx_trabalhos_select on public.hwx_trabalhos for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy hwx_trabalhos_insert on public.hwx_trabalhos for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy hwx_trabalhos_update on public.hwx_trabalhos for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy hwx_trabalhos_delete on public.hwx_trabalhos for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));

-- ══════════════ 6) Verificação (um só resultado: o SQL Editor só mostra o último select) ══════════════
select * from (
  select 1 as o, 'coluna nova'::text as tipo, (table_name || '.' || column_name)::text as item, (data_type || ' default ' || coalesce(column_default, '-'))::text as detalhe
  from information_schema.columns
  where table_schema = 'public' and table_name = 'hwx_config' and column_name in ('ultimo_trab_ano','ultimo_trab_seq','horas_sexta')
  union all
  select 2, 'tabela ' || c.relname::text, ('rls=' || c.relrowsecurity::text)::text,
         ((select count(*) from pg_policies pp where pp.schemaname = 'public' and pp.tablename = c.relname)::text || ' políticas (esperado 4)')::text
  from pg_class c where c.oid in ('public.hwx_series'::regclass, 'public.hwx_trabalhos'::regclass)
  union all
  select 3, 'trigger', (c.relname || '.' || t.tgname)::text, 'ativo'::text
  from pg_trigger t join pg_class c on c.oid = t.tgrelid
  where t.tgrelid in ('public.hwx_series'::regclass, 'public.hwx_trabalhos'::regclass) and not t.tgisinternal
  union all
  select 4, 'índice único parcial', indexname::text, 'serie_id + data_serie'::text
  from pg_indexes where schemaname = 'public' and indexname = 'hwx_trabalhos_serie_data'
  union all
  select 5, 'dados existentes (não mudam)', 'hwx_clientes / hwx_locais / hwx_servicos / hwx_ofertas'::text,
         ((select count(*) from public.hwx_clientes)::text || ' / ' || (select count(*) from public.hwx_locais)::text || ' / ' || (select count(*) from public.hwx_servicos)::text || ' / ' || (select count(*) from public.hwx_ofertas)::text)::text
  union all
  select 6, 'dados config', ('horas_sexta=' || horas_sexta::text)::text,
         ('ultimo_trab_ano=' || ultimo_trab_ano || ' seq=' || ultimo_trab_seq)::text
  from public.hwx_config
) v order by o, item;

commit;
