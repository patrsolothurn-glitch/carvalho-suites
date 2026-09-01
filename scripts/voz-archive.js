#!/usr/bin/env node
'use strict';
/**
 * Arquiva gravações da app Voz para o Google Drive.
 *
 * Corre semanalmente via .github/workflows/voz-archive.yml (Domingo, a
 * seguir ao backup). Também pode ser corrido à mão para testar:
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... \
 *   GDRIVE_CLIENT_ID=... GDRIVE_CLIENT_SECRET=... GDRIVE_REFRESH_TOKEN=... \
 *   node scripts/voz-archive.js
 *
 * Regra de ordem (não mexer): só se apaga do Storage DEPOIS de confirmado
 * o upload no Drive E gravada a linha em voz_gravacoes (drive_url +
 * arquivado_em). Se qualquer passo falhar a meio, a gravação fica como
 * estava — nunca perde o áudio.
 */

const BUCKET = 'voz';
const DRIVE_ROOT = ['Carvalho Suite Backups', 'Voz'];

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`✗ ERRO: falta a variável de ambiente ${name}`);
    process.exit(1);
  }
  return v;
}

const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_KEY = requireEnv('SUPABASE_SERVICE_KEY');

function sbHeaders(extra) {
  return Object.assign({ apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, extra || {});
}

// ── Semana atual / KW (ISO 8601, semana começa à Segunda) ──────────────
function mondayOfCurrentWeekISO() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Dom..6=Sáb
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() + diff);
  return monday.toISOString();
}
function isoWeekAndYear(dateStr) {
  const d = new Date(dateStr);
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dow);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
  return { year: tmp.getUTCFullYear(), week };
}

// ── Supabase: tabela ─────────────────────────────────────────────────
async function fetchRowsToArchive(cutoffISO) {
  const url = `${SUPABASE_URL}/rest/v1/voz_gravacoes?arquivado_em=is.null&gravado_em=lt.${encodeURIComponent(cutoffISO)}&select=*`;
  const res = await fetch(url, { headers: sbHeaders() });
  if (!res.ok) throw new Error(`Falha ao listar voz_gravacoes: ${res.status} ${await res.text()}`);
  return res.json();
}
async function updateRow(id, fields) {
  const url = `${SUPABASE_URL}/rest/v1/voz_gravacoes?id=eq.${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: sbHeaders({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`Falha ao atualizar voz_gravacoes ${id}: ${res.status} ${await res.text()}`);
}

// ── Supabase: storage ────────────────────────────────────────────────
async function downloadFromStorage(path) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  const res = await fetch(url, { headers: sbHeaders() });
  if (!res.ok) throw new Error(`Falha ao descarregar do storage (${path}): ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
async function deleteFromStorage(path) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  const res = await fetch(url, { method: 'DELETE', headers: sbHeaders() });
  if (!res.ok) throw new Error(`Falha ao apagar do storage (${path}): ${res.status} ${await res.text()}`);
}

// ── Google Drive ─────────────────────────────────────────────────────
async function getDriveAccessToken() {
  const clientId = requireEnv('GDRIVE_CLIENT_ID');
  const clientSecret = requireEnv('GDRIVE_CLIENT_SECRET');
  const refreshToken = requireEnv('GDRIVE_REFRESH_TOKEN');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Falha ao renovar token do Drive: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}
async function findFolder(name, parentId, accessToken) {
  const q = `name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Falha ao procurar pasta "${name}" no Drive: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.files && data.files[0] ? data.files[0].id : null;
}
async function createFolder(name, parentId, accessToken) {
  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] }),
  });
  if (!res.ok) throw new Error(`Falha ao criar pasta "${name}" no Drive: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.id;
}
async function resolveFolderId(pathParts, accessToken, cache) {
  let parentId = 'root';
  let builtPath = '';
  for (const name of pathParts) {
    builtPath += '/' + name;
    if (cache.has(builtPath)) {
      parentId = cache.get(builtPath);
      continue;
    }
    const found = await findFolder(name, parentId, accessToken);
    const id = found || await createFolder(name, parentId, accessToken);
    cache.set(builtPath, id);
    parentId = id;
  }
  return parentId;
}
async function uploadToDrive(name, folderId, buffer, mimeType, accessToken) {
  const boundary = 'voz_archive_' + Date.now();
  const metadata = JSON.stringify({ name, parents: [folderId] });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    buffer,
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!res.ok) throw new Error(`Falha ao enviar "${name}" para o Drive: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── Uma gravação, ordem estrita: download → upload Drive → BD → apagar storage ──
async function archiveOne(row, accessToken, folderCache) {
  const { year, week } = isoWeekAndYear(row.gravado_em);
  const folderPath = DRIVE_ROOT.concat([String(year), `KW ${week}`]);
  const folderId = await resolveFolderId(folderPath, accessToken, folderCache);

  const buffer = await downloadFromStorage(row.storage_path);
  const ext = (row.storage_path.split('.').pop() || 'webm').replace(/[^a-z0-9]/gi, '') || 'webm';
  const fileName = `${row.titulo || row.id}.${ext}`.replace(/[\\/:*?"<>|]/g, '_');

  const uploaded = await uploadToDrive(fileName, folderId, buffer, row.mime_type || 'audio/webm', accessToken);
  if (!uploaded || !uploaded.id) throw new Error('Upload para o Drive não devolveu id do ficheiro');
  const driveUrl = uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`;

  // Só a partir daqui o upload está confirmado.
  await updateRow(row.id, { drive_url: driveUrl, arquivado_em: new Date().toISOString() });

  // Só apaga do storage depois de a BD já apontar para o Drive.
  await deleteFromStorage(row.storage_path);

  console.log(`✓ "${row.titulo}" → ${driveUrl}`);
}

async function main() {
  const accessToken = await getDriveAccessToken();
  const cutoff = mondayOfCurrentWeekISO();
  const rows = await fetchRowsToArchive(cutoff);
  console.log(`${rows.length} gravação(ões) para arquivar (gravadas antes de ${cutoff})`);
  if (rows.length === 0) return;

  const folderCache = new Map();
  let ok = 0, fail = 0;
  for (const row of rows) {
    try {
      await archiveOne(row, accessToken, folderCache);
      ok++;
    } catch (e) {
      fail++;
      console.error(`✗ Falha ao arquivar gravação ${row.id} ("${row.titulo}"): ${e && e.message ? e.message : e}`);
    }
  }
  console.log(`Concluído: ${ok} arquivada(s), ${fail} falharam.`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error('✗ ERRO FATAL:', e && e.message ? e.message : e);
  process.exit(1);
});
