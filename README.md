# Carvalho Suite

App familiar com 16 mini-apps (lista completa abaixo — ver `APPS_DATA`
em `src/02-theme.js`). Publicada via GitHub Pages a partir de
`index.html` (gerado automaticamente — ver abaixo).

## ⚠️ Não editar `index.html`, `sw.js` nem `build-number.txt` diretamente

Estes três ficheiros são **gerados automaticamente** por `node build.js`
a partir dos ficheiros em `src/`. Qualquer edição direta é perdida no
próximo build. Esta nota está também como comentário no topo do próprio
`index.html`.

## As 16 apps (menu principal)

| App | Ficheiro fonte | Descrição |
|---|---|---|
| Patricio Time | `05-app-horaspro.js` | Registo de horas e CHF |
| Patricio Work | `06-app-agendapro.js` | Gestão de trabalho |
| Família Carvalho | `07-app-familia.js` | Calendário familiar |
| Nutriguima | `08-app-nutriguima.js` | Loja de suplementos |
| Vida Escolar | `09-app-escolar.js` | Escola do Lucas / Liam |
| Carvalho Abo Kontrolle | `11-app-subby.js` | Gestor de subscrições |
| Escola Grenchen | `12-app-lucas.js` | Gestão do transporte escolar |
| Hauswart *(admin)* | `13-app-hauswart.js` | Faturação trimestral |
| Arnold Rapport *(admin)* | `14-app-rapport.js` | Planung · Tages- und Wochenrapport |
| Viagens Família *(admin)* | `15-app-viagens.js` | Férias e visitas importantes |
| Voz *(admin)* | `16-app-voz.js` | Notas de voz e tradutor multi-idioma |
| Wochenplan *(admin)* | `17-app-wochenplan.js` | Planeamento semanal de trabalho |
| Horas por Voz *(admin)* | `18-app-horasvoz.js` | Registo de horas a 70% por voz |
| Pólen | `19-app-pollen.js` | Previsão e diário de alergias ao pólen |
| Carvalho Fitness *(admin)* | `20-app-fitness.js` | Plano alimentar, progresso e treino |
| Notas Carvalho | `23-app-notas.js` | Notas da família: pastas Privado e Geschäft, importância 1/2/3, Arquivo, cofre de passwords com código de 4 dígitos, painel Cofres da família para o admin |

*(admin)* = app marcada `adminOnly: true` em `APPS_DATA`, só visível a
administradores. A app Hauswart Extra (`21-app-hauswart-extra.js`) não
tem entrada própria no menu — abre-se pelo botão "➕ Extra" dentro da
Hauswart.

Esta tabela espelha `APPS_DATA` em `src/02-theme.js` — se mudares ali
(adicionar, remover ou renomear uma app), atualiza esta tabela também.

## Estrutura de `src/`

```
src/
  head.html                HTML inicial: <head>, CDN do React/Supabase, init do cliente Supabase
  01-helpers.js            Funções de runtime geradas pelo Babel (não tocar)
  02-theme.js              T_DARK / T_LIGHT / T / wrap / applyTheme, filtros de notificação, APPS_DATA
  03-data.js               Constantes partilhadas (VAPID key, dias da semana, dados legados)
  04-ui-components.js      Card, BottomNav, TopBar, Pill, GoldBtn, useFont
  05-app-horaspro.js       App Patricio Time
  06-app-agendapro.js      App Patricio Work
  07-app-familia.js        App Família Carvalho
  08-app-nutriguima.js     App Nutriguima
  09-app-escolar.js        App Vida Escolar
  11-app-subby.js          App Carvalho Abo Kontrolle (gestor de subscrições)
  12-app-lucas.js          App Escola Grenchen (gestão do transporte escolar — compilado por Babel, ver nota abaixo)
  13-app-hauswart.js       App Hauswart (faturação trimestral, admin only)
  21-app-hauswart-extra.js App Hauswart Extra (trabalhos leves, aberta a partir da Hauswart)
  14-app-rapport.js        App Arnold Rapport (Wochen Planung, Tages- e Wochenrapport)
  15-app-viagens.js        App Viagens Família
  16-app-voz.js            App Voz (gravador + tradutor)
  17-app-wochenplan.js     App Wochenplan
  18-app-horasvoz.js       App Horas por Voz (admin only)
  19-app-pollen.js         App Pólen
  20-app-fitness.js        App Carvalho Fitness (admin only)
  22-home-extras.js        Home: popup Kompliment des Tages, tempo, painel admin do Kompliment
  23-app-notas.js          App Notas Carvalho (notas, Arquivo, Lixo, cofre de passwords)
  10-shell.js              CarvalhoSuite — menu principal, login, Definições, Perfil, Avisos
  tail.html                Scripts finais: montagem do React + registo do Service Worker

build.js                   Monta o index.html a partir de src/. Valida sintaxe ANTES de escrever.
deploy.js                  Publica src/, index.html, sw.js, manifest.json, diag.html e
                            build-number.txt no GitHub (um PUT por ficheiro) e confirma o deploy.
package.json                npm run build / npm run deploy
```

