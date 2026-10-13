-- Migração já aplicada. Os dados pessoais originais foram substituídos por
-- placeholders — os valores reais vivem só na base de dados (escolar_perfil),
-- nunca neste ficheiro. NÃO voltar a correr este INSERT.
insert into escolar_perfil (aluno, klasse, cidade, resp_nome, resp_sala, resp_tel, resp_email)
values ('lucas', 'SEK P', 'Grenchen', 'NOME DO(A) RESPONSÁVEL', 'SALA', 'TELEFONE', 'EMAIL');
