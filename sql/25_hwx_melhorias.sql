-- Hauswart Extra — melhorias da fase 1 (clientes com firma/locais/estado/número, serviços com estado/período,
-- categorias próprias, contadores automáticos).
-- NÃO CORRIDO. Rever antes de correr no SQL Editor. Reverter: 25_hwx_melhorias_reverter.sql
-- Pré-requisito: sql/24_hwx_base.sql já corrido (função hwx_touch e as 3 tabelas hwx_).
--
-- SÓ ACRESCENTA: nenhuma coluna nem tabela de dados é apagada. As colunas antigas
-- (hwx_clientes.telefone, plz_ort, ativo; hwx_servicos.ativo, minimo) ficam na tabela.
-- Os únicos "drop" são dos 2 check constraints de hwx_servicos que mudam (unidade e categoria).
--
-- COMPATÍVEL com a app publicada (build 375): tudo o que é novo tem default ou é preenchido por trigger,
-- por isso a app antiga continua a criar, editar e ler clientes e serviços sem erro:
--   · colunas novas: todas com default (ou anuláveis);
--   · hwx_clientes.numero: not null, mas o trigger preenche-o quando o insert não o traz (a app antiga não o envia);
--   · unidade: o check novo é um SUPERCONJUNTO do antigo (hora, 30min, peca, fixo + mes, trimestre, ano);
--   · categoria: sem check (a app antiga só envia as 4 categorias antigas, que continuam válidas);
--   · a app antiga ignora as colunas e a tabela nova (faz select *, e insert/update só com as suas colunas).
-- Limitação durante a janela entre correr este SQL e fundir o PR: o que a app antiga alterar em
-- telefone / plz_ort / ativo não aparece na app nova (que lê telemovel, telefone_fixo, plz, ort, estado).
--
-- Nomes dos check constraints que mudam: não consegui consultar a base daqui. Os nomes automáticos do
-- Postgres seriam hwx_servicos_unidade_check e hwx_servicos_categoria_check, mas o bloco abaixo NÃO depende
-- disso: procura o nome real em pg_constraint (pela coluna na definição) e usa-o explicitamente.
-- Para veres os nomes reais antes de correr:
--   select conname, pg_get_constraintdef(oid) from pg_constraint
--   where conrelid = 'public.hwx_servicos'::regclass and contype = 'c';

begin;

-- ══════════════ 1) hwx_config: categorias, contador, remetente ══════════════
alter table public.hwx_config
  add column if not exists categorias jsonb not null
    default '[{"id":"casa","nome":"Casa"},{"id":"compras","nome":"Compras"},{"id":"pc_telemovel","nome":"PC e telemóvel"},{"id":"outro","nome":"Outro"}]'::jsonb,
  add column if not exists ultimo_numero_cliente integer not null default 0;

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.hwx_config'::regclass and conname = 'hwx_config_categorias_array') then
    alter table public.hwx_config add constraint hwx_config_categorias_array check (jsonb_typeof(categorias) = 'array');
  end if;
end $$;

-- remetente: cria as chaves plz e ort a partir de plz_ort ("NNNN Localidade"); plz_ort fica
update public.hwx_config
set remetente = remetente || jsonb_build_object(
      'plz', substring(btrim(remetente->>'plz_ort') from '^(\d{4})'),
      'ort', btrim(substring(btrim(remetente->>'plz_ort') from '^\d{4}\s+(.*)$')))
where btrim(coalesce(remetente->>'plz_ort', '')) ~ '^\d{4}\s+\S'
  and not (remetente ? 'plz')
  and not (remetente ? 'ort');

-- ══════════════ 2) hwx_clientes: colunas novas + migração ══════════════
alter table public.hwx_clientes
  add column if not exists firma              text not null default '',
  add column if not exists contacto_nome      text not null default '',
  add column if not exists contacto_telemovel text not null default '',
  add column if not exists contacto_telefone  text not null default '',
  add column if not exists contacto_email     text not null default '',
  add column if not exists telemovel          text not null default '',
  add column if not exists telefone_fixo      text not null default '',
  add column if not exists plz                text not null default '',
  add column if not exists ort                text not null default '',
  add column if not exists estado             text not null default 'ativo'
    check (estado in ('ativo','fixo','pausado','contacto','arquivado')),
  add column if not exists pausado_ate        date,
  add column if not exists numero             integer,
  add column if not exists ultimo_sub_numero  integer not null default 0;

-- telefone → telemovel (começa por 07, +417 ou 00417, sem espaços) ou telefone_fixo
update public.hwx_clientes
set telemovel     = case when regexp_replace(telefone, '\s', '', 'g') ~ '^(07|\+417|00417)' then btrim(telefone) else '' end,
    telefone_fixo = case when regexp_replace(telefone, '\s', '', 'g') ~ '^(07|\+417|00417)' then '' else btrim(telefone) end
