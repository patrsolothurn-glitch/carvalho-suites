#!/usr/bin/env python3
"""
scripts/pollen-fetch.py — atualiza pollen_estacoes e pollen_medicoes no
Supabase a partir dos dados abertos da MeteoSwiss (coleção
ch.meteoschweiz.ogd-pollen, https://data.geo.admin.ch). Corre via
.github/workflows/pollen-fetch.yml (cron a cada 3h + workflow_dispatch).
Só usa a biblioteca padrão (urllib) — sem dependências externas.

NÃO faz commit ao repositório.

IMPORTANTE — leitura antes de confiar cegamente neste script: foi
escrito sem conseguir aceder a data.geo.admin.ch a partir do ambiente
onde foi desenvolvido (proxy de rede bloqueia o domínio); os nomes
exatos das colunas dos CSV horários da MeteoSwiss vêm só de
documentação pesquisada (opendatadocs.meteoswiss.ch), não de um
ficheiro real inspecionado ao vivo. Por isso:
  - a lista de estações vem de ogd-pollen_meta_stations.csv, que fica
    na RAIZ da coleção (colunas confirmadas: station_abbr, station_name,
    station_coordinates_wgs84_lat/lon) — este ficheiro sempre funcionou;
  - os ficheiros horários por estação (h_now = hoje, h_recent = dias
    anteriores) já NÃO ficam na raiz — ficam em
    <coleção>/<abbr>/ogd-pollen_<abbr>_h_{now,recent}.csv (confirmado
    em produção a 17/09: pedir sem a pasta do <abbr> dava sempre HTTP 403
    nas 15 estações, mesmo a lista de estações vindo bem). Por isso o
    caminho preferido é descobrir o href real de cada ficheiro pela API
    STAC da coleção (GET .../api/stac/v1/collections/ch.meteoschweiz.ogd-pollen/items,
    a seguir a paginação "next") — só se essa API falhar é que se cai
    para o padrão de pasta acima, como último recurso;
  - as colunas de cada tipo de pólen são reconhecidas por PALAVRA-CHAVE
    no cabeçalho (nome alemão/inglês ou abreviatura latina do género),
    não por um nome fixo — para aguentar variações que não pude
    confirmar. Corre com workflow_dispatch e lê os avisos "coluna não
    reconhecida" nos logs; ajusta TIPO_KEYWORDS abaixo se for preciso.
"""
import csv
import io
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = os.environ['SUPABASE_URL']
SUPABASE_KEY = os.environ['SUPABASE_SERVICE_KEY']

META_STATIONS_URL = 'https://data.geo.admin.ch/ch.meteoschweiz.ogd-pollen/ogd-pollen_meta_stations.csv'
STAC_ITEMS_URL = 'https://data.geo.admin.ch/api/stac/v1/collections/ch.meteoschweiz.ogd-pollen/items'
# Último recurso, só se a API STAC falhar — {abbr} sempre em minúsculas,
# {freq} é 'h_now' ou 'h_recent'.
FALLBACK_CSV_URL_TPL = 'https://data.geo.admin.ch/ch.meteoschweiz.ogd-pollen/{abbr}/ogd-pollen_{abbr}_{freq}.csv'
ASSET_FILENAME_RE = re.compile(r'^ogd-pollen_([a-z0-9]+)_h_(now|recent)\.csv$', re.IGNORECASE)

# tipos = mesmos ids de POL_TIPOS em src/19-app-pollen.js — o "tipo"
# gravado em pollen_medicoes tem de bater certo com esses ids.
TIPO_KEYWORDS = {
    'erle': ['aln', 'erle', 'alder'],
    'hasel': ['cory', 'hasel', 'hazel'],
    'esche': ['frax', 'esche', 'ash'],
    'birke': ['betu', 'birke', 'birch'],
    'buche': ['fagu', 'buche', 'beech'],
    'eiche': ['quer', 'eiche', 'oak'],
    'graeser': ['poac', 'gram', 'graeser', 'gräser', 'graser', 'grass'],
    'beifuss': ['arte', 'beifuss', 'mugwort'],
    'ambrosia': ['ambr', 'ragweed'],
    # olive fica sem palavras-chave — não é medida na rede terrestre suíça.
}
TS_KEYWORDS = ['reference_timestamp', 'timestamp', 'datum', 'date', 'time']
IGNORAR_COLUNAS = {'station_abbr', 'station/abbr'}


