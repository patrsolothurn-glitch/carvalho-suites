-- DOCUMENTAÇÃO. Reverte 31_policies_admin.sql. NÃO CORRIDO pelo Claude Code.
-- Só executar manualmente se for preciso desfazer o endurecimento das
-- policies (volta a "qualquer utilizador autenticado", sem admin).
begin;

drop policy if exists "agenda_monteurs_admin" on public.agenda_monteurs;
create policy "Allow all authenticated access" on public.agenda_monteurs
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists "agenda_pro_jobs_admin" on public.agenda_pro_jobs;
create policy "acesso total agenda_pro_jobs" on public.agenda_pro_jobs
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists "horas_projects_admin" on public.horas_projects;
create policy "Allow all authenticated access" on public.horas_projects
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists "horaspro_projects_admin" on public.horaspro_projects;
create policy "auth_full_access" on public.horaspro_projects
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists "horaspro_settings_admin" on public.horaspro_settings;
create policy "auth_full_access" on public.horaspro_settings
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists "horas_entries_admin" on public.horas_entries;
create policy "acesso total horas_entries" on public.horas_entries
  for all to authenticated
  using (true)
  with check (true);

-- nutri_products: volta às 4 policies separadas, uma por operação
drop policy if exists "nutri_products_admin" on public.nutri_products;
create policy "select_nutri_products" on public.nutri_products
  for select to authenticated
  using (true);
create policy "insert_nutri_products" on public.nutri_products
  for insert to authenticated
  with check (true);
create policy "update_nutri_products" on public.nutri_products
  for update to authenticated
  using (true);
create policy "delete_nutri_products" on public.nutri_products
  for delete to authenticated
  using (true);

commit;