where btrim(telefone) <> '' and telemovel = '' and telefone_fixo = '';

-- plz_ort → plz + ort ("NNNN Localidade"); senão tudo para ort
update public.hwx_clientes
set plz = case when btrim(plz_ort) ~ '^\d{4}\s+\S' then substring(btrim(plz_ort) from '^(\d{4})') else '' end,
    ort = case when btrim(plz_ort) ~ '^\d{4}\s+\S' then btrim(substring(btrim(plz_ort) from '^\d{4}\s+(.*)$')) else btrim(plz_ort) end
where btrim(plz_ort) <> '' and plz = '' and ort = '';

-- ativo → estado
update public.hwx_clientes set estado = case when ativo then 'ativo' else 'arquivado' end;

-- numero: 1, 2, 3… por ordem de created_at (por utilizador)
update public.hwx_clientes c
set numero = n.rn
from (select id, row_number() over (partition by user_id order by created_at, id)::integer as rn
      from public.hwx_clientes) n
where c.id = n.id and c.numero is null;

alter table public.hwx_clientes alter column numero set not null;
alter table public.hwx_clientes add constraint hwx_clientes_numero_unico unique (user_id, numero);
alter table public.hwx_clientes add constraint hwx_clientes_numero_positivo check (numero > 0);

-- contador de números de cliente (hwx_config): uma linha por utilizador com clientes
insert into public.hwx_config (user_id)
select distinct user_id from public.hwx_clientes
on conflict (user_id) do nothing;

update public.hwx_config g
set ultimo_numero_cliente = greatest(g.ultimo_numero_cliente,
      coalesce((select max(c.numero) from public.hwx_clientes c where c.user_id = g.user_id), 0));

-- ══════════════ 3) Numeração automática de clientes (feita pela BASE) ══════════════
-- Sem security definer: a RLS deixa o admin escrever em hwx_config, e a função corre com os direitos de quem
-- grava o cliente (também só admin). Assim a função nunca ganha acesso que o utilizador não tenha.
-- O contador nunca desce: números de clientes apagados não voltam a ser usados.
create or replace function public.hwx_clientes_numero() returns trigger
language plpgsql set search_path = public, pg_temp as $$
declare v_ult integer;
begin
  if tg_op = 'UPDATE' and new.numero is not distinct from old.numero then
    return new;
  end if;
  insert into public.hwx_config (user_id) values (new.user_id) on conflict (user_id) do nothing;
  select ultimo_numero_cliente into v_ult from public.hwx_config where user_id = new.user_id for update;
  v_ult := coalesce(v_ult, 0);
  if new.numero is null then
    new.numero := v_ult + 1;
    update public.hwx_config set ultimo_numero_cliente = new.numero where user_id = new.user_id;
  elsif new.numero > v_ult then
    update public.hwx_config set ultimo_numero_cliente = new.numero where user_id = new.user_id;
  end if;
  return new;
end $$;

create trigger hwx_clientes_numero_ins before insert on public.hwx_clientes
  for each row execute function public.hwx_clientes_numero();
create trigger hwx_clientes_numero_upd before update of numero on public.hwx_clientes
  for each row execute function public.hwx_clientes_numero();

-- ══════════════ 4) hwx_locais (locais de trabalho de cada cliente) ══════════════
create table public.hwx_locais (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  cliente_id  uuid not null references public.hwx_clientes(id) on delete cascade,
  sub_numero  integer,
  nome        text not null default '',
  rua         text not null default '',
  plz         text not null default '',
  ort         text not null default '',
  zona        text not null default '',
  notas       text not null default '',
  ordem       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint hwx_locais_sub_numero_unico unique (cliente_id, sub_numero),
  constraint hwx_locais_sub_numero_positivo check (sub_numero > 0)
);
create index hwx_locais_cliente_ordem on public.hwx_locais (cliente_id, ordem);

-- sub_numero automático: contador do cliente (hwx_clientes.ultimo_sub_numero), que nunca desce
create or replace function public.hwx_locais_sub_numero() returns trigger
language plpgsql set search_path = public, pg_temp as $$
declare v_ult integer;
begin
  if tg_op = 'UPDATE' and new.sub_numero is not distinct from old.sub_numero then
    return new;
  end if;
  select ultimo_sub_numero into v_ult from public.hwx_clientes where id = new.cliente_id for update;
  if not found then
    raise exception 'hwx_locais: cliente % não existe', new.cliente_id using errcode = 'foreign_key_violation';
  end if;
  if new.sub_numero is null then
    new.sub_numero := v_ult + 1;
    update public.hwx_clientes set ultimo_sub_numero = new.sub_numero where id = new.cliente_id;
  elsif new.sub_numero > v_ult then
    update public.hwx_clientes set ultimo_sub_numero = new.sub_numero where id = new.cliente_id;
  end if;
  return new;
end $$;

create trigger hwx_locais_sub_numero_ins before insert on public.hwx_locais
  for each row execute function public.hwx_locais_sub_numero();
