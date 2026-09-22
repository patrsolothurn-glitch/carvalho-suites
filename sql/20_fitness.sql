-- ══════════════════════════════════════════════════════════════════
-- Carvalho Fitness — schema Supabase (correr à mão no SQL Editor)
--
-- App nova, independente das outras (nunca lê/escreve tabelas de
-- fora do prefixo fitness_*). Acesso só ao Patricio, controlado no
-- código (allowed_apps/isAdmin em src/02-theme.js e src/10-shell.js)
-- — aqui a RLS é "user_id = auth.uid()" em todas as tabelas, como o
-- resto da suite (profiles.id = auth.users.id = auth.uid()).
--
-- 13 tabelas fitness_*, todas com: id uuid pk, user_id uuid default
-- auth.uid(), created_at/updated_at timestamptz. RLS ligada, 4
-- políticas (select/insert/update/delete) por tabela, sempre
-- "user_id = auth.uid()" — mesmo padrão do resto da suite
-- (updated_at não tem trigger automático, como em supabase/pollen.sql
-- — não é um padrão desta suite, mantido por consistência).
--
-- Decisões de FK ON DELETE que não estavam explícitas no pedido
-- (confirma ou muda antes de correr):
--   fitness_opcao_itens.alimento_id  → RESTRICT (não deixa apagar um
--     alimento ainda usado nalguma opção do plano; tem de sair da
--     opção primeiro)
--   fitness_registo.refeicao_id/opcao_id → SET NULL (o histórico de
--     registos nunca desaparece, mesmo que a refeição/opção seja
--     apagada depois — só perde a ligação)
--   fitness_compras.alimento_id → CASCADE (uma linha da lista de
--     compras não faz sentido sem o alimento)
--   fitness_treino_log.treino_id → SET NULL (histórico de treinos
--     feitos preservado mesmo que o treino-modelo seja apagado)
-- ══════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ── fitness_perfil (uma linha por utilizador) ─────────────────────────
create table if not exists fitness_perfil (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  sexo text check (sexo in ('homem', 'mulher')),
  data_nasc date,
  altura_cm numeric,
  atividade numeric check (atividade in (1.2, 1.375, 1.55, 1.725)),
  objetivo text check (objetivo in ('perder', 'manter', 'ganhar')),
  ritmo text check (ritmo in ('ligeiro', 'normal', 'rapido')),
  n_refeicoes int check (n_refeicoes between 1 and 6),
  kcal_coach numeric,
  usar_coach boolean not null default false,
  prot_g_kg numeric not null default 1.8,
  agua_l numeric not null default 3,
  peso_meta numeric,
  prox_avaliacao date, -- atualizada sozinha quando se grava uma avaliação nova (data + intervalo_avaliacao_dias); editável à mão e pode ficar null (ver src/20-app-fitness.js)
  intervalo_avaliacao_dias int not null default 14,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
alter table fitness_perfil enable row level security;
drop policy if exists "fitness_perfil: dono lê" on fitness_perfil;
create policy "fitness_perfil: dono lê" on fitness_perfil for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_perfil: dono cria" on fitness_perfil;
create policy "fitness_perfil: dono cria" on fitness_perfil for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_perfil: dono edita" on fitness_perfil;
create policy "fitness_perfil: dono edita" on fitness_perfil for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_perfil: dono apaga" on fitness_perfil;
create policy "fitness_perfil: dono apaga" on fitness_perfil for delete to authenticated using (user_id = auth.uid());

-- ── fitness_refeicoes ──────────────────────────────────────────────────
create table if not exists fitness_refeicoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  ordem int not null,
  nome text not null,
  pct numeric(5, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table fitness_refeicoes enable row level security;
drop policy if exists "fitness_refeicoes: dono lê" on fitness_refeicoes;
create policy "fitness_refeicoes: dono lê" on fitness_refeicoes for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_refeicoes: dono cria" on fitness_refeicoes;
create policy "fitness_refeicoes: dono cria" on fitness_refeicoes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_refeicoes: dono edita" on fitness_refeicoes;
create policy "fitness_refeicoes: dono edita" on fitness_refeicoes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_refeicoes: dono apaga" on fitness_refeicoes;
create policy "fitness_refeicoes: dono apaga" on fitness_refeicoes for delete to authenticated using (user_id = auth.uid());

-- ── fitness_alimentos ──────────────────────────────────────────────────
create table if not exists fitness_alimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  nome text not null,
  categoria text,
  kcal_100 numeric not null,
  prot_100 numeric not null,
  hc_100 numeric not null,
  gord_100 numeric not null,
  unidade_nome text,
  g_unidade numeric,
  off_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table fitness_alimentos enable row level security;
drop policy if exists "fitness_alimentos: dono lê" on fitness_alimentos;
create policy "fitness_alimentos: dono lê" on fitness_alimentos for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_alimentos: dono cria" on fitness_alimentos;
create policy "fitness_alimentos: dono cria" on fitness_alimentos for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_alimentos: dono edita" on fitness_alimentos;
create policy "fitness_alimentos: dono edita" on fitness_alimentos for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_alimentos: dono apaga" on fitness_alimentos;
create policy "fitness_alimentos: dono apaga" on fitness_alimentos for delete to authenticated using (user_id = auth.uid());

-- ── fitness_opcoes (máximo 5 por refeição — validado na app E aqui) ────
create table if not exists fitness_opcoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  refeicao_id uuid not null references fitness_refeicoes(id) on delete cascade,
  ordem int not null,
  nome text not null,
  favorito boolean not null default false,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table fitness_opcoes enable row level security;
drop policy if exists "fitness_opcoes: dono lê" on fitness_opcoes;
create policy "fitness_opcoes: dono lê" on fitness_opcoes for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_opcoes: dono cria" on fitness_opcoes;
create policy "fitness_opcoes: dono cria" on fitness_opcoes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_opcoes: dono edita" on fitness_opcoes;
create policy "fitness_opcoes: dono edita" on fitness_opcoes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_opcoes: dono apaga" on fitness_opcoes;
create policy "fitness_opcoes: dono apaga" on fitness_opcoes for delete to authenticated using (user_id = auth.uid());

create or replace function fitness_check_max_opcoes()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from fitness_opcoes where refeicao_id = new.refeicao_id and id <> new.id) >= 5 then
    raise exception 'Máximo de 5 opções por refeição.';
  end if;
  return new;
end;
$$;
drop trigger if exists fitness_opcoes_max_5 on fitness_opcoes;
create trigger fitness_opcoes_max_5
  before insert or update of refeicao_id on fitness_opcoes
  for each row execute function fitness_check_max_opcoes();

-- ── fitness_opcao_itens ────────────────────────────────────────────────
create table if not exists fitness_opcao_itens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  opcao_id uuid not null references fitness_opcoes(id) on delete cascade,
  alimento_id uuid not null references fitness_alimentos(id) on delete restrict,
  gramas_base numeric not null,
  ajustavel boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table fitness_opcao_itens enable row level security;
drop policy if exists "fitness_opcao_itens: dono lê" on fitness_opcao_itens;
create policy "fitness_opcao_itens: dono lê" on fitness_opcao_itens for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_opcao_itens: dono cria" on fitness_opcao_itens;
create policy "fitness_opcao_itens: dono cria" on fitness_opcao_itens for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_opcao_itens: dono edita" on fitness_opcao_itens;
create policy "fitness_opcao_itens: dono edita" on fitness_opcao_itens for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_opcao_itens: dono apaga" on fitness_opcao_itens;
create policy "fitness_opcao_itens: dono apaga" on fitness_opcao_itens for delete to authenticated using (user_id = auth.uid());

-- ── fitness_registo (histórico — grava os valores calculados no
-- momento, nunca recalcula a partir do alimento atual) ───────────────
create table if not exists fitness_registo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  data date not null,
  refeicao_id uuid references fitness_refeicoes(id) on delete set null,
  opcao_id uuid references fitness_opcoes(id) on delete set null,
  livre_nome text,
  kcal numeric not null,
  prot numeric not null default 0,
  hc numeric not null default 0,
  gord numeric not null default 0,
  fator numeric,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table fitness_registo enable row level security;
drop policy if exists "fitness_registo: dono lê" on fitness_registo;
create policy "fitness_registo: dono lê" on fitness_registo for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_registo: dono cria" on fitness_registo;
create policy "fitness_registo: dono cria" on fitness_registo for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_registo: dono edita" on fitness_registo;
create policy "fitness_registo: dono edita" on fitness_registo for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_registo: dono apaga" on fitness_registo;
create policy "fitness_registo: dono apaga" on fitness_registo for delete to authenticated using (user_id = auth.uid());

-- ── fitness_agua (uma linha por dia por utilizador) ───────────────────
create table if not exists fitness_agua (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  data date not null,
  ml numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, data)
);
alter table fitness_agua enable row level security;
drop policy if exists "fitness_agua: dono lê" on fitness_agua;
create policy "fitness_agua: dono lê" on fitness_agua for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_agua: dono cria" on fitness_agua;
create policy "fitness_agua: dono cria" on fitness_agua for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_agua: dono edita" on fitness_agua;
create policy "fitness_agua: dono edita" on fitness_agua for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_agua: dono apaga" on fitness_agua;
create policy "fitness_agua: dono apaga" on fitness_agua for delete to authenticated using (user_id = auth.uid());

