-- Migração já aplicada. Os dados pessoais originais foram substituídos por
-- placeholders — os valores reais vivem só na base de dados (escolar_perfil),
-- nunca neste ficheiro. NÃO voltar a correr este INSERT/UPSERT: o "on
-- conflict do update" sobrescreveria a linha real com os placeholders.
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
values ('lucas', 'SEK P', 'Grenchen', 'NOME DO(A) RESPONSÁVEL', 'SALA', 'TELEFONE', 'EMAIL')
on conflict (aluno) do update set
  resp_nome = excluded.resp_nome,
  resp_sala = excluded.resp_sala,
  resp_tel = excluded.resp_tel,
  resp_email = excluded.resp_email;
