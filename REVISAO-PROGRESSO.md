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

### P1c — Concluída — 2026-09-21 — histórico reescrito, sem PR (força-push autorizado explicitamente só para este passo)

**Antes de mexer**: confirmado zero PRs abertos e o backup de hoje
(`backups/2026-09-21/`, 39 ficheiros) a existir no `carvalho-backups`.

**Branches remotas**: das 8 branches além de `main`
(`infra-p1a-backup-publico`, `p2-escolar-guardas`,
`claude/graphify-file-test-analysis-42ho91`,
`claude/graphify-file-test-analysis-42ho91-quadro-semana`,
`p1b-backup-privado`, `p17-wochenplan-notizen`, `pollen-fetch-caminho`),
7 estavam totalmente integradas em `main` (verificado com
`git merge-base --is-ancestor`). A oitava, `pollen-fetch-caminho`, tinha 2
commits que a ancestralidade não reconhecia — mas `scripts/pollen-fetch.py`
era byte-a-byte idêntico ao de `main` (o conteúdo já lá estava, só chegara
por um commit diferente, via `git checkout -- ficheiro` numa sessão
anterior); confirmado com o Patricio, incluída na lista a apagar.

`git push origin --delete` falhou com **HTTP 403 vindo do próprio
`git-receive-pack` do GitHub** (não do proxy da sessão — confirmado com
`GIT_CURL_VERBOSE`), e não há nenhuma ferramenta MCP para apagar uma
ref/branch. O Patricio apagou as 8 branches manualmente no GitHub;
confirmado com `git ls-remote --heads` que só `main` restava antes de
continuar.

**Reescrita do histórico**:
- `git clone --mirror` de `carvalho-suites` (trouxe também as refs
  `refs/pull/N/head` do GitHub, geradas automaticamente para cada PR —
  ver aviso abaixo).
- `git filter-repo --path backups --invert-paths` (instalado via `pip
  install git-filter-repo`, não vinha no ambiente).
- **`main` tinha 6977 commits antes → 6785 depois.** 192 commits ficaram
  completamente vazios (só tocavam em `backups/`, ex.: os commits diários
  "🗄️ Backup automático") e foram removidos por completo; os 6785
  restantes foram todos reescritos (SHA novo — 100% dos commits
  processados, 0 inalterados, confirmado pelo `commit-map` do
  `filter-repo`).
- Confirmado (duas formas — `git rev-list --all --objects` e `git log
  --all -- backups`) que **zero commits, em nenhuma ref, contêm
  `backups/`**.
- Sem tags no repositório (`git ls-remote --tags` vazio) — nada a
  reenviar além de `main`.

**Push e publicação**:
- `git push --force` de `main`: **`8949f91` → `36a87397`**.
- Deploy disparou automaticamente (evento `push`, força-push inclui) —
  run **#6593**, `conclusion: success`.
- Clone de trabalho local (`/home/user/carvalho-suites`) reposto com
  `git fetch` + `git reset --hard origin/main` para corresponder ao
  histórico novo.

**⚠️ Exposição residual — duas notas importantes**:
1. **`refs/pull/N/head`**: o GitHub mantém automaticamente uma ref por
   cada PR alguma vez aberto (`pull/1/head` .. `pull/8/head`), mesmo depois
   de fechado/mergeado, e estas **não são apagáveis por `git push`** (só o
   GitHub Support as remove). Continuam a apontar para os commits
   *antigos*, com `backups/` completo — mais fáceis de encontrar do que
   um SHA direto, porque são enumeráveis (`pull/1/head`, `pull/2/head`, …).
2. **Pedir ao GitHub Support** para limpar os commits antigos em cache
   (incluindo as `refs/pull/N/head`) — continuam acessíveis por SHA
   direto e por essas refs até lá.

**Ainda por fazer** (fora do âmbito deste passo):
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

## P17 — Wochenplan: Bemerkungen impressas + Notizen escrito na app — Concluído e publicado — 2026-09-21 — [PR #8](https://github.com/patrsolothurn-glitch/carvalho-suites/pull/8) (mergeado, `627c1e6`; build 316, deploy #6592 com sucesso)

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
