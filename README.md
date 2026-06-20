# Carvalho Suite

App familiar com 5 mini-apps: HorasPro, Agenda Pro, Família Carvalho,
Agenda Escolar, Nutriguima. Publicada via GitHub Pages a partir de
`index.html` (gerado automaticamente — ver abaixo).

## ⚠️ Não editar `index.html` diretamente

O `index.html` é **gerado automaticamente** a partir dos ficheiros em
`src/`. Qualquer edição direta no `index.html` é perdida no próximo
build. Esta nota está também como comentário no topo do próprio ficheiro.

## Estrutura

```
src/
  head.html              HTML inicial: <head>, CDN do React/Supabase, init do cliente Supabase
  01-helpers.js          Funções de runtime geradas pelo Babel (não tocar)
  02-theme.js            T_DARK / T_LIGHT / T / wrap / applyTheme, filtros de notificação, APPS_DATA
  03-data.js             Constantes partilhadas (VAPID key, dias da semana, dados legados)
  04-ui-components.js    Card, BottomNav, TopBar, Pill, GoldBtn, useFont
  05-app-horaspro.js     App HorasPro
  06-app-agendapro.js    App Agenda Pro
  07-app-familia.js      App Família Carvalho
  08-app-nutriguima.js   App Nutriguima
  09-app-escolar.js      App Agenda Escolar
  10-shell.js            CarvalhoSuite — menu principal, login, Definições, Perfil, Avisos
  tail.html              Scripts finais: montagem do React + registo do Service Worker

build.js                 Monta o index.html a partir de src/. Valida sintaxe ANTES de escrever.
deploy.js                build.js + sobe versão do sw.js + publica no GitHub + confirma deploy
package.json             npm run build / npm run deploy
```

## Como editar algo

1. Identifica a app/secção certa em `src/` (ex: bug na Família → `07-app-familia.js`)
2. Edita esse ficheiro (é muito mais pequeno que o `index.html` inteiro — mais fácil
   de encontrar texto único para editar, e mais fácil de não perder a conta dos parênteses)
3. Corre `node build.js` — só escreve o `index.html` se a sintaxe estiver válida
4. Corre `GITHUB_TOKEN=xxx node deploy.js "mensagem do commit"` para publicar
   (ou os dois juntos: `GITHUB_TOKEN=xxx npm run deploy -- "mensagem"`)

O `deploy.js` já faz tudo o que antes era manual: incrementa a versão
da cache do Service Worker, publica os dois ficheiros no GitHub, e
espera + confirma que o GitHub Pages publicou com sucesso.

## Porque é que o código está "compilado" (sem JSX)

Os ficheiros em `src/` usam `React.createElement(...)` em vez de JSX
(`<div>...</div>`). Isto foi uma escolha deliberada na arrumação:
reescrever todo o código de volta para JSX exigiria reinterpretar
milhares de chamadas `React.createElement` manualmente, com risco real
de erro de transcrição. Dividir em ficheiros sem mudar a sintaxe é uma
operação puramente mecânica (mover texto, não reescrever), por isso o
risco é praticamente zero — confirmado por diff: o `index.html` gerado
é idêntico ao anterior, linha a linha, ignorando só linhas em branco.

Se um dia quiseres dar o próximo passo (JSX real + Babel a correr no
build), é possível, mas é um trabalho maior e separado deste.

## Testes

As funcionalidades mais sensíveis (filtro de notificações, troca de
tema, ecrã inicial preferido, mudar password, etc.) foram validadas
com simulações de lógica e de render em Node antes de cada deploy.
Esses scripts de teste não estão neste repositório (foram usados
pontualmente durante o desenvolvimento), mas o padrão para qualquer
alteração nova é: `node --check` no bundle + simulação da lógica
nova com mocks antes de publicar.
