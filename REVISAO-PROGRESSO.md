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

### P1b — Concluído e verificado — 2026-09-21 — [PR #7](https://github.com/patrsolothurn-glitch/carvalho-suites/pull/7) (mergeado, `62e8af9`)

Só `.github/workflows/backup.yml` tocado.

- Repositório privado `patrsolothurn-glitch/carvalho-backups` e secret
  `BACKUP_REPO_TOKEN` já existiam (criados fora desta sessão).
- Agendamento 03:00 UTC reativado + `workflow_dispatch` mantido.
- `set -euo pipefail`; cada tabela com `curl -sf` — se uma falhar, o
  workflow falha de imediato ("tabela X falhou"), nunca grava `"[]"`.
- Cada ficheiro validado com `jq -e` (tem de ser array JSON) antes de
  contar como sucesso.
- Mesma lista de tabelas. `family_trips_list` **não entrou** — só é lida
  no código (`.select`), nunca escrita como `family_trips` (que já está
  na lista); tudo indica view sobre essa tabela, não tabela própria (sem
  acesso direto à BD nesta sessão para confirmar com certeza absoluta).
- Clona `carvalho-backups` com o token, escreve em `backups/AAAA-MM-DD/`,
  comita e envia (push) **lá** — o workflow já nem faz checkout do
  `carvalho-suites`.
- Limpeza de pastas com mais de 90 dias pela **data no nome** da pasta
  (string `YYYY-MM-DD`, não `mtime`).
- Resumo (nº de tabelas + linhas por tabela) no `$GITHUB_STEP_SUMMARY`.
- **Correções feitas depois da primeira verificação do PR #7**:
  - `carvalho-backups` está mesmo vazio (sem branch) — depois do clone,
    se `HEAD` não tiver commit nenhum, cria a branch `main`; o push final
    passa a ser explícito (`git push origin HEAD:main`).
  - `wplan_notizen` (tabela nova do P17) acrescentada à lista.
  - Paginação: cada tabela exportada em páginas de 1000 linhas
    (`Range: OFFSET-OFFSET+999`), juntas com `jq -s`, até uma página vir
    com menos de 1000 — testado localmente com tabelas simuladas de
    2500 (3 páginas), 2000 (múltiplo exato), 0 e 37 linhas, todos com o
    total exato. O resumo já mostra o total real, não só a 1ª página.
- **Verificado a correr de verdade** (run #51, id `35591804817`, depois
  de duas falhas por `BACKUP_REPO_TOKEN` vazio — corrigido recriando o
  secret como Repository secret, token fine-grained só para
  `carvalho-backups`): **39 tabelas** exportadas com sucesso.
  `family_events` 268, `escolar_tpc` 15, `wplan_tasks` 31,
  `horas_entries` 141 linhas. `backups/2026-09-21/` confirmada criada no
  `carvalho-backups` (commit raiz `46f72d0`, 39 ficheiros, branch `main`
  nova).

### P1c — Pronta para avançar (falta ainda ser pedida/confirmada)

PR #7 já está mergeado e o workflow já correu com sucesso pelo menos uma
vez — as duas condições do passo 1 da P1c (sem PRs de infraestrutura
abertos que a bloqueiem, backup de hoje a existir no `carvalho-backups`)
estão cumpridas. Nota: o PR #8 (P17) continua aberto nesta data — se o
passo 1 da P1c exigir *zero* PRs abertos em qualquer parte do repo (não só
de infraestrutura), confirmar isso antes de avançar.

- Limpar `backups/` de todo o histórico do repo público com `git filter-repo`
  (comandos já documentados no PR #5). Força-push autorizado explicitamente
  só para este passo.
- Apagar as branches remotas antigas já integradas (lista dada pelo
  Patricio), confirmando primeiro que nenhuma tem commits que faltem no
  main.
- Depois do `push --force`: qualquer clone existente (incluindo sessões
  futuras) fica desatualizado e precisa de ser re-clonado.
- Pedir ao GitHub Support para limpar os commits antigos em cache (ficam
  acessíveis por SHA direto até lá).
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

## P17 — Wochenplan: Bemerkungen impressas + Notizen escrito na app — PR aberto, sem merge — 2026-09-21 — [PR #8](https://github.com/patrsolothurn-glitch/carvalho-suites/pull/8)

**Objetivo**: poder escrever na app o que hoje se escreve à mão na folha
impressa — a nota ao lado da morada (`bemerkungen`) e o bloco "Notizen" no
fundo. Quem não escrever nada continua a ter a folha igual à de hoje.

Só `src/17-app-wochenplan.js` tocado.

- `bemerkungen` (já existia, já era gravado, nunca era impresso) passa a
  aparecer nas linhas impressas do Wochenplan e do Tagesplan/Wochenliste
  (dias, Übertrag/Nicht erledigt, Dringend), só quando preenchido, com
  quebra de linha em vez de cortar/espremer a coluna do nome. A
  Wochenübersicht não foi pedida explicitamente e não foi tocada.
- Rótulo do formulário: "Bemerkungen" → "Bemerkungen / Notiz".
- Tabela `wplan_notizen(datum_montag, wer, texto)` (já criada) — campo de
  texto "Notizen" por baixo do plano da semana, gravação automática 800ms
  depois de parar de escrever, erro com `console.error('[wochenplan] ...')`
  + cartão vermelho sem fechar o campo. Muda de semana/pessoa → carrega a
  nota respetiva.
- Impressão: sem texto fica igual a hoje; com texto, mostra-o (quebras de
  linha preservadas) e as linhas em branco que sobrarem por baixo — nas
  três folhas que já chamavam `wpPrintNotizen`.

4 casos (sem nada, só bemerkungen, só Notizen, Notizen mais longo do que
o espaço) descritos na descrição do PR #8.
