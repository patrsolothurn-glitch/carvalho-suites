-- Reverte 27_hwx_agenda.sql, pela ordem inversa. NÃO CORRIDO.
-- ATENÇÃO: apaga as tabelas hwx_trabalhos e hwx_series (e com elas todos os trabalhos e séries que tenham sido
-- criados) e as 3 colunas novas de hwx_config. Não toca em hauswart_data, hwx_clientes, hwx_locais, hwx_servicos
-- nem hwx_ofertas (só nos dados novos desta fase). Faz um backup (ou confirma o backup da noite) antes de correr.

begin;

drop trigger if exists hwx_trabalhos_numero_ins on public.hwx_trabalhos;
drop trigger if exists hwx_trabalhos_touch on public.hwx_trabalhos;
drop table if exists public.hwx_trabalhos;
drop function if exists public.hwx_trabalhos_numero();

drop trigger if exists hwx_series_del on public.hwx_series;
drop trigger if exists hwx_series_touch on public.hwx_series;
drop table if exists public.hwx_series;
drop function if exists public.hwx_series_antes_apagar();

alter table public.hwx_config
  drop column if exists ultimo_trab_ano,
  drop column if exists ultimo_trab_seq,
  drop column if exists horas_sexta;

commit;
