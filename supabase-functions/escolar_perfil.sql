create table if not exists escolar_perfil (
  aluno text primary key,
  klasse text,
  cidade text,
  resp_nome text,
  resp_sala text,
  resp_tel text,
  resp_email text
);

insert into escolar_perfil (aluno, klasse, cidade, resp_nome, resp_sala, resp_tel, resp_email)
values ('lucas', 'SEK P', 'Grenchen', 'Petra Humair', '3-01', '079 763 71 86', 'petra.humair@schulen-grenchen.ch')
on conflict (aluno) do update set
  resp_nome = excluded.resp_nome,
  resp_sala = excluded.resp_sala,
  resp_tel = excluded.resp_tel,
  resp_email = excluded.resp_email;
