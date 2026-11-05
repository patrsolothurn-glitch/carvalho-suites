-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- DOCUMENTAÇÃO. Reverte 34_notas_admin_le_familia.sql. NÃO CORRIDO pelo Claude Code.
-- AVISO: o admin deixa de ler as notas da 'esposa' (volta a ler só as do lucas e do liam);
-- a app Notas Carvalho continua a mostrar o cartão da Cristina ao admin, mas vazio.
drop policy "notas: admin lê família" on public.notas_notas;
create policy "notas: admin lê filhos" on public.notas_notas for select to authenticated using (dono in ('lucas','liam') and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
