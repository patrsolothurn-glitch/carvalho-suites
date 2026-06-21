create table agenda_monteurs (
  id bigint generated always as identity primary key,
  name text not null,
  emoji text,
  tel text,
  notif boolean default true,
  cor text,
  created_at timestamptz default current_timestamp
);

alter table agenda_monteurs enable row level security;

create policy "Allow all authenticated access"
  on agenda_monteurs for all
  using (true)
  with check (true);

insert into agenda_monteurs (name, emoji, tel, notif, cor) values
  ('Patricio', '👨‍🔧', '', true, '#D97706'),
  ('David', '👷', '', true, '#2563EB');