Nota sobre `12-app-lucas.js`: ao contrário dos outros ficheiros de
`src/`, este é gerado por um compilador Babel (usa `_regenerator`,
`_asyncToGenerator`, etc.). Edições devem ser mínimas e manter o
estilo compilado — nunca reformatar ou reconverter o ficheiro inteiro.

## Notas Carvalho: tabelas e SQL

- Tabelas Supabase: `notas_notas` (as notas; está no backup diário), `notas_cofre` (entradas do
  cofre de passwords) e `notas_cofre_pin` (código de cada pessoa, só como salt + hash).
- O cofre **não entra no backup**: `notas_cofre` e `notas_cofre_pin` não estão na lista `TABLES` de
  `backup.yml` e não devem ser acrescentadas.
- O código de 4 dígitos é um cadeado de ecrã, **não encriptação**; as passwords ficam em claro em
  `notas_cofre`, protegidas só por RLS. Guardar lá só passwords sem importância.
- Quem define os códigos é o admin (no cartão de cada pessoa). Cada pessoa só lê o seu cofre; o admin
  lê os dos outros, só em leitura, no painel "Cofres da família".
- `sql/33_…` a `sql/40_…` (cada um com `_reverter`) são cópias de documentação do SQL que o
  utilizador já correu no Supabase: 33 tabela das notas, 34 o admin lê também as notas da Cristina (só leitura), 35
  importância e fixada, 36 nível "baixo", 37 `feita_em` (Arquivo), 38 `pasta` (Privado/Geschäft),
  39 cofre, 40 política "cofre: admin lê". O SQL é sempre corrido pelo utilizador, nunca pelo código.

## Contas, registo e permissões

- **Registo público desligado.** O separador "Criar conta" está escondido em `src/10-shell.js`
  (`SIGNUP_ENABLED = false`) e o registo está desligado no painel do Supabase (essa definição não
  está neste repositório). As contas são criadas e apagadas pelo admin, pela função `manage-member`
  (ver abaixo).
- **Contas:** quatro utilizadores — `patricio` (admin), `esposa` (Cristina), `lucas` e `liam`.
- **Permissões reais por conta** vivem na base de dados (`profiles.allowed_apps` e `profiles.is_admin`),
  não no código. O Liam só tem a app escolar (Vida Escolar). As apps `adminOnly` em `APPS_DATA`
  só aparecem a administradores.
- `USERS_DEF` e `PERMS_DEF` em `src/03-data.js` são **legado**: só servem para nomes, papéis e emojis,
  não definem permissões e não guardam credenciais.

## Funções do servidor, scripts e PWA pública

