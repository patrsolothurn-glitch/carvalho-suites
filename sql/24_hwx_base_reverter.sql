-- Reverte 24_hwx_base.sql: apaga SÓ hwx_clientes, hwx_servicos, hwx_config e a função hwx_touch.
-- NÃO CORRIDO. Apaga também os dados dessas tabelas — fazer backup antes se já houver dados.
-- Não toca em hauswart_data nem em nenhuma outra tabela.

begin;

drop table if exists public.hwx_clientes;
drop table if exists public.hwx_servicos;
drop table if exists public.hwx_config;
drop function if exists public.hwx_touch();

commit;
