-- ══════════════════════════════════════════════════════════════════
-- Pólen — schema Supabase (correr à mão no SQL Editor)
--
-- Assume que profiles.id é o mesmo uuid que auth.users.id / auth.uid()
-- (como no resto da suite). Ajusta as policies se o teu esquema ligar
-- profiles a auth.users de outra forma (ex.: profiles.user_id).
--
-- RLS "família": pollen_perfis, pollen_diario e pollen_termos são
-- partilhados por toda a gente com acesso ao Pólen (is_admin ou
-- 'pollen' em profiles.allowed_apps) — não só pelo dono da linha. Ver
-- src/19-app-pollen.js (carregar() já não filtra por profile_id) e o
-- PR "Pólen: perfis partilhados por toda a família".
--
-- IMPORTANTE antes de correr: confirma o tipo real de
-- profiles.allowed_apps (jsonb ou text[]) —
--   select column_name, data_type, udt_name from information_schema.columns
--   where table_name = 'profiles' and column_name = 'allowed_apps';
-- — e usa a versão A (jsonb) ou B (text[]) de pol_tem_acesso_pollen
-- abaixo consoante o resultado. Só uma das duas pode estar ativa de
-- cada vez (a outra fica comentada).
-- ══════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ── Acesso ao Pólen (helper único, usado pelas 3 tabelas abaixo) ───
-- VERSÃO A — profiles.allowed_apps é jsonb (ativa por omissão)
create or replace function pol_tem_acesso_pollen(uid uuid)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from profiles pr
    where pr.id = uid
      and (pr.is_admin = true or pr.allowed_apps ? 'pollen')
  );
$$;
-- VERSÃO B — profiles.allowed_apps é text[] (comenta a A e descomenta esta se for o caso)
-- create or replace function pol_tem_acesso_pollen(uid uuid)
-- returns boolean
-- language sql stable
-- as $$
--   select exists (
--     select 1 from profiles pr
--     where pr.id = uid
--       and (pr.is_admin = true or 'pollen' = any(pr.allowed_apps))
--   );
-- $$;