| Onde | O que é |
|---|---|
| `supabase-functions/manage-member.ts` | Cria e apaga contas. Só admin (confirma `profiles.is_admin` no servidor antes de usar a chave de serviço). |
| `supabase-functions/send-push.ts` | Envia notificações push. Usada pelas apps, pelos crons e pela PWA pública. Não verifica o chamador no código. |
| `supabase-functions/subby-reminders.ts`, `pollen-alerta.ts`, `escolar-test-reminder.ts` | Lembretes agendados (os `*-cron.sql` guardam os agendamentos). Usam a chave de serviço. |
| `supabase-functions/fitness-receita-ia.ts` | Receita por IA (API paga). Só admin; a chave da API é um segredo da função, nunca vai para o repositório. |
| `supabase-functions/*.sql`, `supabase/pollen.sql` | Migrações antigas já aplicadas (fora de `sql/`). |
| `scripts/backup-comparar.sh`, `scripts/pollen-fetch.py`, `scripts/voz-archive.js` | Usados pelos workflows `backup.yml`, `pollen-fetch.yml` e `voz-archive.yml`. |

As funções **não são publicadas por este repositório**: o Patricio faz o deploy no Supabase.

**PWA pública da escola.** É um repositório à parte (`escola-grenchen`, GitHub Pages) e usa só a chave
pública. O `lucas.html` deste repositório é apenas um redireccionamento para ela. A PWA faz `select` em
`lucas_condutores`, `lucas_config`, `lucas_semana` e `lucas_visitantes`, um `insert` em `lucas_visitantes`,
chama a função `send-push` e usa as RPC `lucas_entrar`, `update_condutor_profile`, `update_visitante_profile`,
`update_lucas_avatar` e `update_visitante_avatar`. **Essas RPC não estão definidas neste repositório**
(só existem na base de dados).

## O que a pasta `sql/` NÃO cobre

`sql/` guarda cópias de documentação do SQL que o utilizador já correu no Supabase (começa no 20; as tabelas
base foram criadas no painel). Não cobre:

- as policies de RLS da maioria das tabelas (Vida Escolar, Família, Escola Grenchen, Viagens, Voz, Hauswart,
  Rapport, Wochenplan, Horas por Voz, perfis, push, convites);
- a função `public.is_admin_user()` (usada pelas policies do `sql/31`) e o trigger `profiles_protect_cols`;
- as RPC `lucas_entrar`, `update_condutor_profile`, `update_visitante_profile`, `update_lucas_avatar`,
  `update_visitante_avatar`;
- as tabelas `family_trip_photos`, `fotos_trabalho`, `nutriguima_favorites` e `wplan_task_leute`
  (existem na base de dados, mas o código deste repositório não as conhece);
- as policies reais de `notas_cofre` e `notas_cofre_pin`.

**`sql/39` e `sql/40` são descritivos, não o SQL executado:** foram escritos a partir da descrição das
tabelas e das policies. O `sql/39` cria as tabelas mas não traz as policies, e o `sql/40` não contém
nenhum comando executável (só o comentário; o `_reverter` apaga a policy `cofre: admin lê`).
O estado real da base de dados confirma-se com consultas de catálogo ao Supabase.

## Pipeline: `src/` → `build.js` → `deploy.js`

1. Edita o ficheiro certo em `src/` (ver tabelas acima).
2. Corre `node build.js` — lê os ficheiros em `src/` pela ordem de
   `JS_SECTIONS`, valida a sintaxe do bundle resultante e só então
   escreve `index.html`, atualiza a versão da cache em `sw.js` e
   incrementa `build-number.txt`. Nunca escreve um `index.html` partido.
3. Corre `GITHUB_TOKEN=xxx node deploy.js "mensagem do commit"` para
   publicar — sobe `src/`, `index.html`, `sw.js`, `manifest.json`,
   `diag.html` e `build-number.txt` para o GitHub (um commit por
   ficheiro, via API de Contents) e espera a confirmação do GitHub
   Pages.

**Importante: `build.js` nunca corre no CI.** O workflow `Guarda PR`
(`.github/workflows/guarda-pr.yml`) só faz checkout do PR e valida a
sintaxe dos ficheiros alterados — não monta nem publica nada. O
`index.html`/`sw.js`/`build-number.txt` têm de vir já corretos no PR
(gerados localmente com `node build.js` antes do commit); o `Guarda
PR` não os gera por ti. Quem opera a suite (incluindo o Claude Code)
nunca deve dar merge a um PR com este workflow vermelho.

### `JS_SECTIONS` e `SRC_FILES` têm de estar de acordo

