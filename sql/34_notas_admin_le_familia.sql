-- ===================== SQL para correr (JÁ CORRIDO) =====================
-- Cópia de documentação: o admin passa a ler também as notas da 'esposa' (só leitura).
-- JÁ CORRIDO no Supabase pelo utilizador — NÃO correr outra vez e NÃO foi corrido
-- pelo Claude Code. Substitui a política "notas: admin lê filhos" (sql/33).
-- As políticas de criar/editar/apagar NÃO mudam: o admin continua sem poder escrever
-- em nada que não seja dele ou da 'familia'.
drop policy "notas: admin lê filhos" on public.notas_notas;
create policy "notas: admin lê família" on public.notas_notas for select to authenticated using (dono in ('lucas','liam','esposa') and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
