-- Hauswart Extra — fase 2: Ofertas (Offerte). Tabela hwx_ofertas + numeração automática + preço base por hora.
-- NÃO CORRIDO. Rever antes de correr no SQL Editor. Reverter: 26_hwx_ofertas_reverter.sql
-- Pré-requisitos: sql/24_hwx_base.sql e sql/25_hwx_melhorias.sql já corridos (hwx_touch, hwx_config, hwx_clientes, hwx_locais).
--
-- SÓ ACRESCENTA: nenhuma coluna nem tabela existente é apagada ou alterada nos seus dados.
--
-- COMPATÍVEL com a app publicada (build 377), que pode continuar a ser usada depois deste SQL:
--   · hwx_config ganha 3 colunas, todas com default; a build 377 faz select * e só escreve as suas colunas;
--   · hwx_ofertas é uma tabela nova que a build 377 não conhece;
--   · nada muda em hwx_clientes, hwx_locais nem hwx_servicos.
-- As zonas continuam no jsonb de hwx_config (o "tipo" de cada zona vive lá; não há SQL para isso).

begin;

-- ══════════════ 1) hwx_config: preço base por hora e contadores das ofertas ══════════════
alter table public.hwx_config
  add column if not exists preco_base_hora   numeric(10,2) not null default 35 check (preco_base_hora >= 0),
  add column if not exists ultimo_oferta_ano integer not null default 0,
  add column if not exists ultimo_oferta_seq integer not null default 0;

-- ══════════════ 2) hwx_ofertas ══════════════
create table if not exists public.hwx_ofertas (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  numero          text not null,                 -- preenchido pelo trigger (O2026-0001)
  cliente_id      uuid references public.hwx_clientes(id) on delete set null,
  local_id        uuid references public.hwx_locais(id) on delete set null,
  -- fotografias no momento da oferta: mudar o cliente, o local ou a zona depois não altera ofertas antigas
  cliente_snap    jsonb not null default '{}'::jsonb check (jsonb_typeof(cliente_snap) = 'object'),
  local_snap      jsonb not null default '{}'::jsonb check (jsonb_typeof(local_snap) = 'object'),   -- vazio = morada de quem paga
  zona_snap       jsonb not null default '{}'::jsonb check (jsonb_typeof(zona_snap) = 'object'),    -- {nome, tipo, valor}
  titulo          text not null default '',
  data            date not null default current_date,
  valida_ate      date,
  estado          text not null default 'rascunho' check (estado in ('rascunho','enviada','aceite','recusada')),
  lingua          text not null default 'de' check (lingua in ('de','fr','it','en','pt')),
  -- cada linha: {tipo:'servico'|'livre'|'anfahrt', servico_id, descricao, unidade, qtd, preco, acrescimo_hora, total}
  -- com os preços congelados
  linhas          jsonb not null default '[]'::jsonb check (jsonb_typeof(linhas) = 'array'),
  desconto_tipo   text not null default 'chf' check (desconto_tipo in ('chf','pct')),
  desconto_valor  numeric(10,2) not null default 0 check (desconto_valor >= 0),
  total           numeric(12,2) not null default 0 check (total >= 0),
  notas_cliente   text not null default '',      -- vai para a impressão
  notas_internas  text not null default '',      -- NUNCA sai da app
  enviada_em      timestamptz,
  respondida_em   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint hwx_ofertas_numero_unico unique (user_id, numero)
);
create index if not exists hwx_ofertas_data    on public.hwx_ofertas (user_id, data);
create index if not exists hwx_ofertas_cliente on public.hwx_ofertas (cliente_id);
create index if not exists hwx_ofertas_estado  on public.hwx_ofertas (user_id, estado);

drop trigger if exists hwx_ofertas_touch on public.hwx_ofertas;
create trigger hwx_ofertas_touch before update on public.hwx_ofertas
  for each row execute function public.hwx_touch();

