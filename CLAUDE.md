# Regras permanentes — Carvalho Suite

Aplicam-se em todas as sessões e para todas as apps desta suite.

1. SQL: o utilizador é que corre SEMPRE o SQL no Supabase. Nunca correr SQL, nem por API, nem por CLI, nem por chave de serviço. Só dar o SQL ao utilizador e esperar pelo resultado.
2. Todo o SQL dado ao utilizador leva "SQL para correr" escrito em cima do bloco. Sem essa etiqueta não é para correr nada.
3. Antes de dar SQL, verificar no código e nos ficheiros em sql/ que as tabelas e colunas existem e que o SQL não estraga nada. Mostrar o que foi verificado. Se não for possível confirmar uma coluna, dizê-lo.
4. SQL de leitura é só SELECT. Qualquer SQL que altere dados ou estrutura vem com o reverter correspondente e a explicação do que pode partir, e espera a confirmação explícita do utilizador antes de ser dado como pronto a correr. Nunca o aplicar por conta própria.
5. Mesmo que o utilizador cole um resultado de SQL, não o executar de novo na base de dados.
6. Uma app por conversa. Trabalhar só no ficheiro src/NN-app-*.js da app em questão. Não tocar em ficheiros partilhados (build.js, deploy.js, 02-theme.js, 10-shell.js, head.html, workflows, sw.js, manifest.json) sem avisar e esperar confirmação.
7. Testar a lógica antes de enviar para o GitHub. Um PR por passo, nunca merge, nunca com o Guarda PR vermelho.
8. Sempre que se cria algo, implementar também editar e apagar.
9. O repo é PÚBLICO: nunca pôr dados pessoais, IBAN, moradas, chaves ou segredos em código, comentários, mensagens de commit ou descrições de PR.
10. Nunca pôr passwords no repositório — nem reais, nem de exemplo, nem em seeds, testes, comentários, mensagens de commit ou descrições de PR. Se um campo de password for preciso, usar um marcador (por exemplo "PASSWORD") e nunca um valor com ar de verdadeiro.
11. Os ficheiros sql/ são cópias de documentação do SQL já corrido; sql/39 e sql/40 são descritivos (não o SQL executado) e não trazem as policies reais. O estado real da base de dados confirma-se com consultas de catálogo corridas pelo utilizador (ver README, "O que a pasta sql/ NÃO cobre").
12. O registo público está desligado: contas novas só pela função manage-member (admin). As permissões por conta vivem na base de dados (profiles.allowed_apps), não em src/03-data.js (legado).