-- ── pollen_perfis ────────────────────────────────────────────────
create table if not exists pollen_perfis (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade, -- quem criou o perfil
  nome text not null,
  alergias jsonb not null default '[]'::jsonb,
  kanton text,
  cidade text not null,
  lat float8 not null,
  lon float8 not null,
  notificar boolean not null default true,
  avisar_ids uuid[] not null default '{}'::uuid[], -- quem recebe o aviso das 06:30; vazio = avisar profile_id (quem criou)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table pollen_perfis add column if not exists avisar_ids uuid[] not null default '{}'::uuid[];
alter table pollen_perfis enable row level security;
drop policy if exists "pollen_perfis: dono lê" on pollen_perfis;
drop policy if exists "pollen_perfis: dono cria" on pollen_perfis;
drop policy if exists "pollen_perfis: dono edita" on pollen_perfis;
drop policy if exists "pollen_perfis: dono apaga" on pollen_perfis;
create policy "pollen_perfis: família lê" on pollen_perfis for select using (
  pol_tem_acesso_pollen(auth.uid())
);
create policy "pollen_perfis: família cria" on pollen_perfis for insert with check (
  profile_id = auth.uid() and pol_tem_acesso_pollen(auth.uid())
);
create policy "pollen_perfis: família edita" on pollen_perfis for update using (
  pol_tem_acesso_pollen(auth.uid())
) with check (
  pol_tem_acesso_pollen(auth.uid())
);
create policy "pollen_perfis: família apaga" on pollen_perfis for delete using (
  pol_tem_acesso_pollen(auth.uid())
);

-- ── pollen_diario ────────────────────────────────────────────────
-- Perfil (perfil_id) pode ser de qualquer membro da família com
-- acesso ao Pólen — não só do dono da linha.
create table if not exists pollen_diario (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references pollen_perfis(id) on delete cascade,
  data date not null,
  sintomas int not null check (sintomas between 0 and 3),
  medicamento text,
  nota text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (perfil_id, data)
);
alter table pollen_diario enable row level security;
drop policy if exists "pollen_diario: dono lê" on pollen_diario;
drop policy if exists "pollen_diario: dono cria" on pollen_diario;
drop policy if exists "pollen_diario: dono edita" on pollen_diario;
drop policy if exists "pollen_diario: dono apaga" on pollen_diario;
create policy "pollen_diario: família lê" on pollen_diario for select using (
  pol_tem_acesso_pollen(auth.uid())
);
create policy "pollen_diario: família cria" on pollen_diario for insert with check (
  pol_tem_acesso_pollen(auth.uid())
);
create policy "pollen_diario: família edita" on pollen_diario for update using (
  pol_tem_acesso_pollen(auth.uid())
) with check (
  pol_tem_acesso_pollen(auth.uid())
);
create policy "pollen_diario: família apaga" on pollen_diario for delete using (
  pol_tem_acesso_pollen(auth.uid())
);

-- ── pollen_termos (termos pessoais; os termos base vivem só no
-- código, src/19-app-pollen.js POL_TERMOS_BASE, sem tabela) ────────
create table if not exists pollen_termos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade, -- quem criou o termo
  de text not null,
  pt text not null,
  explicacao text,
  categoria text not null default 'polen' check (categoria in ('polen', 'medico')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table pollen_termos enable row level security;
drop policy if exists "pollen_termos: dono lê" on pollen_termos;
drop policy if exists "pollen_termos: dono cria" on pollen_termos;
drop policy if exists "pollen_termos: dono edita" on pollen_termos;
drop policy if exists "pollen_termos: dono apaga" on pollen_termos;
create policy "pollen_termos: família lê" on pollen_termos for select using (
  pol_tem_acesso_pollen(auth.uid())
);
create policy "pollen_termos: família cria" on pollen_termos for insert with check (
  profile_id = auth.uid() and pol_tem_acesso_pollen(auth.uid())
);
create policy "pollen_termos: família edita" on pollen_termos for update using (
  pol_tem_acesso_pollen(auth.uid())
) with check (
  pol_tem_acesso_pollen(auth.uid())
);
create policy "pollen_termos: família apaga" on pollen_termos for delete using (
  pol_tem_acesso_pollen(auth.uid())
);

-- ── pollen_estacoes / pollen_medicoes ────────────────────────────
-- Cache partilhada, alimentada só pelo workflow pollen-fetch.yml
-- (via SUPABASE_SERVICE_KEY, que ignora RLS). Utilizadores autenticados
-- só podem ler — nunca há policy de insert/update/delete para eles.
create table if not exists pollen_estacoes (
  codigo text primary key,
  nome text not null,
  lat float8 not null,
  lon float8 not null
);
alter table pollen_estacoes enable row level security;
create policy "pollen_estacoes: leitura autenticada" on pollen_estacoes for select using (auth.role() = 'authenticated');

create table if not exists pollen_medicoes (
  estacao text not null references pollen_estacoes(codigo) on delete cascade,
  ts timestamptz not null,
  tipo text not null,
  valor float8 not null,
  primary key (estacao, ts, tipo)
);
create index if not exists pollen_medicoes_estacao_ts_idx on pollen_medicoes (estacao, ts);
alter table pollen_medicoes enable row level security;
create policy "pollen_medicoes: leitura autenticada" on pollen_medicoes for select using (auth.role() = 'authenticated');

-- ── pg_cron: alerta diário ────────────────────────────────────────
-- Corre isto DEPOIS de:
--   1) fazeres o deploy manual da Edge Function:
--        supabase functions deploy pollen-alerta
--   2) guardares a service_role_key no Vault (Project Settings →
--      Vault) com o nome 'service_role_key' (ou ajusta o nome abaixo).
-- Ajusta também SEU_PROJECT_REF.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'pollen-alerta',
  '30 4 * * *', -- 04:30 UTC = 06:30 na Suíça em horário de verão; no inverno (UTC+1) passa a ser 05:30 UTC para continuar às 06:30 locais
  $$
  select net.http_post(
    url := 'https://SEU_PROJECT_REF.supabase.co/functions/v1/pollen-alerta',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Para verificar jobs agendados:  select * from cron.job;
-- Para remover, se precisares:   select cron.unschedule('pollen-alerta');
