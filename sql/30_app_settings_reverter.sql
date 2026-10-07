-- Reverte 30_app_settings.sql. NÃO CORRIDO. Apaga a tabela (e com ela as políticas).
-- A app volta aos valores por defeito / cache local sem nenhum erro.
begin;
drop table public.app_settings;
commit;
