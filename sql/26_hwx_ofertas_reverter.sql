-- Reverte 26_hwx_ofertas.sql, pela ordem inversa. NÃO CORRIDO.
-- ATENÇÃO: apaga a tabela hwx_ofertas (e com ela todas as ofertas guardadas) e as 3 colunas novas de hwx_config.
-- Faz backup antes se já houver ofertas. Não toca em hauswart_data nem em clientes, locais ou serviços.

begin;

drop trigger if exists hwx_ofertas_numero_ins on public.hwx_ofertas;
drop trigger if exists hwx_ofertas_touch on public.hwx_ofertas;
drop table if exists public.hwx_ofertas;
drop function if exists public.hwx_ofertas_numero();

alter table public.hwx_config
  drop column if exists preco_base_hora,
  drop column if exists ultimo_oferta_ano,
  drop column if exists ultimo_oferta_seq;

commit;
