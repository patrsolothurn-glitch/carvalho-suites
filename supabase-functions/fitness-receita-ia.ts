// supabase-functions/fitness-receita-ia.ts
// "Adicionar prato por nome" (Carvalho Fitness) — recebe o nome de um
// prato + kcal alvo da refeição + lista de alimentos já existentes do
// utilizador, e pede a um modelo Claude para montar a receita (nome,
// modo de preparo, ingredientes com macros por 100 g/ml). A app grava
// o resultado (depois de o Patricio rever/editar a pré-visualização)
// chamando o RPC fitness_criar_opcao_ia — esta função nunca escreve
// na base de dados, só consulta o perfil do chamador para confirmar
// que é admin.
//
// Nota sobre o caminho deste ficheiro: o resto das Edge Functions
// desta suite vive todo em supabase-functions/<nome>.ts (ficheiro
// plano, sem pasta), não em supabase/functions/<nome>/index.ts — este
// repositório não é em si um projeto `supabase` (não há
// supabase/config.toml), é só onde o código-fonte das funções fica
// versionado; o Patricio copia para o projeto Supabase real antes de
// fazer deploy. Mantive essa convenção em vez do caminho pedido, para
// não introduzir um layout novo a meio dos outros — ver PR para mais
// detalhe.
//
// Deploy manual (Patricio), sempre que este ficheiro mudar:
//   1. Guardar a chave em Supabase → Edge Functions → Secrets, nome
//      ANTHROPIC_API_KEY (nunca no código).
//   2. supabase functions deploy fitness-receita-ia

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const SYSTEM_PROMPT = `És nutricionista português. A tua tarefa é criar a receita de UM prato para 1 pessoa, tal como se faz em Portugal.

Responde SÓ com JSON válido — nada de texto antes ou depois, e nunca uses blocos de código (\`\`\`).

Regras:
- Ajusta as quantidades para o total de kcal ficar dentro de ±10% da kcal_alvo indicada no pedido.
- Quando um ingrediente for o mesmo alimento que já existe na lista "alimentos_existentes" do pedido, usa exatamente o mesmo nome (string idêntica, incluindo maiúsculas/minúsculas) — nunca inventes uma variante do nome de um alimento já existente.
- Os valores nutricionais (kcal, proteína, hidratos de carbono, gordura) são sempre por 100 g ou 100 ml, baseados em tabelas de referência (INSA/USDA).
- Alimentos que se cozinham (arroz, massa, carne, leguminosas, etc.) são expressos em peso já cozinhado.
- Molhos e azeite são sempre expressos em gramas (nunca em colheres nem ml).
- Ingredientes "a gosto" (sal, ervas, especiarias, legumes de acompanhamento livre) usam "ajustavel": false.
- "preparo" é uma lista de passos curtos, numerados, como texto único (ex.: "1. Tempera o frango...\\n2. Leva ao forno...").

Formato de resposta (APENAS isto, em JSON):
{
  "nome": string,
  "preparo": string,
  "ingredientes": [
    {
      "nome": string,
      "gramas": number,
      "ajustavel": boolean,
      "nota": string | null,
      "kcal_100": number,
      "prot_100": number,
      "hc_100": number,
      "gord_100": number,
      "medida": "g" | "ml",
      "unidade_nome": string | null,
      "g_unidade": number | null
    }
  ],
  "kcal_total": number,
  "avisos": string[]
}`;

function montarMensagemUtilizador(nome: string, notas: string, kcalAlvo: number, alimentosExistentes: unknown[]): string {
  return (
    'Prato: "' + nome + '"' +
    (notas ? '\nNotas: ' + notas : '') +
    '\nkcal_alvo: ' + kcalAlvo +
    '\nalimentos_existentes (reutiliza o nome exato quando for o mesmo alimento): ' +
    JSON.stringify(alimentosExistentes)
  );
}

async function chamarAnthropic(nome: string, notas: string, kcalAlvo: number, alimentosExistentes: unknown[], apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: montarMensagemUtilizador(nome, notas, kcalAlvo, alimentosExistentes) }],
      }),
      signal: controller.signal,
    });
    if (!resp.ok) {
      throw new Error('Anthropic API respondeu ' + resp.status);
    }
    const data = await resp.json();
    const bloco = Array.isArray(data.content) ? data.content.find((c: any) => c && c.type === 'text') : null;
    if (!bloco || typeof bloco.text !== 'string') {
      throw new Error('Resposta da IA sem texto.');
    }
    return bloco.text;
  } finally {
    clearTimeout(timeoutId);
  }
}

function tentarParsearJSON(texto: string): any | null {
  if (!texto) return null;
  let limpo = texto.trim();
  if (limpo.startsWith('```')) {
    limpo = limpo.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  }
  try {
    return JSON.parse(limpo);
  } catch {
    return null;
  }
}

