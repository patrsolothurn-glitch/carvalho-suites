-- Reverte 23_wplan_pensum.sql. NÃO CORRIDO. Apaga a tabela (e com ela políticas e trigger).
-- wplan_leute.std_tag / arbeitstage nunca foram alterados por esta mudança.
-- Depois de reverter: tirar wplan_pensum da lista TABLES de .github/workflows/backup.yml.
begin;
drop table public.wplan_pensum;
drop function public.wplan_pensum_touch();
commit;