def log(msg):
    print(msg, flush=True)


def http_get(url, timeout=30):
    """Devolve (bytes, código HTTP). Em erro (4xx/5xx) urlopen levanta
    urllib.error.HTTPError, que já traz o código em e.code."""
    req = urllib.request.Request(url, headers={'User-Agent': 'carvalho-suite-pollen-fetch'})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read(), resp.getcode()


def supabase_upsert(table, rows, on_conflict, batch_size=1000):
    if not rows:
        return
    url = '{}/rest/v1/{}?on_conflict={}'.format(SUPABASE_URL, table, on_conflict)
    for i in range(0, len(rows), batch_size):
        lote = rows[i:i + batch_size]
        body = json.dumps(lote).encode('utf-8')
        req = urllib.request.Request(url, data=body, method='POST', headers={
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
        })
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp.read()


def supabase_delete_old(table, ts_col, before_iso):
    url = '{}/rest/v1/{}?{}=lt.{}'.format(SUPABASE_URL, table, ts_col, urllib.parse.quote(before_iso, safe=''))
    req = urllib.request.Request(url, method='DELETE', headers={
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        resp.read()


def parse_timestamp(raw):
    raw = (raw or '').strip()
    if not raw:
        return None
    formatos = ['%d.%m.%Y %H:%M', '%Y-%m-%dT%H:%M', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M']
    for fmt in formatos:
        try:
            dt = datetime.strptime(raw, fmt)
            return dt.replace(tzinfo=timezone.utc).isoformat()
        except ValueError:
            continue
    return None


def identificar_coluna(nome_coluna):
    baixo = (nome_coluna or '').strip().lower()
    for tipo_id, palavras in TIPO_KEYWORDS.items():
        for p in palavras:
            if p in baixo:
                return tipo_id
    return None


def decode_csv_bytes(raw_bytes):
    """Decodifica os bytes de um CSV da geo.admin.ch. Tenta UTF-8 (com BOM
    opcional) primeiro; os exports desta fonte por vezes vêm em
    Windows-1252/Latin-1 (nomes de estação com acentos — foi isto que
    causou as falhas de 16/09: 'é' em Windows-1252 é o byte 0xE9, que não
    é uma sequência UTF-8 válida). cp1252 tem ~5 posições de byte por
    definir (0x81, 0x8D, 0x8F, 0x90, 0x9D) que também levantam
    UnicodeDecodeError — por isso usa errors='replace' aqui, para este
    último recurso nunca poder falhar e abortar o script inteiro."""
    try:
        return raw_bytes.decode('utf-8-sig')
    except UnicodeDecodeError as e:
        log('  aviso: CSV não é UTF-8 válido ({}), a tentar Windows-1252...'.format(e))
        return raw_bytes.decode('cp1252', errors='replace')


def obter_hrefs_stac():
    """Descobre o href real dos ficheiros horários (h_now / h_recent) de
    cada estação pela API STAC da coleção, seguindo a paginação "next".
    Devolve {abbr_minusculo: {'h_now': href, 'h_recent': href}}, ou None
    se a API falhar (erro de rede, JSON inválido, etc.) — nesse caso o
    chamador usa o padrão de pasta (FALLBACK_CSV_URL_TPL) como recurso."""
    hrefs = {}
    url = STAC_ITEMS_URL
    paginas = 0
    while url:
        paginas += 1
        if paginas > 50:
            log('  aviso STAC: mais de 50 páginas, a parar por segurança (possível loop de paginação)')
            break
        try:
            raw_bytes, status = http_get(url)
            data = json.loads(raw_bytes.decode('utf-8'))
        except Exception as e:
            log('  aviso: API STAC falhou ({}), a usar o padrão de pasta como recurso'.format(e))
            return None
        for item in (data.get('features') or []):
            for asset in (item.get('assets') or {}).values():
                href = asset.get('href')
                if not href:
                    continue
                m = ASSET_FILENAME_RE.match(href.rsplit('/', 1)[-1])
                if not m:
                    continue
                abbr_lower, freq = m.group(1).lower(), m.group(2).lower()
                hrefs.setdefault(abbr_lower, {})['h_' + freq] = href
        url = None
        for link in (data.get('links') or []):
            if link.get('rel') == 'next':
                url = link.get('href')
                break
    log('  API STAC: {} página(s) lida(s), {} estação(ões) com ficheiros horários encontrados'.format(paginas, len(hrefs)))
    return hrefs


def processar_csv_medicoes(csv_text, abbr, corte_iso):
    """Lê um CSV horário de uma estação (h_now ou h_recent — mesmo
    esquema de colunas) e devolve (medicoes, linhas_lidas, linhas_no_prazo).
    Ignora já aqui as linhas com ts anterior a corte_iso — o h_recent
    traz o ano inteiro, e só interessam os últimos 14 dias; a limpeza
    pelo supabase_delete_old no fim do script é só uma rede de segurança,
    não o filtro principal. Nunca levanta — erros ficam só nos logs,
    para o chamador poder continuar com o próximo ficheiro/estação."""
    leitor = csv.DictReader(io.StringIO(csv_text), delimiter=';')
    colunas = leitor.fieldnames or []
    ts_col = next((c for c in colunas if c.strip().lower() in TS_KEYWORDS or 'timestamp' in c.strip().lower()), None)
    if not ts_col:
        log('  ✗ {}: não encontrei a coluna de data/hora (colunas: {}) — a saltar ficheiro'.format(abbr, colunas))
        return [], 0, 0
    colunas_tipo = {}
    for c in colunas:
        if c == ts_col or c.strip().lower() in IGNORAR_COLUNAS:
            continue
        tipo_id = identificar_coluna(c)
        if tipo_id:
            colunas_tipo[c] = tipo_id
        else:
            log('  aviso: coluna "{}" de {} não reconhecida como tipo de pólen — ignorada'.format(c, abbr))
    log('  {}: coluna de data/hora "{}", colunas de pólen reconhecidas: {}'.format(abbr, ts_col, colunas_tipo))

    medicoes = []
    linhas_lidas = 0
    linhas_no_prazo = 0
    for linha in leitor:
        linhas_lidas += 1
        ts_iso = parse_timestamp(linha.get(ts_col, ''))
        if not ts_iso or ts_iso < corte_iso:
            continue
        linhas_no_prazo += 1
        for coluna, tipo_id in colunas_tipo.items():
            valor_raw = (linha.get(coluna) or '').strip()
            if not valor_raw:
                continue
            try:
                valor = float(valor_raw)
            except ValueError:
                continue
            medicoes.append({'estacao': abbr, 'ts': ts_iso, 'tipo': tipo_id, 'valor': valor})
    return medicoes, linhas_lidas, linhas_no_prazo


def main():
    falhas = 0

    log('A obter lista de estações de ' + META_STATIONS_URL + ' ...')
    try:
        raw_bytes, status = http_get(META_STATIONS_URL)
        raw = decode_csv_bytes(raw_bytes)
        leitor = csv.DictReader(io.StringIO(raw), delimiter=';')
        log('  colunas do CSV de estações: {}'.format(leitor.fieldnames))
        estacoes = []
        for linha in leitor:
            abbr = (linha.get('station_abbr') or '').strip()
            nome = (linha.get('station_name') or abbr).strip()
            lat_raw = linha.get('station_coordinates_wgs84_lat')
            lon_raw = linha.get('station_coordinates_wgs84_lon')
            if not abbr or not lat_raw or not lon_raw:
                continue
            try:
                lat = float(lat_raw)
                lon = float(lon_raw)
            except ValueError:
                log('  aviso: coordenadas inválidas para ' + abbr + ', a ignorar')
                continue
            estacoes.append({'codigo': abbr, 'nome': nome, 'lat': lat, 'lon': lon})
        log('  {} estações encontradas: {}'.format(len(estacoes), ', '.join(e['codigo'] for e in estacoes)))
    except Exception as e:
        log('✗ ERRO ao obter a lista de estações: {}'.format(e))
        sys.exit(1)

    if estacoes:
        try:
            supabase_upsert('pollen_estacoes', estacoes, on_conflict='codigo')
            log('  ✓ pollen_estacoes atualizada ({} estações)'.format(len(estacoes)))
        except Exception as e:
            log('✗ ERRO ao gravar pollen_estacoes: {}'.format(e))
            falhas += 1

    corte_14dias_iso = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()

    log('A descobrir os ficheiros horários pela API STAC ...')
    hrefs_stac = obter_hrefs_stac()

    total_medicoes = 0
    for est in estacoes:
        abbr = est['codigo']
        abbr_lower = abbr.lower()
        urls_estacao = (hrefs_stac or {}).get(abbr_lower, {})
        medicoes_por_chave = {}
        linhas_lidas_estacao = 0
        linhas_prazo_estacao = 0
        algum_ficheiro_ok = False

        # h_recent primeiro, h_now depois: se a mesma (estacao,ts,tipo)
        # vier nos dois ficheiros, fica a de h_now (mais recente) — o
        # Postgres rejeita o upsert inteiro se a mesma chave aparecer
        # duas vezes no mesmo pedido ("ON CONFLICT DO UPDATE command
        # cannot affect row a second time"), por isso desduplica-se aqui
        # num dict antes de gravar, nunca se envia a mesma chave 2x.
        for freq in ('h_recent', 'h_now'):
            url = urls_estacao.get(freq) or FALLBACK_CSV_URL_TPL.format(abbr=abbr_lower, freq=freq)
            log('A obter {} de {} ({}) ...'.format(freq, abbr, url))
            try:
                raw_bytes, status = http_get(url)
            except urllib.error.HTTPError as e:
                log('  {} {}: HTTP {} em {} — pode não ter esta frequência, a continuar'.format(abbr, freq, e.code, url))
                continue
            except Exception as e:
                log('  ✗ {} {}: falha a obter {} — {} — a continuar'.format(abbr, freq, url, e))
                falhas += 1
                continue
            log('  {} {}: HTTP {}'.format(abbr, freq, status))
            algum_ficheiro_ok = True

            try:
                raw = decode_csv_bytes(raw_bytes)
                medicoes, linhas, linhas_prazo = processar_csv_medicoes(raw, abbr, corte_14dias_iso)
                linhas_lidas_estacao += linhas
                linhas_prazo_estacao += linhas_prazo
                for medicao in medicoes:
                    chave = (medicao['estacao'], medicao['ts'], medicao['tipo'])
                    medicoes_por_chave[chave] = medicao
            except Exception as e:
                log('  ✗ falha a processar {} {}: {} — a continuar'.format(abbr, freq, e))
                falhas += 1
                continue

        if not algum_ficheiro_ok:
            log('  ✗ {}: nem h_now nem h_recent responderam — estação falhou'.format(abbr))
            falhas += 1
            continue

        medicoes_estacao = list(medicoes_por_chave.values())
        if medicoes_estacao:
            try:
                supabase_upsert('pollen_medicoes', medicoes_estacao, on_conflict='estacao,ts,tipo')
                total_medicoes += len(medicoes_estacao)
                log('  ✓ {}: {} linhas lidas, {} dentro de 14 dias, {} medições únicas gravadas'.format(abbr, linhas_lidas_estacao, linhas_prazo_estacao, len(medicoes_estacao)))
            except Exception as e:
                log('  ✗ falha a gravar medições de {}: {}'.format(abbr, e))
                falhas += 1
        else:
            log('  {}: {} linhas lidas, {} dentro de 14 dias, sem medições novas'.format(abbr, linhas_lidas_estacao, linhas_prazo_estacao))

    log('Total de medições gravadas: {}'.format(total_medicoes))

    log('A apagar medições com mais de 14 dias (rede de segurança — o filtro principal já corre ao ler cada CSV)...')
    try:
        supabase_delete_old('pollen_medicoes', 'ts', corte_14dias_iso)
        log('  ✓ limpeza concluída')
    except Exception as e:
        log('✗ ERRO na limpeza de medições antigas: {}'.format(e))
        falhas += 1

    if total_medicoes == 0:
        log('✗ Nenhuma medição gravada')
        sys.exit(1)
    if falhas:
        log('✗ Terminado com {} falha(s) — ver logs acima.'.format(falhas))
        sys.exit(1)
    log('✓ Concluído sem falhas.')


if __name__ == '__main__':
    main()
