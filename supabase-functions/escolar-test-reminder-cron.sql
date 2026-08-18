-- Agenda a Edge Function "escolar-test-reminder" para correr todas as
-- sextas-feiras às 19:00 UTC (≈ 20:00 na Suíça no inverno, 21:00 no verão).
-- Corre isto DEPOIS de fazeres o deploy manual da função:
--   supabase functions deploy escolar-test-reminder
-- Substitui SEU_PROJECT_REF e SUA_SERVICE_ROLE_KEY pelos valores reais do
-- teu projeto Supabase (Project Settings → API).

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'escolar-lembrete-testes-sexta',
  '0 19 * * 5', -- todas as sextas-feiras às 19:00 UTC (ajusta a hora se quiseres)
  $$
  select net.http_post(
    url := 'https://SEU_PROJECT_REF.supabase.co/functions/v1/escolar-test-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer SUA_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Para verificar jobs agendados:
-- select * from cron.job;

-- Para remover, se precisares:
-- select cron.unschedule('escolar-lembrete-testes-sexta');