`build.js` monta o bundle a partir da lista `JS_SECTIONS` (a ordem dos
ficheiros de app dentro do `index.html`). `deploy.js` publica os
ficheiros a partir de uma lista própria, `SRC_FILES` (que inclui ainda
`head.html`, `tail.html`, `build.js` e `deploy.js`, já que esses também
têm de ir para o repositório, mas não entram no bundle JS). **São duas
listas escritas à mão, uma em cada ficheiro** — ao adicionar, remover
ou renomear um ficheiro de app, as duas têm de ser atualizadas juntas.
Esquecer uma delas produz ou um build local que falha (`JS_SECTIONS`
desatualizada) ou um deploy que publica tudo exceto o ficheiro novo
(`SRC_FILES` desatualizada), sem aviso automático de que ficaram
desincronizadas.

### Ficheiros `FINAL-*.js` já não são suportados

Se existir um `src/FINAL-<nome>.js`, `node build.js` aborta de
imediato com um erro explícito, sem escrever nada — é um resto de uma
convenção antiga. A correção é copiar o conteúdo para `src/<nome>.js`
e apagar o `FINAL-<nome>.js`.

## Workflows (`.github/workflows/`)

| Ficheiro | Quando corre | O que faz |
|---|---|---|
| `guarda-pr.yml` | Em cada PR para `main` | Valida a sintaxe dos ficheiros alterados do PR; nunca escreve nada. Nunca dar merge com este vermelho. |
| `deploy.yml` | Push para `main` (ou manual) | Publica o `index.html` já presente no repositório no GitHub Pages. |
| `backup.yml` | Diariamente, às 03:00 UTC (ou manual) | Faz backup dos dados do Supabase para o repositório privado `carvalho-backups`; nunca escreve no `carvalho-suites`. |
| `health.yml` | Diariamente, às 05:30 UTC (ou manual) | Verifica que o site está no ar, o `index.html` tem tamanho normal e o Supabase responde. |
| `keep-alive.yml` | De 5 em 5 dias (ou manual) | Faz um pedido simples ao Supabase para o manter ativo. |
| `pollen-fetch.yml` | De 3 em 3 horas (ou manual) | Atualiza dados de pólen a partir da MeteoSwiss. |
| `voz-archive.yml` | Dia 1 de cada mês, às 03:30 UTC (ou manual) | Arquiva gravações antigas da app Voz. |
| `vigilancia-sexta.yml` | Sextas-feiras (ou manual) | Verifica semanalmente site, deploy, Supabase e backup; tenta reparar sozinha o que sabe reparar sem risco (nunca escreve dados nem corre `build.js`); abre uma issue quando há reparação ou falha persistente. |

## Porque é que o código está "compilado" (sem JSX)

Os ficheiros em `src/` usam `React.createElement(...)` em vez de JSX
(`<div>...</div>`). Isto foi uma escolha deliberada na arrumação:
reescrever todo o código de volta para JSX exigiria reinterpretar
milhares de chamadas `React.createElement` manualmente, com risco real
de erro de transcrição. Dividir em ficheiros sem mudar a sintaxe é uma
operação puramente mecânica (mover texto, não reescrever), por isso o
risco é praticamente zero.

A excepção é `12-app-lucas.js`, já compilado por um Babel real (ver
nota na estrutura de `src/` acima).

Se um dia quiseres dar o próximo passo (JSX real + Babel a correr no
build), é possível, mas é um trabalho maior e separado deste.

## Testes

As funcionalidades mais sensíveis (filtro de notificações, troca de
tema, ecrã inicial preferido, mudar password, queries ao Supabase,
etc.) são validadas com simulações de lógica em Node antes de cada
PR/deploy: para cada função alterada, um pequeno script com um cliente
Supabase falso prova o caminho de sucesso e o de erro (que o estado só
muda quando a escrita/leitura tem sucesso). Esses scripts de teste não
ficam neste repositório (são usados pontualmente durante o
desenvolvimento) — o padrão para qualquer alteração nova é: `node
--check` no ficheiro alterado + `node build.js` + essa simulação antes
de publicar.
