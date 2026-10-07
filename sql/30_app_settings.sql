-- ===================== SQL para correr (NÃO CORRIDO) =====================
-- Definições globais da suite (chave/valor). Hoje só guarda a chave 'kotd'
-- (Kompliment des Tages: {"enabled": true, "items": ["texto", ...]}).
-- Ler: qualquer utilizador autenticado (o popup tem de saber se está ligado).
-- Escrever: só admin (profiles.is_admin). Nada para anon. Nenhuma tabela existente é tocada.
-- SEM esta tabela a app continua a funcionar (defaults + cache local do aparelho);
-- só não partilha o interruptor/lista do admin entre aparelhos.
begin;

create table public.app_settings (
  key        text primary key check (length(btrim(key)) > 0),
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;
revoke all on public.app_settings from public, anon;
grant select, insert, update, delete on public.app_settings to authenticated;

create policy app_settings_select on public.app_settings for select to authenticated using (true);
create policy app_settings_insert on public.app_settings for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy app_settings_update on public.app_settings for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy app_settings_delete on public.app_settings for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));

-- Verificação (esperado: rowsecurity = true e 4 políticas)
select c.relname, c.relrowsecurity,
       (select count(*) from pg_policies pp where pp.schemaname = 'public' and pp.tablename = 'app_settings') as politicas
from pg_class c where c.oid = 'public.app_settings'::regclass;

commit;
