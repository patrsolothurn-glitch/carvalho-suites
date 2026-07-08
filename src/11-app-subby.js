// ── CARVALHO ABO KONTROLLE (Subby) ──────────────────────────────────
// Gestor de subscrições. Tabela: subscriptions. id interno: subby.
// Cada utilizador vê só as suas subscrições (filtro por owner/member_id).
// Admin vê as suas (não as dos outros membros — dados financeiros privados).

// Logos automáticos via favicon Google para marcas conhecidas
var LOGO_DOMAINS = {
  'netflix': 'netflix.com', 'spotify': 'spotify.com',
  'disney+': 'disneyplus.com', 'disney': 'disneyplus.com',
  'youtube': 'youtube.com', 'youtube premium': 'youtube.com',
  'amazon prime': 'primevideo.com', 'prime video': 'primevideo.com',
  'hbo': 'hbo.com', 'hbo max': 'hbomax.com',
  'apple tv': 'tv.apple.com', 'apple tv+': 'tv.apple.com',
  'apple': 'apple.com', 'icloud': 'icloud.com',
  'google': 'google.com', 'google one': 'one.google.com',
  'microsoft': 'microsoft.com', 'microsoft 365': 'microsoft.com',
  'dropbox': 'dropbox.com', 'adobe': 'adobe.com',
  'github': 'github.com', 'notion': 'notion.so',
  'chatgpt': 'openai.com', 'openai': 'openai.com',
  'meo': 'meo.pt', 'nos': 'nos.pt', 'vodafone': 'vodafone.com',
  'swisscom': 'swisscom.ch', 'sunrise': 'sunrise.ch',
  'digital republik': 'digitalrepublik.ch',
  'gagnet': 'gagnet.ch', 'gagnet ag': 'gagnet.ch',
  'neon': 'neon-free.ch', 'raiffeisen': 'raiffeisen.ch',
  'twint': 'twint.ch', 'paypal': 'paypal.com',
  'amazon': 'amazon.com', 'ebay': 'ebay.com',
  'linkedin': 'linkedin.com', 'twitter': 'x.com', 'x': 'x.com'
};

var ICONE_KEYWORDS = {
  'musica': '🎵', 'music': '🎵', 'radio': '📻',
  'video': '🎬', 'filme': '🎬', 'serie': '📺', 'streaming': '🎬', 'cinema': '🎬',
  'cloud': '☁️', 'storage': '☁️', 'armazenamento': '☁️', 'backup': '☁️',
  'news': '📰', 'jornal': '📰', 'revista': '📰',
  'software': '💻', 'saas': '💻', 'tech': '💻', 'app': '📱',
  'internet': '🌐', 'web': '🌐', 'vpn': '🔒',
  'telemovel': '📱', 'phone': '📱', 'movel': '📱',
  'gym': '💪', 'fitness': '💪', 'desporto': '⚽',
  'saude': '❤️', 'health': '❤️', 'farmacia': '💊',
  'comida': '🍕', 'food': '🍕', 'restaurante': '🍽️',
  'jogo': '🎮', 'game': '🎮', 'gaming': '🎮',
  'seguro': '🛡️', 'insurance': '🛡️',
  'educacao': '📚', 'education': '📚', 'curso': '🎓',
  'trabalho': '💼', 'office': '💼',
  'banco': '🏦', 'bank': '🏦', 'cartao': '💳', 'credito': '💳'
};

var CICLOS = [
  { id: 'semanal', label: 'Semanal', diasPorMes: 7 },
  { id: 'mensal', label: 'Mensal', diasPorMes: 30 },
  { id: 'trimestral', label: 'Trimestral', diasPorMes: 90 },
  { id: 'semestral', label: 'Semestral', diasPorMes: 180 },
  { id: 'anual', label: 'Anual', diasPorMes: 360 },
  { id: 'custom', label: 'Custom (dias)', diasPorMes: null }
];