-- ── fitness_compras ────────────────────────────────────────────────────
create table if not exists fitness_compras (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  alimento_id uuid not null references fitness_alimentos(id) on delete cascade,
  gramas numeric not null,
  comprado boolean not null default false,
  semana date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table fitness_compras enable row level security;
drop policy if exists "fitness_compras: dono lê" on fitness_compras;
create policy "fitness_compras: dono lê" on fitness_compras for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_compras: dono cria" on fitness_compras;
create policy "fitness_compras: dono cria" on fitness_compras for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_compras: dono edita" on fitness_compras;
create policy "fitness_compras: dono edita" on fitness_compras for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_compras: dono apaga" on fitness_compras;
create policy "fitness_compras: dono apaga" on fitness_compras for delete to authenticated using (user_id = auth.uid());

-- ── fitness_avaliacoes ─────────────────────────────────────────────────
create table if not exists fitness_avaliacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  data date not null,
  peso numeric not null,
  cintura numeric,
  peito numeric,
  anca numeric,
  braco numeric,
  coxa numeric,
  gordura_pct numeric,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table fitness_avaliacoes enable row level security;
drop policy if exists "fitness_avaliacoes: dono lê" on fitness_avaliacoes;
create policy "fitness_avaliacoes: dono lê" on fitness_avaliacoes for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_avaliacoes: dono cria" on fitness_avaliacoes;
create policy "fitness_avaliacoes: dono cria" on fitness_avaliacoes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_avaliacoes: dono edita" on fitness_avaliacoes;
create policy "fitness_avaliacoes: dono edita" on fitness_avaliacoes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_avaliacoes: dono apaga" on fitness_avaliacoes;
create policy "fitness_avaliacoes: dono apaga" on fitness_avaliacoes for delete to authenticated using (user_id = auth.uid());

-- ── fitness_fotos (o ficheiro em si vive no Storage, bucket privado
-- "fitness-fotos" — apagar a linha NÃO apaga o ficheiro sozinho, a app
-- tem de chamar storage.remove() primeiro, ver src/20-app-fitness.js) ──
create table if not exists fitness_fotos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  avaliacao_id uuid not null references fitness_avaliacoes(id) on delete cascade,
  posicao text not null check (posicao in ('frente', 'costas', 'lado')),
  storage_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table fitness_fotos enable row level security;
drop policy if exists "fitness_fotos: dono lê" on fitness_fotos;
create policy "fitness_fotos: dono lê" on fitness_fotos for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_fotos: dono cria" on fitness_fotos;
create policy "fitness_fotos: dono cria" on fitness_fotos for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_fotos: dono edita" on fitness_fotos;
create policy "fitness_fotos: dono edita" on fitness_fotos for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_fotos: dono apaga" on fitness_fotos;
create policy "fitness_fotos: dono apaga" on fitness_fotos for delete to authenticated using (user_id = auth.uid());

-- ── fitness_treinos ────────────────────────────────────────────────────
create table if not exists fitness_treinos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  nome text not null,
  ordem int not null,
  duracao_min int,
  voltas int,
  descanso_s int,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table fitness_treinos enable row level security;
drop policy if exists "fitness_treinos: dono lê" on fitness_treinos;
create policy "fitness_treinos: dono lê" on fitness_treinos for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_treinos: dono cria" on fitness_treinos;
create policy "fitness_treinos: dono cria" on fitness_treinos for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_treinos: dono edita" on fitness_treinos;
create policy "fitness_treinos: dono edita" on fitness_treinos for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_treinos: dono apaga" on fitness_treinos;
create policy "fitness_treinos: dono apaga" on fitness_treinos for delete to authenticated using (user_id = auth.uid());

-- ── fitness_exercicios ─────────────────────────────────────────────────
create table if not exists fitness_exercicios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  treino_id uuid not null references fitness_treinos(id) on delete cascade,
  ordem int not null,
  nome text not null,
  series int,
  reps text,
  video_url text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table fitness_exercicios enable row level security;
drop policy if exists "fitness_exercicios: dono lê" on fitness_exercicios;
create policy "fitness_exercicios: dono lê" on fitness_exercicios for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_exercicios: dono cria" on fitness_exercicios;
create policy "fitness_exercicios: dono cria" on fitness_exercicios for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_exercicios: dono edita" on fitness_exercicios;
create policy "fitness_exercicios: dono edita" on fitness_exercicios for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_exercicios: dono apaga" on fitness_exercicios;
create policy "fitness_exercicios: dono apaga" on fitness_exercicios for delete to authenticated using (user_id = auth.uid());

-- ── fitness_treino_log ─────────────────────────────────────────────────
create table if not exists fitness_treino_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  data date not null,
  treino_id uuid references fitness_treinos(id) on delete set null,
  feitos jsonb not null default '[]'::jsonb,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table fitness_treino_log enable row level security;
drop policy if exists "fitness_treino_log: dono lê" on fitness_treino_log;
create policy "fitness_treino_log: dono lê" on fitness_treino_log for select to authenticated using (user_id = auth.uid());
drop policy if exists "fitness_treino_log: dono cria" on fitness_treino_log;
create policy "fitness_treino_log: dono cria" on fitness_treino_log for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "fitness_treino_log: dono edita" on fitness_treino_log;
create policy "fitness_treino_log: dono edita" on fitness_treino_log for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fitness_treino_log: dono apaga" on fitness_treino_log;
create policy "fitness_treino_log: dono apaga" on fitness_treino_log for delete to authenticated using (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════
-- Storage: bucket privado "fitness-fotos"
-- Caminho: <user_id>/<avaliacao_id>/<posicao>.jpg — signed URLs só,
-- nunca público (ver src/16-app-voz.js para o mesmo padrão já em uso
-- na suite: upload → createSignedUrl(path, 3600) para mostrar).
-- ══════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('fitness-fotos', 'fitness-fotos', false)
on conflict (id) do nothing;

drop policy if exists "fitness-fotos: dono lê" on storage.objects;
create policy "fitness-fotos: dono lê" on storage.objects for select to authenticated using (
  bucket_id = 'fitness-fotos' and (storage.foldername(name))[1] = auth.uid()::text
);
drop policy if exists "fitness-fotos: dono envia" on storage.objects;
create policy "fitness-fotos: dono envia" on storage.objects for insert to authenticated with check (
  bucket_id = 'fitness-fotos' and (storage.foldername(name))[1] = auth.uid()::text
);
drop policy if exists "fitness-fotos: dono atualiza" on storage.objects;
create policy "fitness-fotos: dono atualiza" on storage.objects for update to authenticated using (
  bucket_id = 'fitness-fotos' and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'fitness-fotos' and (storage.foldername(name))[1] = auth.uid()::text
);
drop policy if exists "fitness-fotos: dono apaga" on storage.objects;
create policy "fitness-fotos: dono apaga" on storage.objects for delete to authenticated using (
  bucket_id = 'fitness-fotos' and (storage.foldername(name))[1] = auth.uid()::text
);

-- Para verificar depois: select tablename, policyname from pg_policies where tablename like 'fitness_%' order by tablename;
