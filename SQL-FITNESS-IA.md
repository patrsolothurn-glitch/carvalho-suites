# SQL-FITNESS-IA — limite diário das estimativas por IA (Carvalho Fitness)

Nada disto foi corrido. Quem corre é o Patricio, no SQL Editor do Supabase.

**É opcional.** A função `fitness-prato` funciona sem esta tabela; só não tem limite diário. Com a tabela, cada utilizador tem 30 estimativas por dia.

## O que foi verificado

- A função `supabase-functions/fitness-prato.ts` lê e escreve só a tabela `fitness_ia_uso`, colunas `user_id`, `dia`, `chamadas`, com a chave de serviço (não passa pelas policies).
- A app (`src/20-app-fitness.js`) nunca lê nem escreve esta tabela.
- `user_id` aponta para `profiles(id)`, como todas as tabelas `fitness_*` em `sql/20_fitness.sql`.
- O nome `fitness_ia_uso` não aparece em nenhum ficheiro de `sql/` nem do código: não choca com nada versionado.

## O que não foi possível confirmar

- Se já existe na base uma tabela com este nome (a pasta `sql/` é só documentação). O bloco 1 responde a isso.

---

## Bloco 1 — só leitura (correr primeiro)

Esperado: 0 linhas. Se devolver uma linha, a tabela já existe: não correr o bloco 2 sem ver primeiro o que ela tem.

SQL para correr
```sql
select table_schema, table_name
from information_schema.tables
where table_schema = 'public' and table_name = 'fitness_ia_uso';
```

## Bloco 2 — criar a tabela do contador (ALTERA a estrutura; esperar pela confirmação)

O que faz: cria uma tabela nova e vazia. Não toca em nenhuma tabela existente.
O que pode partir: nada do que existe. Se a tabela já existir, o `create table if not exists` não a altera.

SQL para correr
```sql
create table if not exists public.fitness_ia_uso (
  user_id uuid not null references public.profiles(id) on delete cascade,
  dia date not null,
  chamadas integer not null default 0 check (chamadas >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, dia)
);

alter table public.fitness_ia_uso enable row level security;

-- Só a função (chave de serviço) escreve. Cada utilizador pode ver o seu próprio contador.
revoke all on public.fitness_ia_uso from anon, authenticated;
grant select on public.fitness_ia_uso to authenticated;

drop policy if exists "fitness_ia_uso: dono lê" on public.fitness_ia_uso;
create policy "fitness_ia_uso: dono lê" on public.fitness_ia_uso
  for select to authenticated using (user_id = auth.uid());
```

## Bloco 3 — só leitura, verificação

As duas consultas têm de devolver 0 linhas se correu bem.

SQL para correr
```sql
-- 3a) a tabela tem de existir com RLS ligada (0 linhas = está certo)
select 'tabela em falta ou sem RLS' as problema
where not exists (
  select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'fitness_ia_uso' and c.relrowsecurity
);
```

SQL para correr
```sql
-- 3b) anon não pode nada; authenticated só pode ler (0 linhas = está certo)
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'fitness_ia_uso'
  and ((grantee = 'anon') or (grantee = 'authenticated' and privilege_type <> 'SELECT'));
```

## Bloco 4 — só leitura, para ver o uso (quando quiseres)

SQL para correr
```sql
select dia, chamadas, updated_at
from public.fitness_ia_uso
order by dia desc
limit 14;
```

---

## REVERTER (à parte)

Apaga a tabela e os contadores. A função continua a funcionar, sem limite diário. Não afeta registos de comida nem nenhuma outra tabela.

SQL para correr
```sql
-- reverter 2
drop table if exists public.fitness_ia_uso;
```

## Limpeza opcional (não é obrigatória)

O contador guarda uma linha por utilizador e por dia. Para apagar as linhas com mais de 90 dias:

SQL para correr
```sql
delete from public.fitness_ia_uso where dia < current_date - 90;
```
