insert into escolar_disciplinas (id, aluno, abr, nome, prof, tel, emoji, cor) values
(19, 'lucas', 'W+T', 'Wissenschaft und Technik', 'Greder', '', '🔬', '#0D9488');

update escolar_horario set disc_id = 19, sala = '2-02'
where aluno = 'lucas' and dia in (2, 4) and disc_id = 17;

delete from escolar_disciplinas where aluno = 'lucas' and id = 17;
