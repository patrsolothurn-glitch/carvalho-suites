-- DOCUMENTAÇÃO. Já executado em produção a 15/10/2026 pelo Patricio no SQL
-- Editor do Supabase. O Claude Code NÃO executa este ficheiro.
-- Troca as policies antigas "using (true)" (qualquer utilizador autenticado)
-- por policies só-admin (public.is_admin_user()) nas tabelas abaixo.
-- Reverter: 31_policies_admin_reverter.sql.
begin;

-- agenda_monteurs
drop policy if exists "Allow all authenticated access" on public.agenda_monteurs;
alter table public.agenda_monteurs enable row level security;
create policy "agenda_monteurs_admin" on public.agenda_monteurs
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- agenda_pro_jobs
drop policy if exists "acesso total agenda_pro_jobs" on public.agenda_pro_jobs;
alter table public.agenda_pro_jobs enable row level security;
create policy "agenda_pro_jobs_admin" on public.agenda_pro_jobs
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- horas_projects
drop policy if exists "Allow all authenticated access" on public.horas_projects;
alter table public.horas_projects enable row level security;
create policy "horas_projects_admin" on public.horas_projects
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- horaspro_projects
drop policy if exists "auth_full_access" on public.horaspro_projects;
alter table public.horaspro_projects enable row level security;
create policy "horaspro_projects_admin" on public.horaspro_projects
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- horaspro_settings
drop policy if exists "auth_full_access" on public.horaspro_settings;
alter table public.horaspro_settings enable row level security;
create policy "horaspro_settings_admin" on public.horaspro_settings
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- horas_entries
drop policy if exists "acesso total horas_entries" on public.horas_entries;
alter table public.horas_entries enable row level security;
create policy "horas_entries_admin" on public.horas_entries
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- nutri_products (antes: 4 policies separadas, uma por operação)
drop policy if exists "select_nutri_products" on public.nutri_products;
drop policy if exists "insert_nutri_products" on public.nutri_products;
drop policy if exists "update_nutri_products" on public.nutri_products;
drop policy if exists "delete_nutri_products" on public.nutri_products;
alter table public.nutri_products enable row level security;
create policy "nutri_products_admin" on public.nutri_products
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- Verificação (esperado: rowsecurity = true e 1 política "<tabela>_admin" em cada tabela)
select c.relname, c.relrowsecurity,
       (select count(*) from pg_policies pp where pp.schemaname = 'public' and pp.tablename = c.relname and pp.policyname = c.relname || '_admin') as politica_admin
from pg_class c
where c.oid in (
  'public.agenda_monteurs'::regclass, 'public.agenda_pro_jobs'::regclass,
  'public.horas_projects'::regclass, 'public.horaspro_projects'::regclass,
  'public.horaspro_settings'::regclass, 'public.horas_entries'::regclass,
  'public.nutri_products'::regclass
);

commit;
