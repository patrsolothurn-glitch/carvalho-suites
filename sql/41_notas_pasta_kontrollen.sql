-- ===================== SQL para correr (AINDA NÃO CORRIDO) =====================
-- Nova caixa "Kontrollen" (pasta 'kontrollen') no cartão do Patricio da app Notas Carvalho
-- (src/23-app-notas.js). A coluna pasta (sql/38) tem um CHECK que só aceita 'privado' e 'geschaeft':
-- sem este SQL, criar ou mover uma nota para Kontrollen falha com erro de restrição (CHECK).
-- NÃO foi corrido pelo Claude Code. Quem corre é o utilizador, no SQL Editor do Supabase, por esta ordem:
--   1) o BLOCO 1 (só leitura) — confirma o nome real da restrição e que as políticas não dependem da pasta;
--   2) só se o resultado do bloco 1 bater certo, o BLOCO 2 (altera a estrutura).
-- Reverter: sql/41_notas_pasta_kontrollen_reverter.sql.
-- As políticas de RLS (sql/33 e sql/34) NÃO mudam: dependem só de dono e do perfil, nunca da pasta.

-- ---------------------- BLOCO 1 — SÓ LEITURA ----------------------
-- Esperado:
--   a) 1 linha: conname = notas_notas_pasta_check, com ... CHECK ((pasta = ANY (ARRAY['privado'::text, 'geschaeft'::text])))
--      (ou escrito de forma equivalente). Se o nome for outro, NÃO correr o bloco 2 sem avisar.
--   b) valores de pasta existentes: só 'privado' e/ou 'geschaeft'.
--   c) 0 linhas: nenhuma política de notas_notas menciona pasta.
select conname, pg_get_constraintdef(oid) as definicao
from pg_constraint
where conrelid = 'public.notas_notas'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%pasta%';

select pasta, count(*) as notas from public.notas_notas group by pasta order by pasta;

select policyname, cmd from pg_policies
where schemaname = 'public' and tablename = 'notas_notas'
  and (coalesce(qual, '') ilike '%pasta%' or coalesce(with_check, '') ilike '%pasta%');

-- ---------------------- BLOCO 2 — ALTERA A ESTRUTURA ----------------------
-- O que faz: troca a restrição da coluna pasta por uma igual que aceita também 'kontrollen'.
-- Tudo numa só transação: se alguma nota existente não cumprir a nova regra, falha e a restrição antiga fica como estava.
-- O que pode partir: nada do que existe (as notas atuais são todas 'privado' ou 'geschaeft', que continuam válidas).
--   A tabela fica bloqueada uns milissegundos enquanto se verifica. Nenhuma nota é alterada.
begin;
alter table public.notas_notas drop constraint notas_notas_pasta_check;
alter table public.notas_notas add constraint notas_notas_pasta_check check (pasta in ('privado','geschaeft','kontrollen'));
commit;

-- ---------------------- BLOCO 3 — SÓ LEITURA (verificação) ----------------------
-- Esperado: 1 linha, com 'kontrollen' dentro da definição.
select conname, pg_get_constraintdef(oid) as definicao
from pg_constraint
where conrelid = 'public.notas_notas'::regclass and conname = 'notas_notas_pasta_check';