-- ══════════════ 3) Numeração automática pela BASE: O<ano>-<seq de 4 dígitos> ══════════════
-- Sem security definer: a RLS deixa o admin escrever em hwx_config e a função corre com os direitos de quem grava
-- a oferta (só admin), por isso nunca ganha acesso que o utilizador não tenha.
-- Ano = ano da data da oferta. Ano novo → sequência recomeça em 1; mesmo ano → seq + 1. Contador em hwx_config
-- (ultimo_oferta_ano/seq) que nunca desce: números de ofertas apagadas não voltam a ser usados.
-- Caso raro: oferta com data de um ano ANTERIOR ao do contador → usa o maior número desse ano que ainda exista + 1
-- (não mexe no contador), para nunca repetir um número existente.
create or replace function public.hwx_ofertas_numero() returns trigger
language plpgsql set search_path = public, pg_temp as $$
declare v_ano integer; v_uano integer; v_useq integer; v_max integer; v_seq integer;
begin
  if new.numero is not null and btrim(new.numero) <> '' then
    return new;
  end if;
  v_ano := extract(year from new.data)::integer;
  insert into public.hwx_config (user_id) values (new.user_id) on conflict (user_id) do nothing;
  select ultimo_oferta_ano, ultimo_oferta_seq into v_uano, v_useq
  from public.hwx_config where user_id = new.user_id for update;
  v_uano := coalesce(v_uano, 0);
  v_useq := coalesce(v_useq, 0);
  select coalesce(max(substring(o.numero from '^O\d{4}-(\d+)$')::integer), 0) into v_max
  from public.hwx_ofertas o where o.user_id = new.user_id and o.numero like 'O' || v_ano || '-%';
  if v_ano = v_uano then
    v_seq := greatest(v_useq, v_max) + 1;
  else
    v_seq := v_max + 1;
  end if;
  new.numero := 'O' || v_ano || '-' || lpad(v_seq::text, 4, '0');
  if v_ano >= v_uano then
    update public.hwx_config set ultimo_oferta_ano = v_ano, ultimo_oferta_seq = v_seq where user_id = new.user_id;
  end if;
  return new;
end $$;

drop trigger if exists hwx_ofertas_numero_ins on public.hwx_ofertas;
create trigger hwx_ofertas_numero_ins before insert on public.hwx_ofertas
  for each row execute function public.hwx_ofertas_numero();

-- ══════════════ 4) RLS exatamente igual às outras hwx_ (padrão de 23_wplan_pensum.sql) ══════════════
alter table public.hwx_ofertas enable row level security;
revoke all on public.hwx_ofertas from public, anon;
grant select, insert, update, delete on public.hwx_ofertas to authenticated;
drop policy if exists hwx_ofertas_select on public.hwx_ofertas;
drop policy if exists hwx_ofertas_insert on public.hwx_ofertas;
drop policy if exists hwx_ofertas_update on public.hwx_ofertas;
drop policy if exists hwx_ofertas_delete on public.hwx_ofertas;
create policy hwx_ofertas_select on public.hwx_ofertas for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy hwx_ofertas_insert on public.hwx_ofertas for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy hwx_ofertas_update on public.hwx_ofertas for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy hwx_ofertas_delete on public.hwx_ofertas for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));

-- ══════════════ 5) Verificação (um só resultado: o SQL Editor só mostra o último select) ══════════════
select * from (
  select 1 as o, 'coluna nova'::text as tipo, (table_name || '.' || column_name)::text as item, (data_type || ' default ' || coalesce(column_default, '-'))::text as detalhe
  from information_schema.columns
  where table_schema = 'public' and table_name = 'hwx_config' and column_name in ('preco_base_hora','ultimo_oferta_ano','ultimo_oferta_seq')
  union all
  select 2, 'tabela hwx_ofertas', ('rls=' || c.relrowsecurity::text)::text,
         ((select count(*) from pg_policies pp where pp.schemaname = 'public' and pp.tablename = 'hwx_ofertas')::text || ' políticas (esperado 4)')::text
  from pg_class c where c.oid = 'public.hwx_ofertas'::regclass
  union all
  select 3, 'trigger numeração', t.tgname::text, 'ativo'::text
  from pg_trigger t where t.tgrelid = 'public.hwx_ofertas'::regclass and not t.tgisinternal
  union all
  select 4, 'dados existentes (não mudam)', 'hwx_clientes / hwx_locais / hwx_servicos'::text,
         ((select count(*) from public.hwx_clientes)::text || ' / ' || (select count(*) from public.hwx_locais)::text || ' / ' || (select count(*) from public.hwx_servicos)::text)::text
  union all
  select 5, 'dados config', ('preco_base_hora=' || preco_base_hora::text)::text,
         ('ultimo_oferta_ano=' || ultimo_oferta_ano || ' seq=' || ultimo_oferta_seq || ' zonas=' || jsonb_array_length(zonas)::text)::text
  from public.hwx_config
) v order by o, item;

commit;
