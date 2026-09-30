-- Wochenplan: Pensum por pessoa e mês, com histórico (wplan_pensum).
-- NÃO CORRIDO. Verificar antes de correr no SQL Editor do Supabase. Reverter: 23_wplan_pensum_reverter.sql
-- Provado na base: wplan_leute.id é bigint; pers_nr é text.
-- Só admin (profiles.is_admin) lê e escreve; nada para anon. As outras tabelas wplan_* não são tocadas.
-- A política depende de profiles.is_admin não poder ser alterado por não-admin (trigger de protecção).

begin;

create table public.wplan_pensum (
  id             bigint generated always as identity primary key,
  leute_id       bigint not null references public.wplan_leute(id) on delete cascade,
  gueltig_ab     date   not null,
  -- 100 % = vollzeit_h horas/semana; guardado em cada linha para que mudar o valor nunca recalcule o passado
  vollzeit_h     numeric(5,2) not null default 43 check (vollzeit_h > 0 and vollzeit_h <= 60),
  pensum_prozent numeric(5,2) not null check (pensum_prozent > 0 and pensum_prozent <= 100),
  -- Mo..So, 0/1 (mesmo formato que wplan_leute.arbeitstage no código)
  arbeitstage    smallint[] not null,
  zuschlag_min   integer not null default 0 check (zuschlag_min >= 0 and zuschlag_min <= 240),
  kategorie      text check (kategorie is null or kategorie in ('Monteur', 'Leitender Monteur', 'Gruppenchef', 'Chefmonteur')),
  "position"     text not null default '',
  created_by     uuid default auth.uid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint wplan_pensum_monat     check (gueltig_ab = date_trunc('month', gueltig_ab::timestamp)::date),
  constraint wplan_pensum_tage      check (array_length(arbeitstage, 1) = 7
                                           and arbeitstage <@ array[0, 1]::smallint[]
                                           and 1 = any(arbeitstage)),
  constraint wplan_pensum_eindeutig unique (leute_id, gueltig_ab)
);

create function public.wplan_pensum_touch() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin new.updated_at = now(); return new; end $$;
create trigger wplan_pensum_touch before update on public.wplan_pensum
  for each row execute function public.wplan_pensum_touch();

-- RLS: só authenticated e só admin; nada para anon/public
alter table public.wplan_pensum enable row level security;
revoke all on public.wplan_pensum from public, anon;
grant select, insert, update, delete on public.wplan_pensum to authenticated;

create policy wplan_pensum_select on public.wplan_pensum for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy wplan_pensum_insert on public.wplan_pensum for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy wplan_pensum_update on public.wplan_pensum for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy wplan_pensum_delete on public.wplan_pensum for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));

-- Valores iniciais (ab 2026-09). Kategorie fica NULL até o admin a escolher no ecrã "Pensum".
-- Aborta se as duas pessoas não forem exatamente as provadas (id + pers_nr).
do $$
declare n int;
begin
  insert into public.wplan_pensum (leute_id, gueltig_ab, vollzeit_h, pensum_prozent, arbeitstage, zuschlag_min)
  select v.id, date '2026-09-01', 43, v.pct, v.tage, v.zus
  from (values (1::bigint, 70::numeric,  '{1,1,1,1,0,0,0}'::smallint[], 15, '895'),
               (4::bigint, 100::numeric, '{1,1,1,1,1,0,0}'::smallint[], 0,  '1449')) as v(id, pct, tage, zus, pnr)
  join public.wplan_leute l on l.id = v.id and l.pers_nr = v.pnr;
  get diagnostics n = row_count;
  if n <> 2 then raise exception 'Esperava 2 pessoas (id 1 / 895 e id 4 / 1449), inseri %', n; end if;
end $$;

-- Verificação (esperado: Patricio 7.775 h/Tag e 31.10 h/Woche; Roger 8.600 h/Tag e 43.00 h/Woche)
select l.name, p.gueltig_ab, p.pensum_prozent, p.zuschlag_min,
       round((p.vollzeit_h * 60 * p.pensum_prozent / 100
              / (select count(*) from unnest(p.arbeitstage) x where x = 1) + p.zuschlag_min) / 60, 3) as soll_tag_h,
       round((p.vollzeit_h * 60 * p.pensum_prozent / 100
              / (select count(*) from unnest(p.arbeitstage) x where x = 1) + p.zuschlag_min) / 60
             * (select count(*) from unnest(p.arbeitstage) x where x = 1), 2) as soll_woche_h
from public.wplan_pensum p join public.wplan_leute l on l.id = p.leute_id order by l.id;

commit;
