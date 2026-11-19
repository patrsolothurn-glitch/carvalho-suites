# SQL-SAUDE — Carvalho Saúde (papéis clínicos e Zeugnis)

**Nada disto foi corrido.** Quem corre é o Patricio, no SQL Editor do Supabase, por esta ordem: bloco 1 (só leitura) → bloco 2 → bloco 3 → bloco 4 (verificação). O bloco 5 é opcional e só serve a Fase 2.

**Não toca em nenhuma tabela existente** (nem em `notas_*`, `fitness_*`, `profiles`…). Só cria nomes novos: as tabelas `saude_pessoas`, `saude_casos`, `saude_docs`, `saude_zeugnis` (e `saude_ia_uso` no bloco 5), o bucket de Storage `saude-docs` e as políticas deles.

## O que foi verificado

- O padrão (RLS por comando, `revoke` do anon, bucket privado com políticas por pasta, `createSignedUrl`) é o de `sql/20_fitness.sql`, `sql/27_hwx_agenda.sql` e `sql/42_notas_kontrollen.sql`.
- A função de admin da suite é `public.is_admin_user()` (usada em `sql/31_policies_admin.sql`). **Não inventei outra.** A definição dela não está em `sql/`; o bloco 1 confirma que existe e quem a pode executar.
- **Sem RPCs e sem `security definer`:** a app escreve direto, com RLS. Por isso não há `search_path` a fixar.
- Os documentos pertencem à pessoa; a pessoa pertence a um utilizador (`dono` = `profiles.id`). O acesso é só do dono, e o admin acede a tudo (`is_admin_user()`). `anon` não tem nenhum privilégio; só `authenticated`.
- O backup do GitHub (`backup.yml`, lista `TABLES`) **não** inclui estas tabelas e nunca inclui o Storage. Não alterei o workflow.

## O que não foi possível confirmar

- A definição real de `public.is_admin_user()` (só se vê na base): o bloco 1 mostra-a.
- Se a tua versão do Storage aceita `file_size_limit` e `allowed_mime_types` no `insert` do bucket (o bloco 3 está numa transação: se não aceitar, falha sem deixar nada a meio).

---

## Bloco 1 — só leitura (correr primeiro)

Esperado: a) 0 linhas; b) 1 linha com `authenticated_executa = true`; c) 0 linhas; d) 1 linha (a coluna `is_admin` existe em `profiles`).

SQL para correr
```sql
-- a) as tabelas ainda não existem
select table_name from information_schema.tables
where table_schema = 'public' and table_name in ('saude_pessoas', 'saude_casos', 'saude_docs', 'saude_zeugnis', 'saude_ia_uso');

-- b) a função de admin da suite existe e o authenticated pode executá-la
select p.proname, p.prosecdef as security_definer, p.proconfig as config,
       has_function_privilege('authenticated', 'public.is_admin_user()', 'execute') as authenticated_executa,
       has_function_privilege('anon', 'public.is_admin_user()', 'execute') as anon_executa
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'is_admin_user';

-- c) o bucket ainda não existe
select id from storage.buckets where id = 'saude-docs';

-- d) profiles tem is_admin
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_admin';
```

## Bloco 2 — tabelas e RLS (ALTERA a estrutura; esperar pela confirmação)

O que faz: cria 4 tabelas novas e vazias, índices, RLS e 4 políticas por tabela, e tira todos os privilégios ao `anon`.
O que pode partir: nada do que existe (só nomes novos). Tudo numa transação: se algo falhar, não fica nada a meio.

