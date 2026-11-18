-- ===================== SQL para correr (AINDA NÃO CORRIDO) =====================
-- Caixa "Kontrollen" da app Notas Carvalho (src/23-app-notas.js): registo de controlos regulares (anuais,
-- de meio ano…). Duas tabelas NOVAS. NÃO toca em notas_notas, notas_lista_itens, notas_cofre nem em nenhuma
-- tabela existente. NÃO foi corrido pelo Claude Code: quem corre é o utilizador, no SQL Editor do Supabase,
-- por esta ordem: BLOCO 1 (só leitura) -> BLOCO 2 (cria) -> BLOCO 3 (só leitura, verificação).
-- Reverter: sql/42_notas_kontrollen_reverter.sql.
--
-- RLS só-dono, como o padrão das Notas (sql/33): o registo só é visível e editável por quem é admin
-- (profiles.is_admin) E é o dono da linha (dono = profiles.member_id). Ninguém mais vê nada, nem a Família,
-- nem outros membros. As colunas e tabelas usadas aqui existem em sql/33 e no código (profiles.is_admin e
-- profiles.member_id são as mesmas que as políticas de notas_notas já usam).
-- Os registos só podem apontar para um tipo do MESMO dono (a política de insert/update confirma-o).
-- Apagar um tipo apaga também as suas vezes (on delete cascade); a app avisa na confirmação.
-- Backup: estas tabelas NÃO estão na lista TABLES de .github/workflows/backup.yml (ver README).

-- ---------------------- BLOCO 1 — SÓ LEITURA (correr primeiro) ----------------------
-- Esperado: a) 0 linhas (as tabelas ainda não existem); b) 2 linhas (is_admin e member_id em profiles);
--           c) uma linha com admins_patricio >= 1 (o admin tem member_id = 'patricio').
select table_name from information_schema.tables
where table_schema = 'public' and table_name in ('notas_kontroll_tipos', 'notas_kontroll_registos');

select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'profiles' and column_name in ('is_admin', 'member_id');

select count(*) filter (where is_admin and member_id = 'patricio') as admins_patricio from public.profiles;

-- ---------------------- BLOCO 2 — CRIA (ALTERA a estrutura; só depois de o bloco 1 bater certo) ----------------------
-- O que faz: cria duas tabelas novas e vazias, índices, RLS e 4 políticas por tabela.
-- O que pode partir: nada do que existe (só cria nomes novos). Tudo numa só transação: se algo falhar, não fica nada a meio.
begin;

create table public.notas_kontroll_tipos (
  id uuid primary key default gen_random_uuid(),
  dono text not null check (dono in ('patricio','esposa','lucas','liam')),
  nome text not null check (length(btrim(nome)) between 1 and 100),
  intervalo_meses integer not null check (intervalo_meses between 1 and 120),
  created_at timestamptz not null default now()
);

create table public.notas_kontroll_registos (
  id uuid primary key default gen_random_uuid(),
  dono text not null check (dono in ('patricio','esposa','lucas','liam')),
  tipo_id uuid not null references public.notas_kontroll_tipos(id) on delete cascade,
  data date not null,
  hora_inicio time,
  hora_fim time,
  assunto text not null default '' check (length(assunto) <= 300),
  feita boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (hora_inicio is null or hora_fim is null or hora_fim >= hora_inicio)
);

create index notas_kontroll_tipos_dono_idx on public.notas_kontroll_tipos (dono, created_at);
create index notas_kontroll_registos_tipo_idx on public.notas_kontroll_registos (tipo_id, data desc);
create index notas_kontroll_registos_dono_idx on public.notas_kontroll_registos (dono, data desc);

alter table public.notas_kontroll_tipos enable row level security;
alter table public.notas_kontroll_registos enable row level security;

revoke all on public.notas_kontroll_tipos from anon;
revoke all on public.notas_kontroll_registos from anon;
grant select, insert, update, delete on public.notas_kontroll_tipos to authenticated;
grant select, insert, update, delete on public.notas_kontroll_registos to authenticated;

-- notas_kontroll_tipos: só o admin dono
create policy "kontroll_tipos: dono lê" on public.notas_kontroll_tipos for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin and p.member_id = notas_kontroll_tipos.dono));
create policy "kontroll_tipos: dono cria" on public.notas_kontroll_tipos for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin and p.member_id = notas_kontroll_tipos.dono));
create policy "kontroll_tipos: dono edita" on public.notas_kontroll_tipos for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin and p.member_id = notas_kontroll_tipos.dono))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin and p.member_id = notas_kontroll_tipos.dono));
create policy "kontroll_tipos: dono apaga" on public.notas_kontroll_tipos for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin and p.member_id = notas_kontroll_tipos.dono));

-- notas_kontroll_registos: só o admin dono, e o tipo tem de ser do mesmo dono
create policy "kontroll_registos: dono lê" on public.notas_kontroll_registos for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin and p.member_id = notas_kontroll_registos.dono));
create policy "kontroll_registos: dono cria" on public.notas_kontroll_registos for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin and p.member_id = notas_kontroll_registos.dono)
    and exists (select 1 from public.notas_kontroll_tipos t where t.id = notas_kontroll_registos.tipo_id and t.dono = notas_kontroll_registos.dono));
create policy "kontroll_registos: dono edita" on public.notas_kontroll_registos for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin and p.member_id = notas_kontroll_registos.dono))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin and p.member_id = notas_kontroll_registos.dono)
    and exists (select 1 from public.notas_kontroll_tipos t where t.id = notas_kontroll_registos.tipo_id and t.dono = notas_kontroll_registos.dono));
create policy "kontroll_registos: dono apaga" on public.notas_kontroll_registos for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin and p.member_id = notas_kontroll_registos.dono));

commit;

-- ---------------------- BLOCO 3 — SÓ LEITURA (verificação) ----------------------
-- Esperado: 3a) 2 linhas, ambas com RLS ligada; 3b) 4 políticas por tabela (8 linhas);
--           3c) 0 linhas (anon sem nenhum privilégio; authenticated só select/insert/update/delete).
select c.relname, c.relrowsecurity as rls_ligada
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('notas_kontroll_tipos', 'notas_kontroll_registos');

select tablename, policyname, cmd from pg_policies
where schemaname = 'public' and tablename in ('notas_kontroll_tipos', 'notas_kontroll_registos')
order by tablename, cmd;

select table_name, grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('notas_kontroll_tipos', 'notas_kontroll_registos')
  and (grantee = 'anon' or (grantee = 'authenticated' and privilege_type not in ('SELECT','INSERT','UPDATE','DELETE')));
