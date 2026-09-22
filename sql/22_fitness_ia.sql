-- ══════════════════════════════════════════════════════════════════
-- Carvalho Fitness — "Adicionar prato por nome" com IA. Correr à mão,
-- depois de sql/20_fitness.sql e sql/21_fitness_receita.sql.
-- Ficheiro re-executável.
-- ══════════════════════════════════════════════════════════════════

-- Texto "Como se faz" de uma opção (também usado por opções criadas à
-- mão, não só pelas da IA).
alter table fitness_opcoes add column if not exists preparo text;

-- Cria numa só transação: a opção (com "preparo") + os itens + os
-- alimentos que ainda não existam para este utilizador (por nome,
-- lower(trim())). SECURITY INVOKER — corre com os privilégios de quem
-- chama, a RLS de fitness_opcoes/fitness_opcao_itens/fitness_alimentos
-- continua toda a valer; só confirmamos aqui, explicitamente, que a
-- refeição indicada é do próprio (para dar um erro claro em vez de
-- deixar a RLS do insert falhar a meio da transação). Se alguma
-- validação falhar a meio, a exceção faz rollback a tudo — nunca fica
-- uma opção criada sem itens, ou itens a apontar para um alimento que
-- não chegou a existir.
create or replace function fitness_criar_opcao_ia(p jsonb)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_refeicao_id uuid;
  v_nome text;
  v_preparo text;
  v_ingredientes jsonb;
  v_ing jsonb;
  v_n_ingredientes int;
  v_ordem int;
  v_opcao_id uuid;
  v_alimento_id uuid;
  v_nome_norm text;
  v_gramas numeric;
  v_kcal100 numeric;
  v_prot100 numeric;
  v_hc100 numeric;
  v_gord100 numeric;
  v_medida text;
  v_g_unidade numeric;
begin
  if v_user_id is null then
    raise exception 'Não autenticado.';
  end if;

  v_refeicao_id := (p->>'refeicao_id')::uuid;
  v_nome := nullif(trim(p->>'nome'), '');
  v_preparo := nullif(trim(p->>'preparo'), '');
  v_ingredientes := coalesce(p->'ingredientes', '[]'::jsonb);

  if v_refeicao_id is null then
    raise exception 'refeicao_id em falta.';
  end if;
  if v_nome is null then
    raise exception 'Nome da opção em falta.';
  end if;
  if jsonb_typeof(v_ingredientes) <> 'array' then
    raise exception 'ingredientes tem de ser uma lista.';
  end if;
  v_n_ingredientes := jsonb_array_length(v_ingredientes);
  if v_n_ingredientes < 1 then
    raise exception 'A receita tem de ter pelo menos um ingrediente.';
  end if;
  if v_n_ingredientes > 12 then
    raise exception 'No máximo 12 ingredientes.';
  end if;

  -- Confirma que a refeição é do próprio antes de inserir (a RLS já
  -- protege o insert a seguir, isto só dá um erro mais claro).
  if not exists (select 1 from fitness_refeicoes where id = v_refeicao_id and user_id = v_user_id) then
    raise exception 'Refeição não encontrada.';
  end if;

  select coalesce(max(ordem), 0) + 1 into v_ordem from fitness_opcoes where refeicao_id = v_refeicao_id;

  insert into fitness_opcoes (user_id, refeicao_id, ordem, nome, preparo)
  values (v_user_id, v_refeicao_id, v_ordem, v_nome, v_preparo)
  returning id into v_opcao_id;
  -- (o trigger fitness_opcoes_max_5 continua a proteger o máximo de 6
  -- opções por refeição, incluindo para este caminho)

  for v_ing in select * from jsonb_array_elements(v_ingredientes)
  loop
    v_nome_norm := lower(trim(coalesce(v_ing->>'nome', '')));
    if v_nome_norm = '' then
      raise exception 'Ingrediente sem nome.';
    end if;

    v_gramas := (v_ing->>'gramas')::numeric;
    if v_gramas is null or v_gramas <= 0 or v_gramas > 1000 then
      raise exception 'Quantidade inválida em "%": tem de ser entre 0 e 1000.', v_ing->>'nome';
    end if;

    v_medida := coalesce(v_ing->>'medida', 'g');
    if v_medida not in ('g', 'ml') then
      raise exception 'Medida inválida em "%": só "g" ou "ml".', v_ing->>'nome';
    end if;

    v_kcal100 := (v_ing->>'kcal_100')::numeric;
    if v_kcal100 is null or v_kcal100 < 0 or v_kcal100 > 900 then
      raise exception 'kcal/100 inválido em "%": tem de ser entre 0 e 900.', v_ing->>'nome';
    end if;
    v_prot100 := coalesce((v_ing->>'prot_100')::numeric, 0);
    v_hc100 := coalesce((v_ing->>'hc_100')::numeric, 0);
    v_gord100 := coalesce((v_ing->>'gord_100')::numeric, 0);
    if v_prot100 < 0 or v_hc100 < 0 or v_gord100 < 0 then
      raise exception 'Macros inválidos em "%": não podem ser negativos.', v_ing->>'nome';
    end if;
    v_g_unidade := case when nullif(v_ing->>'g_unidade', '') is not null then (v_ing->>'g_unidade')::numeric else null end;

    select id into v_alimento_id from fitness_alimentos
      where user_id = v_user_id and lower(trim(nome)) = v_nome_norm
      limit 1;

    if v_alimento_id is null then
      insert into fitness_alimentos (user_id, nome, medida, kcal_100, prot_100, hc_100, gord_100, unidade_nome, g_unidade)
      values (v_user_id, trim(v_ing->>'nome'), v_medida, v_kcal100, v_prot100, v_hc100, v_gord100,
              nullif(trim(v_ing->>'unidade_nome'), ''), v_g_unidade)
      returning id into v_alimento_id;
    end if;

    insert into fitness_opcao_itens (user_id, opcao_id, alimento_id, gramas_base, ajustavel, nota)
    values (v_user_id, v_opcao_id, v_alimento_id, v_gramas,
            coalesce((v_ing->>'ajustavel')::boolean, true),
            nullif(trim(v_ing->>'nota'), ''));
  end loop;

  return v_opcao_id;
end;
$$;

revoke all on function fitness_criar_opcao_ia(jsonb) from public;
grant execute on function fitness_criar_opcao_ia(jsonb) to authenticated;
