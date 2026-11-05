-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- Cópia de documentação da tabela da app Notas Carvalho (src/23-app-notas.js).
-- JÁ CORRIDA no Supabase pelo utilizador — NÃO correr outra vez e NÃO foi corrida
-- pelo Claude Code. Esta cópia foi escrita a partir da descrição da tabela dada
-- pelo utilizador; pode não ser idêntica, linha a linha, ao que está na base.
begin;

create table public.notas_notas (
  id         uuid primary key default gen_random_uuid(),
  dono       text not null check (dono in ('patricio','esposa','lucas','liam','familia')),
  titulo     text not null,
  texto      text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz            -- null = nota ativa; preenchido = no Lixo
);

alter table public.notas_notas enable row level security;

-- RLS (já feita na base; as policies exatas NÃO estão copiadas aqui). Intenção:
--  * cada dono lê/cria/edita/apaga as suas notas e as de 'familia' (quem tem a app);
--  * o admin lê também as do 'lucas' e do 'liam', SÓ leitura;
--  * as notas da 'esposa' o admin NÃO vê.

commit;
