// ══════════════════════════════════════════════════════════════════
// APP CARVALHO FITNESS — plano alimentar, diário, progresso e treino.
// Visível só ao Patricio (admin) — via allowed_apps/isAdmin como as
// outras apps normais, ver src/02-theme.js e src/10-shell.js. Só lê e
// escreve tabelas fitness_* (RLS por user_id = auth.uid()); nunca
// mistura com tabelas de outra app. Fotos vivem só no Storage (bucket
// privado "fitness-fotos", signed URLs), nunca base64 na base de dados.
//
// FASE 1 (este ficheiro, neste PR): assistente/perfil, cálculo de
// meta, Alimentos, Plano (refeições/opções/itens), próxima avaliação
// física (data/intervalo no perfil + faixa no placeholder do Hoje).
// Hoje (registo/água), Treino e Progresso completos ficam para as
// fases seguintes.
// ══════════════════════════════════════════════════════════════════

var FI_COR = '#1E8E3E';
var FI_BUCKET = 'fitness-fotos';
var FI_CSS = '' +
  '.fi-app{--fi-fundo:#F7FAF7;--fi-cartao:#FFFFFF;--fi-borda:#DCE8DC;--fi-texto:#132116;--fi-texto2:#4B5D4E;--fi-verde:#1E8E3E;--fi-verde-texto:#FFFFFF;--fi-vermelho:#DC2626;--fi-amarelo:#B45309;' +
  'background:var(--fi-fundo);color:var(--fi-texto);min-height:100vh;padding-bottom:86px;' +
  'font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
  '.fi-app.fi-dark{--fi-fundo:#0B140D;--fi-cartao:#121D14;--fi-borda:#213424;--fi-texto:#E6F1E8;--fi-texto2:#93A895;--fi-verde:#34C759;--fi-verde-texto:#04140B;--fi-vermelho:#F87171;--fi-amarelo:#FBBF24}' +
  '.fi-card{background:var(--fi-cartao);border-radius:16px;border:1px solid var(--fi-borda);padding:14px}' +
  '.fi-input{width:100%;box-sizing:border-box;background:var(--fi-cartao);border:1px solid var(--fi-borda);color:var(--fi-texto);border-radius:10px;padding:10px 12px;font-size:14px}' +
  '.fi-btn{background:var(--fi-cartao);color:var(--fi-texto);border:1px solid var(--fi-borda);border-radius:10px;padding:10px 14px;font-size:13px;font-weight:800;cursor:pointer}' +
  '.fi-app button:not([class]){color:var(--fi-texto)}' +
  '.fi-btn-ativo{background:var(--fi-verde);color:var(--fi-verde-texto);border-color:var(--fi-verde)}' +
  '.fi-btn-perigo{background:var(--fi-vermelho);color:#fff;border-color:var(--fi-vermelho)}' +
  '.fi-chip{background:var(--fi-cartao);border:1px solid var(--fi-borda);color:var(--fi-texto2);border-radius:20px;padding:9px 15px;font-size:13px;font-weight:800;cursor:pointer;text-align:left}' +
  '.fi-chip.fi-chip-ativo{background:var(--fi-verde);color:var(--fi-verde-texto);border-color:var(--fi-verde)}' +
  '.fi-plano-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}' +
  '.fi-plano-fila{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:4px}' +
  '.fi-plano-fila::-webkit-scrollbar{display:none;height:0}' +
  '.fi-plano-col{min-width:0;align-self:start;flex:0 0 88%;scroll-snap-align:start}' +
  '@media (min-width:700px){.fi-plano-col{flex:0 0 calc(50% - 7px)}}' +
  '@media (min-width:1100px){' +
  '.fi-plano-chips{display:none}' +
  '.fi-plano-fila{display:grid;grid-template-columns:repeat(4,1fr);overflow-x:visible;scroll-snap-type:none;padding-bottom:0}' +
  '.fi-plano-col{scroll-snap-align:none}' +
  '}' +
  '.fi-plano-col-btns{display:flex;flex-wrap:wrap;gap:8px}' +
  '.fi-plano-col-btns>.fi-btn{flex:1 1 140px}';

function fiTemaEscuro() { return T.bg === T_DARK.bg; }

// ── Opções de perfil (labels amigáveis) ─────────────────────────────
var FI_ATIVIDADE_OPTS = [
  { v: 1.2, label: 'Sedentário', desc: 'trabalho sentado, pouco movimento' },
  { v: 1.375, label: 'Leve', desc: 'algum movimento no dia' },
  { v: 1.55, label: 'Moderada', desc: 'de pé / a andar grande parte do dia de trabalho' },
  { v: 1.725, label: 'Muito ativo', desc: 'trabalho físico pesado ou treino diário' }
];
var FI_OBJETIVO_OPTS = [
  { v: 'perder', label: 'Perder peso', emoji: '📉' },
  { v: 'manter', label: 'Manter peso', emoji: '⚖️' },
  { v: 'ganhar', label: 'Ganhar peso', emoji: '📈' }
];
var FI_RITMO_OPTS = [
  { v: 'ligeiro', label: 'Ligeiro', desc: '−15% · menos fome, mais lento' },
  { v: 'normal', label: 'Normal', desc: '−20%' },
  { v: 'rapido', label: 'Rápido', desc: '−25% · mais difícil' }
];
var FI_DIVISAO_DEFAULT = {
  1: [100], 2: [50, 50], 3: [30, 40, 30], 4: [25, 30, 15, 30],
  5: [20, 10, 30, 10, 30], 6: [20, 10, 25, 10, 25, 10]
};
var FI_MIN_KCAL = { homem: 1500, mulher: 1200 };
var FI_RITMO_PCT = { ligeiro: -0.15, normal: -0.20, rapido: -0.25 };

// ── Cálculo (funções puras) ─────────────────────────────────────────
function fiCalcularIdade(dataNasc) {
  if (!dataNasc) return null;
  var hoje = new Date();
  var nasc = new Date(dataNasc);
  var idade = hoje.getFullYear() - nasc.getFullYear();
  var m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}
// Mifflin-St Jeor
function fiBMR(sexo, pesoKg, alturaCm, idade) {
  var base = 10 * pesoKg + 6.25 * alturaCm - 5 * idade;
  return sexo === 'homem' ? base + 5 : base - 161;
}
function fiTDEE(bmr, atividade) { return bmr * atividade; }
// perder: ligeiro -15% / normal -20% / rapido -25% (nunca mais); manter 0%; ganhar +10%.
// Mínimo de segurança 1500 kcal homem / 1200 mulher — nunca abaixo disso.
function fiMetaCalculada(tdee, objetivo, ritmo, sexo) {
  var pct = 0;
  if (objetivo === 'perder') pct = FI_RITMO_PCT[ritmo] || FI_RITMO_PCT.normal;
  else if (objetivo === 'ganhar') pct = 0.10;
  var metaBruta = Math.round(tdee * (1 + pct));
  var minimo = FI_MIN_KCAL[sexo] || FI_MIN_KCAL.mulher;
  var avisoMinimo = metaBruta < minimo;
  return { kcal: avisoMinimo ? minimo : metaBruta, avisoMinimo: avisoMinimo, tdee: Math.round(tdee) };
}
// Meta ativa: se usar_coach=true e houver kcal_coach, é essa; senão a calculada.
// Devolve sempre os dois, para mostrar "Calculado: X · Coach: Y" lado a lado.
function fiMetaAtiva(perfil, pesoAtual) {
  var calculado = null;
  if (perfil && perfil.sexo && perfil.data_nasc && perfil.altura_cm && pesoAtual && perfil.atividade && perfil.objetivo) {
    var idade = fiCalcularIdade(perfil.data_nasc);
    var bmr = fiBMR(perfil.sexo, pesoAtual, perfil.altura_cm, idade);
    var tdee = fiTDEE(bmr, perfil.atividade);
    calculado = Object.assign({ bmr: Math.round(bmr) }, fiMetaCalculada(tdee, perfil.objetivo, perfil.ritmo, perfil.sexo));
  }
  var usarCoach = !!(perfil && perfil.usar_coach && perfil.kcal_coach);
  var ativa = usarCoach ? perfil.kcal_coach : (calculado ? calculado.kcal : null);
  return { calculado: calculado, coach: (perfil && perfil.kcal_coach) || null, usarCoach: usarCoach, ativa: ativa };
}
// Cálculo passo a passo para o cartão META DIÁRIA (só quando "calculado"
// existe, ou seja, quando há sexo/idade/altura/peso/atividade/objetivo).
// deficitCalc/deficitEmUso positivos = défice; negativos = superávit.
// ritmoSemanal em kg/semana (regra défice diário × 7 / 7700), positivo =
// perda, negativo = ganho. metaPesoInfo só é calculado com peso_meta.
function fiExplicacaoMeta(calculado, metaAtiva, pesoAtual, pesoMeta) {
  if (!calculado) return null;
  var manutencao = calculado.tdee;
  var metaCalc = calculado.kcal;
  var deficitCalc = manutencao - metaCalc;
  var deficitCalcPct = manutencao > 0 ? (deficitCalc / manutencao * 100) : 0;
  var ritmoSemanal = (deficitCalc * 7) / 7700;
  var metaPesoInfo = null;
  if (pesoMeta != null && pesoAtual != null) {
    if (pesoMeta >= pesoAtual) metaPesoInfo = { estado: 'atingida_ou_acima' };
    else if (ritmoSemanal > 0) metaPesoInfo = { estado: 'previsao', semanas: Math.ceil((pesoAtual - pesoMeta) / ritmoSemanal) };
    else metaPesoInfo = { estado: 'sem_previsao' };
  }
  var deficitEmUso = null, deficitEmUsoPct = null;
  if (metaAtiva != null && manutencao > 0) {
    deficitEmUso = manutencao - metaAtiva;
    deficitEmUsoPct = deficitEmUso / manutencao * 100;
  }
  return {
    bmr: calculado.bmr, manutencao: manutencao, metaCalc: metaCalc,
    deficitCalc: deficitCalc, deficitCalcPct: deficitCalcPct,
    ritmoSemanal: ritmoSemanal, metaPesoInfo: metaPesoInfo,
    deficitEmUsoPct: deficitEmUsoPct,
    avisoDeficitAlto: deficitEmUsoPct != null && deficitEmUsoPct > 25
  };
}
function fiProteinaAlvo(protGKg, pesoKg) {
  if (!protGKg || !pesoKg) return null;
  return Math.round(protGKg * pesoKg);
}
// Resto das kcal (depois da proteína) dividido 50/50 entre HC e gordura — só referência.
function fiMacrosReferencia(kcalMeta, protG) {
  if (!kcalMeta || protG == null) return null;
  var kcalProt = protG * 4;
  var kcalResto = Math.max(0, kcalMeta - kcalProt);
  return { prot_g: protG, hc_g: Math.round(kcalResto / 2 / 4), gord_g: Math.round(kcalResto / 2 / 9) };
}
function fiSomaPct(refeicoes) {
  var soma = refeicoes.reduce(function (s, r) { return s + Number(r.pct || 0); }, 0);
  return Math.round(soma * 100) / 100;
}
// Gramas de uma opção para bater a kcal alvo T da refeição:
// F = kcal dos itens não-ajustáveis; S = kcal dos ajustáveis em gramas_base;
// fator = (T-F)/S, limitado a 0.5–2.0; gramas = gramas_base × fator, a 5 g.
function fiCalcularGramasOpcao(itens, alimentosPorId, kcalAlvoRefeicao) {
  var F = 0, S = 0;
  itens.forEach(function (it) {
    var al = alimentosPorId[it.alimento_id];
    if (!al) return;
    var kcalItem = (al.kcal_100 / 100) * it.gramas_base;
    if (it.ajustavel === false) F += kcalItem; else S += kcalItem;
  });
  var temItens = itens.some(function (it) { return !!alimentosPorId[it.alimento_id]; });
  var fatorBruto = S > 0 ? (kcalAlvoRefeicao - F) / S : 1;
  var fator = Math.max(0.5, Math.min(2.0, fatorBruto));
  // Opção sem itens (ou sem nenhum item com alimento válido) não tem nada
  // para avisar — o aviso só existe quando há de facto itens a comparar.
  // Sem itens ajustáveis (S=0) não há fator para desviar — o aviso passa a
  // olhar se os itens fixos (F) já se afastam de mais de 15% da kcal alvo T.
  var avisoFora = !temItens ? false : (S > 0
    ? (fatorBruto < 0.5 || fatorBruto > 2.0)
    : (kcalAlvoRefeicao > 0 ? (Math.abs(F - kcalAlvoRefeicao) / kcalAlvoRefeicao > 0.15) : F > 0));
  var itensCalc = itens.map(function (it) {
    var al = alimentosPorId[it.alimento_id];
    if (!al) return null;
    var gramas = it.ajustavel === false ? it.gramas_base : Math.round((it.gramas_base * fator) / 5) * 5;
    return {
      id: it.id, alimento_id: it.alimento_id, nome: al.nome, ajustavel: it.ajustavel !== false,
      gramas: gramas,
      kcal: (al.kcal_100 / 100) * gramas, prot: (al.prot_100 / 100) * gramas,
      hc: (al.hc_100 / 100) * gramas, gord: (al.gord_100 / 100) * gramas,
      unidades: al.g_unidade ? Math.round((gramas / al.g_unidade) * 10) / 10 : null,
      unidade_nome: al.unidade_nome,
      medida: al.medida === 'ml' ? 'ml' : 'g',
      nota: it.nota || null
    };
  }).filter(Boolean);
  var totais = itensCalc.reduce(function (acc, it) {
    acc.kcal += it.kcal; acc.prot += it.prot; acc.hc += it.hc; acc.gord += it.gord; return acc;
  }, { kcal: 0, prot: 0, hc: 0, gord: 0 });
  return { fator: Math.round(fator * 100) / 100, avisoFora: avisoFora, itens: itensCalc, totais: totais };
}
function fiFmtKcal(n) { return n == null ? '—' : Math.round(n) + ' kcal'; }
function fiFmtG(n) { return n == null ? '—' : Math.round(n) + ' g'; }
// "N kcal · P N g · HC N g · G N g" para uma quantidade — valor por 100
// × quantidade ÷ 100, kcal a inteiro, macros a 1 casa decimal. Usado na
// linha só-de-leitura de cada ingrediente da pré-visualização da IA.
function fiFmtParaQtd(kcal100, prot100, hc100, gord100, qtd) {
  var k = (parseFloat(kcal100) || 0) * qtd / 100;
  var p = (parseFloat(prot100) || 0) * qtd / 100;
  var h = (parseFloat(hc100) || 0) * qtd / 100;
  var g = (parseFloat(gord100) || 0) * qtd / 100;
  return Math.round(k) + ' kcal · P ' + (Math.round(p * 10) / 10) + ' g · HC ' + (Math.round(h * 10) / 10) + ' g · G ' + (Math.round(g * 10) / 10) + ' g';
}
// Quais dos 4 campos por 100 (kcal/prot/hc/gord) de um ingrediente da
// pré-visualização da IA estão em falta ou inválidos — usado para abrir
// o cartão sozinho e marcar o campo a vermelho.
function fiIngredienteValoresInvalidos(ing) {
  var inv = {};
  var k = parseFloat(ing.kcal_100);
  if (ing.kcal_100 === '' || ing.kcal_100 == null || isNaN(k) || k < 0 || k > 900) inv.kcal_100 = true;
  var p = parseFloat(ing.prot_100);
  if (ing.prot_100 === '' || ing.prot_100 == null || isNaN(p) || p < 0) inv.prot_100 = true;
  var h = parseFloat(ing.hc_100);
  if (ing.hc_100 === '' || ing.hc_100 == null || isNaN(h) || h < 0) inv.hc_100 = true;
  var g = parseFloat(ing.gord_100);
  if (ing.gord_100 === '' || ing.gord_100 == null || isNaN(g) || g < 0) inv.gord_100 = true;
  return inv;
}
// Erro de uma chamada a functions.invoke — a mesma forma usada no resto
// da suite (ver fnErr em src/10-shell.js), só que aqui como função de
// módulo porque este ficheiro não tem acesso àquele closure.
function fiFnErr(res) {
  if (res && res.error) return res.error.message || 'Erro desconhecido';
  if (res && res.data && res.data.error) return res.data.error;
  return null;
}
// Valida/normaliza a altura escrita no assistente e no editor de perfil.
// Só aceita 100–250 cm; um valor < 3 é lido como metros (ex.: 1.73) e
// convertido para cm (×100). Devolve { cm, convertido, erro } — cm fica
// null quando há erro ou o campo está vazio (erro só quando o campo TEM
// texto mas fica fora do intervalo depois de convertido).
function fiValidarAltura(valorStr) {
  if (valorStr === '' || valorStr == null) return { cm: null, convertido: false, erro: null };
  var n = parseFloat(valorStr);
  if (isNaN(n)) return { cm: null, convertido: false, erro: null };
  var convertido = n > 0 && n < 3;
  var cm = convertido ? Math.round(n * 100) : n;
  if (cm < 100 || cm > 250) return { cm: null, convertido: false, erro: 'A altura tem de estar entre 100 e 250 cm.' };
  return { cm: cm, convertido: convertido, erro: null };
}
// dataISO "YYYY-MM-DD" + dias -> nova data ISO "YYYY-MM-DD" (usada
// para prox_avaliacao = data da avaliação + intervalo_avaliacao_dias).
function fiSomarDias(dataISO, dias) {
  var d = new Date(dataISO + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}
function fiFmtDataCurta(dataISO) {
  if (!dataISO) return '—';
  var p = dataISO.split('-');
  return p[2] + '-' + p[1] + '-' + p[0];
}
// Dias inteiros entre hoje e dataISO (negativo se já passou).
function fiDiasAte(dataISO) {
  var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  var alvo = new Date(dataISO + 'T00:00:00');
  return Math.round((alvo - hoje) / 86400000);
}

// ── Open Food Facts (pesquisa pública, sem chave) ───────────────────
function fiBuscarOFF(query) {
  var url = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(query) + '&search_simple=1&action=process&json=1&page_size=12';
  return fetch(url).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (data) {
    return (data.products || []).map(function (p) {
      var n = p.nutriments || {};
      return {
        nome: p.product_name || p.generic_name || '(sem nome)',
        kcal_100: n['energy-kcal_100g'] != null ? Math.round(n['energy-kcal_100g']) : null,
        prot_100: n['proteins_100g'] != null ? Math.round(n['proteins_100g'] * 10) / 10 : null,
        hc_100: n['carbohydrates_100g'] != null ? Math.round(n['carbohydrates_100g'] * 10) / 10 : null,
        gord_100: n['fat_100g'] != null ? Math.round(n['fat_100g'] * 10) / 10 : null,
        off_code: p.code || null
      };
    }).filter(function (p) { return p.kcal_100 != null; });
  });
}

