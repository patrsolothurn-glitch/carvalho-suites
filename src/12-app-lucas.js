// ─────────────────────────────────────────────────────────────────
// 12-app-lucas.js  —  Escola do Lucas  —  Carvalho Suite
// ─────────────────────────────────────────────────────────────────

const { useState, useEffect } = React;

const DAYS = [
  { key:'seg', label:'Segunda', short:'SEG', sai:'11:50', tarde:true  },
  { key:'ter', label:'Terça',   short:'TER', sai:'11:50', tarde:true  },
  { key:'qua', label:'Quarta',  short:'QUA', sai:'11:50', tarde:false },
  { key:'qui', label:'Quinta',  short:'QUI', sai:'11:05', tarde:true  },
  { key:'sex', label:'Sexta',   short:'SEX', sai:'11:40', tarde:false },
];

const ALL_SLOTS = ['leva_manha','busca_almoco','leva_tarde','busca_fim'];
const SLOT_LABELS = {
  leva_manha:   '🚗 Leva manhã',
  busca_almoco: '🚗 Busca almoço',
  leva_tarde:   '🚗 Leva tarde',
  busca_fim:    '🚗 Busca fim dia',
};

const C = {
  primary:'#1a237e', blue:'#1565c0', orange:'#bf360c',
  green:'#2e7d32', greenL:'#e8f5e9', purple:'#7b1fa2', purpleL:'#f3e5f5',
  bg:'#eef2f7', card:'#fff', border:'#e8e8e8',
};

// ── Helpers ──────────────────────────────────────────────────────
function getMonday(d) {
  const dt = new Date(d), day = dt.getDay();
  dt.setDate(dt.getDate() - day + (day === 0 ? -6 : 1));
  dt.setHours(0,0,0,0); return dt;
}
function toISO(d)      { return d.toISOString().split('T')[0]; }
function dayDate(ws,i) {
  const d = new Date(ws); d.setDate(d.getDate()+i);
  return d.toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit'});
}
function weekLabel(mon) {
  const fri = new Date(mon); fri.setDate(mon.getDate()+4);
  const o = {day:'2-digit',month:'2-digit'};
  return `${mon.toLocaleDateString('pt-PT',o)} – ${fri.toLocaleDateString('pt-PT',o)}`;
}

// ── Estilos comuns ───────────────────────────────────────────────
const s = {
  card: { background:C.card, borderRadius:14, boxShadow:'0 2px 10px rgba(0,0,0,0.08)' },
  sectionTitle: (color) => ({
    fontSize:10, fontWeight:800, color,
    letterSpacing:1.5, textTransform:'uppercase', marginBottom:4,
  }),
  row: { display:'flex', alignItems:'center', gap:8, padding:'9px 0', borderBottom:`1px solid ${C.border}` },
};

