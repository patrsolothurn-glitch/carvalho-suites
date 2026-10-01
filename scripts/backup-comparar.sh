#!/usr/bin/env bash
# scripts/backup-comparar.sh — compara o backup de hoje com o backup anterior e
# avisa quando uma tabela perde dados de um dia para o outro.
# Chamado pelo passo "Comparar com o backup anterior" de .github/workflows/backup.yml,
# depois do export e antes de comitar. É SÓ LEITURA: lê os JSON, nunca os altera,
# nunca apaga nada, nunca faz commit. Nunca falha o backup (sai sempre com 0);
# se a própria comparação der erro, avisa com ::warning:: e deixa o backup seguir.
#
# Regras (por tabela presente nas duas pastas, excepto as de IGNORAR):
#   a) antes >= 3  e hoje == 0              -> "caiu para zero"
#   b) antes >= 10 e hoje <= antes / 2      -> "perdeu metade ou mais"
#   c) escolar_horario (excluindo livre = true) e escolar_tpc: linhas com disc_id
#      nulo; se hoje houver >= 3 a mais do que antes -> "disc_id a NULL subiu"
#
# O corpo do alerta leva SÓ nome da tabela, nº de linhas antes/hoje e a regra:
# nunca conteúdo de linhas, ids, emails ou valores (o repositório é público).
#
# Variáveis de ambiente:
#   BACKUPS_DIR  pasta com as pastas AAAA-MM-DD (ex.: carvalho-backups/backups)
#   DATE         data do backup de hoje (AAAA-MM-DD)
#   IGNORAR      tabelas a ignorar, separadas por espaço (afinar falsos positivos)
#   SIMULAR      "true" -> finge, só em memória, que escolar_notas tinha 8 linhas
#                ontem e 0 hoje (os ficheiros ficam intactos); só para testes
#   OUT_MD       onde escrever o corpo markdown do alerta (opcional)
set -uo pipefail

BACKUPS_DIR="${BACKUPS_DIR:?BACKUPS_DIR em falta}"
DATE="${DATE:?DATE em falta}"
IGNORAR="${IGNORAR:-}"
SIMULAR="${SIMULAR:-false}"
SUMMARY="${GITHUB_STEP_SUMMARY:-/dev/null}"
OUTPUT="${GITHUB_OUTPUT:-/dev/null}"
OUT_MD="${OUT_MD:-${RUNNER_TEMP:-/tmp}/backup-alertas.md}"

aviso_erro() {
  echo "::warning::A comparação com o backup anterior falhou (linha $1) — o backup segue sem verificação de perdas."
  echo "⚠️ A comparação com o backup anterior falhou; o backup foi comitado sem esta verificação." >> "$SUMMARY"
  { echo "has_alertas=false"; } >> "$OUTPUT"
  exit 0
}
trap 'aviso_erro $LINENO' ERR
set -E

esta_ignorada() { case " $IGNORAR " in *" $1 "*) return 0 ;; *) return 1 ;; esac; }

# nº de linhas de um JSON (array); vazio se o ficheiro não existir ou não for um array
contar() { [ -f "$1" ] && jq -e 'if type == "array" then length else empty end' "$1" 2>/dev/null || true; }
# linhas com disc_id nulo (escolar_horario: sem as aulas livres; escolar_tpc: todas)
nulos() {
  [ -f "$2" ] || return 0
  if [ "$1" = "escolar_horario" ]; then
    jq -e 'if type == "array" then [.[] | select(.livre != true) | select(.disc_id == null)] | length else empty end' "$2" 2>/dev/null || true
  else
    jq -e 'if type == "array" then [.[] | select(.disc_id == null)] | length else empty end' "$2" 2>/dev/null || true
  fi
}
eh_numero() { [[ "$1" =~ ^[0-9]+$ ]]; }