SQL para correr
```sql
begin;

create table public.saude_pessoas (
  id uuid primary key default gen_random_uuid(),
  dono uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  nome text not null check (length(btrim(nome)) between 1 and 100),
  notas text not null default '' check (length(notas) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saude_casos (
  id uuid primary key default gen_random_uuid(),
  pessoa uuid not null references public.saude_pessoas(id) on delete cascade,
  nome text not null check (length(btrim(nome)) between 1 and 100),
  cor text not null default '#E11D48' check (cor ~ '^#[0-9A-Fa-f]{6}$'),
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saude_docs (
  id uuid primary key default gen_random_uuid(),
  caso uuid not null references public.saude_casos(id) on delete cascade,
  titulo text not null check (length(btrim(titulo)) between 1 and 150),
  data_doc date not null,
  tipo text not null check (tipo in ('exame', 'relatorio', 'receita', 'zeugnis', 'outro')),
  ficheiro_path text not null check (length(ficheiro_path) between 3 and 400),
  drive_backup_url text check (drive_backup_url is null or (drive_backup_url ~ '^https://(drive|docs)\.google\.com/' and length(drive_backup_url) <= 500)),
  notas text not null default '' check (length(notas) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saude_zeugnis (
  id uuid primary key default gen_random_uuid(),
  pessoa uuid not null references public.saude_pessoas(id) on delete cascade,
  doc uuid references public.saude_docs(id) on delete set null,
  de date not null,
  ate date not null,
  percentagem integer not null check (percentagem between 0 and 100),
  medico text not null default '' check (length(medico) <= 150),
  estado text not null default 'por_enviar' check (estado in ('por_enviar', 'enviado')),
  enviado_em date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ate >= de),
  check ((estado = 'enviado') = (enviado_em is not null))
);

create index saude_pessoas_dono_idx on public.saude_pessoas (dono);
create index saude_casos_pessoa_idx on public.saude_casos (pessoa, ordem);
create index saude_docs_caso_idx on public.saude_docs (caso, data_doc desc);
create index saude_zeugnis_pessoa_idx on public.saude_zeugnis (pessoa, de desc);
create index saude_zeugnis_doc_idx on public.saude_zeugnis (doc);

alter table public.saude_pessoas enable row level security;
alter table public.saude_casos enable row level security;
alter table public.saude_docs enable row level security;
alter table public.saude_zeugnis enable row level security;

revoke all on public.saude_pessoas from anon, public;
revoke all on public.saude_casos from anon, public;
revoke all on public.saude_docs from anon, public;
revoke all on public.saude_zeugnis from anon, public;
grant select, insert, update, delete on public.saude_pessoas to authenticated;
grant select, insert, update, delete on public.saude_casos to authenticated;
grant select, insert, update, delete on public.saude_docs to authenticated;
grant select, insert, update, delete on public.saude_zeugnis to authenticated;

-- pessoas: só o dono; o admin acede a tudo
create policy "saude_pessoas: ler" on public.saude_pessoas for select to authenticated
  using (dono = (select auth.uid()) or public.is_admin_user());
create policy "saude_pessoas: criar" on public.saude_pessoas for insert to authenticated
  with check (dono = (select auth.uid()) or public.is_admin_user());
create policy "saude_pessoas: editar" on public.saude_pessoas for update to authenticated
  using (dono = (select auth.uid()) or public.is_admin_user())
  with check (dono = (select auth.uid()) or public.is_admin_user());
create policy "saude_pessoas: apagar" on public.saude_pessoas for delete to authenticated
  using (dono = (select auth.uid()) or public.is_admin_user());

-- casos: pela pessoa
create policy "saude_casos: ler" on public.saude_casos for select to authenticated
  using (exists (select 1 from public.saude_pessoas p where p.id = saude_casos.pessoa and (p.dono = (select auth.uid()) or public.is_admin_user())));
create policy "saude_casos: criar" on public.saude_casos for insert to authenticated
  with check (exists (select 1 from public.saude_pessoas p where p.id = saude_casos.pessoa and (p.dono = (select auth.uid()) or public.is_admin_user())));
create policy "saude_casos: editar" on public.saude_casos for update to authenticated
  using (exists (select 1 from public.saude_pessoas p where p.id = saude_casos.pessoa and (p.dono = (select auth.uid()) or public.is_admin_user())))
  with check (exists (select 1 from public.saude_pessoas p where p.id = saude_casos.pessoa and (p.dono = (select auth.uid()) or public.is_admin_user())));
create policy "saude_casos: apagar" on public.saude_casos for delete to authenticated
  using (exists (select 1 from public.saude_pessoas p where p.id = saude_casos.pessoa and (p.dono = (select auth.uid()) or public.is_admin_user())));

-- documentos: pelo caso e pela pessoa
create policy "saude_docs: ler" on public.saude_docs for select to authenticated
  using (exists (select 1 from public.saude_casos c join public.saude_pessoas p on p.id = c.pessoa
                 where c.id = saude_docs.caso and (p.dono = (select auth.uid()) or public.is_admin_user())));
create policy "saude_docs: criar" on public.saude_docs for insert to authenticated
  with check (exists (select 1 from public.saude_casos c join public.saude_pessoas p on p.id = c.pessoa
                      where c.id = saude_docs.caso and (p.dono = (select auth.uid()) or public.is_admin_user())));
create policy "saude_docs: editar" on public.saude_docs for update to authenticated
  using (exists (select 1 from public.saude_casos c join public.saude_pessoas p on p.id = c.pessoa
                 where c.id = saude_docs.caso and (p.dono = (select auth.uid()) or public.is_admin_user())))
  with check (exists (select 1 from public.saude_casos c join public.saude_pessoas p on p.id = c.pessoa
                      where c.id = saude_docs.caso and (p.dono = (select auth.uid()) or public.is_admin_user())));
create policy "saude_docs: apagar" on public.saude_docs for delete to authenticated
  using (exists (select 1 from public.saude_casos c join public.saude_pessoas p on p.id = c.pessoa
                 where c.id = saude_docs.caso and (p.dono = (select auth.uid()) or public.is_admin_user())));

-- zeugnis: pela pessoa; o documento (se houver) tem de ser da mesma pessoa
create policy "saude_zeugnis: ler" on public.saude_zeugnis for select to authenticated
  using (exists (select 1 from public.saude_pessoas p where p.id = saude_zeugnis.pessoa and (p.dono = (select auth.uid()) or public.is_admin_user())));
create policy "saude_zeugnis: criar" on public.saude_zeugnis for insert to authenticated
  with check (exists (select 1 from public.saude_pessoas p where p.id = saude_zeugnis.pessoa and (p.dono = (select auth.uid()) or public.is_admin_user()))
    and (saude_zeugnis.doc is null or exists (select 1 from public.saude_docs d join public.saude_casos c on c.id = d.caso
                                              where d.id = saude_zeugnis.doc and c.pessoa = saude_zeugnis.pessoa)));
create policy "saude_zeugnis: editar" on public.saude_zeugnis for update to authenticated
  using (exists (select 1 from public.saude_pessoas p where p.id = saude_zeugnis.pessoa and (p.dono = (select auth.uid()) or public.is_admin_user())))
  with check (exists (select 1 from public.saude_pessoas p where p.id = saude_zeugnis.pessoa and (p.dono = (select auth.uid()) or public.is_admin_user()))
    and (saude_zeugnis.doc is null or exists (select 1 from public.saude_docs d join public.saude_casos c on c.id = d.caso
                                              where d.id = saude_zeugnis.doc and c.pessoa = saude_zeugnis.pessoa)));
create policy "saude_zeugnis: apagar" on public.saude_zeugnis for delete to authenticated
  using (exists (select 1 from public.saude_pessoas p where p.id = saude_zeugnis.pessoa and (p.dono = (select auth.uid()) or public.is_admin_user())));

commit;
```

