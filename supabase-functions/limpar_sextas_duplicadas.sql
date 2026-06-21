delete from horas_entries
where dl_tipo = 'sexta'
and id not in (
  select min(id) from horas_entries
  where dl_tipo = 'sexta'
  group by data
);