// Comprime uma foto (do telemóvel) para no máximo maxLado px no lado
// maior, JPEG qualidade 0.7 — devolve um Blob pronto a enviar para o
// Storage. Nunca guardamos base64 na base de dados, só o caminho.
function fiComprimirFoto(file, maxLado) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height;
        if (w > h) { if (w > maxLado) { h = Math.round(h * maxLado / w); w = maxLado; } }
        else if (h > maxLado) { w = Math.round(w * maxLado / h); h = maxLado; }
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(function (blob) {
          if (!blob) { reject(new Error('Falha ao comprimir a foto.')); return; }
          resolve(blob);
        }, 'image/jpeg', 0.7);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Pequenas peças ──────────────────────────────────────────────
function FiCard(p) { return React.createElement('div', { className: 'fi-card', style: p.style }, p.children); }
function FiLabel(p) { return React.createElement('p', { style: Object.assign({ fontSize: 11, fontWeight: 800, color: 'var(--fi-texto2)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 6px' }, p.style) }, p.children); }
// Botões "← Voltar / Seguinte →" do assistente — componente ao nível
// do módulo (nunca dentro de FitnessApp: um componente redefinido a
// cada render perde o estado/foco dos filhos, era a causa do bug de
// digitação já visto noutra app).
function FiAssistNav(p) {
  return React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 18 } },
    p.mostrarVoltar && React.createElement('button', { className: 'fi-btn', style: { flex: 1 }, onClick: p.onVoltar }, '← Voltar'),
    React.createElement('button', { className: 'fi-btn fi-btn-ativo', style: { flex: 2 }, disabled: p.disabled, onClick: p.onNext }, p.label || 'Seguinte →')
  );
}
function fiAlimentoVazio() { return { nome: '', categoria: '', medida: 'g', kcal_100: '', prot_100: '', hc_100: '', gord_100: '', unidade_nome: '', g_unidade: '' }; }

