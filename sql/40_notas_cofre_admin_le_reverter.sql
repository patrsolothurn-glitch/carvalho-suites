-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- Reverter de sql/40_notas_cofre_admin_le.sql (documentação; NÃO foi corrido pelo Claude Code).
-- Depois disto o admin volta a NÃO ler as entradas dos cofres dos outros (o painel "Cofres da família"
-- passa a mostrar 0 entradas).
drop policy "cofre: admin lê" on public.notas_cofre;
