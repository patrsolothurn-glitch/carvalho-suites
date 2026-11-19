# SQL-KONTROLLEN-DRIVE — links do Drive nos controlos (Notas Carvalho, caixa Kontrollen)

Nada disto foi corrido. Quem corre é o Patricio, no SQL Editor do Supabase.

**O que faz:** acrescenta uma coluna opcional `drive_url` (só o LINK, nunca a foto) às duas tabelas da caixa Kontrollen:
- `notas_kontroll_registos.drive_url`: foto da vez no Drive.
- `notas_kontroll_tipos.drive_url`: pasta do controlo no Drive.

**Não altera dados:** só colunas novas, vazias (`null`), com `add column if not exists`. Não toca em `notas_notas` nem noutras tabelas. As políticas RLS (só-dono) e os privilégios são da tabela, por isso cobrem as colunas novas sem mudar nada. O backup lê `select=*`, por isso leva as colunas novas sozinho.

## O que foi verificado

- As duas tabelas existem (`sql/42_notas_kontrollen.sql`, já corrido) e a app só as lê com `select('*')`.
- A app **funciona antes** de este SQL correr: só mostra os campos de link e só envia `drive_url` quando a coluna existe (vê-se pelas linhas já lidas). Sem a coluna, a lista de controlos e as vezes ficam como estão.
- O CHECK da coluna (`https://` e até 500 caracteres) é igual ao da app; aceita `null`.

## O que não foi possível confirmar

- Que as colunas ainda não existem na base: o bloco 1 responde a isso.

---

## Bloco 1 — só leitura (correr primeiro)

Esperado: 0 linhas. Se devolver linhas, a coluna já existe numa das tabelas: não correr o bloco 2 sem ver primeiro o que há.

SQL para correr
```sql
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and table_name in ('notas_kontroll_tipos', 'notas_kontroll_registos')
  and column_name = 'drive_url';
```

## Bloco 2 — acrescentar as colunas (ALTERA a estrutura; esperar pela confirmação)

O que faz: duas colunas novas, opcionais, sem valor nas linhas que já existem.
O que pode partir: nada do que existe. A tabela fica bloqueada uns milissegundos.

SQL para correr
```sql
begin;

alter table public.notas_kontroll_registos
  add column if not exists drive_url text
  check (drive_url is null or (drive_url ~ '^https://' and length(drive_url) <= 500));

alter table public.notas_kontroll_tipos
  add column if not exists drive_url text
  check (drive_url is null or (drive_url ~ '^https://' and length(drive_url) <= 500));

commit;
```

## Bloco 3 — só leitura, verificação

Esperado: 0 linhas (as duas colunas existem).

SQL para correr
```sql
select t.nome as tabela_sem_coluna
from (values ('notas_kontroll_tipos'), ('notas_kontroll_registos')) as t(nome)
where not exists (
  select 1 from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = t.nome and c.column_name = 'drive_url'
);
```

---

## REVERTER (à parte)

Apaga as duas colunas e **todos os links guardados nelas** (as fotos no Drive não são tocadas). Não afeta controlos, vezes nem nenhuma outra tabela. A app volta a esconder os campos de link sozinha.

SQL para correr
```sql
-- reverter 2
begin;
alter table public.notas_kontroll_registos drop column if exists drive_url;
alter table public.notas_kontroll_tipos drop column if exists drive_url;
commit;
```
