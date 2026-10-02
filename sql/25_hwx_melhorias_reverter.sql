-- Reverte 25_hwx_melhorias.sql, pela ordem inversa. NÃO CORRIDO.
-- ATENÇÃO: apaga o que a migração acrescentou (tabela hwx_locais e as colunas novas) e, com isso, os dados
-- que só existem nelas. Antes de apagar, copia de volta para as colunas ANTIGAS o que a app antiga precisa de ver.
-- Não toca em hauswart_data, nem nas colunas de 24_hwx_base.sql, nem nas linhas de dados (só nas colunas).

begin;

-- ══════════════ 5) hwx_servicos ══════════════
-- devolver à app antiga o que ela entende
update public.hwx_servicos set ativo = (estado <> 'arquivado');
update public.hwx_servicos set minimo = horas_incluidas where minimo is null and horas_incluidas is not null;
update public.hwx_servicos set unidade = 'fixo' where unidade in ('mes','trimestre','ano');
update public.hwx_servicos set categoria = 'outro' where categoria not in ('casa','compras','pc_telemovel','outro');

alter table public.hwx_servicos drop constraint if exists hwx_servicos_unidade_check;
alter table public.hwx_servicos drop constraint if exists hwx_servicos_meses_check;
alter table public.hwx_servicos drop constraint if exists hwx_servicos_horas_incluidas_check;
alter table public.hwx_servicos add constraint hwx_servicos_unidade_check
  check (unidade in ('hora','fixo','peca','30min'));
alter table public.hwx_servicos add constraint hwx_servicos_categoria_check
  check (categoria in ('casa','compras','pc_telemovel','outro'));
alter table public.hwx_servicos
  drop column if exists estado,
  drop column if exists pausado_ate,
  drop column if exists meses,
  drop column if exists horas_incluidas;

-- ══════════════ 4) hwx_locais ══════════════
drop table if exists public.hwx_locais;
drop function if exists public.hwx_locais_sub_numero();

-- ══════════════ 3) numeração automática ══════════════
drop trigger if exists hwx_clientes_numero_ins on public.hwx_clientes;
drop trigger if exists hwx_clientes_numero_upd on public.hwx_clientes;
drop function if exists public.hwx_clientes_numero();

-- ══════════════ 2) hwx_clientes ══════════════
update public.hwx_clientes set ativo = (estado <> 'arquivado');
update public.hwx_clientes
set telefone = coalesce(nullif(telemovel, ''), nullif(telefone_fixo, ''), telefone)
where telefone = '' and (telemovel <> '' or telefone_fixo <> '');
update public.hwx_clientes
set plz_ort = btrim(plz || ' ' || ort)
where plz_ort = '' and (plz <> '' or ort <> '');

alter table public.hwx_clientes drop constraint if exists hwx_clientes_numero_unico;
alter table public.hwx_clientes drop constraint if exists hwx_clientes_numero_positivo;
alter table public.hwx_clientes
  drop column if exists firma,
  drop column if exists contacto_nome,
  drop column if exists contacto_telemovel,
  drop column if exists contacto_telefone,
  drop column if exists contacto_email,
  drop column if exists telemovel,
  drop column if exists telefone_fixo,
  drop column if exists plz,
  drop column if exists ort,
  drop column if exists estado,
  drop column if exists pausado_ate,
  drop column if exists numero,
  drop column if exists ultimo_sub_numero;

-- ══════════════ 1) hwx_config ══════════════
-- as chaves plz e ort do remetente (jsonb) saem; plz_ort nunca foi apagado
update public.hwx_config set remetente = remetente - 'plz' - 'ort';
alter table public.hwx_config drop constraint if exists hwx_config_categorias_array;
alter table public.hwx_config
  drop column if exists categorias,
  drop column if exists ultimo_numero_cliente;

commit;
