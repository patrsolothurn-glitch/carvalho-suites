-- ══════════════════════════════════════════════════════════════════
-- Carvalho Fitness — seed (correr DEPOIS de sql/20_fitness.sql)
--
-- user_id resolvido pelo email de login confirmado pelo Patricio:
-- patr.carvalho@hotmail.com (profiles.email — profiles.id é o mesmo
-- uuid que auth.users.id/auth.uid(), como no resto da suite). Se o
-- email não existir em profiles, o bloco pára com um erro claro em
-- vez de inserir dados sem dono.
--
-- Sexo, data de nascimento, altura, atividade, objetivo e ritmo NÃO
-- vêm no seed (não foram dados no pedido) — ficam por preencher em
-- Mais → Perfil; como usar_coach=true, a app já funciona com a meta
-- do coach (1811 kcal) enquanto isso não for preenchido.
--
-- Valores nutricionais dos ~40 alimentos são aproximados (USDA
-- FoodData Central / tabelas genéricas de composição por 100 g) —
-- editáveis depois em Mais → Alimentos.
--
-- Sem histórico de avaliações — o Patricio manda os dados antigos
-- depois, num SQL à parte. Só a próxima avaliação (2026-09-25,
-- intervalo 14 dias) é semeada aqui, no perfil.
-- ══════════════════════════════════════════════════════════════════

do $$
declare
  v_user_id uuid;
  v_ref1 uuid; v_ref2 uuid; v_ref3 uuid; v_ref4 uuid;
  v_treino1 uuid;
