-- Hauswart Extra — fase 1: hwx_clientes, hwx_servicos, hwx_config.
-- Correr no SQL Editor ANTES de fundir qualquer PR que mexa no backup.yml.
-- NÃO CORRIDO. Rever antes de correr. Reverter: 24_hwx_base_reverter.sql
-- Nenhuma destas tabelas lê ou escreve hauswart_data.
-- Só admin (profiles.is_admin) lê e escreve; nada para anon/public. Mesmo padrão de 23_wplan_pensum.sql.
-- A política depende de profiles.is_admin não poder ser alterado por não-admin (trigger de protecção) — por confirmar na base.
-- Sem base64: só texto, números e jsonb pequeno.

begin;

create extension if not exists pgcrypto; -- gen_random_uuid()

-- updated_at automático (mesmo estilo de wplan_pensum_touch)
create or replace function public.hwx_touch() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin new.updated_at = now(); return new; end $$;

-- ── clientes ──────────────────────────────────────────────────────────
create table public.hwx_clientes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  nome        text not null check (length(btrim(nome)) > 0),
  telefone    text not null default '',   -- guardado como escrito; normalizado só ao gerar tel:/WhatsApp
  email       text not null default '',
  rua         text not null default '',
  plz_ort     text not null default '',
  zona        text not null default '',   -- nome da zona de deslocação (hwx_config.zonas)
  lingua      text not null default 'de' check (lingua in ('de','fr','it','en','pt')),
  notas       text not null default '',
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index hwx_clientes_nome on public.hwx_clientes (user_id, nome);

-- ── tabela de preços ──────────────────────────────────────────────────
create table public.hwx_servicos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  nome        text not null check (length(btrim(nome)) > 0),
  categoria   text not null default 'casa' check (categoria in ('casa','compras','pc_telemovel','outro')),
  unidade     text not null default 'hora' check (unidade in ('hora','fixo','peca','30min')),
  preco       numeric(10,2) not null check (preco >= 0),
  minimo      numeric(5,2) check (minimo is null or minimo > 0),
  nota        text not null default '',
  ativo       boolean not null default true,
  ordem       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index hwx_servicos_cat_ordem on public.hwx_servicos (user_id, categoria, ordem);

-- ── configuração (uma linha por utilizador) ───────────────────────────
create table public.hwx_config (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique default auth.uid() references public.profiles(id) on delete cascade,
  limite_anual numeric(12,2) not null default 2500 check (limite_anual >= 0),
  zonas        jsonb not null default '[]'::jsonb check (jsonb_typeof(zonas) = 'array'),       -- [{nome, valor}]
  remetente    jsonb not null default '{}'::jsonb check (jsonb_typeof(remetente) = 'object'),  -- nome, rua, plz_ort, telefone, email
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── updated_at + RLS só-admin, nas 3 tabelas ──────────────────────────
do $$
declare t text;
begin
  foreach t in array array['hwx_clientes','hwx_servicos','hwx_config'] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.hwx_touch()', t || '_touch', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format($p$create policy %I on public.%I for select to authenticated
      using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))$p$, t || '_select', t);
    execute format($p$create policy %I on public.%I for insert to authenticated
      with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))$p$, t || '_insert', t);
    execute format($p$create policy %I on public.%I for update to authenticated
      using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))
      with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))$p$, t || '_update', t);
    execute format($p$create policy %I on public.%I for delete to authenticated
      using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))$p$, t || '_delete', t);
  end loop;
end $$;

-- Verificação (esperado: 3 tabelas com rowsecurity = true e 4 políticas cada)
select c.relname, c.relrowsecurity,
       (select count(*) from pg_policies pp where pp.schemaname = 'public' and pp.tablename = c.relname) as politicas
from pg_class c
where c.oid in ('public.hwx_clientes'::regclass, 'public.hwx_servicos'::regclass, 'public.hwx_config'::regclass)
order by c.relname;

commit;
