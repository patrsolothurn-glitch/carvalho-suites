create table horas_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text,
  created_at timestamptz default now()
);

alter table horas_projects enable row level security;

create policy "Authenticated users can manage horas_projects"
  on horas_projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

insert into horas_projects (name, description, color) values
  ('POP GREN04', 'Grenchen - Fibra otica', '#2563EB'),
  ('BUDI-2S', 'Buildi - 2a fase', '#D97706'),
  ('BUDI-1S', 'Buildi - 1a fase', '#D97706'),
  ('BUDI-S', 'Buildi', '#22A06B');