begin
  select id into v_user_id from profiles where email = 'patr.carvalho@hotmail.com';
  if v_user_id is null then
    raise exception 'Não encontrei profiles.email = patr.carvalho@hotmail.com — confirma o email antes de correr este seed.';
  end if;

  if exists (select 1 from fitness_refeicoes where user_id = v_user_id)
     or exists (select 1 from fitness_alimentos where user_id = v_user_id)
     or exists (select 1 from fitness_treinos where user_id = v_user_id) then
    raise exception 'Seed já corrido (ou a app já foi usada) — não corro para não duplicar.';
  end if;

  -- ── Perfil ──────────────────────────────────────────────────────
  insert into fitness_perfil (user_id, kcal_coach, usar_coach, agua_l, n_refeicoes, prox_avaliacao, intervalo_avaliacao_dias)
  values (v_user_id, 1811, true, 3, 4, '2026-09-25', 14)
  on conflict (user_id) do update set
    kcal_coach = excluded.kcal_coach,
    usar_coach = excluded.usar_coach,
    agua_l = excluded.agua_l,
    n_refeicoes = excluded.n_refeicoes,
    prox_avaliacao = excluded.prox_avaliacao,
    intervalo_avaliacao_dias = excluded.intervalo_avaliacao_dias;

  -- ── Refeições (soma dos pct = 100.00) ───────────────────────────
  insert into fitness_refeicoes (user_id, ordem, nome, pct) values (v_user_id, 1, '1.ª refeição', 22.69) returning id into v_ref1;
  insert into fitness_refeicoes (user_id, ordem, nome, pct) values (v_user_id, 2, '2.ª refeição', 27.33) returning id into v_ref2;
  insert into fitness_refeicoes (user_id, ordem, nome, pct) values (v_user_id, 3, '3.ª refeição', 19.77) returning id into v_ref3;
  insert into fitness_refeicoes (user_id, ordem, nome, pct) values (v_user_id, 4, '4.ª refeição', 30.21) returning id into v_ref4;

  -- ── Opções (só com nome — o Patricio preenche os itens na app) ──
  insert into fitness_opcoes (user_id, refeicao_id, ordem, nome) values
    (v_user_id, v_ref1, 1, 'Mousse com bolacha e banana'),
    (v_user_id, v_ref1, 2, 'Pão de forma com manteiga'),
    (v_user_id, v_ref2, 1, 'Carnes brancas'),
    (v_user_id, v_ref2, 2, 'Ovo com pão'),
    (v_user_id, v_ref3, 1, 'Pão com presunto'),
    (v_user_id, v_ref3, 2, 'Barra com iogurte'),
    (v_user_id, v_ref4, 1, 'Carnes brancas com hidratos'),
    (v_user_id, v_ref4, 2, 'Tosta mista + proteico + fruta');

  -- ── ~40 alimentos comuns, valores por 100 g ─────────────────────
  insert into fitness_alimentos (user_id, nome, categoria, kcal_100, prot_100, hc_100, gord_100, unidade_nome, g_unidade) values
    (v_user_id, 'Arroz cozido', 'hidratos', 130, 2.7, 28, 0.3, null, null),
    (v_user_id, 'Massa cozida', 'hidratos', 131, 5, 25, 1.1, null, null),
    (v_user_id, 'Batata cozida', 'hidratos', 87, 1.9, 20, 0.1, null, null),
    (v_user_id, 'Batata-doce cozida', 'hidratos', 90, 2, 21, 0.1, null, null),
    (v_user_id, 'Pão (mistura)', 'hidratos', 265, 9, 49, 3.2, null, null),
    (v_user_id, 'Pão de forma', 'hidratos', 250, 9, 45, 3.5, 'fatia', 25),
    (v_user_id, 'Aveia (flocos)', 'hidratos', 389, 17, 66, 7, null, null),
    (v_user_id, 'Feijão cozido', 'hidratos', 127, 8.7, 23, 0.5, null, null),
    (v_user_id, 'Grão-de-bico cozido', 'hidratos', 164, 8.9, 27, 2.6, null, null),
    (v_user_id, 'Lentilhas cozidas', 'hidratos', 116, 9, 20, 0.4, null, null),
    (v_user_id, 'Quinoa cozida', 'hidratos', 120, 4.4, 21, 1.9, null, null),
    (v_user_id, 'Frango peito grelhado', 'proteina', 165, 31, 0, 3.6, null, null),
    (v_user_id, 'Peru peito', 'proteina', 135, 30, 0, 1, null, null),
    (v_user_id, 'Vaca magra grelhada', 'proteina', 187, 26, 0, 8, null, null),
    (v_user_id, 'Salmão grelhado', 'proteina', 208, 20, 0, 13, null, null),
    (v_user_id, 'Atum em água (escorrido)', 'proteina', 116, 26, 0, 1, null, null),
    (v_user_id, 'Ovo', 'proteina', 155, 13, 1.1, 11, 'ovo', 50),
    (v_user_id, 'Fiambre de peru', 'proteina', 103, 18, 2, 2, null, null),
    (v_user_id, 'Presunto', 'proteina', 145, 25, 0.5, 5, null, null),
    (v_user_id, 'Whey protein (pó)', 'proteina', 380, 75, 8, 5, 'colher (30 g)', 30),
    (v_user_id, 'Camarão cozido', 'proteina', 99, 24, 0.2, 0.3, null, null),
    (v_user_id, 'Iogurte natural', 'lacticinios', 61, 3.5, 4.7, 3.3, null, null),
    (v_user_id, 'Iogurte proteico', 'lacticinios', 57, 10, 3.6, 0.2, null, null),
    (v_user_id, 'Queijo fresco magro', 'lacticinios', 98, 11, 3.4, 4.3, null, null),
    (v_user_id, 'Leite meio-gordo', 'lacticinios', 47, 3.3, 4.8, 1.6, null, null),
    (v_user_id, 'Banana', 'fruta', 89, 1.1, 23, 0.3, 'banana média', 120),
    (v_user_id, 'Maçã', 'fruta', 52, 0.3, 14, 0.2, 'maçã média', 180),
    (v_user_id, 'Azeite', 'gorduras', 884, 0, 0, 100, 'colher de sopa', 10),
    (v_user_id, 'Manteiga', 'gorduras', 717, 0.9, 0.1, 81, null, null),
    (v_user_id, 'Amêndoas', 'gorduras', 579, 21, 22, 50, null, null),
    (v_user_id, 'Amendoim', 'gorduras', 567, 26, 16, 49, null, null),
    (v_user_id, 'Manteiga de amendoim', 'gorduras', 588, 25, 20, 50, null, null),
    (v_user_id, 'Pizza margherita', 'refeicao', 266, 11, 33, 10, null, null),
    (v_user_id, 'Tosta mista (pão+fiambre+queijo)', 'refeicao', 250, 13, 28, 9, 'tosta', 120),
    (v_user_id, 'Legumes salteados (mix)', 'legumes', 35, 2, 6, 0.5, null, null),
    (v_user_id, 'Brócolos cozidos', 'legumes', 35, 2.4, 7, 0.4, null, null),
    (v_user_id, 'Chocolate preto 70%', 'extras', 598, 7.8, 46, 43, null, null),
    (v_user_id, 'Bolacha maria', 'extras', 430, 7, 75, 11, 'bolacha', 6),
    (v_user_id, 'Barra proteica', 'extras', 350, 30, 30, 10, 'barra', 40),
    (v_user_id, 'Mousse de chocolate', 'extras', 150, 3, 20, 7, null, null);

  -- ── Treino "Dia 1 — Fullbody" ────────────────────────────────────
  insert into fitness_treinos (user_id, nome, ordem, duracao_min, voltas, descanso_s, notas)
  values (v_user_id, 'Dia 1 — Fullbody', 1, 30, 3, 60,
    '1–2 séries de aquecimento antes; séries próximo da falha com boa técnica; unilaterais sem descanso entre lados.')
  returning id into v_treino1;

  insert into fitness_exercicios (user_id, treino_id, ordem, nome, series, reps) values
    (v_user_id, v_treino1, 1, 'Press militar em pé', 4, '12-15'),
    (v_user_id, v_treino1, 2, 'Supino elástico', 3, '12-15'),
    (v_user_id, v_treino1, 3, 'Remada serrote', 3, '15-20'),
    (v_user_id, v_treino1, 4, 'Agachamento cadeira', 3, '15-20');
end $$;

-- Para verificar depois:
-- select nome, pct from fitness_refeicoes where user_id = (select id from profiles where email = 'patr.carvalho@hotmail.com') order by ordem;
-- select count(*) from fitness_alimentos where user_id = (select id from profiles where email = 'patr.carvalho@hotmail.com');
