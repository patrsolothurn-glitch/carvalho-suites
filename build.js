#!/usr/bin/env node
'use strict';
/**
 * build.js — monta o index.html da Carvalho Suite a partir dos
 * ficheiros fonte em src/, e valida a sintaxe ANTES de escrever
 * o resultado final. Nunca escreve um index.html partido.
 *
 * Uso:  node build.js
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, 'src');
const OUT_FILE = path.join(__dirname, 'index.html');
const SW_FILE = path.join(__dirname, 'sw.js');
const BUILD_NO_FILE = path.join(__dirname, 'build-number.txt');

// Ordem de montagem do bundle JS. Cada ficheiro é uma secção lógica
// e independente — para editar uma app, só é preciso abrir o ficheiro
// dela, não o index.html inteiro.
const JS_SECTIONS = [
  '01-helpers.js', // funções de runtime geradas pelo Babel (não tocar)
  '02-theme.js', // T_DARK/T_LIGHT/T/wrap/applyTheme + filtros de notificação + APPS_DATA
  '03-data.js', // constantes partilhadas (VAPID, dias da semana, utilizadores legados)
  '04-ui-components.js', // Card, BottomNav, TopBar, Pill, GoldBtn, useFont
  '05-app-horaspro.js', // app HorasPro
  '06-app-agendapro.js', // app Agenda Pro
  '07-app-familia.js', // app Família Carvalho
  '08-app-nutriguima.js', // app Nutriguima
  '09-app-escolar.js', // app Agenda Escolar
  '11-app-subby.js', // app Subby — gestor de subscrições (independente, só Patricio)
  '10-shell.js', // CarvalhoSuite — menu principal, login, Definições, Perfil, Avisos
];

function read(name) {
  return fs.readFileSync(path.join(SRC_DIR, name), 'utf8');
}

function main() {
  console.log('🔨 A construir index.html a partir de src/...');

  for (const name of JS_SECTIONS) {
    const p = path.join(SRC_DIR, name);
    if (!fs.existsSync(p)) {
      console.error(`✗ ERRO: falta o ficheiro src/${name}`);
      process.exit(1);
    }
  }
  if (!fs.existsSync(path.join(SRC_DIR, 'head.html')) || !fs.existsSync(path.join(SRC_DIR, 'tail.html'))) {
    console.error('✗ ERRO: faltam src/head.html ou src/tail.html');
    process.exit(1);
  }

  const head = read('head.html');
  const tail = read('tail.html');
  const jsBody = JS_SECTIONS.map(read).join('\n');

  // ── Hash do código real + número de build amigável ──
  // O hash (usado na cache do Service Worker) muda sempre que o
  // código muda — é isso que evita telemóveis presos em versões
  // antigas. O "número de build" é só cosmético, para mostrar em
  // Definições algo como "Carvalho-07" em vez do hash em si.
  const contentHash = crypto.createHash('sha256').update(jsBody + head + tail).digest('hex').slice(0, 8);
  const newCacheVersion = 'carvalho-v' + contentHash;
  let oldCacheVersion = null;
  if (fs.existsSync(SW_FILE)) {
    const swMatch = fs.readFileSync(SW_FILE, 'utf8').match(/const CACHE = '([^']+)';/);
    if (swMatch) oldCacheVersion = swMatch[1];
  }
  let buildNo = 0;
  if (fs.existsSync(BUILD_NO_FILE)) {
    buildNo = parseInt(fs.readFileSync(BUILD_NO_FILE, 'utf8').trim(), 10) || 0;
  }
  if (oldCacheVersion !== newCacheVersion) {
    buildNo += 1;
  }
  const friendlyVersion = 'Carvalho-' + String(buildNo).padStart(2, '0');

  const banner = `<!--
  GERADO AUTOMATICAMENTE por build.js a partir dos ficheiros em src/.
  NÃO EDITAR ESTE FICHEIRO DIRETAMENTE — as alterações seriam perdidas
  no próximo build. Edita os ficheiros em src/, depois corre:
    node build.js
  Gerado em: ${new Date().toISOString()}
-->
`;
  const buildNoScript = `  <script>window.CARVALHO_FRIENDLY_VERSION = ${JSON.stringify(friendlyVersion)};</script>\n`;
  let headWithBanner = head.replace('<!DOCTYPE html>\n', '<!DOCTYPE html>\n' + banner);
  headWithBanner = headWithBanner.replace('</head>', buildNoScript + '</head>');

  const finalHtml = headWithBanner + jsBody + tail;

  // Validar a sintaxe do bundle JS ANTES de escrever index.html.
  const scriptMarker = '"use strict";';
  const scriptStart = finalHtml.indexOf(scriptMarker);
  const scriptEnd = finalHtml.indexOf('</script>', scriptStart);
  if (scriptStart === -1 || scriptEnd === -1) {
    console.error('✗ ERRO: não foi possível localizar os limites do bundle JS para validar.');
    process.exit(1);
  }
  const bundle = finalHtml.slice(scriptStart, scriptEnd);

  const tmpPath = path.join(__dirname, '.build-tmp-bundle.js');
  fs.writeFileSync(tmpPath, bundle, 'utf8');
  try {
    execSync(`node --check "${tmpPath}"`, { stdio: 'pipe' });
    console.log('✓ Sintaxe do bundle válida');
  } catch (err) {
    console.error('✗ ERRO DE SINTAXE — index.html NÃO foi escrito. Nada foi publicado.');
    console.error((err.stderr || err.message || '').toString());
    fs.unlinkSync(tmpPath);
    process.exit(1);
  }
  fs.unlinkSync(tmpPath);

  fs.writeFileSync(OUT_FILE, finalHtml, 'utf8');
  console.log(`✓ index.html gerado: ${finalHtml.length} caracteres, ${JS_SECTIONS.length} secções JS`);

  // ── Atualiza automaticamente a versão da cache do Service Worker ──
  // A versão é um hash do código real (jsBody), por isso só muda
  // quando o código muda — e muda SEMPRE que mudar, sem ninguém ter
  // de se lembrar de bater o número à mão (isso é o que estava a
  // causar telemóveis a ficarem agarrados a versões antigas).
  if (fs.existsSync(SW_FILE)) {
    if (oldCacheVersion) {
      if (oldCacheVersion !== newCacheVersion) {
        const swContent = fs.readFileSync(SW_FILE, 'utf8').replace(/const CACHE = '[^']+';/, "const CACHE = '" + newCacheVersion + "';");
        fs.writeFileSync(SW_FILE, swContent, 'utf8');
        console.log(`✓ sw.js: versão da cache atualizada ${oldCacheVersion} → ${newCacheVersion}`);
      } else {
        console.log(`  sw.js: código sem alterações — versão mantida (${oldCacheVersion})`);
      }
    } else {
      console.warn('⚠ Aviso: não encontrei "const CACHE = ..." em sw.js — versão da cache NÃO foi atualizada automaticamente.');
    }
  }
  fs.writeFileSync(BUILD_NO_FILE, String(buildNo), 'utf8');
  console.log(`  Versão amigável: ${friendlyVersion}`);
  console.log('  (pronto para publicar)');
}

main();