var METODOS_PAG = ['Débito direto', 'Débito', 'Twint', 'Crédito', 'Apple Pay', 'Google Pay', 'Cash', 'Rechnung'];
var MOEDAS = ['CHF', 'EUR', 'USD', 'GBP'];
var FX = { CHF: 1.03, EUR: 1, USD: 0.92, GBP: 1.17 };
var BANDEIRAS = { 'PT': '🇵🇹', 'CH': '🇨🇭', 'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'NL': '🇳🇱', 'AT': '🇦🇹' };

function subbyAutoIcone(nome) {
  var n = (nome || '').toLowerCase().trim();
  for (var k in LOGO_DOMAINS) {
    if (n.includes(k)) return { type: 'logo', domain: LOGO_DOMAINS[k] };
  }
  for (var kw in ICONE_KEYWORDS) {
    if (n.includes(kw)) return { type: 'emoji', emoji: ICONE_KEYWORDS[kw] };
  }
  return { type: 'emoji', emoji: '🔔' };
}

function subbyLogoUrl(domain) {
  return 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=64';
}

function subbyDiasAte(dateStr) {
  if (!dateStr) return 999;
  var d = new Date(dateStr + 'T12:00:00');
  var hoje = new Date(); hoje.setHours(0,0,0,0);
  return Math.round((d - hoje) / 86400000);
}

function subbyValorMensalEUR(sub) {
  var v = parseFloat(sub.valor) || 0;
  var ciclo = CICLOS.find(function(c) { return c.id === sub.ciclo; }) || CICLOS[1];
  var diasMes = ciclo.diasPorMes || (parseFloat(sub.ciclo_dias) > 0 ? parseFloat(sub.ciclo_dias) : 30);
  var mensal = v * 30 / diasMes;
  return mensal * (FX[sub.moeda] || 1);
}

var SubbyApp = function SubbyApp(_ref) {
  var profile = _ref.profile;
  var onBack = _ref.onBack || function() {};
  var H = T;
  var owner = (profile && profile.member_id) || 'patricio';

  var _us1  = (0,_react.useState)([]),    subs       = _us1[0],  setSubs       = _us1[1];
  var _us2  = (0,_react.useState)(true),  loading    = _us2[0],  setLoading    = _us2[1];
  var _us3  = (0,_react.useState)('data'),ordem      = _us3[0],  setOrdem      = _us3[1];
  var _us4  = (0,_react.useState)(null),  editId     = _us4[0],  setEditId     = _us4[1];
  var _us5  = (0,_react.useState)(false), showForm   = _us5[0],  setShowForm   = _us5[1];
  var _us6  = (0,_react.useState)(null),  badgeSubs  = _us6[0],  setBadgeSubs  = _us6[1];
  var _us7  = (0,_react.useState)(null),  detalheSub = _us7[0],  setDetalheSub = _us7[1];

  // Campos do formulário
  var _fn  = (0,_react.useState)(''),   fNome    = _fn[0],  setFNome    = _fn[1];
  var _fc  = (0,_react.useState)(''),   fCat     = _fc[0],  setFCat     = _fc[1];
  var _fcl = (0,_react.useState)('mensal'), fCiclo = _fcl[0], setFCiclo = _fcl[1];
  var _fcd = (0,_react.useState)(''),   fCicloDias= _fcd[0],setFCicloDias=_fcd[1];
  var _fv  = (0,_react.useState)(''),   fValor   = _fv[0],  setFValor   = _fv[1];
  var _fm  = (0,_react.useState)('CHF'),fMoeda   = _fm[0],  setFMoeda   = _fm[1];
  var _fmp = (0,_react.useState)(''),   fMetodo  = _fmp[0], setFMetodo  = _fmp[1];
  var _fb  = (0,_react.useState)(''),   fBanco   = _fb[0],  setFBanco   = _fb[1];
  var _fca = (0,_react.useState)(''),   fCartao  = _fca[0], setFCartao  = _fca[1];
  var _fp  = (0,_react.useState)('CH'), fPais    = _fp[0],  setFPais    = _fp[1];
  var _fpr = (0,_react.useState)(''),   fProxima = _fpr[0], setFProxima = _fpr[1];
  var _fdi = (0,_react.useState)(''),   fDataIni = _fdi[0], setFDataIni = _fdi[1];
  var _fl  = (0,_react.useState)(3),    fLemb    = _fl[0],  setFLemb    = _fl[1];
  var _fno = (0,_react.useState)(''),   fNotas   = _fno[0], setFNotas   = _fno[1];
  var _fat = (0,_react.useState)(true),  fAtiva   = _fat[0], setFAtiva   = _fat[1];
  var _fic = (0,_react.useState)(''),   fIcone   = _fic[0], setFIcone   = _fic[1];
  var _fim = (0,_react.useState)(false), fIconeManual= _fim[0],setFIconeManual=_fim[1];

  var TABLE = 'subscriptions';

  var loadSubs = function() {
    if (!window.supabaseClient) { setLoading(false); return; }
    setLoading(true);
    window.supabaseClient.from(TABLE).select('*').eq('owner', owner)
      .order('proxima_cobranca', { ascending: true })
      .then(function(r) { setSubs(r.data || []); setLoading(false); })
      .catch(function() { setLoading(false); });
  };

  var loadOrdem = function() {
    if (!window.supabaseClient) return;
    window.supabaseClient.from('profiles').select('subby_prefs').eq('member_id', owner)
      .then(function(r) {
        var rows = r.data || [];
        if (rows[0] && rows[0].subby_prefs && rows[0].subby_prefs.sortBy) {
          setOrdem(rows[0].subby_prefs.sortBy);
        }
      }).catch(function() {});
  };

  var saveOrdem = function(o) {
    setOrdem(o);
    if (!window.supabaseClient) return;
    window.supabaseClient.from('profiles').update({ subby_prefs: { sortBy: o } })
      .eq('member_id', owner).catch(function() {});
  };

  (0,_react.useEffect)(function() { loadSubs(); loadOrdem(); }, []);

  // Calcular badge (subscrições a vencer em breve não confirmadas)
  (0,_react.useEffect)(function() {
    var urgentes = subs.filter(function(s) {
      if (!s.ativa) return false;
      var dias = subbyDiasAte(s.proxima_cobranca);
      if (dias > (s.lembrete_dias || 3)) return false;
      if (s.visto_ate_data && s.visto_ate_data === s.proxima_cobranca) return false;
      return true;
    });
    setBadgeSubs(urgentes.length > 0 ? String(urgentes.length) : null);
  }, [subs]);

  var totalMensalEUR = subs.filter(function(s){return s.ativa;}).reduce(function(acc,s){return acc+subbyValorMensalEUR(s);},0);
  var totalAnualEUR  = totalMensalEUR * 12;
  var totalMensalCHF = totalMensalEUR / (FX.CHF || 1.03);
  var totalAnualCHF  = totalMensalCHF * 12;

  var subsOrdenadas = _toConsumableArray(subs).sort(function(a,b){
    if (ordem==='nome') return (a.nome||'').localeCompare(b.nome||'');
    var da = subbyDiasAte(a.proxima_cobranca), db = subbyDiasAte(b.proxima_cobranca);
    return da - db;
  });

  var resetForm = function() {
    setFNome(''); setFCat(''); setFCiclo('mensal'); setFCicloDias('');
    setFValor(''); setFMoeda('CHF'); setFMetodo(''); setFBanco(''); setFCartao('');
    setFPais('CH'); setFProxima(''); setFDataIni(''); setFLemb(3); setFNotas('');
    setFAtiva(true); setFIcone(''); setFIconeManual(false); setEditId(null);
  };

  var abrirEditar = function(sub) {
    setEditId(sub.id);
    setFNome(sub.nome||''); setFCat(sub.categoria||''); setFCiclo(sub.ciclo||'mensal');
    setFCicloDias(sub.ciclo_dias ? String(sub.ciclo_dias) : '');
    setFValor(sub.valor ? String(sub.valor) : ''); setFMoeda(sub.moeda||'CHF');
    setFMetodo(sub.metodo_pagamento||''); setFBanco(sub.banco||''); setFCartao(sub.cartao_ultimos4||'');
    setFPais(sub.pais||'CH'); setFProxima(sub.proxima_cobranca||''); setFDataIni(sub.data_inicio||'');
    setFLemb(sub.lembrete_dias||3); setFNotas(sub.notas||''); setFAtiva(sub.ativa!==false);
    setFIcone(sub.icone||''); setFIconeManual(!!sub.icone_manual); setShowForm(true);
  };

  var abrirNova = function() { resetForm(); setShowForm(true); };

  // Auto-ícone ao escrever o nome (só se não for manual)
  var handleNomeChange = function(v) {
    setFNome(v);
    if (!fIconeManual) {
      var auto = subbyAutoIcone(v);
      if (auto.type === 'emoji') setFIcone(auto.emoji);
      else setFIcone('__logo__' + auto.domain);
    }
  };

  var guardar = function() {
    if (!fNome.trim()) return;
    var hoje = new Date().toISOString().slice(0,10);
    var ini = fDataIni || hoje;
    var prox = fProxima;
    if (!prox) { // DB exige not-null: calcular a partir do ciclo, avançando até data futura
      var d = new Date(ini + 'T12:00:00');
      var diaOrig = d.getDate(), anoOrig = d.getFullYear(), mesOrig = d.getMonth(), mesesTot = 0;
      var addMeses = function(m) {
        mesesTot += m;
        var ultimo = new Date(anoOrig, mesOrig + mesesTot + 1, 0).getDate();
        d = new Date(anoOrig, mesOrig + mesesTot, Math.min(diaOrig, ultimo), 12);
      };
      var avancar = function() {
        if (fCiclo === 'semanal') d.setDate(d.getDate() + 7);
        else if (fCiclo === 'trimestral') addMeses(3);
        else if (fCiclo === 'semestral') addMeses(6);
        else if (fCiclo === 'anual') addMeses(12);
        else if (fCiclo === 'custom') d.setDate(d.getDate() + (parseInt(fCicloDias) || 30));
        else addMeses(1); // mensal
      };
      var guard = 0;
      do { avancar(); guard++; } while (d.toISOString().slice(0,10) < hoje && guard < 2000);
      prox = d.toISOString().slice(0,10);
    }
    var row = {
      owner: owner,
      nome: fNome.trim(),
      categoria: fCat.trim(),
      ciclo: fCiclo,
      ciclo_dias: fCiclo==='custom' ? (parseInt(fCicloDias)||30) : null,
      valor: parseFloat(fValor.replace(',','.'))||0,
      moeda: fMoeda,
      metodo_pagamento: fMetodo,
      banco: fBanco.trim(),
      cartao_ultimos4: fCartao.trim(),
      pais: fPais,
      proxima_cobranca: prox,
      data_inicio: ini,
      lembrete_dias: parseInt(fLemb)||3,
      notas: fNotas.trim(),
      ativa: fAtiva,
      icone: fIcone,
      icone_manual: fIconeManual,
      updated_at: new Date().toISOString()
    };
    var op = editId
      ? window.supabaseClient.from(TABLE).update(row).eq('id', editId)
      : window.supabaseClient.auth.getSession().then(function(s) {
          var uid = s && s.data && s.data.session && s.data.session.user && s.data.session.user.id;
          if (uid) row.user_id = uid; // exigido pela política RLS (auth.uid() = user_id)
          return window.supabaseClient.from(TABLE).insert(row);
        });
    op.then(function(res) {
      if (res && res.error) { return; } // erro já mostrado pelo monitor global; formulário fica aberto
      setShowForm(false); resetForm(); loadSubs();
      // Push notification
      var msg = editId ? 'Subscrição actualizada: ' + fNome.trim() : 'Nova subscrição: ' + fNome.trim();
      getEligibleProfileIds('subby', null).then(function(ids) {
        if (!ids.length) return;
        fetch('https://qtynznppkxjmihxiquze.supabase.co/functions/v1/send-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (window._sbAnonKey||'') },
          body: JSON.stringify({ profile_ids: ids, title: '💳 Abo Kontrolle', body: msg, url: '/' })
        }).catch(function(){});
      });
    }).catch(function() {});
  };

  var apagar = function(id, nome) {
    if (!window.confirm('Apagar "' + nome + '"?')) return;
    window.supabaseClient.from(TABLE).delete().eq('id', id)
      .then(function() { loadSubs(); }).catch(function(){});
  };

  var marcarVisto = function(sub) {
    window.supabaseClient.from(TABLE).update({ visto_ate_data: sub.proxima_cobranca })
      .eq('id', sub.id).then(function() { loadSubs(); }).catch(function(){});
  };

  var renderIcone = function(sub, size) {
    size = size || 40;
    var ic = sub.icone || '';
    // Formato novo: __logo__domain.com
    if (ic.startsWith('__logo__')) {
      var domain = ic.slice(8);
      return /*#__PURE__*/React.createElement("img", {
        src: subbyLogoUrl(domain),
        style: { width: size, height: size, borderRadius: 10, objectFit: 'contain', background: '#fff', padding: 4 },
        onError: function(e) { e.target.style.display='none'; }
      });
    }
    // Formato antigo: URL direta (Clearbit, favicon, etc)
    if (ic.startsWith('http://') || ic.startsWith('https://')) {
      return /*#__PURE__*/React.createElement("img", {
        src: ic,
        style: { width: size, height: size, borderRadius: 10, objectFit: 'contain', background: '#fff', padding: 4 },
        onError: function(e) { e.target.style.display='none'; }
      });
    }
    // Sem ícone ou ícone não reconhecido: tentar auto-detetar pelo nome
    if (!ic || ic === '🔔') {
      var auto = subbyAutoIcone(sub.nome || '');
      if (auto.type === 'logo') {
        return /*#__PURE__*/React.createElement("img", {
          src: subbyLogoUrl(auto.domain),
          style: { width: size, height: size, borderRadius: 10, objectFit: 'contain', background: '#fff', padding: 4 },
          onError: function(e) { e.target.style.display='none'; }
        });
      }
      return /*#__PURE__*/React.createElement("span", { style: { fontSize: size * 0.55 } }, auto.emoji || '🔔');
    }
    return /*#__PURE__*/React.createElement("span", { style: { fontSize: size * 0.55 } }, ic || '🔔');
  };

  var inputStyle = { width:'100%', background:H.surface2, border:'1px solid '+H.border, borderRadius:10, padding:'9px 12px', color:H.text, fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:10 };
  var labelStyle = { fontSize:11, color:H.muted, fontWeight:700, marginBottom:4, display:'block', textTransform:'uppercase' };
  var C = '#6C5CE7';

  return /*#__PURE__*/React.createElement("div", { style: { minHeight:'100vh', background:H.bg, color:H.text, paddingBottom:100 } },

    // ── Cabeçalho totais ──
    /*#__PURE__*/React.createElement("div", { style: { padding:'16px 16px 0' } },
      /*#__PURE__*/React.createElement("div", { style: { display:'flex', alignItems:'center', gap:10, marginBottom:14 } },
        /*#__PURE__*/React.createElement("button", {
          onClick: onBack,
          style: { background:'none', border:'1px solid '+H.border, borderRadius:10, padding:'6px 12px', color:H.muted, fontSize:18, cursor:'pointer', flexShrink:0 }
        }, "‹"),
        /*#__PURE__*/React.createElement("p", { style: { fontWeight:900, fontSize:20, color:C, flex:1, textAlign:'center' } }, "💳 Abo Kontrolle"),
        /*#__PURE__*/React.createElement("div", { style: { width:40 } })
      ),
      /*#__PURE__*/React.createElement("div", { style: { display:'flex', gap:10, marginBottom:14 } },
        /*#__PURE__*/React.createElement("div", { style: { flex:1, background:H.surface, borderRadius:14, padding:'12px 14px', border:'1px solid '+H.border, textAlign:'center' } },
          /*#__PURE__*/React.createElement("p", { style: { color:H.muted, fontSize:10, fontWeight:700, textTransform:'uppercase' } }, "Por mês"),
          /*#__PURE__*/React.createElement("p", { style: { color:C, fontSize:20, fontWeight:900, marginTop:4 } }, totalMensalCHF.toFixed(2), " CHF"),
          /*#__PURE__*/React.createElement("p", { style: { color:H.muted, fontSize:13, fontWeight:700, marginTop:2 } }, totalMensalEUR.toFixed(2), " EUR")
        ),
        /*#__PURE__*/React.createElement("div", { style: { flex:1, background:H.surface, borderRadius:14, padding:'12px 14px', border:'1px solid '+H.border, textAlign:'center' } },
          /*#__PURE__*/React.createElement("p", { style: { color:H.muted, fontSize:10, fontWeight:700, textTransform:'uppercase' } }, "Por ano"),
          /*#__PURE__*/React.createElement("p", { style: { color:C, fontSize:20, fontWeight:900, marginTop:4 } }, totalAnualCHF.toFixed(2), " CHF"),
          /*#__PURE__*/React.createElement("p", { style: { color:H.muted, fontSize:13, fontWeight:700, marginTop:2 } }, totalAnualEUR.toFixed(2), " EUR")
        )
      ),

      // ── Botão nova + ordenação ──
      /*#__PURE__*/React.createElement("button", {
        onClick: abrirNova,
        style: { width:'100%', background:C, border:'none', borderRadius:14, padding:'13px', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', marginBottom:12 }
      }, "+ Nova Subscrição"),

      /*#__PURE__*/React.createElement("div", { style: { display:'flex', gap:8, marginBottom:16 } },
        [['data','📅 Data'],['nome','🔤 Nome A-Z']].map(function(o) {
          return /*#__PURE__*/React.createElement("button", {
            key:o[0], onClick:function(){ saveOrdem(o[0]); },
            style:{ flex:1, background:ordem===o[0]?C:H.surface2, border:'1px solid '+(ordem===o[0]?C:H.border), borderRadius:10, padding:'7px', color:ordem===o[0]?'#fff':H.muted, fontSize:12, fontWeight:700, cursor:'pointer' }
          }, o[1]);
        })
      )
    ),

    // ── Lista ──
    /*#__PURE__*/React.createElement("div", { style: { padding:'0 16px' } },
      loading && /*#__PURE__*/React.createElement("p", { style:{ color:H.muted, textAlign:'center', padding:32 } }, "A carregar..."),

      subsOrdenadas.map(function(sub) {
        var dias      = subbyDiasAte(sub.proxima_cobranca);
        var urgente   = sub.ativa && dias <= (sub.lembrete_dias||3) && !(sub.visto_ate_data && sub.visto_ate_data===sub.proxima_cobranca);
        var cicloLbl  = (CICLOS.find(function(c){return c.id===sub.ciclo;})||CICLOS[1]).label;
        var bandeira  = BANDEIRAS[sub.pais] || '';

        return /*#__PURE__*/React.createElement("div", {
          key: sub.id,
          onClick:function(){ setDetalheSub(sub); },
          style:{ background:H.surface, borderRadius:14, padding:'12px 14px', marginBottom:10, border:'1px solid '+(urgente?'rgba(239,68,68,0.4)':H.border), cursor:'pointer' }
        },
          /*#__PURE__*/React.createElement("div", { style:{ display:'flex', gap:10, alignItems:'flex-start' } },
            // Ícone
            /*#__PURE__*/React.createElement("div", { style:{ width:44, height:44, borderRadius:10, background:C+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 } },
              renderIcone(sub, 36)
            ),

            // Info
            /*#__PURE__*/React.createElement("div", { style:{ flex:1, minWidth:0 } },
              /*#__PURE__*/React.createElement("div", { style:{ display:'flex', alignItems:'center', gap:6 } },
                /*#__PURE__*/React.createElement("div", { style:{ width:8, height:8, borderRadius:'50%', background:sub.ativa!==false?H.green:H.red, flexShrink:0 } }),
                /*#__PURE__*/React.createElement("p", { style:{ fontWeight:800, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, sub.nome),
                bandeira && /*#__PURE__*/React.createElement("span", { style:{ fontSize:14 } }, bandeira)
              ),
              (sub.categoria||cicloLbl) && /*#__PURE__*/React.createElement("p", { style:{ color:H.muted, fontSize:12, marginTop:2 } },
                [sub.categoria, cicloLbl].filter(Boolean).join(' · ')
              ),
              (sub.metodo_pagamento||sub.banco) && /*#__PURE__*/React.createElement("p", { style:{ color:H.muted, fontSize:12, marginTop:1 } },
                [sub.metodo_pagamento, sub.banco, sub.cartao_ultimos4?'••••'+sub.cartao_ultimos4:null].filter(Boolean).join(' · ')
              ),
              sub.proxima_cobranca && /*#__PURE__*/React.createElement("div", { style:{ display:'flex', alignItems:'center', gap:8, marginTop:4 } },
                /*#__PURE__*/React.createElement("p", { style:{ color:urgente?H.red:H.muted, fontSize:12, fontWeight:urgente?700:400 } },
                  sub.proxima_cobranca, " (em ", dias, "d)"
                ),
                urgente && /*#__PURE__*/React.createElement("button", {
                  onClick:function(e){ e.stopPropagation(); marcarVisto(sub); },
                  style:{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.4)', borderRadius:8, padding:'2px 8px', color:H.green, fontSize:11, fontWeight:700, cursor:'pointer' }
                }, "✓ Vi")
              )
            ),

            // Valor + ações
            /*#__PURE__*/React.createElement("div", { style:{ textAlign:'right', flexShrink:0 } },
              /*#__PURE__*/React.createElement("p", { style:{ fontWeight:800, fontSize:15, color:C } },
                parseFloat(sub.valor||0).toFixed(2), " ", sub.moeda
              ),
              /*#__PURE__*/React.createElement("div", { style:{ display:'flex', gap:6, marginTop:6, justifyContent:'flex-end' } },
                /*#__PURE__*/React.createElement("button", {
                  onClick:function(e){ e.stopPropagation(); abrirEditar(sub); },
                  style:{ background:H.surface2, border:'1px solid '+H.border, borderRadius:8, padding:'4px 8px', color:H.muted, fontSize:14, cursor:'pointer' }
                }, "✏️"),
                /*#__PURE__*/React.createElement("button", {
                  onClick:function(e){ e.stopPropagation(); apagar(sub.id, sub.nome); },
                  style:{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'4px 8px', color:H.red, fontSize:14, cursor:'pointer' }
                }, "🗑")
              )
            )
          )
        );
      }),

      !loading && subs.length===0 && /*#__PURE__*/React.createElement("div", { style:{ textAlign:'center', padding:'60px 20px' } },
        /*#__PURE__*/React.createElement("p", { style:{ fontSize:48, marginBottom:16 } }, "💳"),
        /*#__PURE__*/React.createElement("p", { style:{ color:H.muted, fontSize:16 } }, "Sem subscrições ainda."),
        /*#__PURE__*/React.createElement("p", { style:{ color:H.muted, fontSize:14, marginTop:8 } }, "Toca em + Nova Subscrição para começar.")
      )
    ),

    // ── Formulário (overlay) ──
    showForm && /*#__PURE__*/React.createElement("div", {
      style:{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:300, overflowY:'auto' }
    },
      /*#__PURE__*/React.createElement("div", { style:{ background:H.surface, margin:'16px', borderRadius:18, padding:'20px 16px' } },

        /*#__PURE__*/React.createElement("p", { style:{ fontWeight:900, fontSize:18, marginBottom:16, color:C } },
          editId ? '✏️ Editar Subscrição' : '+ Nova Subscrição'
        ),

        // Ícone preview + nome
        /*#__PURE__*/React.createElement("div", { style:{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10 } },
          /*#__PURE__*/React.createElement("div", {
            style:{ width:52, height:52, borderRadius:12, background:C+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'1px solid '+H.border, cursor:'pointer', position:'relative' },
            onClick:function(){ setFIconeManual(true); }
          },
            fIcone && !fIcone.startsWith('__logo__')
              ? /*#__PURE__*/React.createElement("span", { style:{ fontSize:28 } }, fIcone)
              : fIcone.startsWith('__logo__')
                ? /*#__PURE__*/React.createElement("img", { src:subbyLogoUrl(fIcone.slice(8)), style:{ width:40, height:40, objectFit:'contain', borderRadius:8 } })
                : /*#__PURE__*/React.createElement("span", { style:{ fontSize:28 } }, "🔔")
          ),
          /*#__PURE__*/React.createElement("div", { style:{ flex:1 } },
            /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Nome *"),
            /*#__PURE__*/React.createElement("input", { style:_objectSpread({},inputStyle,{marginBottom:0}), value:fNome, onChange:function(e){handleNomeChange(e.target.value);}, placeholder:"ex: Netflix" })
          )
        ),

        // Seletor de emojis por categoria
        /*#__PURE__*/React.createElement("div", { style:{ marginBottom:12 } },
          [
            { label:'Media', emojis:['🎬','🎵','📺','📻','🎙️','🎧','🎼','🎭','📸','🎪'] },
            { label:'Tech', emojis:['💻','📱','🖥️','☁️','🌐','📡','💾','🔌','🤖','⌨️'] },
            { label:'Vida', emojis:['❤️','💪','🏃','🍕','🛒','✈️','🏠','🚗','📚','🎓'] },
            { label:'Negócio', emojis:['💼','💳','🏦','💰','📊','🔒','🛡️','📧','📋','🔔'] },
            { label:'Lazer', emojis:['🎮','⚽','🏋️','🎯','🧩','🌿','😀','🎸','♟️','🎲'] }
          ].map(function(cat) {
            return /*#__PURE__*/React.createElement("div", { key:cat.label, style:{ marginBottom:8 } },
              /*#__PURE__*/React.createElement("p", { style:{ fontSize:10, color:H.muted, fontWeight:700, marginBottom:4, textTransform:'uppercase' } }, cat.label),
              /*#__PURE__*/React.createElement("div", { style:{ display:'flex', gap:4, flexWrap:'wrap' } },
                cat.emojis.map(function(em) {
                  return /*#__PURE__*/React.createElement("button", {
                    key:em, onClick:function(){ setFIcone(em); setFIconeManual(true); },
                    style:{ background:fIcone===em?C+'33':'transparent', border:'1px solid '+(fIcone===em?C:H.border), borderRadius:8, padding:'5px 7px', fontSize:20, cursor:'pointer' }
                  }, em);
                })
              )
            );
          }),
          fIconeManual && /*#__PURE__*/React.createElement("button", {
            onClick:function(){ setFIconeManual(false); handleNomeChange(fNome); },
            style:{ background:'transparent', border:'1px solid '+H.border, borderRadius:8, padding:'5px 10px', color:H.muted, fontSize:12, cursor:'pointer', marginTop:4 }
          }, "↺ Repor logo automático")
        ),

        /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Emoji personalizado"),
        /*#__PURE__*/React.createElement("input", { style:inputStyle, value:fIconeManual&&!fIcone.startsWith('__logo__')?fIcone:'', onChange:function(e){ setFIcone(e.target.value); setFIconeManual(true); }, placeholder:"Ou escreve qualquer emoji aqui" }),

        /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Categoria"),
        /*#__PURE__*/React.createElement("input", { style:inputStyle, value:fCat, onChange:function(e){setFCat(e.target.value);}, placeholder:"ex: Streaming, Cloud, Internet..." }),

        /*#__PURE__*/React.createElement("div", { style:{ display:'flex', gap:8 } },
          /*#__PURE__*/React.createElement("div", { style:{ flex:1 } },
            /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Ciclo"),
            /*#__PURE__*/React.createElement("select", { style:_objectSpread({},inputStyle), value:fCiclo, onChange:function(e){setFCiclo(e.target.value);} },
              CICLOS.map(function(c){ return /*#__PURE__*/React.createElement("option",{key:c.id,value:c.id},c.label); })
            )
          ),
          fCiclo==='custom' && /*#__PURE__*/React.createElement("div", { style:{ flex:1 } },
            /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Dias"),
            /*#__PURE__*/React.createElement("input", { style:inputStyle, type:"number", min:"1", value:fCicloDias, onChange:function(e){setFCicloDias(e.target.value);}, placeholder:"ex: 45" })
          )
        ),

        /*#__PURE__*/React.createElement("div", { style:{ display:'flex', gap:8 } },
          /*#__PURE__*/React.createElement("div", { style:{ flex:2 } },
            /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Valor *"),
            /*#__PURE__*/React.createElement("input", { style:inputStyle, type:"number", step:"0.01", value:fValor, onChange:function(e){setFValor(e.target.value);}, placeholder:"0.00" })
          ),
          /*#__PURE__*/React.createElement("div", { style:{ flex:1 } },
            /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Moeda"),
            /*#__PURE__*/React.createElement("select", { style:_objectSpread({},inputStyle), value:fMoeda, onChange:function(e){setFMoeda(e.target.value);} },
              MOEDAS.map(function(m){ return /*#__PURE__*/React.createElement("option",{key:m,value:m},m); })
            )
          )
        ),

        /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Método de pagamento"),
        /*#__PURE__*/React.createElement("select", { style:_objectSpread({},inputStyle), value:fMetodo, onChange:function(e){setFMetodo(e.target.value);} },
          /*#__PURE__*/React.createElement("option",{value:''},"Seleciona..."),
          METODOS_PAG.map(function(m){ return /*#__PURE__*/React.createElement("option",{key:m,value:m},m); })
        ),

        /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Banco / Conta"),
        /*#__PURE__*/React.createElement("input", { style:inputStyle, value:fBanco, onChange:function(e){setFBanco(e.target.value);}, placeholder:"ex: Raiffeisen, Neon..." }),

        /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Últimos 4 dígitos do cartão"),
        /*#__PURE__*/React.createElement("input", { style:inputStyle, type:"number", maxLength:4, value:fCartao, onChange:function(e){setFCartao(e.target.value.slice(0,4));}, placeholder:"1234" }),

        /*#__PURE__*/React.createElement("label", { style:labelStyle }, "País"),
        /*#__PURE__*/React.createElement("select", { style:_objectSpread({},inputStyle), value:fPais, onChange:function(e){setFPais(e.target.value);} },
          Object.keys(BANDEIRAS).map(function(p){ return /*#__PURE__*/React.createElement("option",{key:p,value:p},BANDEIRAS[p],' ',p); })
        ),

        /*#__PURE__*/React.createElement("div", { style:{ display:'flex', gap:8 } },
          /*#__PURE__*/React.createElement("div", { style:{ flex:1 } },
            /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Data início"),
            /*#__PURE__*/React.createElement("input", { style:inputStyle, type:"date", value:fDataIni, onChange:function(e){setFDataIni(e.target.value);} })
          ),
          /*#__PURE__*/React.createElement("div", { style:{ flex:1 } },
            /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Próxima cobrança"),
            /*#__PURE__*/React.createElement("input", { style:inputStyle, type:"date", value:fProxima, onChange:function(e){setFProxima(e.target.value);} })
          )
        ),

        /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Aviso (dias antes)"),
        /*#__PURE__*/React.createElement("input", { style:inputStyle, type:"number", min:"0", max:"30", value:fLemb, onChange:function(e){setFLemb(e.target.value);} }),

        /*#__PURE__*/React.createElement("label", { style:labelStyle }, "Notas"),
        /*#__PURE__*/React.createElement("textarea", { style:_objectSpread({},inputStyle,{height:70,resize:'none'}), value:fNotas, onChange:function(e){setFNotas(e.target.value);}, placeholder:"Notas opcionais..." }),

        // Ativa/Inativa
        /*#__PURE__*/React.createElement("div", { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 } },
          /*#__PURE__*/React.createElement("p", { style:{ fontWeight:700 } }, fAtiva ? '🟢 Activa' : '🔴 Inactiva'),
          /*#__PURE__*/React.createElement("div", {
            onClick:function(){ setFAtiva(!fAtiva); },
            style:{ width:48, height:26, borderRadius:13, background:fAtiva?H.green:'rgba(239,68,68,0.4)', position:'relative', cursor:'pointer', transition:'background 0.2s' }
          },
            /*#__PURE__*/React.createElement("div", {
              style:{ position:'absolute', top:3, left:fAtiva?24:3, width:20, height:20, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.2s' }
            })
          )
        ),

        /*#__PURE__*/React.createElement("div", { style:{ display:'flex', gap:8 } },
          /*#__PURE__*/React.createElement("button", {
            onClick: guardar,
            style:{ flex:1, background:C, border:'none', borderRadius:12, padding:'13px', color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer' }
          }, "✓ Guardar"),
          /*#__PURE__*/React.createElement("button", {
            onClick:function(){ setShowForm(false); resetForm(); },
            style:{ flex:1, background:'none', border:'1px solid '+H.border, borderRadius:12, padding:'13px', color:H.muted, fontSize:14, fontWeight:700, cursor:'pointer' }
          }, "Cancelar")
        )
      )
    ),

    // ── Vista detalhada (overlay, sem emojis) ──
    detalheSub && (function(){
      var d = detalheSub;
      var dCiclo = (CICLOS.find(function(c){return c.id===d.ciclo;})||CICLOS[1]);
      var dDias  = subbyDiasAte(d.proxima_cobranca);
      var linhas = [
        ['Categoria',        d.categoria],
        ['Ciclo',            dCiclo.label + (d.ciclo==='custom' && d.ciclo_dias ? ' ('+d.ciclo_dias+' dias)' : '')],
        ['Valor',            parseFloat(d.valor||0).toFixed(2) + ' ' + d.moeda],
        ['Equivalente/mes',  subbyValorMensalEUR(d).toFixed(2) + ' EUR'],
        ['Metodo',           d.metodo_pagamento],
        ['Banco',            d.banco],
        ['Cartao',           d.cartao_ultimos4 ? '**** ' + d.cartao_ultimos4 : null],
        ['Pais',             d.pais],
        ['Proxima cobranca', d.proxima_cobranca ? d.proxima_cobranca + ' (em ' + dDias + 'd)' : null],
        ['Inicio',           d.data_inicio],
        ['Lembrete',         (d.lembrete_dias!=null) ? d.lembrete_dias + ' dias antes' : null],
        ['Estado',           d.ativa!==false ? 'Ativa' : 'Inativa'],
        ['Notas',            d.notas]
      ].filter(function(l){ return l[1]; });

      return /*#__PURE__*/React.createElement("div", {
        onClick:function(){ setDetalheSub(null); },
        style:{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:310, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }
      },
        /*#__PURE__*/React.createElement("div", {
          onClick:function(e){ e.stopPropagation(); },
          style:{ background:H.surface, borderRadius:18, padding:'20px 18px', width:'100%', maxWidth:420, maxHeight:'85vh', overflowY:'auto', border:'1px solid '+H.border }
        },
          /*#__PURE__*/React.createElement("div", { style:{ display:'flex', gap:12, alignItems:'center', marginBottom:14 } },
            /*#__PURE__*/React.createElement("div", { style:{ width:52, height:52, borderRadius:12, background:C+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 } },
              renderIcone(d, 42)
            ),
            /*#__PURE__*/React.createElement("div", { style:{ minWidth:0 } },
              /*#__PURE__*/React.createElement("p", { style:{ fontWeight:800, fontSize:18 } }, d.nome),
              /*#__PURE__*/React.createElement("p", { style:{ color:C, fontWeight:800, fontSize:15, marginTop:2 } },
                parseFloat(d.valor||0).toFixed(2), " ", d.moeda, " / ", dCiclo.label.toLowerCase()
              )
            )
          ),
          linhas.map(function(l){
            return /*#__PURE__*/React.createElement("div", {
              key:l[0],
              style:{ display:'flex', justifyContent:'space-between', gap:12, padding:'9px 0', borderBottom:'1px solid '+H.border }
            },
              /*#__PURE__*/React.createElement("span", { style:{ color:H.muted, fontSize:13, flexShrink:0 } }, l[0]),
              /*#__PURE__*/React.createElement("span", { style:{ fontSize:13, fontWeight:600, textAlign:'right', wordBreak:'break-word' } }, String(l[1]))
            );
          }),
          /*#__PURE__*/React.createElement("div", { style:{ display:'flex', gap:10, marginTop:16 } },
            /*#__PURE__*/React.createElement("button", {
              onClick:function(){ var s = detalheSub; setDetalheSub(null); abrirEditar(s); },
              style:{ flex:1, background:C, border:'none', borderRadius:12, padding:'12px', color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer' }
            }, "Editar"),
            /*#__PURE__*/React.createElement("button", {
              onClick:function(){ setDetalheSub(null); },
              style:{ flex:1, background:'none', border:'1px solid '+H.border, borderRadius:12, padding:'12px', color:H.muted, fontSize:14, fontWeight:700, cursor:'pointer' }
            }, "Fechar")
          )
        )
      );
    })()
  );
};
