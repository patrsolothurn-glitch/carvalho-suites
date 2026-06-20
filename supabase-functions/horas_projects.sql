create table horas_projects (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  color text,
  created_at timestamptz default current_timestamp
);

alter table horas_projects enable row level security;

create policy "Allow all authenticated access"
  on horas_projects for all
  using (true)
  with check (true);

insert into horas_projects (name, description, color) values
  ('POP GREN04', 'Grenchen - Fibra otica', '#2563EB'),
  ('BUDI-2S', 'Buildi - 2a fase', '#D97706'),
  ('BUDI-1S', 'Buildi - 1a fase', '#D97706'),
  ('BUDI-S', 'Buildi', '#22A06B');