# Pasta de backup mais recente anterior à de hoje (a pasta mais recente cujo nome é < hoje)
ANTERIOR=""
for d in "$BACKUPS_DIR"/*/; do
  [ -d "$d" ] || continue
  NOME="$(basename "$d")"
  if [[ "$NOME" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] && [[ "$NOME" < "$DATE" ]]; then
    ANTERIOR="$NOME"   # a glob vem ordenada: a última que passa é a mais recente
  fi
done

SIMULADO=false
[ "$SIMULAR" = "true" ] && SIMULADO=true

if [ -z "$ANTERIOR" ]; then
  echo "Sem pasta de backup anterior a $DATE — comparação saltada."
  { echo "### 🔎 Comparação com o backup anterior"; echo; echo "Sem pasta de backup anterior a $DATE — comparação saltada."; echo; } >> "$SUMMARY"
  { echo "has_alertas=false"; echo "data=$DATE"; echo "simulado=$SIMULADO"; } >> "$OUTPUT"
  exit 0
fi

HOJE_DIR="$BACKUPS_DIR/$DATE"
ANT_DIR="$BACKUPS_DIR/$ANTERIOR"
LINHAS_ALERTA=""
N_ALERTAS=0
N_COMPARADAS=0
N_IGNORADAS=0

for f in "$HOJE_DIR"/*.json; do
  [ -f "$f" ] || continue
  T="$(basename "$f" .json)"
  if esta_ignorada "$T"; then N_IGNORADAS=$((N_IGNORADAS + 1)); continue; fi
  [ -f "$ANT_DIR/$T.json" ] || continue            # só tabelas presentes nas duas pastas
  HOJE="$(contar "$f")"; ANTES="$(contar "$ANT_DIR/$T.json")"
  if [ "$SIMULADO" = "true" ] && [ "$T" = "escolar_notas" ]; then ANTES=8; HOJE=0; fi
  if ! eh_numero "$HOJE" || ! eh_numero "$ANTES"; then
    echo "::warning::Tabela $T: ficheiro ilegível numa das pastas — saltada na comparação."
    continue
  fi
  N_COMPARADAS=$((N_COMPARADAS + 1))
  REGRA=""
  if [ "$ANTES" -ge 3 ] && [ "$HOJE" -eq 0 ]; then
    REGRA="caiu para zero (antes ≥ 3 e hoje = 0)"
  elif [ "$ANTES" -ge 10 ] && [ $((HOJE * 2)) -le "$ANTES" ]; then
    REGRA="perdeu metade ou mais (antes ≥ 10 e hoje ≤ antes/2)"
  fi
  if [ -n "$REGRA" ]; then
    LINHAS_ALERTA+="| \`$T\` | $ANTES | $HOJE | $REGRA |"$'\n'
    N_ALERTAS=$((N_ALERTAS + 1))
  fi
done

# Perda silenciosa de disciplina: linhas com disc_id nulo
for T in escolar_horario escolar_tpc; do
  esta_ignorada "$T" && continue
  [ -f "$HOJE_DIR/$T.json" ] && [ -f "$ANT_DIR/$T.json" ] || continue
  HOJE="$(nulos "$T" "$HOJE_DIR/$T.json")"; ANTES="$(nulos "$T" "$ANT_DIR/$T.json")"
  if ! eh_numero "$HOJE" || ! eh_numero "$ANTES"; then
    echo "::warning::Tabela $T: não consegui contar disc_id nulo — saltada nesta regra."
    continue
  fi
  if [ $((HOJE - ANTES)) -ge 3 ]; then
    [ "$T" = "escolar_horario" ] && ROT="escolar_horario (linhas com disc_id nulo, sem as livres)" || ROT="escolar_tpc (linhas com disc_id nulo)"
    LINHAS_ALERTA+="| \`$ROT\` | $ANTES | $HOJE | disc_id a NULL subiu (+$((HOJE - ANTES)), limite +3) |"$'\n'
    N_ALERTAS=$((N_ALERTAS + 1))
  fi
done

{
  echo "### 🔎 Comparação com o backup anterior ($ANTERIOR → $DATE)"
  echo
  [ "$SIMULADO" = "true" ] && { echo "🧪 **SIMULAÇÃO**: escolar_notas fingida em memória com 8 linhas antes e 0 hoje (os ficheiros ficaram intactos)."; echo; }
  echo "Tabelas comparadas: $N_COMPARADAS · ignoradas: $N_IGNORADAS · alertas: $N_ALERTAS"
  echo
} >> "$SUMMARY"

if [ "$N_ALERTAS" -gt 0 ]; then
  {
    echo "Comparação do backup de **$DATE** com o anterior (**$ANTERIOR**)."
    [ "$SIMULADO" = "true" ] && { echo; echo "🧪 **TESTE**: perda simulada em memória (escolar_notas), nenhum dado real foi alterado."; }
    echo
    echo "| Tabela | Linhas antes | Linhas hoje | Regra |"
    echo "|---|---|---|---|"
    printf '%s' "$LINHAS_ALERTA"
  } > "$OUT_MD"
  { echo "| Tabela | Linhas antes | Linhas hoje | Regra |"; echo "|---|---|---|---|"; printf '%s' "$LINHAS_ALERTA"; echo; } >> "$SUMMARY"
  echo "⚠️ $N_ALERTAS alerta(s) de perda de dados:"; printf '%s' "$LINHAS_ALERTA"
  {
    echo "has_alertas=true"
    echo "data=$DATE"
    echo "simulado=$SIMULADO"
    echo "corpo<<EOF_CORPO_BACKUP"
    cat "$OUT_MD"
    echo "EOF_CORPO_BACKUP"
  } >> "$OUTPUT"
else
  echo "✅ Sem perdas face a $ANTERIOR ($N_COMPARADAS tabelas comparadas)."
  echo "✅ Nenhuma tabela perdeu dados face a $ANTERIOR." >> "$SUMMARY"
  { echo "has_alertas=false"; echo "data=$DATE"; echo "simulado=$SIMULADO"; } >> "$OUTPUT"
fi
exit 0
