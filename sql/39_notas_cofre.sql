-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- Cópia de documentação (escrita a partir da descrição, não é o ficheiro corrido): cofre de passwords
-- da app Notas Carvalho (src/23-app-notas.js). JÁ CORRIDO no Supabase pelo utilizador — NÃO correr outra
-- vez e NÃO foi corrido pelo Claude Code. Estas tabelas NÃO estão (nem devem entrar) em backup.yml.
--
-- notas_cofre: entradas do cofre. RLS SÓ-DONO: select/insert/update/delete apenas quando
--   profiles.member_id = dono E o perfil tem 'notas' em allowed_apps. O admin NÃO lê as entradas dos outros.
-- notas_cofre_pin: código de 4 dígitos de cada pessoa, só como salt + hash (PBKDF2-SHA256, hex).
--   O dono lê o seu registo; o ADMIN (profiles.is_admin) tem todas as operações em qualquer dono
--   (política "cofrepin: admin gere", for all).
-- O código é um cadeado de ecrã, NÃO encriptação: as passwords ficam em claro em notas_cofre.
create table public.notas_cofre (
  id uuid primary key default gen_random_uuid(),
  dono text not null check (dono in ('patricio','esposa','lucas','liam')),
  titulo text not null,
  utilizador text default '',
  segredo text default '',
  nota text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table public.notas_cofre_pin (
  dono text primary key check (dono in ('patricio','esposa','lucas','liam')),
  salt text,
  hash text,
  updated_at timestamptz default now()
);
alter table public.notas_cofre enable row level security;
alter table public.notas_cofre_pin enable row level security;
-- (as políticas de RLS foram criadas pelo utilizador, como descrito acima; não se repetem aqui)
