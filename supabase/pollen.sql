-- ══════════════════════════════════════════════════════════════════
-- Pólen — schema Supabase (correr à mão no SQL Editor)
--
-- RLS "só do dono": assume que profiles.id é o mesmo uuid que
-- auth.users.id / auth.uid() (como no resto da suite). Ajusta as
-- policies se o teu esquema ligar profiles a auth.users de outra
-- forma (ex.: profiles.user_id).
-- ══════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ── pollen_perfis ────────────────────────────────────────────────
create table if not exists pollen_perfis (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  nome text not null,
  alergias jsonb not null default '[]'::jsonb,
  kanton text,
  cidade text not null,
  lat float8 not null,
  lon float8 not null,
  notificar boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table pollen_perfis enable row level security;
create policy "pollen_perfis: dono lê" on pollen_perfis for select using (auth.uid() = profile_id);
create policy "pollen_perfis: dono cria" on pollen_perfis for insert with check (auth.uid() = profile_id);
create policy "pollen_perfis: dono edita" on pollen_perfis for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "pollen_perfis: dono apaga" on pollen_perfis for delete using (auth.uid() = profile_id);

-- ── pollen_diario ────────────────────────────────────────────────
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
create policy "pollen_diario: dono lê" on pollen_diario for select using (
  exists (select 1 from pollen_perfis p where p.id = perfil_id and p.profile_id = auth.uid())
);
create policy "pollen_diario: dono cria" on pollen_diario for insert with check (
  exists (select 1 from pollen_perfis p where p.id = perfil_id and p.profile_id = auth.uid())
);
create policy "pollen_diario: dono edita" on pollen_diario for update using (
  exists (select 1 from pollen_perfis p where p.id = perfil_id and p.profile_id = auth.uid())
) with check (
  exists (select 1 from pollen_perfis p where p.id = perfil_id and p.profile_id = auth.uid())
);
create policy "pollen_diario: dono apaga" on pollen_diario for delete using (
  exists (select 1 from pollen_perfis p where p.id = perfil_id and p.profile_id = auth.uid())
);

-- ── pollen_termos (termos pessoais; os termos base vivem só no
-- código, src/19-app-pollen.js POL_TERMOS_BASE, sem tabela) ────────
create table if not exists pollen_termos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  de text not null,
  pt text not null,
  explicacao text,
  categoria text not null default 'polen' check (categoria in ('polen', 'medico')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table pollen_termos enable row level security;
create policy "pollen_termos: dono lê" on pollen_termos for select using (auth.uid() = profile_id);
create policy "pollen_termos: dono cria" on pollen_termos for insert with check (auth.uid() = profile_id);
create policy "pollen_termos: dono edita" on pollen_termos for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "pollen_termos: dono apaga" on pollen_termos for delete using (auth.uid() = profile_id);

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
