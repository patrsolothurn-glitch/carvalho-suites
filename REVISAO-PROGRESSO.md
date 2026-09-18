# Revisão de segurança/infraestrutura — Progresso

Registo do que já foi feito e do que falta na revisão do `carvalho-suites`.
MODO CUIDADO em todas as partes: um PR por parte, nunca merge automático.

## P1 — Repo público: dados a vazar

**Contexto**: `carvalho-suites` é um repositório público. A pasta `backups/`
(38 tabelas do Supabase, exportadas diariamente pelo `backup.yml`) estava
acessível a qualquer pessoa, e o `deploy.yml` publicava a raiz do repo
inteira no GitHub Pages — incluindo `backups/` e o código-fonte.

### P1a — Concluído — 2026-09-17 — [PR #5](https://github.com/patrsolothurn-glitch/carvalho-suites/pull/5)

Só infraestrutura, nenhuma app tocada.

- `backup.yml`: agendamento (`schedule`, 03:00 UTC diário) comentado — só
  corre por `workflow_dispatch` até à P1b.
- `deploy.yml`: publica só uma pasta `_site` com os ficheiros do site
  (`index.html`, `sw.js`, `manifest.json`, `icon-192.png`, `icon-512.png`,
  `lucas.html`), em vez da raiz do repo inteira.
- `backups/` removida do repositório (534 ficheiros) e acrescentada ao
  `.gitignore`.
- **Não limpa o histórico do git** — os commits antigos com `backups/`
  continuam acessíveis a quem clonar o repo. Isso é o P1b.
- Instruções de `git filter-repo` para o P1b escritas na descrição do PR #5.

### P1b — Pendente (à espera do Patricio ao PC)

- Mover o backup do Supabase para um repositório privado novo.
- Limpar `backups/` de todo o histórico do repo público com `git filter-repo`
  (comandos já documentados no PR #5).
- Decidir o que fazer às branches antigas que ainda têm o histórico completo
  (apagar as que não interessa preservar antes de reescrever).
- Depois do `push --force` no filter-repo: qualquer clone existente
  (incluindo sessões futuras) fica desatualizado e precisa de ser re-clonado
  a partir do repositório privado novo.
- Rever as políticas RLS do Supabase para as 38 tabelas que estiveram
  publicamente legíveis via `backups/` (a service key nunca esteve
  commitada — só como secret do GitHub Actions — mas os dados em si
  estiveram expostos enquanto `backups/` existiu no repo público).

## P2 — Vida Escolar: disciplinas órfãs — Concluído — 2026-09-18 — [PR #6](https://github.com/patrsolothurn-glitch/carvalho-suites/pull/6)

**Contexto**: dois incidentes de perda de ligações, repostos à mão por SQL —
Lucas 11/09 (`disc_id` a `NULL`) e Liam 17/09 (as disciplinas do aluno
desapareceram e as 31 aulas do horário ficaram a apontar para ids que já
não existiam, o horário inteiro apareceu "Livre"). A Guarda A existente
(`isBadDiscId`) só apanhava `null`/`undefined`/`NaN`, nunca verificava se o
id ainda existia na lista de disciplinas.

Só `src/09-app-escolar.js` tocado.

- Guarda A reforçada (`doSaveAlunoSnapshot`, domínios `horario` e `tpc`):
  também rejeita `disc_id` que já não existe nas disciplinas em memória.
  Aborta sem apagar nem inserir nada, com `console.error('[escolar] ...')`
  e cartão vermelho.
- Guarda nova no domínio `disciplinas`: antes do delete, verifica se a nova
  lista deixa de fora alguma disciplina ainda usada no horário, tpc ou
  notas. Se sim, aborta e mostra cartão vermelho com o(s) nome(s).
- Apagar disciplina: conta aulas/tpc/notas que a usam, pede confirmação com
  os números se houver uso, e (se confirmado) marca as aulas como `livre`,
  remove tpc e notas ligados, e grava tudo na mesma operação.
- `_escolarSaveInFlight` e afins passaram a viver em `window` (como
  `_saveTimers` já fazia) — eram reinicializados a cada render, o que
  tornava invisível para o `useEffect` do reload em segundo plano.
- Reload em segundo plano (`visibilitychange`, `csAoVoltarRede`) já não
  recarrega por cima de uma gravação em curso — tenta outra vez até ficar
  livre.
- Confirmado: adicionar/editar disciplina nunca muda ids existentes.

5 casos simulados e relatados na descrição do PR #6 (adicionar disciplina,
apagar sem uso, apagar com 24 aulas em uso, voltar à app durante uma
gravação, disc_id órfão).