create trigger hwx_locais_sub_numero_upd before update of sub_numero on public.hwx_locais
  for each row execute function public.hwx_locais_sub_numero();
-- (sub_numero fica not null depois do trigger: o trigger preenche-o antes da verificação not null)
alter table public.hwx_locais alter column sub_numero set not null;

create trigger hwx_locais_touch before update on public.hwx_locais
  for each row execute function public.hwx_touch();

-- RLS exatamente igual às outras hwx_ (padrão de 23_wplan_pensum.sql)
alter table public.hwx_locais enable row level security;
revoke all on public.hwx_locais from public, anon;
grant select, insert, update, delete on public.hwx_locais to authenticated;
create policy hwx_locais_select on public.hwx_locais for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy hwx_locais_insert on public.hwx_locais for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy hwx_locais_update on public.hwx_locais for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
create policy hwx_locais_delete on public.hwx_locais for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));

-- ══════════════ 5) hwx_servicos: estado, período, horas incluídas, unidades, categorias livres ══════════════
alter table public.hwx_servicos
  add column if not exists estado          text not null default 'ativo'
    check (estado in ('ativo','pausado','sazonal','consulta','arquivado')),
  add column if not exists pausado_ate     date,
  add column if not exists meses           smallint[],
  add column if not exists horas_incluidas numeric(6,2);

-- check constraints que mudam: procura o nome real em pg_constraint (unidade e categoria) e remove-os
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.hwx_servicos'::regclass and contype = 'c'
      and (pg_get_constraintdef(oid) ~ '\munidade\M' or pg_get_constraintdef(oid) ~ '\mcategoria\M')
  loop
    execute format('alter table public.hwx_servicos drop constraint %I', r.conname);
  end loop;
end $$;

-- unidade: superconjunto do antigo ('fixo' passa a querer dizer "Fixo por vez"); categoria fica SEM check (livre)
alter table public.hwx_servicos add constraint hwx_servicos_unidade_check
  check (unidade in ('hora','30min','peca','fixo','mes','trimestre','ano'));
alter table public.hwx_servicos add constraint hwx_servicos_meses_check
  check (meses is null or meses <@ array[1,2,3,4,5,6,7,8,9,10,11,12]::smallint[]);
alter table public.hwx_servicos add constraint hwx_servicos_horas_incluidas_check
  check (horas_incluidas is null or horas_incluidas > 0);

-- ativo → estado
update public.hwx_servicos set estado = case when ativo then 'ativo' else 'arquivado' end;

-- fixo com mínimo → horas_incluidas (e mínimo a null). O "por mês" NÃO é adivinhado a partir da nota.
update public.hwx_servicos
set horas_incluidas = minimo, minimo = null
where unidade = 'fixo' and minimo is not null and horas_incluidas is null;

-- ══════════════ 6) Verificação (um só resultado: o SQL Editor só mostra o último select) ══════════════
select * from (
  select 1 as o, 'coluna nova'::text as tipo, (table_name || '.' || column_name)::text as item, data_type::text as detalhe
  from information_schema.columns
  where table_schema = 'public' and (
       (table_name = 'hwx_clientes' and column_name in ('firma','contacto_nome','contacto_telemovel','contacto_telefone','contacto_email','telemovel','telefone_fixo','plz','ort','estado','pausado_ate','numero','ultimo_sub_numero'))
    or (table_name = 'hwx_servicos' and column_name in ('estado','pausado_ate','meses','horas_incluidas'))
    or (table_name = 'hwx_config'   and column_name in ('categorias','ultimo_numero_cliente')))
  union all
  select 2, 'tabela hwx_locais', ('rls=' || c.relrowsecurity::text)::text,
         ((select count(*) from pg_policies pp where pp.schemaname = 'public' and pp.tablename = 'hwx_locais')::text || ' políticas (esperado 4)')::text
  from pg_class c where c.oid = 'public.hwx_locais'::regclass
  union all
  select 3, 'dados cliente', ('#' || numero || ' ' || nome)::text,
         ('plz=' || plz || ' ort=' || ort || ' telemovel=' || telemovel || ' fixo=' || telefone_fixo || ' estado=' || estado)::text
  from public.hwx_clientes
  union all
  select 4, 'dados serviço', nome::text,
         ('unidade=' || unidade || ' minimo=' || coalesce(minimo::text, 'null') || ' horas_incluidas=' || coalesce(horas_incluidas::text, 'null') || ' estado=' || estado)::text
  from public.hwx_servicos
  union all
  select 5, 'dados config', ('categorias=' || jsonb_array_length(categorias)::text || ' zonas=' || jsonb_array_length(zonas)::text)::text,
         ('ultimo_numero_cliente=' || ultimo_numero_cliente || ' remetente=' || remetente::text)::text
  from public.hwx_config
) v order by o, item;

commit;