// ── App principal (todo o estado aqui) ───────────────────────────
function FitnessApp(props) {
  var onBack = props.onBack, userProfile = props.profile;
  var db = window.supabaseClient;

  var _s1 = React.useState(true); var loading = _s1[0], setLoading = _s1[1];
  var _s2 = React.useState(null); var erro = _s2[0], setErro = _s2[1];
  var _s3 = React.useState('plano'); var tab = _s3[0], setTab = _s3[1]; // hoje|plano|treino|progresso|mais
  var _s4 = React.useState('menu'); var maisView = _s4[0], setMaisView = _s4[1]; // menu|alimentos|perfil

  var _s5 = React.useState(null); var perfil = _s5[0], setPerfil = _s5[1];
  var _s6 = React.useState([]); var refeicoes = _s6[0], setRefeicoes = _s6[1];
  var _s7 = React.useState([]); var opcoes = _s7[0], setOpcoes = _s7[1];
  var _s8 = React.useState([]); var itens = _s8[0], setItens = _s8[1];
  var _s9 = React.useState([]); var alimentos = _s9[0], setAlimentos = _s9[1];
  var _s10 = React.useState(null); var ultimaAvaliacao = _s10[0], setUltimaAvaliacao = _s10[1];

  // Assistente (primeira abertura, sem perfil ainda)
  var _s11 = React.useState(0); var assistStep = _s11[0], setAssistStep = _s11[1];
  var _s12 = React.useState({ sexo: 'homem', data_nasc: '', altura_cm: '', peso: '', atividade: 1.375, objetivo: 'manter', ritmo: 'normal', n_refeicoes: 3, prot_g_kg: 1.8, agua_l: 3, peso_meta: '', usar_coach: false, kcal_coach: '', intervalo_avaliacao_dias: 14 });
  var assistForm = _s12[0], setAssistForm = _s12[1];
  var _s13 = React.useState(false); var assistSaving = _s13[0], setAssistSaving = _s13[1];

  // Editor de perfil (Mais → Perfil)
  var _s14 = React.useState(false); var perfEditAberto = _s14[0], setPerfEditAberto = _s14[1];
  var _s15 = React.useState(null); var perfForm = _s15[0], setPerfForm = _s15[1];
  var _s16 = React.useState(false); var perfSaving = _s16[0], setPerfSaving = _s16[1];
  var _s17 = React.useState([]); var refeicoesParaConfirmar = _s17[0], setRefeicoesParaConfirmar = _s17[1];

  // Alimentos
  var _s18 = React.useState(''); var alimQuery = _s18[0], setAlimQuery = _s18[1];
  var _s19 = React.useState(false); var alimFormAberto = _s19[0], setAlimFormAberto = _s19[1];
  var _s20 = React.useState(null); var alimEditandoId = _s20[0], setAlimEditandoId = _s20[1];
  var _s21 = React.useState(fiAlimentoVazio()); var alimForm = _s21[0], setAlimForm = _s21[1];
  var _s22 = React.useState(false); var alimSaving = _s22[0], setAlimSaving = _s22[1];
  var _s23 = React.useState(null); var confirmApagarAlimento = _s23[0], setConfirmApagarAlimento = _s23[1];
  var _s24 = React.useState(''); var offQuery = _s24[0], setOffQuery = _s24[1];
  var _s25 = React.useState(false); var offBusy = _s25[0], setOffBusy = _s25[1];
  var _s26 = React.useState(null); var offErro = _s26[0], setOffErro = _s26[1];
  var _s27 = React.useState([]); var offResultados = _s27[0], setOffResultados = _s27[1];

  // Plano — refeições
  var _s28 = React.useState(null); var refEditandoId = _s28[0], setRefEditandoId = _s28[1];
  var _s29 = React.useState({ nome: '', pct: '' }); var refForm = _s29[0], setRefForm = _s29[1];
  var _s30 = React.useState(null); var refErro = _s30[0], setRefErro = _s30[1];
  // Plano — opções
  var _s31 = React.useState(null); var opcaoRefeicaoAberta = _s31[0], setOpcaoRefeicaoAberta = _s31[1]; // id da refeição com form de nova opção aberto
  var _s32 = React.useState(''); var opcaoNomeForm = _s32[0], setOpcaoNomeForm = _s32[1];
  var _s33 = React.useState(null); var opcaoEditandoId = _s33[0], setOpcaoEditandoId = _s33[1];
  var _s34 = React.useState(null); var confirmApagarOpcao = _s34[0], setConfirmApagarOpcao = _s34[1];
  // Plano — itens de uma opção
  var _s35 = React.useState(null); var itemOpcaoAberta = _s35[0], setItemOpcaoAberta = _s35[1]; // id da opção com form de novo item aberto
  var _s36 = React.useState({ alimento_id: '', gramas_base: '', ajustavel: true, nota: '' }); var itemForm = _s36[0], setItemForm = _s36[1];
  var _s37 = React.useState(null); var itemEditandoId = _s37[0], setItemEditandoId = _s37[1];
  var _s38 = React.useState(null); var confirmApagarItem = _s38[0], setConfirmApagarItem = _s38[1];
  // Plano — vista "Receita" de uma opção
  var _s39 = React.useState(null); var receitaOpcaoId = _s39[0], setReceitaOpcaoId = _s39[1];
  var _s40 = React.useState('porcoes'); var receitaModo = _s40[0], setReceitaModo = _s40[1]; // porcoes|gramas, só em memória
  var _s41 = React.useState(null); var receitaFotoUrl = _s41[0], setReceitaFotoUrl = _s41[1];
  var _s42 = React.useState(false); var receitaFotoBusy = _s42[0], setReceitaFotoBusy = _s42[1];
  // Receita — "Como se faz" (preparo), editável e apagável
  var _s43 = React.useState(false); var preparoEditAberto = _s43[0], setPreparoEditAberto = _s43[1];
  var _s44 = React.useState(''); var preparoForm = _s44[0], setPreparoForm = _s44[1];
  // Plano — "Adicionar prato por nome" (IA)
  var _s45 = React.useState(null); var iaRefeicaoAberta = _s45[0], setIaRefeicaoAberta = _s45[1];
  var _s46 = React.useState({ nome: '', notas: '' }); var iaForm = _s46[0], setIaForm = _s46[1];
  var _s47 = React.useState(false); var iaBusy = _s47[0], setIaBusy = _s47[1];
  var _s48 = React.useState(null); var iaErro = _s48[0], setIaErro = _s48[1];
  var _s49 = React.useState(null); var iaPreview = _s49[0], setIaPreview = _s49[1];
  var _s50 = React.useState(false); var iaSaving = _s50[0], setIaSaving = _s50[1];
  var _s51 = React.useState(null); var iaSaveErro = _s51[0], setIaSaveErro = _s51[1];
  var _s52 = React.useState(false); var iaPreparoAberto = _s52[0], setIaPreparoAberto = _s52[1]; // secção "Como se faz", fechada por defeito
  var iaCancelRef = React.useRef(0);

  function carregar() {
    if (!db) { setLoading(false); setErro('Sem ligação à base de dados.'); return; }
    setLoading(true);
    Promise.all([
      db.from('fitness_perfil').select('*').maybeSingle(),
      db.from('fitness_refeicoes').select('*').order('ordem', { ascending: true }),
      db.from('fitness_opcoes').select('*').order('ordem', { ascending: true }),
      db.from('fitness_opcao_itens').select('*'),
      db.from('fitness_alimentos').select('*').order('nome', { ascending: true }),
      db.from('fitness_avaliacoes').select('*').order('data', { ascending: false }).limit(1)
    ]).then(function (res) {
      var perfilRes = res[0], refRes = res[1], opcRes = res[2], itRes = res[3], alRes = res[4], avRes = res[5];
      if (perfilRes.error) { console.error('[fitness] carregar perfil:', perfilRes.error); window.mostrarErro('Fitness', perfilRes.error); }
      if (refRes.error) { console.error('[fitness] carregar refeições:', refRes.error); window.mostrarErro('Fitness', refRes.error); }
      if (opcRes.error) { console.error('[fitness] carregar opções:', opcRes.error); window.mostrarErro('Fitness', opcRes.error); }
      if (itRes.error) { console.error('[fitness] carregar itens:', itRes.error); window.mostrarErro('Fitness', itRes.error); }
      if (alRes.error) { console.error('[fitness] carregar alimentos:', alRes.error); window.mostrarErro('Fitness', alRes.error); }
      if (avRes.error) { console.error('[fitness] carregar avaliações:', avRes.error); window.mostrarErro('Fitness', avRes.error); }
      setPerfil(perfilRes.data || null);
      setRefeicoes(refRes.data || []);
      setOpcoes(opcRes.data || []);
      setItens(itRes.data || []);
      setAlimentos(alRes.data || []);
      setUltimaAvaliacao((avRes.data && avRes.data[0]) || null);
      setErro(null);
      setLoading(false);
    }).catch(function (e) {
      console.error('[fitness] carregar:', e);
      setErro('Falha ao carregar: ' + (e && e.message ? e.message : e));
      setLoading(false);
      window.mostrarErro('Fitness', e);
    });
  }
  React.useEffect(function () { carregar(); }, []);
  React.useEffect(function () { return window.csAoVoltarRede(function () { carregar(); }); }, []);

  var alimentosPorId = React.useMemo(function () {
    var m = {};
    alimentos.forEach(function (a) { m[a.id] = a; });
    return m;
  }, [alimentos]);
  var alimentosPorNome = React.useMemo(function () {
    var m = {};
    alimentos.forEach(function (a) { m[a.nome.toLowerCase().trim()] = a; });
    return m;
  }, [alimentos]);

  var pesoAtual = ultimaAvaliacao ? ultimaAvaliacao.peso : null;
  var meta = fiMetaAtiva(perfil, pesoAtual);
  var protAlvo = perfil ? fiProteinaAlvo(perfil.prot_g_kg, pesoAtual) : null;
  var macrosRef = meta.ativa != null ? fiMacrosReferencia(meta.ativa, protAlvo || 0) : null;
  var explicacao = fiExplicacaoMeta(meta.calculado, meta.ativa, pesoAtual, perfil ? perfil.peso_meta : null);

  // Plano — fila horizontal das refeições (scroll-snap no telemóvel/
  // tablet, grelha de 4 no PC) + chips de navegação. Hooks ao nível do
  // módulo do componente (nunca dentro de renderPlano) para não partir
  // a ordem dos hooks quando o separador muda.
  var ordenadas = React.useMemo(function () {
    return refeicoes.slice().sort(function (a, b) { return a.ordem - b.ordem; });
  }, [refeicoes]);
  var _s53 = React.useState(null); var refeicaoAtivaId = _s53[0], setRefeicaoAtivaId = _s53[1];
  var filaRef = React.useRef(null);
  var planoColRefs = React.useRef({});
  React.useEffect(function () {
    var container = filaRef.current;
    if (!container || typeof IntersectionObserver !== 'function') return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          var id = entry.target.getAttribute('data-refeicao-id');
          if (id) setRefeicaoAtivaId(id);
        }
      });
    }, { root: container, threshold: [0, 0.6, 1] });
    ordenadas.forEach(function (r) {
      var el = planoColRefs.current[r.id];
      if (el) observer.observe(el);
    });
    return function () { observer.disconnect(); };
  }, [ordenadas, tab, receitaOpcaoId, iaPreview]);
  // Scroll suave até à refeição clicada no chip — só horizontal
  // (scrollIntoView com inline/block escolhidos para nunca mexer no
  // scroll vertical da página).
  function irParaRefeicao(id) {
    var el = planoColRefs.current[id];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ASSISTENTE (primeira abertura)
  // ══════════════════════════════════════════════════════════════
  function assistDefinir(campo, valor) { setAssistForm(function (f) { return Object.assign({}, f, campo); }); }
  function assistCampo(nome, valor) { setAssistForm(function (f) { var n = {}; n[nome] = valor; return Object.assign({}, f, n); }); }

  function assistConcluir() {
    setAssistSaving(true);
    var pesoNum = parseFloat(assistForm.peso);
    var temPeso = !isNaN(pesoNum) && pesoNum > 0;
    var hojeIso = new Date().toISOString().slice(0, 10);
    var intervaloNum = parseInt(assistForm.intervalo_avaliacao_dias, 10) || 14;
    var payload = {
      sexo: assistForm.sexo, data_nasc: assistForm.data_nasc || null,
      altura_cm: fiValidarAltura(assistForm.altura_cm).cm,
      atividade: assistForm.atividade, objetivo: assistForm.objetivo,
      ritmo: assistForm.objetivo === 'perder' ? assistForm.ritmo : null,
      n_refeicoes: assistForm.n_refeicoes, prot_g_kg: parseFloat(assistForm.prot_g_kg) || 1.8,
      agua_l: parseFloat(assistForm.agua_l) || 3,
      peso_meta: assistForm.peso_meta ? parseFloat(assistForm.peso_meta) : null,
      usar_coach: !!assistForm.usar_coach,
      kcal_coach: assistForm.usar_coach && assistForm.kcal_coach ? parseFloat(assistForm.kcal_coach) : null,
      intervalo_avaliacao_dias: intervaloNum,
      // A avaliação inicial (se houver peso) é gravada com a data de hoje — a
      // próxima já fica agendada sozinha, como acontece sempre que se grava
      // uma avaliação nova (ver o mesmo cálculo em fiSomarDias).
      prox_avaliacao: temPeso ? fiSomarDias(hojeIso, intervaloNum) : null
    };
    db.from('fitness_perfil').insert(payload).select().then(function (res) {
      if (res.error) { setAssistSaving(false); setErro('Falha ao guardar perfil: ' + res.error.message); console.error('[fitness] assistente perfil:', res.error); window.mostrarErro('Fitness', res.error); return; }
      var tarefas = [];
      if (temPeso) {
        tarefas.push(db.from('fitness_avaliacoes').insert({ data: hojeIso, peso: pesoNum }));
      }
      var divisao = FI_DIVISAO_DEFAULT[assistForm.n_refeicoes] || FI_DIVISAO_DEFAULT[3];
      divisao.forEach(function (pct, i) {
        tarefas.push(db.from('fitness_refeicoes').insert({ ordem: i + 1, nome: (i + 1) + '.ª refeição', pct: pct }));
      });
      Promise.all(tarefas).then(function (resultados) {
        var falha = resultados.filter(function (r) { return r && r.error; })[0];
        setAssistSaving(false);
        if (falha) { console.error('[fitness] assistente (refeições/avaliação):', falha.error); window.mostrarErro('Fitness', falha.error); }
        carregar();
      }).catch(function (e) {
        setAssistSaving(false);
        console.error('[fitness] assistente (refeições/avaliação):', e);
        window.mostrarErro('Fitness', e);
        carregar();
      });
    }).catch(function (e) {
      setAssistSaving(false);
      console.error('[fitness] assistente perfil:', e);
      setErro('Falha ao guardar perfil.');
      window.mostrarErro('Fitness', e);
    });
  }

  function renderAssistente() {
    var passos = ['Dados pessoais', 'Atividade', 'Objetivo', 'Refeições', 'Meta & água'];
    function assistVoltar() { setAssistStep(assistStep - 1); }
    var body;
    if (assistStep === 0) {
      var alturaInfoAssist = fiValidarAltura(assistForm.altura_cm);
      body = React.createElement(React.Fragment, null,
        React.createElement(FiLabel, null, 'Sexo'),
        React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 14 } },
          ['homem', 'mulher'].map(function (s) {
            return React.createElement('button', { key: s, className: 'fi-chip' + (assistForm.sexo === s ? ' fi-chip-ativa' : ''), style: { flex: 1, background: assistForm.sexo === s ? FI_COR : undefined, color: assistForm.sexo === s ? '#fff' : undefined, borderColor: assistForm.sexo === s ? FI_COR : undefined }, onClick: function () { assistCampo('sexo', s); } }, s === 'homem' ? 'Homem' : 'Mulher');
          })
        ),
        React.createElement(FiLabel, null, 'Data de nascimento'),
        React.createElement('input', { type: 'date', className: 'fi-input', autoComplete: 'off', value: assistForm.data_nasc, onChange: function (e) { assistCampo('data_nasc', e.target.value); }, style: { marginBottom: 14 } }),
        React.createElement(FiLabel, null, 'Altura (cm)'),
        React.createElement('input', { type: 'number', className: 'fi-input', autoComplete: 'off', value: assistForm.altura_cm, onChange: function (e) { assistCampo('altura_cm', e.target.value); }, style: { marginBottom: alturaInfoAssist.erro || alturaInfoAssist.convertido ? 4 : 14 } }),
        alturaInfoAssist.erro && React.createElement('p', { style: { fontSize: 11, color: 'var(--fi-vermelho)', margin: '0 0 10px', fontWeight: 700 } }, '⚠️ ' + alturaInfoAssist.erro),
        alturaInfoAssist.convertido && React.createElement('p', { style: { fontSize: 11, color: 'var(--fi-texto2)', margin: '0 0 10px' } }, 'Convertido para ' + alturaInfoAssist.cm + ' cm'),
        React.createElement(FiLabel, null, 'Peso atual (kg)'),
        React.createElement('input', { type: 'number', step: '0.1', className: 'fi-input', autoComplete: 'off', value: assistForm.peso, onChange: function (e) { assistCampo('peso', e.target.value); } }),
        React.createElement(FiAssistNav, { mostrarVoltar: assistStep > 0, onVoltar: assistVoltar, onNext: function () { setAssistStep(1); }, disabled: !assistForm.data_nasc || !assistForm.altura_cm || !assistForm.peso || !!alturaInfoAssist.erro })
      );
    } else if (assistStep === 1) {
      body = React.createElement(React.Fragment, null,
        React.createElement(FiLabel, null, 'Nível de atividade'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          FI_ATIVIDADE_OPTS.map(function (o) {
            var sel = assistForm.atividade === o.v;
            return React.createElement('button', { key: o.v, className: 'fi-chip', style: { background: sel ? FI_COR : undefined, color: sel ? '#fff' : undefined, borderColor: sel ? FI_COR : undefined }, onClick: function () { assistCampo('atividade', o.v); } },
              React.createElement('div', { style: { fontWeight: 800 } }, o.label),
              React.createElement('div', { style: { fontSize: 11, opacity: 0.85, fontWeight: 600 } }, o.desc)
            );
          })
        ),
        React.createElement(FiAssistNav, { mostrarVoltar: assistStep > 0, onVoltar: assistVoltar, onNext: function () { setAssistStep(2); } })
      );
    } else if (assistStep === 2) {
      body = React.createElement(React.Fragment, null,
        React.createElement(FiLabel, null, 'Objetivo'),
        React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 14 } },
          FI_OBJETIVO_OPTS.map(function (o) {
            var sel = assistForm.objetivo === o.v;
            return React.createElement('button', { key: o.v, className: 'fi-chip', style: { flex: 1, background: sel ? FI_COR : undefined, color: sel ? '#fff' : undefined, borderColor: sel ? FI_COR : undefined } , onClick: function () { assistCampo('objetivo', o.v); } }, o.emoji + ' ' + o.label);
          })
        ),
        assistForm.objetivo === 'perder' && React.createElement(React.Fragment, null,
          React.createElement(FiLabel, null, 'Ritmo'),
          React.createElement('div', { style: { display: 'flex', gap: 8 } },
            FI_RITMO_OPTS.map(function (o) {
              var sel = assistForm.ritmo === o.v;
              return React.createElement('button', { key: o.v, className: 'fi-chip', style: { flex: 1, background: sel ? FI_COR : undefined, color: sel ? '#fff' : undefined, borderColor: sel ? FI_COR : undefined }, onClick: function () { assistCampo('ritmo', o.v); } }, o.label + ' (' + o.desc + ')');
            })
          )
        ),
        React.createElement(FiAssistNav, { mostrarVoltar: assistStep > 0, onVoltar: assistVoltar, onNext: function () { setAssistStep(3); } })
      );
    } else if (assistStep === 3) {
      body = React.createElement(React.Fragment, null,
        React.createElement(FiLabel, null, 'Quantas refeições queres por dia?'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6 } },
          [1, 2, 3, 4, 5, 6].map(function (n) {
            var sel = assistForm.n_refeicoes === n;
            return React.createElement('button', { key: n, className: 'fi-chip', style: { textAlign: 'center', background: sel ? FI_COR : undefined, color: sel ? '#fff' : undefined, borderColor: sel ? FI_COR : undefined }, onClick: function () { assistCampo('n_refeicoes', n); } }, n);
          })
        ),
        React.createElement('p', { style: { fontSize: 12, color: 'var(--fi-texto2)', marginTop: 10 } }, 'Cada refeição fica com uma percentagem da meta diária (podes ajustar depois em Plano).'),
        React.createElement(FiAssistNav, { mostrarVoltar: assistStep > 0, onVoltar: assistVoltar, onNext: function () { setAssistStep(4); } })
      );
    } else {
      body = React.createElement(React.Fragment, null,
        React.createElement(FiLabel, null, 'Proteína alvo (g por kg de peso)'),
        React.createElement('input', { type: 'number', step: '0.1', className: 'fi-input', autoComplete: 'off', value: assistForm.prot_g_kg, onChange: function (e) { assistCampo('prot_g_kg', e.target.value); }, style: { marginBottom: 14 } }),
        React.createElement(FiLabel, null, 'Água (litros/dia)'),
        React.createElement('input', { type: 'number', step: '0.1', className: 'fi-input', autoComplete: 'off', value: assistForm.agua_l, onChange: function (e) { assistCampo('agua_l', e.target.value); }, style: { marginBottom: 14 } }),
        React.createElement(FiLabel, null, 'Peso meta (opcional)'),
        React.createElement('input', { type: 'number', step: '0.1', className: 'fi-input', autoComplete: 'off', value: assistForm.peso_meta, onChange: function (e) { assistCampo('peso_meta', e.target.value); }, style: { marginBottom: 14 } }),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
          React.createElement('input', { type: 'checkbox', checked: assistForm.usar_coach, onChange: function (e) { assistCampo('usar_coach', e.target.checked); } }),
          React.createElement('span', { style: { fontSize: 13, fontWeight: 700 } }, 'Usar meta do coach (em vez da calculada)')
        ),
        assistForm.usar_coach && React.createElement('input', { type: 'number', className: 'fi-input', autoComplete: 'off', placeholder: 'kcal do coach', value: assistForm.kcal_coach, onChange: function (e) { assistCampo('kcal_coach', e.target.value); }, style: { marginBottom: 6 } }),
        React.createElement(FiAssistNav, { mostrarVoltar: assistStep > 0, onVoltar: assistVoltar, label: assistSaving ? 'A guardar…' : '✓ Concluir', disabled: assistSaving, onNext: assistConcluir })
      );
    }
    return React.createElement('div', { style: { padding: 16, maxWidth: 460, margin: '0 auto' } },
      React.createElement('div', { style: { fontWeight: 900, fontSize: 20, marginBottom: 2 } }, '🥗 Carvalho Fitness'),
      React.createElement('div', { style: { fontSize: 13, color: 'var(--fi-texto2)', marginBottom: 16 } }, 'Passo ' + (assistStep + 1) + ' de 5 · ' + passos[assistStep]),
      React.createElement(FiCard, null, body)
    );
  }

  // ══════════════════════════════════════════════════════════════
  // PERFIL (Mais → Perfil)
  // ══════════════════════════════════════════════════════════════
  function abrirEditorPerfil() {
    setPerfForm({
      sexo: perfil.sexo || 'homem', data_nasc: perfil.data_nasc || '', altura_cm: perfil.altura_cm || '',
      atividade: perfil.atividade || 1.375, objetivo: perfil.objetivo || 'manter', ritmo: perfil.ritmo || 'normal',
      n_refeicoes: perfil.n_refeicoes || 3, prot_g_kg: perfil.prot_g_kg || 1.8, agua_l: perfil.agua_l || 3,
      peso_meta: perfil.peso_meta || '', usar_coach: !!perfil.usar_coach, kcal_coach: perfil.kcal_coach || '',
      prox_avaliacao: perfil.prox_avaliacao || '', intervalo_avaliacao_dias: perfil.intervalo_avaliacao_dias || 14
    });
    setRefeicoesParaConfirmar([]);
    setPerfEditAberto(true);
  }
  function perfCampo(nome, valor) { setPerfForm(function (f) { var n = {}; n[nome] = valor; return Object.assign({}, f, n); }); }

  function tentarGuardarPerfil() {
    if (fiValidarAltura(perfForm.altura_cm).erro) return;
    var newN = perfForm.n_refeicoes;
    var ordenadas = refeicoes.slice().sort(function (a, b) { return a.ordem - b.ordem; });
    var excedentes = ordenadas.slice(newN);
    var comOpcoes = excedentes.filter(function (r) { return opcoes.some(function (o) { return o.refeicao_id === r.id; }); });
    if (comOpcoes.length) { setRefeicoesParaConfirmar(comOpcoes); return; }
    finalizarGuardarPerfil(excedentes.map(function (r) { return r.id; }), ordenadas.length);
  }
  function apagarRefeicaoExcedente(r) {
    db.from('fitness_refeicoes').delete().eq('id', r.id).then(function (res) {
      if (res.error) { console.error('[fitness] apagar refeição:', res.error); window.mostrarErro('Fitness', res.error); return; }
      setRefeicoesParaConfirmar(function (atual) { return atual.filter(function (x) { return x.id !== r.id; }); });
      setRefeicoes(function (atual) { return atual.filter(function (x) { return x.id !== r.id; }); });
      setOpcoes(function (atual) { return atual.filter(function (o) { return o.refeicao_id !== r.id; }); });
    }).catch(function (e) { console.error('[fitness] apagar refeição:', e); window.mostrarErro('Fitness', e); });
  }
  function finalizarGuardarPerfil(idsParaRemover, totalAtual) {
    setPerfSaving(true);
    var payload = {
      sexo: perfForm.sexo, data_nasc: perfForm.data_nasc || null,
      altura_cm: fiValidarAltura(perfForm.altura_cm).cm,
      atividade: perfForm.atividade, objetivo: perfForm.objetivo,
      ritmo: perfForm.objetivo === 'perder' ? perfForm.ritmo : null,
      n_refeicoes: perfForm.n_refeicoes, prot_g_kg: parseFloat(perfForm.prot_g_kg) || 1.8,
      agua_l: parseFloat(perfForm.agua_l) || 3,
      peso_meta: perfForm.peso_meta ? parseFloat(perfForm.peso_meta) : null,
      usar_coach: !!perfForm.usar_coach,
      kcal_coach: perfForm.usar_coach && perfForm.kcal_coach ? parseFloat(perfForm.kcal_coach) : null,
      prox_avaliacao: perfForm.prox_avaliacao || null,
      intervalo_avaliacao_dias: parseInt(perfForm.intervalo_avaliacao_dias, 10) || 14
    };
    db.from('fitness_perfil').update(payload).eq('id', perfil.id).select().then(function (res) {
      if (res.error) { setPerfSaving(false); setErro('Falha ao guardar perfil: ' + res.error.message); console.error('[fitness] guardar perfil:', res.error); window.mostrarErro('Fitness', res.error); return; }
      var extras = [];
      if (idsParaRemover.length) extras.push(db.from('fitness_refeicoes').delete().in('id', idsParaRemover));
      var faltam = perfForm.n_refeicoes - (totalAtual - idsParaRemover.length);
      if (faltam > 0) {
        var base = totalAtual - idsParaRemover.length;
        for (var i = 0; i < faltam; i++) {
          extras.push(db.from('fitness_refeicoes').insert({ ordem: base + i + 1, nome: (base + i + 1) + '.ª refeição', pct: 0 }));
        }
      }
      Promise.all(extras).then(function (resultados) {
        var falha = resultados.filter(function (r) { return r && r.error; })[0];
        setPerfSaving(false);
        setPerfEditAberto(false);
        if (falha) { console.error('[fitness] guardar perfil (refeições):', falha.error); window.mostrarErro('Fitness', falha.error); }
        carregar();
      }).catch(function (e) { setPerfSaving(false); setPerfEditAberto(false); console.error('[fitness] guardar perfil (refeições):', e); window.mostrarErro('Fitness', e); carregar(); });
    }).catch(function (e) {
      setPerfSaving(false);
      console.error('[fitness] guardar perfil:', e);
      setErro('Falha ao guardar perfil.');
      window.mostrarErro('Fitness', e);
    });
  }

  function renderMetaResumo() {
    return React.createElement(FiCard, { style: { marginBottom: 12 } },
      React.createElement(FiLabel, null, 'Meta diária'),
      React.createElement('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap' } },
        React.createElement('div', null,
          React.createElement('div', { style: { fontSize: 11, color: 'var(--fi-texto2)', fontWeight: 700 } }, 'Calculado'),
          React.createElement('div', { style: { fontSize: 18, fontWeight: 900 } }, meta.calculado ? fiFmtKcal(meta.calculado.kcal) : '—')
        ),
        React.createElement('div', null,
          React.createElement('div', { style: { fontSize: 11, color: 'var(--fi-texto2)', fontWeight: 700 } }, 'Coach'),
          React.createElement('div', { style: { fontSize: 18, fontWeight: 900 } }, meta.coach ? fiFmtKcal(meta.coach) : '—')
        ),
        React.createElement('div', null,
          React.createElement('div', { style: { fontSize: 11, color: FI_COR, fontWeight: 800 } }, 'Em uso'),
          React.createElement('div', { style: { fontSize: 18, fontWeight: 900, color: FI_COR } }, meta.ativa ? fiFmtKcal(meta.ativa) : '— (completa o perfil)')
        )
      ),
      meta.calculado && explicacao && React.createElement('div', { style: { marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--fi-borda)', fontSize: 12.5, lineHeight: 1.9, color: 'var(--fi-texto2)' } },
        React.createElement('div', null, 'Metabolismo base (BMR): ' + fiFmtKcal(explicacao.bmr)),
        React.createElement('div', null, 'Manutenção (BMR × atividade): ' + fiFmtKcal(explicacao.manutencao)),
        React.createElement('div', null,
          explicacao.deficitCalc > 0.5
            ? 'Défice: −' + fiFmtKcal(explicacao.deficitCalc) + ' (−' + Math.round(Math.abs(explicacao.deficitCalcPct)) + '%)'
            : explicacao.deficitCalc < -0.5
              ? 'Superávit: +' + fiFmtKcal(Math.abs(explicacao.deficitCalc)) + ' (+' + Math.round(Math.abs(explicacao.deficitCalcPct)) + '%)'
              : 'Meta = manutenção'
        ),
        React.createElement('div', null, 'Meta calculada: ' + fiFmtKcal(explicacao.metaCalc)),
        React.createElement('div', null, 'Ritmo previsto: ~' + Math.abs(explicacao.ritmoSemanal).toFixed(1) + ' kg/semana' + (explicacao.ritmoSemanal > 0.05 ? ' de perda' : explicacao.ritmoSemanal < -0.05 ? ' de ganho' : ' (estável)')),
        explicacao.metaPesoInfo && React.createElement('div', null,
          explicacao.metaPesoInfo.estado === 'atingida_ou_acima'
            ? 'Peso meta já atingido ou acima do atual — revê o valor'
            : explicacao.metaPesoInfo.estado === 'previsao'
              ? 'Meta de peso em: ~' + explicacao.metaPesoInfo.semanas + ' semana' + (explicacao.metaPesoInfo.semanas === 1 ? '' : 's')
              : 'Ao ritmo atual não é possível prever quando atinges o peso meta.'
        ),
        meta.usarCoach && explicacao.manutencao > 0 && React.createElement('div', null, (function () {
          var dCoach = explicacao.manutencao - meta.coach;
          var dCoachPct = Math.round(Math.abs(dCoach / explicacao.manutencao * 100));
          return dCoach >= 0
            ? 'Coach: ' + fiFmtKcal(meta.coach) + ' = défice de −' + fiFmtKcal(dCoach) + ' (−' + dCoachPct + '%) face à tua manutenção'
            : 'Coach: ' + fiFmtKcal(meta.coach) + ' = superávit de +' + fiFmtKcal(Math.abs(dCoach)) + ' (+' + dCoachPct + '%) face à tua manutenção';
        })()),
        explicacao.avisoDeficitAlto && React.createElement('div', { style: { color: 'var(--fi-amarelo)', fontWeight: 700, marginTop: 4 } }, '⚠️ Défice alto — mais difícil sem fome.')
      ),
      meta.calculado && meta.calculado.avisoMinimo && React.createElement('p', { style: { fontSize: 12, color: 'var(--fi-vermelho)', marginTop: 8, fontWeight: 700 } }, '⚠️ A meta calculada ficaria abaixo do mínimo de segurança — foi ajustada para o mínimo.'),
      !pesoAtual && React.createElement('p', { style: { fontSize: 12, color: 'var(--fi-texto2)', marginTop: 8 } }, 'Sem peso registado ainda — o cálculo fica completo depois de uma avaliação.'),
      !pesoAtual
        ? React.createElement('p', { style: { fontSize: 12, color: 'var(--fi-texto2)', marginTop: 8 } }, 'Regista uma avaliação para veres as macros.')
        : macrosRef && React.createElement('p', { style: { fontSize: 12, color: 'var(--fi-texto2)', marginTop: 8 } }, 'Referência: ' + fiFmtG(macrosRef.prot_g) + ' proteína · ' + fiFmtG(macrosRef.hc_g) + ' HC · ' + fiFmtG(macrosRef.gord_g) + ' gordura')
    );
  }

  function renderPerfilEditor() {
    var alturaInfoPerf = fiValidarAltura(perfForm.altura_cm);
    return React.createElement('div', { style: { padding: 16, maxWidth: 460, margin: '0 auto' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 } },
        React.createElement('button', { className: 'fi-btn', onClick: function () { setPerfEditAberto(false); setRefeicoesParaConfirmar([]); } }, '← Voltar'),
        React.createElement('span', { style: { fontWeight: 900, fontSize: 17 } }, 'Editar perfil')
      ),
      refeicoesParaConfirmar.length > 0 && React.createElement(FiCard, { style: { marginBottom: 14, borderColor: 'var(--fi-vermelho)' } },
        React.createElement('p', { style: { fontWeight: 800, marginBottom: 8, color: 'var(--fi-vermelho)' } }, '⚠️ Estas refeições têm opções e vão deixar de caber no novo número de refeições. Apaga cada uma para confirmar (ou aumenta o número de refeições):'),
        refeicoesParaConfirmar.map(function (r) {
          var nOpcoes = opcoes.filter(function (o) { return o.refeicao_id === r.id; }).length;
          return React.createElement('div', { key: r.id, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--fi-borda)' } },
            React.createElement('span', { style: { fontSize: 13 } }, r.nome + ' (' + nOpcoes + ' opç' + (nOpcoes === 1 ? 'ão' : 'ões') + ')'),
            React.createElement('button', { className: 'fi-btn fi-btn-perigo', onClick: function () { apagarRefeicaoExcedente(r); } }, '🗑️ Apagar')
          );
        })
      ),
      React.createElement(FiCard, null,
        React.createElement(FiLabel, null, 'Sexo'),
        React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 14 } },
          ['homem', 'mulher'].map(function (s) {
            var sel = perfForm.sexo === s;
            return React.createElement('button', { key: s, className: 'fi-chip', style: { flex: 1, background: sel ? FI_COR : undefined, color: sel ? '#fff' : undefined, borderColor: sel ? FI_COR : undefined }, onClick: function () { perfCampo('sexo', s); } }, s === 'homem' ? 'Homem' : 'Mulher');
          })
        ),
        React.createElement(FiLabel, null, 'Data de nascimento'),
        React.createElement('input', { type: 'date', className: 'fi-input', autoComplete: 'off', value: perfForm.data_nasc, onChange: function (e) { perfCampo('data_nasc', e.target.value); }, style: { marginBottom: 14 } }),
        React.createElement(FiLabel, null, 'Altura (cm)'),
        React.createElement('input', { type: 'number', className: 'fi-input', autoComplete: 'off', value: perfForm.altura_cm, onChange: function (e) { perfCampo('altura_cm', e.target.value); }, style: { marginBottom: alturaInfoPerf.erro || alturaInfoPerf.convertido ? 4 : 14 } }),
        alturaInfoPerf.erro && React.createElement('p', { style: { fontSize: 11, color: 'var(--fi-vermelho)', margin: '0 0 10px', fontWeight: 700 } }, '⚠️ ' + alturaInfoPerf.erro),
        alturaInfoPerf.convertido && React.createElement('p', { style: { fontSize: 11, color: 'var(--fi-texto2)', margin: '0 0 10px' } }, 'Convertido para ' + alturaInfoPerf.cm + ' cm'),
        React.createElement(FiLabel, null, 'Atividade'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 } },
          FI_ATIVIDADE_OPTS.map(function (o) {
            var sel = perfForm.atividade === o.v;
            return React.createElement('button', { key: o.v, className: 'fi-chip', style: { background: sel ? FI_COR : undefined, color: sel ? '#fff' : undefined, borderColor: sel ? FI_COR : undefined }, onClick: function () { perfCampo('atividade', o.v); } }, o.label + ' — ' + o.desc);
          })
        ),
        React.createElement(FiLabel, null, 'Objetivo'),
        React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 8 } },
          FI_OBJETIVO_OPTS.map(function (o) {
            var sel = perfForm.objetivo === o.v;
            return React.createElement('button', { key: o.v, className: 'fi-chip', style: { flex: 1, background: sel ? FI_COR : undefined, color: sel ? '#fff' : undefined, borderColor: sel ? FI_COR : undefined }, onClick: function () { perfCampo('objetivo', o.v); } }, o.emoji + ' ' + o.label);
          })
        ),
        perfForm.objetivo === 'perder' && React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 14 } },
          FI_RITMO_OPTS.map(function (o) {
            var sel = perfForm.ritmo === o.v;
            return React.createElement('button', { key: o.v, className: 'fi-chip', style: { flex: 1, background: sel ? FI_COR : undefined, color: sel ? '#fff' : undefined, borderColor: sel ? FI_COR : undefined }, onClick: function () { perfCampo('ritmo', o.v); } }, o.label + ' (' + o.desc + ')');
          })
        ),
        React.createElement(FiLabel, null, 'Nº de refeições por dia'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6, marginBottom: 14 } },
          [1, 2, 3, 4, 5, 6].map(function (n) {
            var sel = perfForm.n_refeicoes === n;
            return React.createElement('button', { key: n, className: 'fi-chip', style: { textAlign: 'center', background: sel ? FI_COR : undefined, color: sel ? '#fff' : undefined, borderColor: sel ? FI_COR : undefined }, onClick: function () { perfCampo('n_refeicoes', n); setRefeicoesParaConfirmar([]); } }, n);
          })
        ),
        React.createElement(FiLabel, null, 'Proteína alvo (g/kg)'),
        React.createElement('input', { type: 'number', step: '0.1', className: 'fi-input', autoComplete: 'off', value: perfForm.prot_g_kg, onChange: function (e) { perfCampo('prot_g_kg', e.target.value); }, style: { marginBottom: 14 } }),
        React.createElement(FiLabel, null, 'Água (litros/dia)'),
        React.createElement('input', { type: 'number', step: '0.1', className: 'fi-input', autoComplete: 'off', value: perfForm.agua_l, onChange: function (e) { perfCampo('agua_l', e.target.value); }, style: { marginBottom: 14 } }),
        React.createElement(FiLabel, null, 'Peso meta (opcional)'),
        React.createElement('input', { type: 'number', step: '0.1', className: 'fi-input', autoComplete: 'off', value: perfForm.peso_meta, onChange: function (e) { perfCampo('peso_meta', e.target.value); }, style: { marginBottom: 14 } }),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
          React.createElement('input', { type: 'checkbox', checked: perfForm.usar_coach, onChange: function (e) { perfCampo('usar_coach', e.target.checked); } }),
          React.createElement('span', { style: { fontSize: 13, fontWeight: 700 } }, 'Usar meta do coach')
        ),
        perfForm.usar_coach && React.createElement('input', { type: 'number', className: 'fi-input', autoComplete: 'off', placeholder: 'kcal do coach', value: perfForm.kcal_coach, onChange: function (e) { perfCampo('kcal_coach', e.target.value); }, style: { marginBottom: 14 } }),
        React.createElement(FiLabel, null, 'Próxima avaliação física'),
        React.createElement('input', { type: 'date', className: 'fi-input', autoComplete: 'off', value: perfForm.prox_avaliacao, onChange: function (e) { perfCampo('prox_avaliacao', e.target.value); }, style: { marginBottom: 8 } }),
        React.createElement('p', { style: { fontSize: 11, color: 'var(--fi-texto2)', margin: '0 0 14px' } }, 'Atualiza-se sozinha ao gravar uma avaliação nova (data + intervalo abaixo) — mas podes mudar ou apagar à mão aqui.'),
        React.createElement(FiLabel, null, 'Intervalo entre avaliações (dias)'),
        React.createElement('input', { type: 'number', className: 'fi-input', autoComplete: 'off', value: perfForm.intervalo_avaliacao_dias, onChange: function (e) { perfCampo('intervalo_avaliacao_dias', e.target.value); }, style: { marginBottom: 14 } }),
        React.createElement('button', { className: 'fi-btn fi-btn-ativo', style: { width: '100%', marginTop: 10 }, disabled: perfSaving || refeicoesParaConfirmar.length > 0 || !!alturaInfoPerf.erro, onClick: tentarGuardarPerfil }, perfSaving ? 'A guardar…' : '✓ Guardar')
      )
    );
  }

  function renderPerfilView() {
    if (!perfil) return null;
    return React.createElement('div', { style: { padding: 16 } },
      renderMetaResumo(),
      React.createElement(FiCard, null,
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 } },
          React.createElement(FiLabel, { style: { margin: 0 } }, 'Dados'),
          React.createElement('button', { className: 'fi-btn', onClick: abrirEditorPerfil }, '✏️ Editar')
        ),
        React.createElement('div', { style: { fontSize: 13, lineHeight: 1.9 } },
          React.createElement('div', null, 'Sexo: ' + (perfil.sexo === 'homem' ? 'Homem' : perfil.sexo === 'mulher' ? 'Mulher' : '—')),
          React.createElement('div', null, 'Idade: ' + (fiCalcularIdade(perfil.data_nasc) != null ? fiCalcularIdade(perfil.data_nasc) + ' anos' : '—')),
          React.createElement('div', null, 'Altura: ' + (perfil.altura_cm ? perfil.altura_cm + ' cm' : '—')),
          React.createElement('div', null, 'Peso atual: ' + (pesoAtual ? pesoAtual + ' kg' : '— (sem avaliações ainda)')),
          React.createElement('div', null, 'Atividade: ' + ((FI_ATIVIDADE_OPTS.filter(function (o) { return o.v === perfil.atividade; })[0] || {}).label || '—')),
          React.createElement('div', null, 'Objetivo: ' + ((FI_OBJETIVO_OPTS.filter(function (o) { return o.v === perfil.objetivo; })[0] || {}).label || '—') + (perfil.objetivo === 'perder' && perfil.ritmo ? ' · ' + perfil.ritmo : '')),
          React.createElement('div', null, 'Refeições/dia: ' + perfil.n_refeicoes),
          React.createElement('div', null, 'Proteína: ' + perfil.prot_g_kg + ' g/kg'),
          React.createElement('div', null, 'Água: ' + perfil.agua_l + ' L/dia'),
          perfil.peso_meta && React.createElement('div', null, 'Peso meta: ' + perfil.peso_meta + ' kg')
        )
      )
    );
  }

  // ══════════════════════════════════════════════════════════════
  // ALIMENTOS (Mais → Alimentos)
  // ══════════════════════════════════════════════════════════════
  function abrirNovoAlimento() { setAlimEditandoId(null); setAlimForm(fiAlimentoVazio()); setAlimFormAberto(true); }
  function abrirEditarAlimento(a) {
    setAlimEditandoId(a.id);
    setAlimForm({ nome: a.nome, categoria: a.categoria || '', medida: a.medida === 'ml' ? 'ml' : 'g', kcal_100: a.kcal_100, prot_100: a.prot_100, hc_100: a.hc_100, gord_100: a.gord_100, unidade_nome: a.unidade_nome || '', g_unidade: a.g_unidade || '' });
    setAlimFormAberto(true);
  }
  function alimCampo(nome, valor) { setAlimForm(function (f) { var n = {}; n[nome] = valor; return Object.assign({}, f, n); }); }
  function guardarAlimento() {
    if (!alimForm.nome.trim() || alimForm.kcal_100 === '' || alimForm.prot_100 === '' || alimForm.hc_100 === '' || alimForm.gord_100 === '') return;
    setAlimSaving(true);
    var payload = {
      nome: alimForm.nome.trim(), categoria: alimForm.categoria.trim() || null, medida: alimForm.medida === 'ml' ? 'ml' : 'g',
      kcal_100: parseFloat(alimForm.kcal_100), prot_100: parseFloat(alimForm.prot_100),
      hc_100: parseFloat(alimForm.hc_100), gord_100: parseFloat(alimForm.gord_100),
      unidade_nome: alimForm.unidade_nome.trim() || null, g_unidade: alimForm.g_unidade ? parseFloat(alimForm.g_unidade) : null
    };
    var query = alimEditandoId ? db.from('fitness_alimentos').update(payload).eq('id', alimEditandoId).select() : db.from('fitness_alimentos').insert(payload).select();
    query.then(function (res) {
      setAlimSaving(false);
      if (res.error) { console.error('[fitness] guardar alimento:', res.error); window.mostrarErro('Fitness', res.error); return; }
      setAlimFormAberto(false);
      carregar();
    }).catch(function (e) { setAlimSaving(false); console.error('[fitness] guardar alimento:', e); window.mostrarErro('Fitness', e); });
  }
  function apagarAlimento(id) {
    db.from('fitness_alimentos').delete().eq('id', id).then(function (res) {
      if (res.error) { console.error('[fitness] apagar alimento:', res.error); window.mostrarErro('Fitness', res.error); return; }
      setConfirmApagarAlimento(null);
      carregar();
    }).catch(function (e) { console.error('[fitness] apagar alimento:', e); window.mostrarErro('Fitness', e); });
  }
  function pesquisarOFF() {
    if (!offQuery.trim()) return;
    setOffBusy(true); setOffErro(null); setOffResultados([]);
    fiBuscarOFF(offQuery.trim()).then(function (rs) {
      setOffBusy(false);
      setOffResultados(rs);
      if (!rs.length) setOffErro('Nenhum resultado com valores nutricionais completos.');
    }).catch(function (e) {
      setOffBusy(false);
      console.error('[fitness] Open Food Facts:', e);
      setOffErro('Falha ao pesquisar na Open Food Facts — tenta outra vez ou preenche à mão.');
    });
  }
  function aplicarResultadoOFF(r) {
    setAlimEditandoId(null);
    setAlimForm({ nome: r.nome, categoria: '', medida: 'g', kcal_100: r.kcal_100, prot_100: r.prot_100 || 0, hc_100: r.hc_100 || 0, gord_100: r.gord_100 || 0, unidade_nome: '', g_unidade: '' });
    setOffResultados([]); setOffQuery('');
    setAlimFormAberto(true);
  }

  function renderAlimentos() {
    var q = alimQuery.trim().toLowerCase();
    var lista = q ? alimentos.filter(function (a) { return a.nome.toLowerCase().indexOf(q) !== -1; }) : alimentos;
    return React.createElement('div', { style: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
        React.createElement('button', { className: 'fi-btn', onClick: function () { setMaisView('menu'); } }, '← Voltar'),
        React.createElement('span', { style: { fontWeight: 900, fontSize: 17 } }, 'Alimentos')
      ),
      React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', placeholder: 'Pesquisar…', value: alimQuery, onChange: function (e) { setAlimQuery(e.target.value); } }),
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        React.createElement('button', { className: 'fi-btn fi-btn-ativo', style: { flex: 1 }, onClick: abrirNovoAlimento }, '+ Novo alimento')
      ),
      React.createElement(FiCard, null,
        React.createElement(FiLabel, null, 'Procurar na Open Food Facts'),
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', placeholder: 'ex: iogurte grego', value: offQuery, onChange: function (e) { setOffQuery(e.target.value); } }),
          React.createElement('button', { className: 'fi-btn', disabled: offBusy, onClick: pesquisarOFF }, offBusy ? '…' : 'Procurar')
        ),
        offErro && React.createElement('p', { style: { fontSize: 12, color: 'var(--fi-vermelho)', marginTop: 8 } }, '⚠️ ' + offErro),
        offResultados.length > 0 && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 } },
          offResultados.map(function (r, i) {
            return React.createElement('button', { key: i, className: 'fi-btn', style: { textAlign: 'left' }, onClick: function () { aplicarResultadoOFF(r); } },
              React.createElement('div', { style: { fontWeight: 700 } }, r.nome),
              React.createElement('div', { style: { fontSize: 11, color: 'var(--fi-texto2)' } }, fiFmtKcal(r.kcal_100) + '/100g · P ' + fiFmtG(r.prot_100) + ' · HC ' + fiFmtG(r.hc_100) + ' · G ' + fiFmtG(r.gord_100))
            );
          })
        )
      ),
      alimFormAberto && React.createElement(FiCard, null,
        React.createElement(FiLabel, null, alimEditandoId ? 'Editar alimento' : 'Novo alimento — confirma antes de guardar'),
        React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', placeholder: 'Nome', value: alimForm.nome, onChange: function (e) { alimCampo('nome', e.target.value); }, style: { marginBottom: 8 } }),
        React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', placeholder: 'Categoria (opcional)', value: alimForm.categoria, onChange: function (e) { alimCampo('categoria', e.target.value); }, style: { marginBottom: 8 } }),
        React.createElement(FiLabel, null, 'Medida'),
        React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 10 } },
          ['g', 'ml'].map(function (m) {
            var sel = alimForm.medida === m;
            return React.createElement('button', { key: m, className: 'fi-chip', style: { flex: 1, background: sel ? FI_COR : undefined, color: sel ? '#fff' : undefined, borderColor: sel ? FI_COR : undefined }, onClick: function () { alimCampo('medida', m); } }, m === 'g' ? 'Gramas (g)' : 'Mililitros (ml)');
          })
        ),
        React.createElement('p', { style: { fontSize: 11, fontWeight: 800, color: 'var(--fi-texto2)', margin: '0 0 6px' } }, 'Valores por 100 ' + (alimForm.medida === 'ml' ? 'ml' : 'g')),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 } },
          React.createElement('div', null,
            React.createElement(FiLabel, { style: { margin: '0 0 4px' } }, 'Kcal'),
            React.createElement('input', { type: 'number', className: 'fi-input', autoComplete: 'off', value: alimForm.kcal_100, onChange: function (e) { alimCampo('kcal_100', e.target.value); } })
          ),
          React.createElement('div', null,
            React.createElement(FiLabel, { style: { margin: '0 0 4px' } }, 'Proteína (g)'),
            React.createElement('input', { type: 'number', step: '0.1', className: 'fi-input', autoComplete: 'off', value: alimForm.prot_100, onChange: function (e) { alimCampo('prot_100', e.target.value); } })
          ),
          React.createElement('div', null,
            React.createElement(FiLabel, { style: { margin: '0 0 4px' } }, 'Hidratos (g)'),
            React.createElement('input', { type: 'number', step: '0.1', className: 'fi-input', autoComplete: 'off', value: alimForm.hc_100, onChange: function (e) { alimCampo('hc_100', e.target.value); } })
          ),
          React.createElement('div', null,
            React.createElement(FiLabel, { style: { margin: '0 0 4px' } }, 'Gordura (g)'),
            React.createElement('input', { type: 'number', step: '0.1', className: 'fi-input', autoComplete: 'off', value: alimForm.gord_100, onChange: function (e) { alimCampo('gord_100', e.target.value); } })
          )
        ),
        React.createElement(FiLabel, null, 'Porção (ex. fatia, colher de sobremesa, peça)'),
        React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', placeholder: 'ex: fatia', value: alimForm.unidade_nome, onChange: function (e) { alimCampo('unidade_nome', e.target.value); }, style: { marginBottom: 10 } }),
        React.createElement(FiLabel, null, 'Gramas/ml por porção'),
        React.createElement('input', { type: 'number', className: 'fi-input', autoComplete: 'off', placeholder: alimForm.medida + ' por porção', value: alimForm.g_unidade, onChange: function (e) { alimCampo('g_unidade', e.target.value); }, style: { marginBottom: 10 } }),
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          React.createElement('button', { className: 'fi-btn', style: { flex: 1 }, onClick: function () { setAlimFormAberto(false); } }, 'Cancelar'),
          React.createElement('button', { className: 'fi-btn fi-btn-ativo', style: { flex: 1 }, disabled: alimSaving, onClick: guardarAlimento }, alimSaving ? 'A guardar…' : '✓ Guardar')
        )
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        lista.map(function (a) {
          return React.createElement(FiCard, { key: a.id },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
              React.createElement('div', null,
                React.createElement('div', { style: { fontWeight: 800, fontSize: 14 } }, a.nome),
                React.createElement('div', { style: { fontSize: 11, color: 'var(--fi-texto2)' } }, fiFmtKcal(a.kcal_100) + '/100' + (a.medida === 'ml' ? 'ml' : 'g') + ' · P ' + fiFmtG(a.prot_100) + ' · HC ' + fiFmtG(a.hc_100) + ' · G ' + fiFmtG(a.gord_100) + (a.g_unidade ? ' · ' + a.g_unidade + (a.medida === 'ml' ? 'ml' : 'g') + '/' + (a.unidade_nome || 'unid.') : ''))
              ),
              React.createElement('div', { style: { display: 'flex', gap: 6 } },
                React.createElement('button', { onClick: function () { abrirEditarAlimento(a); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' } }, '✏️'),
                React.createElement('button', { onClick: function () { setConfirmApagarAlimento(a.id); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' } }, '🗑️')
              )
            )
          );
        }),
        !lista.length && React.createElement('p', { style: { fontSize: 13, color: 'var(--fi-texto2)', textAlign: 'center', padding: 20 } }, 'Nenhum alimento encontrado.')
      )
    );
  }

  // ══════════════════════════════════════════════════════════════
  // PLANO (refeições · opções · itens)
  // ══════════════════════════════════════════════════════════════
  function abrirEditarRefeicao(r) { setRefEditandoId(r.id); setRefForm({ nome: r.nome, pct: String(r.pct) }); setRefErro(null); }
  function guardarRefeicao() {
    var pctNum = parseFloat(refForm.pct);
    if (!refForm.nome.trim() || isNaN(pctNum)) return;
    var hipotetica = refeicoes.map(function (r) { return r.id === refEditandoId ? Object.assign({}, r, { pct: pctNum }) : r; });
    var soma = fiSomaPct(hipotetica);
    if (Math.abs(soma - 100) > 0.05) { setRefErro('A soma de todas as refeições tem de dar 100% (agora dá ' + soma + '%).'); return; }
    db.from('fitness_refeicoes').update({ nome: refForm.nome.trim(), pct: pctNum }).eq('id', refEditandoId).then(function (res) {
      if (res.error) { console.error('[fitness] guardar refeição:', res.error); window.mostrarErro('Fitness', res.error); return; }
      setRefEditandoId(null); setRefErro(null);
      carregar();
    }).catch(function (e) { console.error('[fitness] guardar refeição:', e); window.mostrarErro('Fitness', e); });
  }

  function abrirNovaOpcao(refeicaoId) { setOpcaoRefeicaoAberta(refeicaoId); setOpcaoEditandoId(null); setOpcaoNomeForm(''); setIaRefeicaoAberta(null); }
  function abrirEditarOpcao(o) { setOpcaoRefeicaoAberta(o.refeicao_id); setOpcaoEditandoId(o.id); setOpcaoNomeForm(o.nome); }
  function guardarOpcao() {
    if (!opcaoNomeForm.trim()) return;
    if (!opcaoEditandoId) {
      var existentes = opcoes.filter(function (o) { return o.refeicao_id === opcaoRefeicaoAberta; });
      if (existentes.length >= 6) { window.mostrarErro('Fitness', new Error('Máximo de 6 opções por refeição.')); return; }
    }
    var query = opcaoEditandoId
      ? db.from('fitness_opcoes').update({ nome: opcaoNomeForm.trim() }).eq('id', opcaoEditandoId)
      : db.from('fitness_opcoes').insert({ refeicao_id: opcaoRefeicaoAberta, ordem: opcoes.filter(function (o) { return o.refeicao_id === opcaoRefeicaoAberta; }).length + 1, nome: opcaoNomeForm.trim() });
    query.then(function (res) {
      if (res.error) { console.error('[fitness] guardar opção:', res.error); window.mostrarErro('Fitness', res.error); return; }
      setOpcaoRefeicaoAberta(null); setOpcaoEditandoId(null); setOpcaoNomeForm('');
      carregar();
    }).catch(function (e) { console.error('[fitness] guardar opção:', e); window.mostrarErro('Fitness', e); });
  }
  function toggleFavoritoOpcao(o) {
    db.from('fitness_opcoes').update({ favorito: !o.favorito }).eq('id', o.id).then(function (res) {
      if (res.error) { console.error('[fitness] favorito opção:', res.error); window.mostrarErro('Fitness', res.error); return; }
      carregar();
    }).catch(function (e) { console.error('[fitness] favorito opção:', e); window.mostrarErro('Fitness', e); });
  }
  function apagarOpcao(id) {
    var o = opcoes.filter(function (x) { return x.id === id; })[0];
    var removerFoto = (o && o.foto_path) ? db.storage.from(FI_BUCKET).remove([o.foto_path]) : Promise.resolve();
    removerFoto.then(function () {
      return db.from('fitness_opcoes').delete().eq('id', id);
    }).then(function (res) {
      if (res.error) { console.error('[fitness] apagar opção:', res.error); window.mostrarErro('Fitness', res.error); return; }
      setConfirmApagarOpcao(null);
      if (receitaOpcaoId === id) setReceitaOpcaoId(null);
      carregar();
    }).catch(function (e) { console.error('[fitness] apagar opção:', e); window.mostrarErro('Fitness', e); });
  }
  // Troca a "ordem" de duas linhas (refeições ou opções) — usado para reordenar.
  function fiTrocarOrdem(tabela, a, b) {
    Promise.all([
      db.from(tabela).update({ ordem: b.ordem }).eq('id', a.id),
      db.from(tabela).update({ ordem: a.ordem }).eq('id', b.id)
    ]).then(function (resultados) {
      var falha = resultados.filter(function (r) { return r && r.error; })[0];
      if (falha) { console.error('[fitness] reordenar (' + tabela + '):', falha.error); window.mostrarErro('Fitness', falha.error); return; }
      carregar();
    }).catch(function (e) { console.error('[fitness] reordenar (' + tabela + '):', e); window.mostrarErro('Fitness', e); });
  }

  // ── Vista "Receita" de uma opção (foto + quantidades já calculadas) ──
  function abrirReceita(o) {
    setReceitaOpcaoId(o.id);
    setReceitaModo('porcoes');
    setReceitaFotoUrl(null);
    setPreparoEditAberto(false);
    setPreparoForm('');
    if (o.foto_path && db) {
      db.storage.from(FI_BUCKET).createSignedUrl(o.foto_path, 3600).then(function (res) {
        if (res.error) throw res.error;
        setReceitaFotoUrl(res.data.signedUrl);
      }).catch(function (e) { console.error('[fitness] link da foto da opção:', e); window.mostrarErro('Fitness', e); });
    }
  }
  function fecharReceita() { setReceitaOpcaoId(null); }
  // ── "Como se faz" (preparo) — editável e apagável na Receita,
  // também para opções criadas à mão (não só as da IA) ──
  function abrirEditarPreparo(o) { setPreparoForm(o.preparo || ''); setPreparoEditAberto(true); }
  function guardarPreparo(o) {
    db.from('fitness_opcoes').update({ preparo: preparoForm.trim() || null }).eq('id', o.id).then(function (res) {
      if (res.error) { console.error('[fitness] guardar preparo:', res.error); window.mostrarErro('Fitness', res.error); return; }
      setPreparoEditAberto(false);
      carregar();
    }).catch(function (e) { console.error('[fitness] guardar preparo:', e); window.mostrarErro('Fitness', e); });
  }
  function apagarPreparo(o) {
    if (!window.confirm('Apagar o texto de "Como se faz"?')) return;
    db.from('fitness_opcoes').update({ preparo: null }).eq('id', o.id).then(function (res) {
      if (res.error) { console.error('[fitness] apagar preparo:', res.error); window.mostrarErro('Fitness', res.error); return; }
      setPreparoEditAberto(false);
      carregar();
    }).catch(function (e) { console.error('[fitness] apagar preparo:', e); window.mostrarErro('Fitness', e); });
  }
  function trocarFotoOpcao(o, file) {
    if (!file || !db) return;
    setReceitaFotoBusy(true);
    var path = userProfile.id + '/opcoes/' + o.id + '.jpg';
    fiComprimirFoto(file, 1080).then(function (blob) {
      return db.storage.from(FI_BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    }).then(function (res) {
      if (res.error) throw res.error;
      return db.from('fitness_opcoes').update({ foto_path: path }).eq('id', o.id);
    }).then(function (res) {
      if (res.error) throw res.error;
      return db.storage.from(FI_BUCKET).createSignedUrl(path, 3600);
    }).then(function (res) {
      if (res.error) throw res.error;
      setReceitaFotoBusy(false);
      setReceitaFotoUrl(res.data.signedUrl);
      carregar();
    }).catch(function (e) {
      setReceitaFotoBusy(false);
      console.error('[fitness] trocar foto da opção:', e);
      window.mostrarErro('Fitness', e);
    });
  }
  function apagarFotoOpcao(o) {
    if (!o.foto_path || !db) return;
    setReceitaFotoBusy(true);
    db.storage.from(FI_BUCKET).remove([o.foto_path]).then(function (res) {
      if (res.error) throw res.error;
      return db.from('fitness_opcoes').update({ foto_path: null }).eq('id', o.id);
    }).then(function (res) {
      if (res.error) throw res.error;
      setReceitaFotoBusy(false);
      setReceitaFotoUrl(null);
      carregar();
    }).catch(function (e) {
      setReceitaFotoBusy(false);
      console.error('[fitness] apagar foto da opção:', e);
      window.mostrarErro('Fitness', e);
    });
  }

  // ── "Adicionar prato por nome" (IA) ──────────────────────────────
  function abrirFormIA(refeicaoId) {
    setIaRefeicaoAberta(refeicaoId);
    setIaForm({ nome: '', notas: '' });
    setIaErro(null);
    setOpcaoRefeicaoAberta(null);
  }
  function fecharFormIA() { setIaRefeicaoAberta(null); setIaErro(null); }
  function cancelarIA() { iaCancelRef.current = (iaCancelRef.current || 0) + 1; setIaBusy(false); }
  function pedirReceitaIA() {
    var nome = iaForm.nome.trim();
    if (!nome || !db) return;
    var refeicao = refeicoes.filter(function (r) { return r.id === iaRefeicaoAberta; })[0];
    if (!refeicao) return;
    var kcalAlvo = meta.ativa ? Math.round(meta.ativa * (refeicao.pct / 100)) : null;
    if (!kcalAlvo) { setIaErro('Sem meta de kcal definida ainda — completa o perfil primeiro.'); return; }
    setIaBusy(true); setIaErro(null);
    iaCancelRef.current = (iaCancelRef.current || 0) + 1;
    var geracao = iaCancelRef.current;
    var refeicaoAberta = iaRefeicaoAberta;
    var alimentosExistentes = alimentos.map(function (a) {
      return { nome: a.nome, kcal_100: a.kcal_100, prot_100: a.prot_100, hc_100: a.hc_100, gord_100: a.gord_100, medida: a.medida === 'ml' ? 'ml' : 'g', unidade_nome: a.unidade_nome || null, g_unidade: a.g_unidade || null };
    });
    db.functions.invoke('fitness-receita-ia', {
      body: { nome: nome, notas: iaForm.notas.trim() || undefined, kcal_alvo: kcalAlvo, alimentos_existentes: alimentosExistentes }
    }).then(function (res) {
      if (iaCancelRef.current !== geracao) return;
      if (res.error) {
        // res.error.context é a Response da função (erro non-2xx) — tenta
        // ler o corpo JSON dela para a mensagem específica que o servidor
        // devolveu; só cai na genérica de fiFnErr se isso falhar.
        var ctx = res.error && res.error.context;
        var lerCorpo = (ctx && typeof ctx.json === 'function') ? ctx.json().catch(function () { return null; }) : Promise.resolve(null);
        lerCorpo.then(function (corpo) {
          if (iaCancelRef.current !== geracao) return;
          setIaBusy(false);
          setIaErro((corpo && corpo.error) || fiFnErr(res) || 'Falha ao pedir a receita à IA — tenta outra vez.');
        });
        return;
      }
      setIaBusy(false);
      var receita = res.data || {};
      setIaPreview({
        refeicaoId: refeicaoAberta,
        kcalAlvo: kcalAlvo,
        nome: receita.nome || nome,
        preparo: receita.preparo || '',
        ingredientes: (receita.ingredientes || []).map(function (ing, i) {
          var obj = {
            _key: 'ia-' + i,
            nome: ing.nome || '', gramas: ing.gramas != null ? ing.gramas : '', ajustavel: ing.ajustavel !== false,
            nota: ing.nota || '', kcal_100: ing.kcal_100 != null ? ing.kcal_100 : '', prot_100: ing.prot_100 != null ? ing.prot_100 : '',
            hc_100: ing.hc_100 != null ? ing.hc_100 : '', gord_100: ing.gord_100 != null ? ing.gord_100 : '',
            medida: ing.medida === 'ml' ? 'ml' : 'g', unidade_nome: ing.unidade_nome || '', g_unidade: ing.g_unidade != null ? ing.g_unidade : ''
          };
          obj._valoresAbertos = Object.keys(fiIngredienteValoresInvalidos(obj)).length > 0;
          return obj;
        }),
        avisos: receita.avisos || []
      });
      setIaPreparoAberto(false);
      setIaRefeicaoAberta(null);
    }).catch(function (e) {
      if (iaCancelRef.current !== geracao) return;
      setIaBusy(false);
      console.error('[fitness] pedir receita IA:', e);
      setIaErro('Falha ao pedir a receita à IA — tenta outra vez.');
      window.mostrarErro('Fitness', e);
    });
  }
  function atualizarIngredienteIA(i, campo, valor) {
    setIaPreview(function (p) {
      var novos = p.ingredientes.slice();
      var n = {}; n[campo] = valor;
      novos[i] = Object.assign({}, novos[i], n);
      return Object.assign({}, p, { ingredientes: novos });
    });
  }
  function removerIngredienteIA(i) {
    setIaPreview(function (p) { return Object.assign({}, p, { ingredientes: p.ingredientes.filter(function (_, idx) { return idx !== i; }) }); });
  }
  function adicionarIngredienteIA() {
    setIaPreview(function (p) {
      return Object.assign({}, p, {
        ingredientes: p.ingredientes.concat([{
          _key: 'novo-' + Date.now() + '-' + Math.random(), _valoresAbertos: true, nome: '', gramas: '', ajustavel: true, nota: '',
          kcal_100: '', prot_100: '', hc_100: '', gord_100: '', medida: 'g', unidade_nome: '', g_unidade: ''
        }])
      });
    });
  }
  function guardarIaPreview() {
    if (!iaPreview || !db) return;
    var nome = iaPreview.nome.trim();
    if (!nome) { setIaSaveErro('O nome do prato não pode ficar vazio.'); return; }
    if (!iaPreview.ingredientes.length) { setIaSaveErro('A receita tem de ter pelo menos um ingrediente.'); return; }
    if (iaPreview.ingredientes.length > 12) { setIaSaveErro('No máximo 12 ingredientes.'); return; }
    var ingredientesValidados = [];
    for (var i = 0; i < iaPreview.ingredientes.length; i++) {
      var ing = iaPreview.ingredientes[i];
      var gNum = parseFloat(ing.gramas);
      var kNum = parseFloat(ing.kcal_100);
      if (!ing.nome || !ing.nome.trim()) { setIaSaveErro('Falta o nome de um ingrediente.'); return; }
      if (isNaN(gNum) || gNum <= 0 || gNum > 1000) { setIaSaveErro('Quantidade inválida em "' + ing.nome + '" (tem de ser entre 0 e 1000).'); return; }
      if (isNaN(kNum) || kNum < 0 || kNum > 900) { setIaSaveErro('kcal/100 inválido em "' + ing.nome + '" (tem de ser entre 0 e 900).'); return; }
      ingredientesValidados.push({
        nome: ing.nome.trim(), gramas: gNum, ajustavel: !!ing.ajustavel, nota: (ing.nota || '').trim() || null,
        kcal_100: kNum, prot_100: parseFloat(ing.prot_100) || 0, hc_100: parseFloat(ing.hc_100) || 0, gord_100: parseFloat(ing.gord_100) || 0,
        medida: ing.medida === 'ml' ? 'ml' : 'g', unidade_nome: (ing.unidade_nome || '').trim() || null, g_unidade: ing.g_unidade ? parseFloat(ing.g_unidade) : null
      });
    }
    setIaSaving(true); setIaSaveErro(null);
    db.rpc('fitness_criar_opcao_ia', { p: { refeicao_id: iaPreview.refeicaoId, nome: nome, preparo: iaPreview.preparo.trim() || null, ingredientes: ingredientesValidados } }).then(function (res) {
      setIaSaving(false);
      if (res.error) { console.error('[fitness] criar opção via IA:', res.error); setIaSaveErro(res.error.message || 'Falha ao gravar.'); window.mostrarErro('Fitness', res.error); return; }
      setIaPreview(null);
      carregar();
    }).catch(function (e) {
      setIaSaving(false);
      console.error('[fitness] criar opção via IA:', e);
      setIaSaveErro('Falha ao gravar.');
      window.mostrarErro('Fitness', e);
    });
  }

  function abrirNovoItem(opcaoId) { setItemOpcaoAberta(opcaoId); setItemEditandoId(null); setItemForm({ alimento_id: alimentos[0] ? alimentos[0].id : '', gramas_base: '', ajustavel: true, nota: '' }); }
  function abrirEditarItem(it) { setItemOpcaoAberta(it.opcao_id); setItemEditandoId(it.id); setItemForm({ alimento_id: it.alimento_id, gramas_base: String(it.gramas_base), ajustavel: it.ajustavel !== false, nota: it.nota || '' }); }
  function guardarItem() {
    var gNum = parseFloat(itemForm.gramas_base);
    if (!itemForm.alimento_id || isNaN(gNum) || gNum <= 0) return;
    var payload = { alimento_id: itemForm.alimento_id, gramas_base: gNum, ajustavel: !!itemForm.ajustavel, nota: itemForm.nota.trim() || null };
    var query = itemEditandoId
      ? db.from('fitness_opcao_itens').update(payload).eq('id', itemEditandoId)
      : db.from('fitness_opcao_itens').insert(Object.assign({ opcao_id: itemOpcaoAberta }, payload));
    query.then(function (res) {
      if (res.error) { console.error('[fitness] guardar item:', res.error); window.mostrarErro('Fitness', res.error); return; }
      setItemOpcaoAberta(null); setItemEditandoId(null);
      carregar();
    }).catch(function (e) { console.error('[fitness] guardar item:', e); window.mostrarErro('Fitness', e); });
  }
  function apagarItem(id) {
    db.from('fitness_opcao_itens').delete().eq('id', id).then(function (res) {
      if (res.error) { console.error('[fitness] apagar item:', res.error); window.mostrarErro('Fitness', res.error); return; }
      setConfirmApagarItem(null);
      carregar();
    }).catch(function (e) { console.error('[fitness] apagar item:', e); window.mostrarErro('Fitness', e); });
  }

  function renderOpcao(o, kcalRefeicao, irmas, idx) {
    var itensOpcao = itens.filter(function (it) { return it.opcao_id === o.id; });
    var calc = fiCalcularGramasOpcao(itensOpcao, alimentosPorId, kcalRefeicao);
    return React.createElement(FiCard, { key: o.id, style: { marginBottom: 10 } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
        React.createElement('div', { style: { flex: 1, cursor: opcaoEditandoId === o.id ? 'default' : 'pointer' }, onClick: opcaoEditandoId === o.id ? undefined : function () { abrirReceita(o); } },
          opcaoEditandoId === o.id
            ? React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', value: opcaoNomeForm, onChange: function (e) { setOpcaoNomeForm(e.target.value); }, style: { marginBottom: 6 } })
            : React.createElement('div', { style: { fontWeight: 800, fontSize: 14 } }, (o.favorito ? '★ ' : '') + o.nome),
          React.createElement('div', { style: { fontSize: 11, color: 'var(--fi-texto2)' } }, fiFmtKcal(calc.totais.kcal) + ' · P ' + fiFmtG(calc.totais.prot) + ' · HC ' + fiFmtG(calc.totais.hc) + ' · G ' + fiFmtG(calc.totais.gord))
        ),
        React.createElement('div', { style: { display: 'flex', gap: 4, flex: 'none' } },
          opcaoEditandoId === o.id
            ? React.createElement('button', { className: 'fi-btn fi-btn-ativo', style: { padding: '6px 10px', fontSize: 11 }, onClick: guardarOpcao }, '✓')
            : React.createElement(React.Fragment, null,
                React.createElement('button', { disabled: idx === 0, onClick: function () { fiTrocarOrdem('fitness_opcoes', o, irmas[idx - 1]); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 } }, '↑'),
                React.createElement('button', { disabled: idx === irmas.length - 1, onClick: function () { fiTrocarOrdem('fitness_opcoes', o, irmas[idx + 1]); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: idx === irmas.length - 1 ? 'default' : 'pointer', opacity: idx === irmas.length - 1 ? 0.3 : 1 } }, '↓'),
                React.createElement('button', { onClick: function () { toggleFavoritoOpcao(o); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' } }, o.favorito ? '★' : '☆'),
                React.createElement('button', { onClick: function () { abrirEditarOpcao(o); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' } }, '✏️'),
                React.createElement('button', { onClick: function () { setConfirmApagarOpcao(o.id); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' } }, '🗑️')
              )
        )
      ),
      calc.avisoFora && React.createElement('p', { style: { fontSize: 11, color: 'var(--fi-vermelho)', marginTop: 6, fontWeight: 700 } }, '⚠️ Esta opção não encaixa bem nesta refeição (fator fora de 0.5–2.0).'),
      React.createElement('div', { style: { marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 } },
        calc.itens.map(function (it) {
          return React.createElement('div', { key: it.id, style: { padding: '4px 0', borderTop: '1px solid var(--fi-borda)' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 } },
              React.createElement('span', null, it.nome + ' — ' + Math.round(it.gramas) + ' ' + it.medida + (it.unidades != null ? ' (' + it.unidades + ' ' + (it.unidade_nome || 'unid.') + ')' : '') + (it.ajustavel ? '' : ' · fixo')),
              React.createElement('div', { style: { display: 'flex', gap: 6 } },
                React.createElement('button', { onClick: function () { abrirEditarItem(itensOpcao.filter(function (x) { return x.id === it.id; })[0]); }, style: { background: 'none', border: 'none', fontSize: 12, cursor: 'pointer' } }, '✏️'),
                React.createElement('button', { onClick: function () { setConfirmApagarItem(it.id); }, style: { background: 'none', border: 'none', fontSize: 12, cursor: 'pointer' } }, '🗑️')
              )
            ),
            it.nota && React.createElement('div', { style: { fontSize: 10.5, color: 'var(--fi-texto2)', marginTop: 2 } }, it.nota)
          );
        }),
        !calc.itens.length && React.createElement('p', { style: { fontSize: 11, color: 'var(--fi-texto2)' } }, 'Sem itens ainda.')
      ),
      itemOpcaoAberta === o.id
        ? React.createElement('div', { style: { marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 } },
            React.createElement('select', { className: 'fi-input', value: itemForm.alimento_id, onChange: function (e) { setItemForm(Object.assign({}, itemForm, { alimento_id: e.target.value })); } },
              alimentos.map(function (a) { return React.createElement('option', { key: a.id, value: a.id }, a.nome); })
            ),
            React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
              React.createElement('input', { type: 'number', className: 'fi-input', autoComplete: 'off', placeholder: (alimentosPorId[itemForm.alimento_id] && alimentosPorId[itemForm.alimento_id].medida === 'ml' ? 'ml base' : 'gramas base'), value: itemForm.gramas_base, onChange: function (e) { setItemForm(Object.assign({}, itemForm, { gramas_base: e.target.value })); } }),
              React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, whiteSpace: 'nowrap' } },
                React.createElement('input', { type: 'checkbox', checked: itemForm.ajustavel, onChange: function (e) { setItemForm(Object.assign({}, itemForm, { ajustavel: e.target.checked })); } }), 'ajustável'
              )
            ),
            React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', placeholder: 'Nota (opcional, ex: ou 150 g de fruta)', value: itemForm.nota, onChange: function (e) { setItemForm(Object.assign({}, itemForm, { nota: e.target.value })); } }),
            React.createElement('div', { style: { display: 'flex', gap: 8 } },
              React.createElement('button', { className: 'fi-btn', style: { flex: 1 }, onClick: function () { setItemOpcaoAberta(null); } }, 'Cancelar'),
              React.createElement('button', { className: 'fi-btn fi-btn-ativo', style: { flex: 1 }, onClick: guardarItem }, '✓ Guardar item')
            )
          )
        : React.createElement('button', { className: 'fi-btn', style: { marginTop: 8, width: '100%' }, onClick: function () { abrirNovoItem(o.id); } }, '+ Item')
    );
  }

  function renderReceita() {
    var o = opcoes.filter(function (x) { return x.id === receitaOpcaoId; })[0];
    if (!o) return null;
    var refeicao = refeicoes.filter(function (r) { return r.id === o.refeicao_id; })[0];
    var kcalRefeicao = (refeicao && meta.ativa) ? Math.round(meta.ativa * (refeicao.pct / 100)) : 0;
    var itensOpcao = itens.filter(function (it) { return it.opcao_id === o.id; });
    var calc = fiCalcularGramasOpcao(itensOpcao, alimentosPorId, kcalRefeicao);
    return React.createElement('div', { style: { padding: 16 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 } },
        React.createElement('button', { className: 'fi-btn', onClick: fecharReceita }, '← Voltar'),
        React.createElement('span', { style: { fontWeight: 900, fontSize: 17 } }, 'Receita')
      ),
      React.createElement(FiCard, { style: { marginBottom: 12, textAlign: 'center' } },
        receitaFotoUrl && React.createElement('img', { src: receitaFotoUrl, style: { width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12, marginBottom: 10 } }),
        React.createElement('div', { style: { fontWeight: 900, fontSize: 19 } }, (o.favorito ? '★ ' : '') + o.nome),
        React.createElement('div', { style: { fontSize: 13, color: 'var(--fi-texto2)', marginTop: 4 } }, fiFmtKcal(calc.totais.kcal) + ' · P ' + fiFmtG(calc.totais.prot) + ' · HC ' + fiFmtG(calc.totais.hc) + ' · G ' + fiFmtG(calc.totais.gord)),
        React.createElement('p', { style: { fontSize: 11.5, color: 'var(--fi-texto2)', marginTop: 10 } }, 'Quantidades já calculadas para ti (' + fiFmtKcal(kcalRefeicao) + ' nesta refeição)'),
        React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' } },
          ['porcoes', 'gramas'].map(function (m) {
            var sel = receitaModo === m;
            return React.createElement('button', { key: m, className: 'fi-chip', style: { background: sel ? FI_COR : undefined, color: sel ? '#fff' : undefined, borderColor: sel ? FI_COR : undefined }, onClick: function () { setReceitaModo(m); } }, m === 'porcoes' ? 'Porções' : 'Gramas');
          })
        )
      ),
      React.createElement(FiCard, { style: { marginBottom: 12 } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
          React.createElement(FiLabel, { style: { margin: 0 } }, 'Como se faz'),
          !preparoEditAberto && React.createElement('div', { style: { display: 'flex', gap: 6 } },
            React.createElement('button', { onClick: function () { abrirEditarPreparo(o); }, style: { background: 'none', border: 'none', fontSize: 14, cursor: 'pointer' } }, '✏️'),
            o.preparo && React.createElement('button', { onClick: function () { apagarPreparo(o); }, style: { background: 'none', border: 'none', fontSize: 14, cursor: 'pointer' } }, '🗑️')
          )
        ),
        preparoEditAberto
          ? React.createElement(React.Fragment, null,
              React.createElement('textarea', { className: 'fi-input', autoComplete: 'off', rows: 6, value: preparoForm, onChange: function (e) { setPreparoForm(e.target.value); }, style: { marginBottom: 8, resize: 'vertical' } }),
              React.createElement('div', { style: { display: 'flex', gap: 8 } },
                React.createElement('button', { className: 'fi-btn', style: { flex: 1 }, onClick: function () { setPreparoEditAberto(false); } }, 'Cancelar'),
                React.createElement('button', { className: 'fi-btn fi-btn-ativo', style: { flex: 1 }, onClick: function () { guardarPreparo(o); } }, '✓ Guardar')
              )
            )
          : (o.preparo
              ? React.createElement('p', { style: { fontSize: 13, whiteSpace: 'pre-wrap', margin: 0 } }, o.preparo)
              : React.createElement('p', { style: { fontSize: 12, color: 'var(--fi-texto2)', margin: 0 } }, 'Sem texto ainda.'))
      ),
      calc.avisoFora && React.createElement(FiCard, { style: { marginBottom: 12, borderColor: 'var(--fi-vermelho)' } },
        React.createElement('p', { style: { fontSize: 12, color: 'var(--fi-vermelho)', fontWeight: 700 } }, '⚠️ Esta opção não encaixa bem nesta refeição (fator fora de 0.5–2.0).')
      ),
      React.createElement(FiCard, { style: { marginBottom: 12 } },
        calc.itens.map(function (it, i) {
          var linha;
          if (receitaModo === 'porcoes' && it.unidades != null && it.unidade_nome) {
            var n = Math.max(0.5, Math.round(it.unidades * 2) / 2);
            var nTxt = (n % 1 === 0) ? String(n) : n.toFixed(1);
            linha = nTxt + ' ' + it.unidade_nome + ' de ' + it.nome;
          } else {
            linha = Math.round(it.gramas) + ' ' + it.medida + ' ' + it.nome;
          }
          return React.createElement('div', { key: it.id, style: { padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--fi-borda)' } },
            React.createElement('div', { style: { fontSize: 14 } }, linha + (it.ajustavel ? '' : ' · fixo')),
            it.nota && React.createElement('div', { style: { fontSize: 11.5, color: 'var(--fi-texto2)', marginTop: 2 } }, it.nota)
          );
        }),
        !calc.itens.length && React.createElement('p', { style: { fontSize: 12, color: 'var(--fi-texto2)' } }, 'Sem itens ainda.')
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
        React.createElement('button', { className: 'fi-btn', onClick: function () { toggleFavoritoOpcao(o); } }, o.favorito ? '★ Favorito' : '☆ Favorito'),
        React.createElement('button', { className: 'fi-btn', onClick: function () { fecharReceita(); abrirEditarOpcao(o); } }, '✏️ Editar'),
        React.createElement('button', { className: 'fi-btn fi-btn-perigo', onClick: function () { setConfirmApagarOpcao(o.id); } }, '🗑 Apagar')
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' } },
        React.createElement('label', { className: 'fi-btn', style: { cursor: receitaFotoBusy ? 'default' : 'pointer', opacity: receitaFotoBusy ? 0.6 : 1 } },
          receitaFotoBusy ? 'A enviar…' : (o.foto_path ? '🖼️ Trocar foto' : '🖼️ Adicionar foto'),
          React.createElement('input', {
            type: 'file', accept: 'image/*', autoComplete: 'off', style: { display: 'none' }, disabled: receitaFotoBusy,
            onChange: function (e) {
              var f = e.target.files && e.target.files[0];
              e.target.value = '';
              if (f) trocarFotoOpcao(o, f);
            }
          })
        ),
        o.foto_path && React.createElement('button', { className: 'fi-btn', disabled: receitaFotoBusy, onClick: function () { apagarFotoOpcao(o); } }, '🗑️ Apagar foto')
      )
    );
  }

  function renderPlano() {
    if (!perfil) return null;
    var soma = fiSomaPct(refeicoes);
    var ativoId = (refeicaoAtivaId && ordenadas.some(function (x) { return x.id === refeicaoAtivaId; }))
      ? refeicaoAtivaId
      : (ordenadas[0] ? ordenadas[0].id : null);
    return React.createElement('div', { style: { padding: 16 } },
      renderMetaResumo(),
      Math.abs(soma - 100) > 0.05 && React.createElement(FiCard, { style: { marginBottom: 12, borderColor: 'var(--fi-vermelho)' } },
        React.createElement('p', { style: { fontSize: 12.5, color: 'var(--fi-vermelho)', fontWeight: 700 } }, '⚠️ As percentagens das refeições somam ' + soma + '% — deviam somar 100%.')
      ),
      ordenadas.length > 1 && React.createElement('div', { className: 'fi-plano-chips' },
        ordenadas.map(function (r, i) {
          var chipAtivo = r.id === ativoId;
          return React.createElement('button', {
            key: r.id, className: 'fi-chip' + (chipAtivo ? ' fi-chip-ativo' : ''),
            onClick: function () { irParaRefeicao(r.id); }
          }, String(i + 1));
        })
      ),
      React.createElement('div', { className: 'fi-plano-fila', ref: filaRef },
        ordenadas.map(function (r, ri) {
          var kcalRefeicao = meta.ativa ? Math.round(meta.ativa * (r.pct / 100)) : null;
          var opcoesRefeicao = opcoes.filter(function (o) { return o.refeicao_id === r.id; }).sort(function (a, b) { return a.ordem - b.ordem; });
          return React.createElement('div', {
            key: r.id, className: 'fi-plano-col', 'data-refeicao-id': r.id,
            ref: function (el) { if (el) planoColRefs.current[r.id] = el; else delete planoColRefs.current[r.id]; }
          },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
              refEditandoId === r.id
                ? React.createElement('div', { style: { display: 'flex', gap: 6, flex: 1, minWidth: 0 } },
                    React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', value: refForm.nome, onChange: function (e) { setRefForm(Object.assign({}, refForm, { nome: e.target.value })); } }),
                    React.createElement('input', { type: 'number', step: '0.01', className: 'fi-input', autoComplete: 'off', style: { maxWidth: 80 }, value: refForm.pct, onChange: function (e) { setRefForm(Object.assign({}, refForm, { pct: e.target.value })); } }),
                    React.createElement('button', { className: 'fi-btn fi-btn-ativo', onClick: guardarRefeicao }, '✓')
                  )
                : React.createElement('div', { style: { minWidth: 0 } },
                    React.createElement('span', { style: { fontWeight: 900, fontSize: 16 } }, r.nome),
                    React.createElement('span', { style: { fontSize: 12, color: 'var(--fi-texto2)', marginLeft: 8 } }, r.pct + '%' + (kcalRefeicao ? ' · ' + fiFmtKcal(kcalRefeicao) : ''))
                  ),
              refEditandoId !== r.id && React.createElement('div', { style: { display: 'flex', gap: 4, flex: 'none' } },
                React.createElement('button', { disabled: ri === 0, onClick: function () { fiTrocarOrdem('fitness_refeicoes', r, ordenadas[ri - 1]); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: ri === 0 ? 'default' : 'pointer', opacity: ri === 0 ? 0.3 : 1 } }, '←'),
                React.createElement('button', { disabled: ri === ordenadas.length - 1, onClick: function () { fiTrocarOrdem('fitness_refeicoes', r, ordenadas[ri + 1]); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: ri === ordenadas.length - 1 ? 'default' : 'pointer', opacity: ri === ordenadas.length - 1 ? 0.3 : 1 } }, '→'),
                React.createElement('button', { onClick: function () { abrirEditarRefeicao(r); }, style: { background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' } }, '✏️')
              )
            ),
            refEditandoId === r.id && refErro && React.createElement('p', { style: { fontSize: 11, color: 'var(--fi-vermelho)', marginBottom: 8 } }, refErro),
            opcoesRefeicao.map(function (o, oi) { return renderOpcao(o, kcalRefeicao || 0, opcoesRefeicao, oi); }),
            opcaoRefeicaoAberta === r.id
              ? React.createElement(FiCard, { style: { marginBottom: 10 } },
                  React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', placeholder: 'Nome da opção', value: opcaoNomeForm, onChange: function (e) { setOpcaoNomeForm(e.target.value); }, style: { marginBottom: 8 } }),
                  React.createElement('div', { style: { display: 'flex', gap: 8 } },
                    React.createElement('button', { className: 'fi-btn', style: { flex: 1 }, onClick: function () { setOpcaoRefeicaoAberta(null); } }, 'Cancelar'),
                    React.createElement('button', { className: 'fi-btn fi-btn-ativo', style: { flex: 1 }, onClick: guardarOpcao }, '✓ Guardar opção')
                  )
                )
              : opcoesRefeicao.length < 6 && React.createElement('div', { className: 'fi-plano-col-btns' },
                  React.createElement('button', { className: 'fi-btn', onClick: function () { abrirNovaOpcao(r.id); } }, '+ Opção (' + opcoesRefeicao.length + '/6)'),
                  iaRefeicaoAberta !== r.id && React.createElement('button', { className: 'fi-btn', onClick: function () { abrirFormIA(r.id); } }, '✨ Adicionar prato por nome')
                ),
            iaRefeicaoAberta === r.id && renderFormIA(r)
          );
        })
      )
    );
  }

  function renderFormIA(r) {
    return React.createElement(FiCard, { style: { marginTop: 10, marginBottom: 10 } },
      React.createElement(FiLabel, null, '✨ Adicionar prato por nome'),
      React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', placeholder: 'Nome do prato (ex: Frango estufado com arroz)', value: iaForm.nome, onChange: function (e) { setIaForm(Object.assign({}, iaForm, { nome: e.target.value })); }, style: { marginBottom: 8 } }),
      React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', placeholder: 'Notas (opcional, ex: sem queijo, versão leve)', value: iaForm.notas, onChange: function (e) { setIaForm(Object.assign({}, iaForm, { notas: e.target.value })); }, style: { marginBottom: 10 } }),
      iaErro && React.createElement('p', { style: { fontSize: 12, color: 'var(--fi-vermelho)', marginBottom: 8, fontWeight: 700 } }, '⚠️ ' + iaErro),
      iaBusy
        ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' } },
            React.createElement('p', { style: { fontSize: 12.5, color: 'var(--fi-texto2)' } }, 'A preparar a receita…'),
            React.createElement('button', { className: 'fi-btn', onClick: cancelarIA }, 'Cancelar')
          )
        : React.createElement('div', { style: { display: 'flex', gap: 8 } },
            React.createElement('button', { className: 'fi-btn', style: { flex: 1 }, onClick: fecharFormIA }, 'Cancelar'),
            React.createElement('button', { className: 'fi-btn fi-btn-ativo', style: { flex: 1 }, disabled: !iaForm.nome.trim(), onClick: pedirReceitaIA }, '✨ Preparar receita')
          )
    );
  }

  function renderIaPreview() {
    var kcalCalc = iaPreview.ingredientes.reduce(function (s, ing) {
      var g = parseFloat(ing.gramas) || 0, k = parseFloat(ing.kcal_100) || 0;
      return s + (g / 100) * k;
    }, 0);
    var kcalAlvo = iaPreview.kcalAlvo || 0;
    var desvioPct = kcalAlvo > 0 ? Math.abs(kcalCalc - kcalAlvo) / kcalAlvo * 100 : 0;
    var dentroFaixa = kcalAlvo > 0 && desvioPct <= 10;
    var corStatus = dentroFaixa ? FI_COR : 'var(--fi-amarelo)';
    var pctBarra = kcalAlvo > 0 ? Math.min(100, Math.max(0, (kcalCalc / kcalAlvo) * 100)) : 0;
    return React.createElement('div', { style: { padding: '16px 16px 100px' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 } },
        React.createElement('button', { className: 'fi-btn', onClick: function () { setIaPreview(null); setIaSaveErro(null); } }, '← Voltar'),
        React.createElement('span', { style: { fontWeight: 900, fontSize: 17 } }, 'Pré-visualização — ✨ IA')
      ),
      React.createElement(FiCard, { style: { marginBottom: 12 } },
        React.createElement('p', { style: { fontSize: 12, color: 'var(--fi-amarelo)', fontWeight: 700, margin: 0 } }, '⚠️ Valores estimados pela IA — confirma com o rótulo quando puderes.'),
        iaPreview.avisos && iaPreview.avisos.length > 0 && React.createElement('div', { style: { marginTop: 6 } },
          iaPreview.avisos.map(function (a, i) { return React.createElement('p', { key: i, style: { fontSize: 11.5, color: 'var(--fi-texto2)', margin: '2px 0' } }, '· ' + a); })
        )
      ),
      React.createElement(FiCard, { style: { marginBottom: 12 } },
        React.createElement(FiLabel, null, 'Nome'),
        React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', value: iaPreview.nome, onChange: function (e) { setIaPreview(Object.assign({}, iaPreview, { nome: e.target.value })); }, style: { marginBottom: 14 } }),
        React.createElement('div', { style: { textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: 30, fontWeight: 900, color: corStatus } }, Math.round(kcalCalc) + ' / ' + Math.round(kcalAlvo) + ' kcal'),
          React.createElement('div', { style: { height: 8, borderRadius: 4, background: 'var(--fi-borda)', overflow: 'hidden', marginTop: 10 } },
            React.createElement('div', { style: { height: '100%', width: pctBarra + '%', background: corStatus } })
          )
        )
      ),
      React.createElement(FiLabel, null, 'Ingredientes'),
      iaPreview.ingredientes.map(function (ing, i) {
        var existe = !!alimentosPorNome[(ing.nome || '').toLowerCase().trim()];
        var invalidos = fiIngredienteValoresInvalidos(ing);
        var temInvalidos = Object.keys(invalidos).length > 0;
        var aberto = !!ing._valoresAbertos || temInvalidos;
        var medida = ing.medida === 'ml' ? 'ml' : 'g';
        var qtd = parseFloat(ing.gramas) || 0;
        function campoValor(campo, rotulo, step) {
          return React.createElement('div', null,
            React.createElement(FiLabel, { style: { margin: '0 0 4px', color: invalidos[campo] ? 'var(--fi-vermelho)' : undefined } }, rotulo),
            React.createElement('input', {
              type: 'number', step: step, className: 'fi-input', autoComplete: 'off', value: ing[campo],
              onChange: function (e) { atualizarIngredienteIA(i, campo, e.target.value); },
              style: invalidos[campo] ? { borderColor: 'var(--fi-vermelho)' } : undefined
            })
          );
        }
        return React.createElement(FiCard, { key: ing._key || i, style: { marginBottom: 10 } },
          React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 } },
            React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', placeholder: 'nome do ingrediente', value: ing.nome, onChange: function (e) { atualizarIngredienteIA(i, 'nome', e.target.value); }, style: { flex: 1 } }),
            React.createElement('span', { style: { fontSize: 10, fontWeight: 900, padding: '4px 7px', borderRadius: 6, whiteSpace: 'nowrap', background: existe ? FI_COR : 'var(--fi-borda)', color: existe ? '#fff' : 'var(--fi-texto2)' } }, existe ? 'JÁ EXISTE' : 'NOVO'),
            React.createElement('button', { onClick: function () { removerIngredienteIA(i); }, style: { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' } }, '🗑️')
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 70px 1fr', gap: 8, marginBottom: 8 } },
            React.createElement('div', null,
              React.createElement(FiLabel, { style: { margin: '0 0 4px' } }, 'Quantidade'),
              React.createElement('input', { type: 'number', className: 'fi-input', autoComplete: 'off', value: ing.gramas, onChange: function (e) { atualizarIngredienteIA(i, 'gramas', e.target.value); } })
            ),
            React.createElement('div', null,
              React.createElement(FiLabel, { style: { margin: '0 0 4px' } }, 'Unidade'),
              React.createElement('select', { className: 'fi-input', value: medida, onChange: function (e) { atualizarIngredienteIA(i, 'medida', e.target.value); } },
                React.createElement('option', { value: 'g' }, 'g'),
                React.createElement('option', { value: 'ml' }, 'ml')
              )
            ),
            React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, alignSelf: 'end', paddingBottom: 10 } },
              React.createElement('input', { type: 'checkbox', checked: !!ing.ajustavel, onChange: function (e) { atualizarIngredienteIA(i, 'ajustavel', e.target.checked); } }), 'Ajustável'
            )
          ),
          React.createElement('p', { style: { fontSize: 13, fontWeight: 800, margin: '0 0 8px' } }, fiFmtParaQtd(ing.kcal_100, ing.prot_100, ing.hc_100, ing.gord_100, qtd)),
          React.createElement('button', {
            onClick: function () { atualizarIngredienteIA(i, '_valoresAbertos', !aberto); },
            disabled: temInvalidos,
            style: { background: 'none', border: 'none', color: temInvalidos ? 'var(--fi-vermelho)' : 'var(--fi-texto2)', fontSize: 12, fontWeight: 800, cursor: temInvalidos ? 'default' : 'pointer', padding: 0 }
          }, (aberto ? '▾' : '▸') + ' Editar valores por 100 ' + medida),
          aberto && React.createElement('div', { style: { marginTop: 10 } },
            React.createElement('p', { style: { fontSize: 11, fontWeight: 800, color: 'var(--fi-texto2)', margin: '0 0 6px' } }, 'Valores por 100 ' + medida),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 8 } },
              campoValor('kcal_100', 'Kcal', undefined),
              campoValor('prot_100', 'Proteína (g)', '0.1'),
              campoValor('hc_100', 'Hidratos (g)', '0.1'),
              campoValor('gord_100', 'Gordura (g)', '0.1')
            ),
            React.createElement('input', { type: 'text', className: 'fi-input', autoComplete: 'off', placeholder: 'Nota (opcional)', value: ing.nota || '', onChange: function (e) { atualizarIngredienteIA(i, 'nota', e.target.value); } })
          )
        );
      }),
      React.createElement('button', { className: 'fi-btn', style: { width: '100%', marginBottom: 12 }, onClick: adicionarIngredienteIA }, '+ Ingrediente'),
      React.createElement(FiCard, { style: { marginBottom: 12 } },
        React.createElement('button', {
          onClick: function () { setIaPreparoAberto(!iaPreparoAberto); },
          style: { background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 800, color: 'var(--fi-texto)' }
        }, (iaPreparoAberto ? '▾' : '▸') + ' Como se faz'),
        iaPreparoAberto && React.createElement('textarea', { className: 'fi-input', autoComplete: 'off', rows: 6, value: iaPreview.preparo, onChange: function (e) { setIaPreview(Object.assign({}, iaPreview, { preparo: e.target.value })); }, style: { marginTop: 10, resize: 'vertical' } })
      ),
      iaSaveErro && React.createElement(FiCard, { style: { marginBottom: 12, borderColor: 'var(--fi-vermelho)' } },
        React.createElement('p', { style: { fontSize: 12, color: 'var(--fi-vermelho)', fontWeight: 700 } }, '⚠️ ' + iaSaveErro)
      )
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  var appClass = 'fi-app' + (fiTemaEscuro() ? ' fi-dark' : '');

  if (loading) {
    return React.createElement('div', { className: appClass },
      React.createElement('style', null, FI_CSS),
      React.createElement('div', { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fi-texto2)' } }, 'A carregar…')
    );
  }

  if (!perfil) {
    return React.createElement('div', { className: appClass },
      React.createElement('style', null, FI_CSS),
      renderAssistente()
    );
  }

  var header = React.createElement('div', { style: { background: 'var(--fi-cartao)', padding: '12px 16px', borderBottom: '1px solid var(--fi-borda)', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 20 } },
    React.createElement('button', { onClick: onBack, style: { background: 'var(--fi-fundo)', border: '1px solid var(--fi-borda)', color: 'var(--fi-texto2)', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', fontSize: 16, flex: 'none' } }, '←'),
    React.createElement('span', { style: { fontSize: 26 } }, '🥗'),
    React.createElement('div', { style: { flex: 1 } }, React.createElement('div', { style: { fontWeight: 900, fontSize: 16 } }, 'Carvalho Fitness'))
  );

  function renderPlaceholder(titulo, faseTexto) {
    return React.createElement('div', { style: { padding: 16 } },
      React.createElement(FiCard, { style: { textAlign: 'center', padding: 30 } },
        React.createElement('div', { style: { fontSize: 34, marginBottom: 10 } }, '🚧'),
        React.createElement('div', { style: { fontWeight: 800, marginBottom: 4 } }, titulo),
        React.createElement('div', { style: { fontSize: 12.5, color: 'var(--fi-texto2)' } }, faseTexto)
      )
    );
  }

  // Faixa "Próxima avaliação física" — já disponível na Fase 1 (o
  // resto do ecrã Hoje, registo e água, é Fase 2).
  function renderProxAvaliacaoFaixa() {
    if (!perfil || !perfil.prox_avaliacao) return null;
    var dias = fiDiasAte(perfil.prox_avaliacao);
    var atrasada = dias < 0;
    var hoje = dias === 0;
    var texto = atrasada
      ? '⚠️ Avaliação em atraso — era ' + fiFmtDataCurta(perfil.prox_avaliacao)
      : hoje
        ? '🎯 Próxima avaliação física: hoje!'
        : 'Próxima avaliação física: ' + fiFmtDataCurta(perfil.prox_avaliacao) + ' · faltam ' + dias + ' dia' + (dias === 1 ? '' : 's');
    return React.createElement(FiCard, {
      style: {
        marginBottom: 12,
        background: (atrasada || hoje) ? 'var(--fi-vermelho)' : undefined,
        borderColor: (atrasada || hoje) ? 'var(--fi-vermelho)' : undefined
      }
    },
      React.createElement('p', { style: { fontSize: 13, fontWeight: 800, color: (atrasada || hoje) ? '#fff' : 'var(--fi-texto)', margin: 0 } }, texto)
    );
  }
  function renderHoje() {
    return React.createElement('div', { style: { padding: 16 } },
      renderProxAvaliacaoFaixa(),
      React.createElement(FiCard, { style: { textAlign: 'center', padding: 30 } },
        React.createElement('div', { style: { fontSize: 34, marginBottom: 10 } }, '🚧'),
        React.createElement('div', { style: { fontWeight: 800, marginBottom: 4 } }, 'Hoje'),
        React.createElement('div', { style: { fontSize: 12.5, color: 'var(--fi-texto2)' } }, 'Registo do dia e água — Fase 2.')
      )
    );
  }

  var corpo;
  if (perfEditAberto) corpo = renderPerfilEditor();
  else if (tab === 'hoje') corpo = renderHoje();
  else if (tab === 'plano') corpo = iaPreview ? renderIaPreview() : (receitaOpcaoId ? renderReceita() : renderPlano());
  else if (tab === 'treino') corpo = renderPlaceholder('Treino', 'Treinos, exercícios e vídeos — Fase 4.');
  else if (tab === 'progresso') corpo = renderPlaceholder('Progresso', 'Avaliações, fotos e gráfico — Fase 3.');
  else if (maisView === 'alimentos') corpo = renderAlimentos();
  else if (maisView === 'perfil') corpo = renderPerfilView();
  else corpo = React.createElement('div', { style: { padding: 16, display: 'flex', flexDirection: 'column', gap: 10 } },
    React.createElement('button', { className: 'fi-chip', onClick: function () { setMaisView('alimentos'); } }, '🍎 Alimentos'),
    React.createElement('button', { className: 'fi-chip', style: { opacity: 0.5 } }, '🛒 Lista de compras (Fase 2)'),
    React.createElement('button', { className: 'fi-chip', onClick: function () { setMaisView('perfil'); } }, '👤 Perfil')
  );

  var bottomNav = !perfEditAberto && !iaPreview && React.createElement('div', { style: { position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--fi-cartao)', borderTop: '1px solid var(--fi-borda)', display: 'flex', justifyContent: 'space-around', padding: '8px 0 20px', zIndex: 200 } },
    [['hoje', '🍽️', 'Hoje'], ['plano', '📋', 'Plano'], ['treino', '🏋️', 'Treino'], ['progresso', '📈', 'Progresso'], ['mais', '⋯', 'Mais']].map(function (it) {
      var active = tab === it[0];
      return React.createElement('button', { key: it[0], onClick: function () { setTab(it[0]); setReceitaOpcaoId(null); setIaPreview(null); setIaRefeicaoAberta(null); if (it[0] === 'mais') setMaisView('menu'); }, style: { background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', color: active ? FI_COR : 'var(--fi-texto2)', fontWeight: active ? 800 : 600 } },
        React.createElement('span', { style: { fontSize: 20 } }, it[1]),
        React.createElement('span', { style: { fontSize: 10 } }, it[2])
      );
    })
  );

  // Cancelar/Guardar fixos no fundo, só durante a pré-visualização da IA
  // (substitui a barra de navegação normal, escondida acima).
  var iaPreviewFooter = iaPreview && React.createElement('div', { style: { position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--fi-cartao)', borderTop: '1px solid var(--fi-borda)', display: 'flex', gap: 8, padding: '10px 16px 20px', zIndex: 200 } },
    React.createElement('button', { className: 'fi-btn', style: { flex: 1 }, onClick: function () { setIaPreview(null); setIaSaveErro(null); } }, 'Cancelar'),
    React.createElement('button', { className: 'fi-btn fi-btn-ativo', style: { flex: 1 }, disabled: iaSaving, onClick: guardarIaPreview }, iaSaving ? 'A gravar…' : '✓ Guardar')
  );

  var modalApagarAlimento = confirmApagarAlimento && React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 },
    onClick: function (e) { if (e.target === e.currentTarget) setConfirmApagarAlimento(null); }
  },
    React.createElement(FiCard, { style: { maxWidth: 340, width: '100%' } },
      React.createElement('p', { style: { fontWeight: 700, marginBottom: 16 } }, 'Apagar este alimento?'),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { className: 'fi-btn', style: { flex: 1 }, onClick: function () { setConfirmApagarAlimento(null); } }, 'Cancelar'),
        React.createElement('button', { className: 'fi-btn fi-btn-perigo', style: { flex: 1 }, onClick: function () { apagarAlimento(confirmApagarAlimento); } }, 'Apagar')
      )
    )
  );
  var modalApagarOpcao = confirmApagarOpcao && React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 },
    onClick: function (e) { if (e.target === e.currentTarget) setConfirmApagarOpcao(null); }
  },
    React.createElement(FiCard, { style: { maxWidth: 340, width: '100%' } },
      React.createElement('p', { style: { fontWeight: 700, marginBottom: 16 } }, 'Apagar esta opção e os seus itens?'),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { className: 'fi-btn', style: { flex: 1 }, onClick: function () { setConfirmApagarOpcao(null); } }, 'Cancelar'),
        React.createElement('button', { className: 'fi-btn fi-btn-perigo', style: { flex: 1 }, onClick: function () { apagarOpcao(confirmApagarOpcao); } }, 'Apagar')
      )
    )
  );
  var modalApagarItem = confirmApagarItem && React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 },
    onClick: function (e) { if (e.target === e.currentTarget) setConfirmApagarItem(null); }
  },
    React.createElement(FiCard, { style: { maxWidth: 340, width: '100%' } },
      React.createElement('p', { style: { fontWeight: 700, marginBottom: 16 } }, 'Apagar este item?'),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { className: 'fi-btn', style: { flex: 1 }, onClick: function () { setConfirmApagarItem(null); } }, 'Cancelar'),
        React.createElement('button', { className: 'fi-btn fi-btn-perigo', style: { flex: 1 }, onClick: function () { apagarItem(confirmApagarItem); } }, 'Apagar')
      )
    )
  );

  return React.createElement('div', { className: appClass },
    React.createElement('style', null, FI_CSS),
    header,
    erro && React.createElement('div', { style: { padding: '10px 16px 0' } }, React.createElement(FiCard, null, React.createElement('p', { style: { color: 'var(--fi-vermelho)', fontSize: 13 } }, '⚠️ ' + erro))),
    corpo,
    bottomNav,
    iaPreviewFooter,
    modalApagarAlimento,
    modalApagarOpcao,
    modalApagarItem
  );
}
