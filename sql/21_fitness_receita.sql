-- ══════════════════════════════════════════════════════════════════
-- Carvalho Fitness — vista "Receita" das opções (foto, medida g/ml,
-- nota do item). Correr à mão, depois de sql/20_fitness.sql. Ficheiro
-- re-executável — todos os "add column" usam "if not exists" e o
-- constraint da medida só é adicionado se ainda não existir.
-- ══════════════════════════════════════════════════════════════════

-- Medida do alimento: 'g' (gramas) ou 'ml' (mililitros) — kcal e
-- macros continuam sempre por 100 g/100 ml, só muda a etiqueta na app.
alter table fitness_alimentos add column if not exists medida text not null default 'g';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fitness_alimentos_medida_check'
  ) then
    alter table fitness_alimentos
      add constraint fitness_alimentos_medida_check check (medida in ('g', 'ml'));
  end if;
end $$;

-- Nota livre por item da opção (ex. "ou 150 g de fruta").
alter table fitness_opcao_itens add column if not exists nota text;

-- Caminho da foto da opção no bucket privado "fitness-fotos"
-- (<user_id>/opcoes/<opcao_id>.jpg) — nunca base64 na base de dados;
-- a política de Storage já existente (dono lê/envia/atualiza/apaga
-- por (storage.foldername(name))[1] = auth.uid()::text) já cobre esta
-- subpasta, não precisa de política nova.
alter table fitness_opcoes add column if not exists foto_path text;
