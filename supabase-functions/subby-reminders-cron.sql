-- Agenda a Edge Function "subby-reminders" para correr todos os dias às 08:00 (hora do servidor, geralmente UTC).
-- Corre isto DEPOIS de fazeres o deploy manual da função (supabase functions deploy subby-reminders).
-- Substitui SEU_PROJECT_REF e SUA_SERVICE_ROLE_KEY pelos valores reais do teu projeto Supabase
-- (Project Settings → API).

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'subby-lembretes-diarios',
  '0 8 * * *', -- todos os dias às 08:00 UTC (ajusta se quiseres outra hora)
  $$
  select net.http_post(
    url := 'https://SEU_PROJECT_REF.supabase.co/functions/v1/subby-reminders',
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
-- select cron.unschedule('subby-lembretes-diarios');