// ── Componente principal ─────────────────────────────────────────
export default function LucasApp({ supabase, user, isAdmin }) {
  const [view,       setView]       = useState('plano');
  const [activeDay,  setActiveDay]  = useState('seg');
  const [weekStart,  setWeekStart]  = useState(() => getMonday(new Date()));
  const [schedule,   setSchedule]   = useState({});
  const [drivers,    setDrivers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);
  const [history,    setHistory]    = useState([]);
  // filtros histórico
  const [fDriver, setFDriver] = useState('');
  const [fDay,    setFDay]    = useState('');
  const [fPeriod, setFPeriod] = useState('');
  const [fSlot,   setFSlot]   = useState('');

  // ── Carregar dados ───────────────────────────────────────────
  useEffect(() => { loadDrivers(); }, []);
  useEffect(() => { loadSchedule(); }, [weekStart]);
  useEffect(() => { if (view==='historico') loadHistory(); }, [view, fDriver, fDay, fPeriod, fSlot]);

  function flash(msg, err=false) {
    setToast({msg,err}); setTimeout(() => setToast(null), 2000);
  }

  async function loadDrivers() {
    const {data} = await supabase.from('lucas_condutores').select('*').order('nome');
    if (data) setDrivers(data);
    setLoading(false);
  }

  async function loadSchedule() {
    setLoading(true);
    const {data} = await supabase.from('lucas_semana').select('*').eq('week_start', toISO(weekStart));
    const map = {};
    (data||[]).forEach(r => { map[`${r.dia}:${r.slot}`] = {condutor:r.condutor, enea:r.enea}; });
    setSchedule(map);
    setLoading(false);
  }

  async function loadHistory() {
    let q = supabase.from('lucas_semana').select('*')
      .order('week_start',{ascending:false}).order('dia').limit(300);
    if (fDriver) q = q.eq('condutor', fDriver);
    if (fDay)    q = q.eq('dia', fDay);
    if (fSlot)   q = q.eq('slot', fSlot);
    const {data} = await q;
    let rows = data||[];
    if (fPeriod) rows = rows.filter(r => {
      const m = ['leva_manha','busca_almoco'].includes(r.slot);
      return fPeriod==='manha' ? m : !m;
    });
    setHistory(rows);
  }

  async function setSlot(dia, slot, condutor) {
    setSaving(true);
    const key = `${dia}:${slot}`;
    const enea = schedule[key]?.enea || false;
    const {error} = await supabase.from('lucas_semana')
      .upsert({week_start:toISO(weekStart), dia, slot, condutor, enea}, {onConflict:'week_start,dia,slot'});
    if (!error) { setSchedule(p => ({...p, [key]:{...p[key], condutor}})); flash('✓ Guardado'); }
    setSaving(false);
  }

  async function toggleEnea(dia, slot) {
    const key = `${dia}:${slot}`;
    const cur = schedule[key]||{};
    const newEnea = !cur.enea;
    const {error} = await supabase.from('lucas_semana')
      .upsert({week_start:toISO(weekStart), dia, slot, condutor:cur.condutor||null, enea:newEnea}, {onConflict:'week_start,dia,slot'});
    if (!error) setSchedule(p => ({...p, [key]:{...p[key], enea:newEnea}}));
  }

  async function toggleAutorizacao(id, cur) {
    const {error} = await supabase.from('lucas_condutores').update({autorizado:!cur}).eq('id',id);
    if (!error) {
      setDrivers(p => p.map(d => d.id===id ? {...d, autorizado:!cur} : d));
      flash(!cur ? '✓ Autorizado' : '⛔ Removido');
    }
  }

  function prevWeek() { setWeekStart(p => { const d=new Date(p); d.setDate(d.getDate()-7); return d; }); }
  function nextWeek() { setWeekStart(p => { const d=new Date(p); d.setDate(d.getDate()+7); return d; }); }

  // ── Derivados ────────────────────────────────────────────────
  const authDrivers  = drivers.filter(d => d.autorizado);
  const driverColor  = Object.fromEntries(drivers.map(d => [d.nome, d.cor||C.green]));
  const day          = DAYS.find(d => d.key === activeDay);

  // ── Sub-componentes ──────────────────────────────────────────

  function DriverSelect({dia, slot}) {
    const key = `${dia}:${slot}`;
    const val = schedule[key]?.condutor || '';
    const col = val ? (driverColor[val]||C.green) : '#aaa';
    return (
      <select value={val} onChange={e => setSlot(dia,slot,e.target.value)} style={{
        border:`1.5px solid ${val ? col : '#ddd'}`,
        borderRadius:8, padding:'6px 8px', fontSize:13,
        background: val ? col+'18' : '#f5f5f5',
        color: val ? col : '#aaa', fontWeight: val ? 700 : 400,
        flex:1, outline:'none', cursor:'pointer', minWidth:0,
      }}>
        <option value="">— escolher —</option>
        {authDrivers.map(d => <option key={d.nome} value={d.nome}>{d.nome}</option>)}
      </select>
    );
  }

  function EneaBtn({dia, slot}) {
    const on = !!schedule[`${dia}:${slot}`]?.enea;
    return (
      <button onClick={() => toggleEnea(dia,slot)} style={{
        border:`1.5px solid ${on ? C.purple : '#ddd'}`,
        borderRadius:20, padding:'6px 10px', fontSize:12,
        background: on ? C.purpleL : '#f5f5f5',
        color: on ? C.purple : '#bbb', fontWeight: on ? 700 : 400,
        cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
      }}>
        🧒 {on ? 'Enea ✓' : 'Enea?'}
      </button>
    );
  }

  function TimeRow({icon, label, time}) {
    return (
      <div style={s.row}>
        <span style={{fontSize:15,width:22}}>{icon}</span>
        <span style={{flex:1,fontSize:13,color:'#555'}}>{label}</span>
        <span style={{fontSize:16,fontWeight:800,color:'#111'}}>{time}</span>
      </div>
    );
  }

  function DriveRow({dia, slot, label}) {
    return (
      <div style={s.row}>
        <span style={{fontSize:15,width:22}}>🚗</span>
        <span style={{fontSize:13,color:'#555',width:40,flexShrink:0}}>{label}</span>
        <DriverSelect dia={dia} slot={slot} />
        <EneaBtn dia={dia} slot={slot} />
      </div>
    );
  }

  // ── VIEW: PLANO ──────────────────────────────────────────────
  function ViewPlano() {
    const isToday = toISO(getMonday(new Date())) === toISO(weekStart);

    return (
      <div>
        {/* Navegação de semana */}
        <div style={{...s.card, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', marginBottom:12}}>
          <button onClick={prevWeek} style={btnNav}>‹</button>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:10,color:'#aaa',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>
              {isToday ? '🟢 Semana atual' : 'Semana'}
            </div>
            <div style={{fontSize:14,fontWeight:800,color:C.primary}}>{weekLabel(weekStart)}</div>
          </div>
          <button onClick={nextWeek} style={btnNav}>›</button>
        </div>

        {/* Tabs dos dias */}
        <div style={{display:'flex',gap:3,marginBottom:12}}>
          {DAYS.map((d,i) => {
            const daySlots = ['leva_manha','busca_almoco',...(d.tarde?['leva_tarde','busca_fim']:[])];
            const filled   = daySlots.filter(sl => schedule[`${d.key}:${sl}`]?.condutor).length;
            const full     = filled === daySlots.length;
            const isActive = activeDay === d.key;
            return (
              <button key={d.key} onClick={() => setActiveDay(d.key)} style={{
                flex:1, padding:'7px 2px', border:'none', borderRadius:10,
                background: isActive ? C.primary : C.card,
                color: isActive ? '#fff' : '#666',
                fontWeight: isActive ? 800 : 500, fontSize:11,
                cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.07)',
                display:'flex', flexDirection:'column', alignItems:'center', gap:1,
              }}>
                <span>{d.short}</span>
                <span style={{fontSize:9,opacity:0.7}}>{dayDate(weekStart,i)}</span>
                <span style={{
                  fontSize:9,fontWeight:700,
                  color: isActive ? 'rgba(255,255,255,.8)' : (full ? C.green : '#ccc'),
                }}>{filled}/{daySlots.length}</span>
              </button>
            );
          })}
        </div>

        {/* Detalhe do dia */}
        {loading
          ? <div style={{textAlign:'center',padding:30,color:'#bbb'}}>A carregar...</div>
          : (
          <div style={{...s.card, padding:'4px 16px 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0 6px',borderBottom:'2px solid #f0f0f0'}}>
              <span style={{fontSize:18,fontWeight:800,color:C.primary}}>{day.label}</span>
              <span style={{fontSize:11,color:'#aaa'}}>🛏 6:15 · 🏫 7:30</span>
            </div>

            {/* Manhã */}
            <div style={{...s.sectionTitle(C.blue), marginTop:14}}>🌅 Manhã</div>
            <TimeRow  icon="🏫" label="Entra na escola" time="7:30" />
            <DriveRow dia={day.key} slot="leva_manha"   label="Leva" />
            <TimeRow  icon="🏠" label="Sai da escola"   time={day.sai} />
            <DriveRow dia={day.key} slot="busca_almoco" label="Busca" />

            {/* Tarde */}
            {day.tarde ? (
              <>
                <div style={{height:1,background:'#eee',margin:'14px 0 0'}}/>
                <div style={{...s.sectionTitle(C.orange), marginTop:14}}>🌤 Tarde</div>
                <TimeRow  icon="🏫" label="Entra na escola" time="13:30" />
                <DriveRow dia={day.key} slot="leva_tarde" label="Leva"  />
                <TimeRow  icon="🏠" label="Sai da escola"   time="16:55" />
                <DriveRow dia={day.key} slot="busca_fim"   label="Busca" />
              </>
            ) : (
              <div style={{textAlign:'center',color:'#ccc',fontStyle:'italic',margin:'18px 0 6px',fontSize:13}}>Sem tarde</div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── VIEW: AUTORIZAÇÕES ───────────────────────────────────────
  function ViewAutorizacoes() {
    return (
      <div>
        <div style={{fontSize:12,color:'#999',marginBottom:14,lineHeight:1.6}}>
          Ativa ou remove o acesso de cada condutor ao plano semanal.<br/>
          Quem não estiver autorizado não aparece nas opções.
        </div>

        {drivers.map(d => {
          const col = d.cor || C.green;
          return (
            <div key={d.id} style={{
              ...s.card, padding:'14px 16px', marginBottom:10,
              display:'flex', alignItems:'center', gap:12,
              border:`2px solid ${d.autorizado ? col : C.border}`,
              opacity: d.autorizado ? 1 : 0.5,
            }}>
              {/* Avatar */}
              <div style={{
                width:48,height:48,borderRadius:24,
                background: d.autorizado ? col+'22' : '#f0f0f0',
                border:`2px solid ${d.autorizado ? col : '#ddd'}`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
              }}>👤</div>

              {/* Nome e estado */}
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:16,color:d.autorizado?'#111':'#aaa'}}>{d.nome}</div>
                <span style={{
                  fontSize:11,fontWeight:700,borderRadius:10,padding:'2px 9px',
                  background: d.autorizado ? col+'22' : '#f0f0f0',
                  color: d.autorizado ? col : '#aaa',
                }}>
                  {d.autorizado ? '✓ Autorizado' : '⛔ Sem acesso'}
                </span>
              </div>

              {/* Botão toggle (só admin) */}
              {isAdmin ? (
                <button onClick={() => toggleAutorizacao(d.id, d.autorizado)} style={{
                  border:'none',borderRadius:20,padding:'8px 14px',cursor:'pointer',
                  background: d.autorizado ? '#ffebee' : C.greenL,
                  color: d.autorizado ? '#c62828' : C.green,
                  fontWeight:700,fontSize:12,
                }}>
                  {d.autorizado ? 'Remover' : 'Autorizar'}
                </button>
              ) : (
                <span style={{fontSize:18}}>{d.autorizado ? '✅' : '🔒'}</span>
              )}
            </div>
          );
        })}

        {/* Resumo */}
        <div style={{...s.card,padding:'12px 16px',marginTop:4}}>
          <div style={{fontSize:11,color:'#999',marginBottom:8,fontWeight:700}}>Resumo</div>
          <div style={{display:'flex',gap:16}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:900,color:C.green}}>{drivers.filter(d=>d.autorizado).length}</div>
              <div style={{fontSize:10,color:'#aaa'}}>Autorizados</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:900,color:'#e53935'}}>{drivers.filter(d=>!d.autorizado).length}</div>
              <div style={{fontSize:10,color:'#aaa'}}>Sem acesso</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:900,color:C.primary}}>{drivers.length}</div>
              <div style={{fontSize:10,color:'#aaa'}}>Total</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW: HISTÓRICO ──────────────────────────────────────────
  function ViewHistorico() {
    // Agrupar por semana
    const byWeek = {};
    history.forEach(r => {
      if (!byWeek[r.week_start]) byWeek[r.week_start] = [];
      byWeek[r.week_start].push(r);
    });
    const hasFilter = fDriver||fDay||fPeriod||fSlot;

    return (
      <div>
        {/* Filtros */}
        <div style={{...s.card,padding:'12px 14px',marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:800,color:'#bbb',letterSpacing:1.2,textTransform:'uppercase',marginBottom:10}}>
            🔎 Filtros
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <FiltroSelect label="Condutor" value={fDriver} onChange={setFDriver}
              opts={drivers.map(d=>({v:d.nome,l:d.nome}))} />
            <FiltroSelect label="Dia" value={fDay} onChange={setFDay}
              opts={DAYS.map(d=>({v:d.key,l:d.label}))} />
            <FiltroSelect label="Período" value={fPeriod} onChange={setFPeriod}
              opts={[{v:'manha',l:'🌅 Manhã'},{v:'tarde',l:'🌤 Tarde'}]} />
            <FiltroSelect label="Serviço" value={fSlot} onChange={setFSlot}
              opts={ALL_SLOTS.map(k=>({v:k,l:SLOT_LABELS[k]}))} />
          </div>
          {hasFilter && (
            <button onClick={()=>{setFDriver('');setFDay('');setFPeriod('');setFSlot('');}}
              style={{marginTop:10,fontSize:11,color:'#e53935',background:'none',border:'none',cursor:'pointer',fontWeight:700}}>
              ✕ Limpar filtros
            </button>
          )}
        </div>

        {history.length === 0
          ? <div style={{textAlign:'center',color:'#ccc',fontSize:13,marginTop:30,fontStyle:'italic'}}>
              {hasFilter ? 'Sem resultados para estes filtros' : 'Sem histórico disponível'}
            </div>
          : Object.entries(byWeek).map(([week, rows]) => {
              const mon = new Date(week+'T00:00:00');
              const fri = new Date(mon); fri.setDate(mon.getDate()+4);
              const o = {day:'2-digit',month:'2-digit'};
              return (
                <div key={week} style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:800,color:C.primary,marginBottom:6,paddingLeft:4}}>
                    📅 {mon.toLocaleDateString('pt-PT',o)} – {fri.toLocaleDateString('pt-PT',o)}
                  </div>
                  <div style={{...s.card,overflow:'hidden'}}>
                    {rows.map((r,i) => {
                      const col = driverColor[r.condutor]||'#888';
                      const dayLabel = DAYS.find(d=>d.key===r.dia)?.label||r.dia;
                      return (
                        <div key={`${r.week_start}${r.dia}${r.slot}`} style={{
                          display:'flex',alignItems:'center',gap:10,padding:'9px 14px',
                          borderBottom: i<rows.length-1 ? `1px solid ${C.border}` : 'none',
                        }}>
                          <span style={{fontSize:11,color:'#aaa',width:40,flexShrink:0}}>{dayLabel.slice(0,3)}</span>
                          <span style={{fontSize:11,color:'#777',flex:1}}>{SLOT_LABELS[r.slot]}</span>
                          <span style={{fontWeight:700,color:col,fontSize:12}}>{r.condutor||'—'}</span>
                          {r.enea && (
                            <span style={{fontSize:10,color:C.purple,background:C.purpleL,borderRadius:10,padding:'1px 7px'}}>🧒</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
        }
      </div>
    );
  }

  function FiltroSelect({label,value,onChange,opts}) {
    return (
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontSize:12,color:'#888',width:62,flexShrink:0}}>{label}</span>
        <select value={value} onChange={e=>onChange(e.target.value)} style={{
          flex:1,border:`1.5px solid ${value?C.primary:'#e0e0e0'}`,borderRadius:8,
          padding:'5px 8px',fontSize:12,
          background:value?`${C.primary}0d`:'#f9f9f9',
          color:value?C.primary:'#aaa',outline:'none',
        }}>
          <option value="">Todos</option>
          {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      </div>
    );
  }

  // ── VIEW: IMPRIMIR ───────────────────────────────────────────
  function ViewImprimir() {
    function handlePrint() {
      const rows = DAYS.map((d,i) => {
        function cell(slot) {
          const k = `${d.key}:${slot}`;
          const sc = schedule[k]||{};
          const col = sc.condutor ? (driverColor[sc.condutor]||'#333') : '#bbb';
          return `<td style="border:1px solid #ccc;padding:8px 10px;background:#fff;vertical-align:top">
            <div style="font-weight:800;font-size:13px;color:${col}">${sc.condutor||'—'}</div>
            ${sc.enea?'<div style="font-size:10px;color:#7b1fa2;margin-top:3px">🧒 Enea</div>':''}
          </td>`;
        }
        return `<tr>
          <td style="border:1px solid #ccc;padding:8px;background:#e8eaf6;text-align:center;vertical-align:middle">
            <div style="font-weight:900;font-size:13px;color:#1a237e">${d.label}</div>
            <div style="font-size:10px;color:#777;margin-top:2px">${dayDate(weekStart,i)}</div>
            <div style="font-size:9px;color:#aaa;margin-top:2px">Sai: ${d.sai}</div>
          </td>
          ${cell('leva_manha')}${cell('busca_almoco')}
          ${d.tarde ? cell('leva_tarde')+cell('busca_fim')
            : '<td colspan="2" style="border:1px solid #ccc;background:#f5f5f5;text-align:center;color:#ccc;font-style:italic;vertical-align:middle">—</td>'}
        </tr>`;
      }).join('');

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Semana do Lucas</title>
        <style>
          @page{size:A4 landscape;margin:12mm}
          body{font-family:Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          .page{display:flex;flex-direction:column;height:183mm}
          table{width:100%;border-collapse:collapse;flex:1}
          th{color:#fff;padding:8px 6px;font-size:9.5px;text-transform:uppercase;border:1px solid rgba(255,255,255,.3);font-weight:800}
          #tbody tr{height:20%}
        </style>
      </head><body>
      <div class="page">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1a237e;padding-bottom:8px;margin-bottom:9px">
          <div>
            <div style="font-size:20px;font-weight:900;color:#1a237e">📅 Semana do Lucas</div>
            <div style="font-size:9px;color:#777;margin-top:2px">🏫 Grenchen Nord Schule ↔ Selzach · 🛏 Levanta 6:15 · Entra 7:30</div>
          </div>
          <div style="font-size:15px;font-weight:800;color:#1a237e">${weekLabel(weekStart)}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th rowspan="2" style="background:#1a237e">Dia / Data</th>
              <th colspan="2" style="background:#1565c0">🌅 MANHÃ</th>
              <th colspan="2" style="background:#bf360c">🌤 TARDE</th>
            </tr>
            <tr>
              <th style="background:#1976d2">🚗 Leva — 7:30</th>
              <th style="background:#1976d2">🚗 Busca</th>
              <th style="background:#d84315">🚗 Leva — 13:30</th>
              <th style="background:#d84315">🚗 Busca — 16:55</th>
            </tr>
          </thead>
          <tbody id="tbody">${rows}</tbody>
        </table>
        <div style="margin-top:7px;padding-top:6px;border-top:1px solid #ddd;font-size:9px;color:#777;display:flex;gap:14px">
          <strong style="color:#333">Legenda:</strong>
          <span>Condutor: nome de quem leva / busca</span>
          <span style="color:#7b1fa2">🧒 Enea vem junto</span>
        </div>
      </div>
      </body></html>`;

      const w = window.open('','_blank');
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 600);
    }

    return (
      <div>
        {/* Header + botão */}
        <div style={{...s.card,padding:'14px 16px',marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontWeight:800,color:C.primary,fontSize:15}}>📅 {weekLabel(weekStart)}</div>
            <div style={{fontSize:11,color:'#aaa',marginTop:2}}>Pré-visualização da semana</div>
          </div>
          <button onClick={handlePrint} style={{
            background:C.primary,color:'#fff',border:'none',borderRadius:10,
            padding:'10px 18px',fontWeight:800,fontSize:13,cursor:'pointer',
          }}>🖨️ Imprimir</button>
        </div>

        {/* Pré-visualização por dia */}
        {DAYS.map((d,i) => {
          const slots = ['leva_manha','busca_almoco',...(d.tarde?['leva_tarde','busca_fim']:[])];
          return (
            <div key={d.key} style={{...s.card,marginBottom:8,overflow:'hidden'}}>
              <div style={{background:C.primary,padding:'8px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{color:'#fff',fontWeight:800,fontSize:14}}>{d.label}</span>
                <span style={{color:'rgba(255,255,255,.6)',fontSize:11}}>{dayDate(weekStart,i)} · Sai {d.sai}</span>
              </div>
              <div style={{padding:'8px 14px'}}>
                {slots.map(slot => {
                  const key = `${d.key}:${slot}`;
                  const sc  = schedule[key]||{};
                  const col = sc.condutor ? (driverColor[sc.condutor]||C.green) : '#ccc';
                  return (
                    <div key={slot} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:`1px solid ${C.border}`}}>
                      <span style={{fontSize:12,color:'#999',flex:1}}>{SLOT_LABELS[slot]}</span>
                      <span style={{fontWeight:700,color:col,fontSize:13}}>{sc.condutor||'—'}</span>
                      {sc.enea && <span style={{fontSize:10,color:C.purple,background:C.purpleL,borderRadius:10,padding:'1px 7px'}}>🧒</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Botão de navegação semana ────────────────────────────────
  const btnNav = {
    background:'none',border:`1.5px solid ${C.border}`,borderRadius:8,
    width:36,height:36,fontSize:20,cursor:'pointer',color:C.primary,
    display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
  };

  // ── Nav inferior ─────────────────────────────────────────────
  const navItems = [
    { key:'plano',        icon:'📅', label:'Plano'     },
    { key:'autorizacoes', icon:'🔑', label:'Acesso'    },
    { key:'historico',    icon:'📋', label:'Histórico' },
    { key:'imprimir',     icon:'🖨️', label:'Imprimir'  },
  ];

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',background:C.bg,minHeight:'100vh',maxWidth:500,margin:'0 auto'}}>

      {/* Header fixo */}
      <div style={{background:C.primary,padding:'14px 16px 10px',position:'sticky',top:0,zIndex:20,boxShadow:'0 2px 10px rgba(0,0,0,0.18)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{color:'#fff',fontWeight:800,fontSize:17}}>🏫 Escola do Lucas</div>
            <div style={{color:'rgba(255,255,255,.55)',fontSize:10,marginTop:1}}>Grenchen Nord Schule · Selzach</div>
          </div>
          <div style={{minWidth:60,textAlign:'right'}}>
            {saving && <span style={{color:'rgba(255,255,255,.5)',fontSize:11}}>A guardar...</span>}
            {toast  && <span style={{color:toast.err?'#ffcdd2':'#a5d6a7',fontSize:12,fontWeight:700}}>{toast.msg}</span>}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{padding:'14px 12px 80px'}}>
        {view==='plano'        && <ViewPlano />}
        {view==='autorizacoes' && <ViewAutorizacoes />}
        {view==='historico'    && <ViewHistorico />}
        {view==='imprimir'     && <ViewImprimir />}
      </div>

      {/* Bottom nav */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:500,background:C.card,borderTop:`1px solid ${C.border}`,display:'flex',boxShadow:'0 -2px 10px rgba(0,0,0,0.08)',zIndex:30}}>
        {navItems.map(n => (
          <button key={n.key} onClick={() => setView(n.key)} style={{
            flex:1,padding:'10px 4px 12px',border:'none',
            background: view===n.key ? C.primary+'12' : 'transparent',
            color: view===n.key ? C.primary : '#bbb',
            cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2,
          }}>
            <span style={{fontSize:19}}>{n.icon}</span>
            <span style={{fontSize:9.5,fontWeight:view===n.key?800:500}}>{n.label}</span>
            {view===n.key && <div style={{width:18,height:2.5,background:C.primary,borderRadius:2,marginTop:1}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}