## Bloco 3 — bucket privado e políticas de Storage (ALTERA; esperar pela confirmação)

O que faz: cria o bucket **privado** `saude-docs` (limite de 15 MB por ficheiro; só PDF e imagens JPEG, PNG, WebP, HEIC/HEIF) e 4 políticas em `storage.objects`: só se vê/envia/atualiza/apaga na pasta com o teu id (`<id>/...`), e o admin em todas. Sem acesso público: os ficheiros só se abrem por URL assinado de curta duração.
O que pode partir: nada do que existe (nome novo, políticas com nomes novos).

SQL para correr
```sql
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('saude-docs', 'saude-docs', false, 15728640,
        array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do nothing;

create policy "saude-docs: ler" on storage.objects for select to authenticated
  using (bucket_id = 'saude-docs' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin_user()));
create policy "saude-docs: enviar" on storage.objects for insert to authenticated
  with check (bucket_id = 'saude-docs' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin_user()));
create policy "saude-docs: atualizar" on storage.objects for update to authenticated
  using (bucket_id = 'saude-docs' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin_user()))
  with check (bucket_id = 'saude-docs' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin_user()));
create policy "saude-docs: apagar" on storage.objects for delete to authenticated
  using (bucket_id = 'saude-docs' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin_user()));

commit;
```

## Bloco 4 — só leitura, verificação (cada consulta tem de devolver 0 linhas)