function validarIngrediente(ing: any): string | null {
  if (!ing || typeof ing !== 'object') return 'ingrediente inválido';
  if (typeof ing.nome !== 'string' || !ing.nome.trim()) return 'ingrediente sem nome';
  if (typeof ing.gramas !== 'number' || !(ing.gramas > 0) || ing.gramas > 1000) return 'quantidade inválida em "' + ing.nome + '"';
  if (typeof ing.kcal_100 !== 'number' || ing.kcal_100 < 0 || ing.kcal_100 > 900) return 'kcal/100 inválido em "' + ing.nome + '"';
  if (typeof ing.prot_100 !== 'number' || ing.prot_100 < 0) return 'prot_100 inválido em "' + ing.nome + '"';
  if (typeof ing.hc_100 !== 'number' || ing.hc_100 < 0) return 'hc_100 inválido em "' + ing.nome + '"';
  if (typeof ing.gord_100 !== 'number' || ing.gord_100 < 0) return 'gord_100 inválido em "' + ing.nome + '"';
  if (ing.medida !== 'g' && ing.medida !== 'ml') return 'medida inválida em "' + ing.nome + '"';
  if (ing.unidade_nome != null && typeof ing.unidade_nome !== 'string') return 'unidade_nome inválido em "' + ing.nome + '"';
  if (ing.g_unidade != null && typeof ing.g_unidade !== 'number') return 'g_unidade inválido em "' + ing.nome + '"';
  if (ing.nota != null && typeof ing.nota !== 'string') return 'nota inválida em "' + ing.nome + '"';
  if (typeof ing.ajustavel !== 'boolean') return 'ajustavel inválido em "' + ing.nome + '"';
  return null;
}

function validarReceita(r: any): string | null {
  if (!r || typeof r !== 'object') return 'resposta vazia';
  if (typeof r.nome !== 'string' || !r.nome.trim()) return 'nome em falta';
  if (typeof r.preparo !== 'string' || !r.preparo.trim()) return 'preparo em falta';
  if (!Array.isArray(r.ingredientes) || r.ingredientes.length < 1 || r.ingredientes.length > 12) return 'lista de ingredientes inválida';
  for (const ing of r.ingredientes) {
    const erro = validarIngrediente(ing);
    if (erro) return erro;
  }
  if (typeof r.kcal_total !== 'number' || r.kcal_total < 0) return 'kcal_total inválido';
  if (r.avisos != null && !Array.isArray(r.avisos)) return 'avisos inválido';
  return null;
}

async function pedirReceitaIA(nome: string, notas: string, kcalAlvo: number, alimentosExistentes: unknown[], apiKey: string) {
  const MAX_TENTATIVAS = 2; // pedido + 1 nova tentativa, só quando a resposta vem inválida
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    const texto = await chamarAnthropic(nome, notas, kcalAlvo, alimentosExistentes, apiKey);
    const parsed = tentarParsearJSON(texto);
    if (!parsed) {
      console.error('[fitness-ia] resposta não é JSON válido (tentativa ' + tentativa + ')');
      continue;
    }
    const erro = validarReceita(parsed);
    if (!erro) return parsed;
    console.error('[fitness-ia] resposta inválida (tentativa ' + tentativa + '): ' + erro);
  }
  throw new Error('A IA não conseguiu gerar uma receita válida — tenta outra vez.');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Não autenticado' }, 401);

    const userClient = createClient(SUPABASE_URL!, SERVICE_KEY!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: 'Sessão inválida' }, 401);

    const admin = createClient(SUPABASE_URL!, SERVICE_KEY!);
    const { data: callerProfile } = await admin.from('profiles').select('is_admin').eq('id', userData.user.id).single();
    if (!callerProfile?.is_admin) return json({ error: 'Apenas o admin pode fazer isto' }, 403);

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'Chave da API em falta' }, 500);

    const body = await req.json().catch(() => null);
    const nome = typeof body?.nome === 'string' ? body.nome.trim() : '';
    const notas = typeof body?.notas === 'string' ? body.notas.trim() : '';
    const kcalAlvo = Number(body?.kcal_alvo);
    const alimentosExistentes = Array.isArray(body?.alimentos_existentes) ? body.alimentos_existentes : [];

    if (!nome) return json({ error: 'Nome do prato em falta' }, 400);
    if (!Number.isFinite(kcalAlvo) || kcalAlvo <= 0) return json({ error: 'kcal_alvo inválido' }, 400);

    const receita = await pedirReceitaIA(nome, notas, kcalAlvo, alimentosExistentes, apiKey);
    return json(receita);
  } catch (e) {
    console.error('[fitness-ia] erro:', e instanceof Error ? e.message : String(e));
    return json({ error: 'Falha ao gerar a receita — tenta outra vez.' }, 500);
  }
});
