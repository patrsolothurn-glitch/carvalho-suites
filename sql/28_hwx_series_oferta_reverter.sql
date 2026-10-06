-- Reverte 28_hwx_series_oferta.sql. NÃO CORRIDO.
-- ATENÇÃO: apaga as colunas novas (e o que nelas estiver: linhas das séries, ligação à oferta e a marca "incluído na
-- Pauschale"). Não toca em hauswart_data nem nas outras colunas. Faz um backup (ou confirma o backup da noite) antes de correr.

begin;

drop index if exists public.hwx_series_oferta;
alter table public.hwx_series
  drop column if exists linhas,
  drop column if exists oferta_id,
  drop column if exists incluido_pauschale;
alter table public.hwx_trabalhos
  drop column if exists incluido_pauschale;

commit;
