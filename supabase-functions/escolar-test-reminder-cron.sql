-- Agenda a Edge Function "escolar-test-reminder" para correr TODOS OS DIAS
-- de manhã — 06:00 UTC, que corresponde a 07:00 na Suíça no inverno (CET)
-- e 08:00 no verão (CEST). O pg_cron não segue fuso horário automaticamente;
-- se quiseres sempre exatamente as 07:00 locais, muda a hora à mão duas
-- vezes por ano (inverno/verão), ou ajusta para o valor que preferires.
-- Corre isto DEPOIS de fazeres o deploy manual da função:
--   supabase functions deploy escolar-test-reminder
-- Substitui SEU_PROJECT_REF e SUA_SERVICE_ROLE_KEY pelos valores reais do
-- teu projeto Supabase (Project Settings → API).

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove o agendamento antigo (semanal, só sexta) se existir, para não
-- ficarem os dois a correr ao mesmo tempo.
select cron.unschedule('escolar-lembrete-testes-sexta')
where exists (select 1 from cron.job where jobname = 'escolar-lembrete-testes-sexta');

select cron.schedule(
  'escolar-lembrete-diario',
  '0 6 * * *', -- todos os dias às 06:00 UTC (~07:00 CET / ~08:00 CEST)
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
-- select cron.unschedule('escolar-lembrete-diario');
