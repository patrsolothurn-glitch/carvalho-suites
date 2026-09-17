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
