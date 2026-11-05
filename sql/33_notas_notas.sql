-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- Cópia de documentação da tabela da app Notas Carvalho (src/23-app-notas.js).
-- JÁ CORRIDA no Supabase pelo utilizador — NÃO correr outra vez e NÃO foi corrida
-- pelo Claude Code.
create table public.notas_notas (id uuid primary key default gen_random_uuid(), dono text not null check (dono in ('patricio','esposa','lucas','liam','familia')), titulo text not null, texto text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create index notas_notas_dono_idx on public.notas_notas (dono, created_at desc);
alter table public.notas_notas enable row level security;
create policy "notas: dono lê" on public.notas_notas for select to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and (p.is_admin or p.allowed_apps @> '"notas"'::jsonb) and (dono = 'familia' or dono = p.member_id)));
create policy "notas: admin lê filhos" on public.notas_notas for select to authenticated using (dono in ('lucas','liam') and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy "notas: dono cria" on public.notas_notas for insert to authenticated with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and (p.is_admin or p.allowed_apps @> '"notas"'::jsonb) and (dono = 'familia' or dono = p.member_id)));
create policy "notas: dono edita" on public.notas_notas for update to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and (p.is_admin or p.allowed_apps @> '"notas"'::jsonb) and (dono = 'familia' or dono = p.member_id))) with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and (p.is_admin or p.allowed_apps @> '"notas"'::jsonb) and (dono = 'familia' or dono = p.member_id)));
create policy "notas: dono apaga" on public.notas_notas for delete to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and (p.is_admin or p.allowed_apps @> '"notas"'::jsonb) and (dono = 'familia' or dono = p.member_id)));