SQL para correr
```sql
-- 4a) tabela em falta ou sem RLS (0 linhas = está certo)
select t.n as problema
from (values ('saude_pessoas'), ('saude_casos'), ('saude_docs'), ('saude_zeugnis')) as t(n)
where not exists (select 1 from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
                  where ns.nspname = 'public' and c.relname = t.n and c.relrowsecurity);

-- 4b) tabela que não tem exatamente 4 políticas (0 linhas = está certo)
select t.n as problema
from (values ('saude_pessoas'), ('saude_casos'), ('saude_docs'), ('saude_zeugnis')) as t(n)
where (select count(*) from pg_policies pp where pp.schemaname = 'public' and pp.tablename = t.n) <> 4;

-- 4c) anon com qualquer privilégio nas tabelas, ou authenticated sem algum dos 4 (0 linhas = está certo)
select t.n as problema
from (values ('saude_pessoas'), ('saude_casos'), ('saude_docs'), ('saude_zeugnis')) as t(n)
where has_table_privilege('anon', 'public.' || t.n, 'select,insert,update,delete,truncate,references,trigger')
   or not has_table_privilege('authenticated', 'public.' || t.n, 'select')
   or not has_table_privilege('authenticated', 'public.' || t.n, 'insert')
   or not has_table_privilege('authenticated', 'public.' || t.n, 'update')
   or not has_table_privilege('authenticated', 'public.' || t.n, 'delete');

-- 4d) privilégios vistos pelo information_schema para anon/PUBLIC (0 linhas = está certo)
select table_name, grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('saude_pessoas', 'saude_casos', 'saude_docs', 'saude_zeugnis')
  and grantee in ('anon', 'PUBLIC');

-- 4e) bucket: tem de existir, ser privado e ter o limite de 15 MB (0 linhas = está certo)
select 'bucket em falta, público ou sem limite' as problema
where not exists (select 1 from storage.buckets b where b.id = 'saude-docs' and b.public = false and b.file_size_limit = 15728640);

-- 4f) políticas de Storage: tem de haver exatamente 4 (0 linhas = está certo)
select 'políticas de storage diferentes de 4' as problema
where (select count(*) from pg_policies pp where pp.schemaname = 'storage' and pp.tablename = 'objects' and pp.policyname like 'saude-docs:%') <> 4;
```

## Bloco 5 — OPCIONAL, só para a Fase 2 (tabela do limite diário da leitura por IA)

A Fase 2 (função `saude-ler`) **não está ativa**. Este bloco só é preciso se um dia fizeres o deploy dela e quiseres o limite diário (como a `fitness_ia_uso`). Sem ele, a função funciona sem limite.

SQL para correr
```sql
begin;
create table public.saude_ia_uso (
  user_id uuid not null references public.profiles(id) on delete cascade,
  dia date not null,
  chamadas integer not null default 0 check (chamadas >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, dia)
);
alter table public.saude_ia_uso enable row level security;
revoke all on public.saude_ia_uso from anon, public;
grant select on public.saude_ia_uso to authenticated;
create policy "saude_ia_uso: dono lê" on public.saude_ia_uso for select to authenticated using (user_id = (select auth.uid()));
commit;
```

Verificação do bloco 5 (0 linhas = está certo):

SQL para correr
```sql
select 'saude_ia_uso em falta ou sem RLS' as problema
where not exists (select 1 from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
                  where ns.nspname = 'public' and c.relname = 'saude_ia_uso' and c.relrowsecurity);
```

---

## REVERTER (à parte)

**Apaga tudo o que a app guardou** (pessoas, casos, documentos e Zeugnis) e o bucket. Antes de apagar o bucket, **esvazia-o no painel do Supabase** (Storage → saude-docs → selecionar tudo → apagar): apagar o bucket só por SQL deixaria os ficheiros órfãos no armazenamento. Não afeta nenhuma outra tabela nem app.

SQL para correr
```sql
-- reverter 3 (storage): depois de esvaziar o bucket no painel
begin;
drop policy if exists "saude-docs: ler" on storage.objects;
drop policy if exists "saude-docs: enviar" on storage.objects;
drop policy if exists "saude-docs: atualizar" on storage.objects;
drop policy if exists "saude-docs: apagar" on storage.objects;
delete from storage.buckets where id = 'saude-docs';
commit;

-- reverter 2 (tabelas; as políticas e os índices vão com elas)
begin;
drop table if exists public.saude_zeugnis;
drop table if exists public.saude_docs;
drop table if exists public.saude_casos;
drop table if exists public.saude_pessoas;
commit;

-- reverter 5 (só se correste o bloco 5)
drop table if exists public.saude_ia_uso;
```
