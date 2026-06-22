#!/usr/bin/env node
'use strict';
/**
 * deploy.js — automatiza o que antes era feito à mão em cada alteração:
 *   1. incrementa a versão da cache no sw.js
 *   2. publica index.html e sw.js no GitHub (via API, com SHA correto)
 *   3. espera e confirma que o GitHub Pages publicou com sucesso
 *
 * Uso:
 *   GITHUB_TOKEN=ghp_xxx node deploy.js "mensagem do commit"
 *
 * Não comitar nunca o token. É lido só da variável de ambiente.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO = 'patrsolothurn-glitch/carvalho-suites';
const TOKEN = process.env.GITHUB_TOKEN;
const MESSAGE = process.argv[2] || 'Deploy automático';

if (!TOKEN) {
  console.error('✗ ERRO: define a variável de ambiente GITHUB_TOKEN antes de correr este script.');
  console.error('  Exemplo: GITHUB_TOKEN=ghp_xxx node deploy.js "mensagem"');
  process.exit(1);
}

function apiRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: urlPath,
      method,
      headers: Object.assign({
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'carvalho-suite-deploy-script',
      }, data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => { chunks += c; });
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(chunks); } catch (e) { parsed = chunks; }
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
        else reject(new Error(`HTTP ${res.statusCode}: ${chunks}`));
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getSha(filePath) {
  try {
    const res = await apiRequest('GET', `/repos/${REPO}/contents/${filePath}`);
    return res.sha;
  } catch (err) {
    if (String(err.message).includes('HTTP 404')) return null;
    throw err;
  }
}

async function putFile(filePath, localPath, message) {
  const sha = await getSha(filePath);
  const content = fs.readFileSync(localPath).toString('base64');
  const body = { message, content };
  if (sha) body.sha = sha;
  const res = await apiRequest('PUT', `/repos/${REPO}/contents/${filePath}`, body);
  console.log(`  ${filePath} -> ${res.commit.sha.slice(0, 10)}${sha ? '' : ' (novo)'}`);
}

async function waitForPagesDeploy(maxAttempts) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 15000));
    const runs = await apiRequest('GET', `/repos/${REPO}/actions/runs?per_page=1`);
    const run = runs.workflow_runs && runs.workflow_runs[0];
    if (!run) continue;
    if (run.status === 'completed') {
      return run.conclusion;
    }
    console.log(`  ainda em progresso (tentativa ${i + 1}/${maxAttempts})...`);
  }
  return 'timeout';
}

const SRC_FILES = [
  'src/head.html', 'src/01-helpers.js', 'src/02-theme.js', 'src/03-data.js',
  'src/04-ui-components.js', 'src/05-app-horaspro.js', 'src/06-app-agendapro.js',
  'src/07-app-familia.js', 'src/08-app-nutriguima.js', 'src/09-app-escolar.js',
  'src/10-shell.js', 'src/tail.html',
];

async function main() {
  console.log('1/4 — A publicar os ficheiros fonte (src/) no GitHub...');
  for (const f of SRC_FILES) {
    await putFile(f, path.join(__dirname, f), MESSAGE);
  }

  console.log('2/4 — A validar e publicar index.html e sw.js no GitHub...');
  await putFile('index.html', path.join(__dirname, 'index.html'), MESSAGE);
  await putFile('sw.js', path.join(__dirname, 'sw.js'), `${MESSAGE} (sw bump)`);

  console.log('3/4 — A aguardar o GitHub Pages publicar...');
  const conclusion = await waitForPagesDeploy(6);

  console.log('4/4 — Resultado:', conclusion);
  if (conclusion !== 'success') {
    console.error('✗ O deploy do GitHub Pages não terminou com sucesso. Verifica manualmente.');
    process.exit(1);
  }
  console.log('✓ Deploy concluído com sucesso (src/, index.html e sw.js todos sincronizados).');
}

main().catch((err) => {
  console.error('✗ ERRO NO DEPLOY:', err.message || err);
  process.exit(1);
});
