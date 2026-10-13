-- Migração já aplicada. Os nomes e telefones reais dos professores foram
-- substituídos por placeholders — os valores reais vivem só na base de
-- dados (escolar_disciplinas), nunca neste ficheiro. NÃO voltar a correr
-- este INSERT (duplicaria as linhas, já que não há "on conflict").
insert into escolar_disciplinas (id, aluno, abr, nome, prof, tel, emoji, cor) values
(1, 'lucas', 'D', 'Deutsch', 'PROFESSOR(A)', 'TELEFONE', '📝', '#2563EB'),
(2, 'lucas', 'M', 'Mathematik', 'PROFESSOR(A)', '', '📐', '#DC2626'),
(3, 'lucas', 'F', 'Französisch', 'PROFESSOR(A)', 'TELEFONE', '🗼', '#9333EA'),
(4, 'lucas', 'Inf', 'Informatik', 'PROFESSOR(A)', '', '💻', '#0891B2'),
(5, 'lucas', 'E', 'Englisch', 'PROFESSOR(A)', '', '🌍', '#7C3AED'),
(6, 'lucas', 'Gs', 'Geschichte', 'PROFESSOR(A)', 'TELEFONE', '🏛', '#92400E'),
(7, 'lucas', 'Mu', 'Musik', 'PROFESSOR(A)', '', '🎵', '#DB2777'),
(8, 'lucas', 'Schw', 'Schwimmen', 'PROFESSOR(A)', '', '🏊', '#0EA5E9'),
(9, 'lucas', 'Gg', 'Geografie', 'PROFESSOR(A)', 'TELEFONE', '🗺', '#65A30D'),
(10, 'lucas', 'BG', 'Bildnerisches Gestalten', 'PROFESSOR(A)', '', '🎨', '#EA580C'),
(11, 'lucas', 'Ch', 'Chemie', 'PROFESSOR(A)', '', '⚗️', '#0891B2'),
(12, 'lucas', 'Rök', 'Religion ökumenisch', 'PROFESSOR(A)', '', '⛪', '#DB2777'),
(13, 'lucas', 'Tu', 'Turnen', 'PROFESSOR(A)', '', '⚽', '#16A34A'),
(14, 'lucas', 'Bio', 'Biologie', 'PROFESSOR(A)', '', '🌿', '#16A34A'),
(15, 'lucas', 'LT', 'Lerntechnik', 'PROFESSOR(A)', '', '🧠', '#F59E0B'),
(16, 'lucas', 'TT', 'Tastaturschreiben', 'PROFESSOR(A)', '', '⌨️', '#64748B'),
(17, 'lucas', 'Lat', 'Latein', 'PROFESSOR(A)', '', '🏺', '#7C3AED'),
(18, 'lucas', 'TG', 'Textiles und Technisches Gestalten', 'PROFESSOR(A)', '', '🧵', '#D97706');
