# Graph Report - carvalho-suites  (2026-08-26)

## Corpus Check
- 246 files · ~419,229 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 351 nodes · 652 edges · 34 communities (22 shown, 12 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 111 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Escola Grenchen (Lucas)
- App Arnold Rapport
- App Escola Grenchen — utilitarios de data
- App Hauswart (faturacao)
- Helpers Babel partilhados
- Pipeline de build/deploy + docs
- App Viagens (ativa)
- PWA manifest
- PWA manifest (dup)
- App Viagens (FINAL- orfao)
- Apps principais montadas no index.html
- build.js
- deploy.js
- Regenerator runtime (Babel)
- Escola Grenchen — campos de formulario
- Registo de apps no bundle (APPS_DATA)
- package.json
- Tema (FINAL- orfao)
- Supabase fn: manage-member
- Tema (ativo)
- Service worker (ativo)
- Redirect lucas.html
- Service worker (FINAL- orfao)
- Supabase fn: escolar-test-reminder
- Supabase fn: send-push
- Supabase fn: subby-reminders
- sw.js (dup community)
- Icon 192 (backup)
- Icon 512 (backup)
- Icon 192 (root)
- Icon 512 (root)

## God Nodes (most connected - your core abstractions)
1. `LucasApp()` - 50 edges
2. `_regenerator()` - 28 edges
3. `RpTagesView()` - 26 edges
4. `_asyncToGenerator()` - 24 edges
5. `RpPlanungView()` - 24 edges
6. `RpWochenView()` - 20 edges
7. `_slicedToArray()` - 18 edges
8. `flash()` - 15 edges
9. `ViagensApp()` - 12 edges
10. `ViagensApp()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `carvalho-suite-v75/index.html (older versioned snapshot)` --semantically_similar_to--> `index.html (generated app bundle, build 200)`  [INFERRED] [semantically similar]
  carvalho-suite-v75/index.html → index.html
- `FINAL-index.html (snapshot bundle, build 178)` --semantically_similar_to--> `index.html (generated app bundle, build 200)`  [INFERRED] [semantically similar]
  FINAL-index.html → index.html
- `Deploy Carvalho Suite (GitHub Action)` --references--> `index.html (generated app bundle, build 200)`  [INFERRED]
  .github/workflows/deploy.yml → index.html
- `build-number.txt (build 200)` --references--> `index.html (generated app bundle, build 200)`  [INFERRED]
  build-number.txt → index.html
- `FINAL-build-number.txt (build 178)` --references--> `FINAL-index.html (snapshot bundle, build 178)`  [INFERRED]
  FINAL-build-number.txt → FINAL-index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **index.html generated from src/head.html + src/*.js + src/tail.html via build.js/deploy.js** — src_head, src_tail, build_js, deploy_js, index [EXTRACTED 0.95]
- **CarvalhoSuite shell hosts five mini-apps sharing APPS_DATA registry** — index_carvalhosuite, index_horasproapp, index_agendaproapp, index_familiaapp, index_nutriguimaapp, index_escolarapp, index_apps_data [INFERRED 0.90]
- **Scheduled GitHub Actions keep Supabase backend alive and backed up** — github_workflows_backup, github_workflows_keep_alive, supabase_backend [EXTRACTED 0.90]

## Communities (34 total, 12 thin omitted)

### Community 0 - "App Escola Grenchen (Lucas)"
Cohesion: 0.13
Nodes (40): _asyncToGenerator(), _defineProperty(), LucasApp(), addCondutor(), submit(), addVisitante(), authorizeVisitanteWithCode(), deleteCondutor() (+32 more)

### Community 1 - "App Arnold Rapport"
Cohesion: 0.12
Nodes (39): RapportApp(), RpBtn(), RpConfirm(), RpField(), rpFmtD(), RpInput(), rpKW(), RpLabel() (+31 more)

### Community 2 - "App Escola Grenchen — utilitarios de data"
Cohesion: 0.11
Nodes (30): addMin(), _arrayLikeToArray(), _arrayWithHoles(), _arrayWithoutHoles(), dayDate(), getMonday(), getWeekNumber(), _iterableToArray() (+22 more)

### Community 3 - "App Hauswart (faturacao)"
Cohesion: 0.28
Nodes (17): HwArquivoTab(), HwCfgTab(), hwChf(), HwDash(), HwDatePick(), HwEmpty(), HwFld(), hwFmtDate() (+9 more)

### Community 4 - "Helpers Babel partilhados"
Cohesion: 0.22
Nodes (16): _arrayLikeToArray(), _arrayWithHoles(), _arrayWithoutHoles(), _defineProperty(), _iterableToArray(), _iterableToArrayLimit(), _nonIterableRest(), _nonIterableSpread() (+8 more)

### Community 5 - "Pipeline de build/deploy + docs"
Cohesion: 0.18
Nodes (17): build.js (assembles index.html from src/, validates syntax before writing), build-number.txt (build 200), carvalho-suite-v75/index.html (older versioned snapshot), deploy.js (build.js + bump sw.js cache version + publish to GitHub + confirm deploy), FINAL-build-number.txt (build 178), FINAL-index.html (snapshot bundle, build 178), Backup Supabase Data (GitHub Action), Deploy Carvalho Suite (GitHub Action) (+9 more)

### Community 6 - "App Viagens (ativa)"
Cohesion: 0.16
Nodes (10): vgBlankForm(), vgType(), vgUploadFoto(), ViagensApp(), deleteTrip(), load(), openAdd(), saveTrip() (+2 more)

### Community 7 - "PWA manifest"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, lifestyle, productivity, lang (+6 more)

### Community 8 - "PWA manifest (dup)"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, lifestyle, productivity, lang (+6 more)

### Community 9 - "App Viagens (FINAL- orfao)"
Cohesion: 0.22
Nodes (10): vgBlankForm(), VgForm(), vgResizeImage(), VgTripCard(), vgType(), ViagensApp(), deleteTrip(), load() (+2 more)

### Community 10 - "Apps principais montadas no index.html"
Cohesion: 0.19
Nodes (7): HorasProApp(), AgendaProApp(), FamiliaApp(), NutriguimaApp(), EscolarApp(), CarvalhoSuite(), CarvalhoSuite()

### Community 11 - "build.js"
Cohesion: 0.18
Nodes (11): BUILD_NO_FILE, crypto, { execSync }, fs, JS_SECTIONS, main(), OUT_FILE, path (+3 more)

### Community 12 - "deploy.js"
Cohesion: 0.33
Nodes (9): apiRequest(), fs, getSha(), https, main(), path, putFile(), SRC_FILES (+1 more)

### Community 13 - "Regenerator runtime (Babel)"
Cohesion: 0.31
Nodes (8): asyncGeneratorStep(), _next(), _throw(), f(), GeneratorFunctionPrototype(), i(), _regeneratorDefine2(), o()

### Community 14 - "Escola Grenchen — campos de formulario"
Cohesion: 0.28
Nodes (7): CodeField(), save(), start(), SchoolTimeField(), save(), VisitanteCodeField(), save()

### Community 15 - "Registo de apps no bundle (APPS_DATA)"
Cohesion: 0.43
Nodes (8): AgendaProApp (work agenda mini-app), APPS_DATA (shared app registry constant), CarvalhoSuite (shell app: menu, login, settings, profile), EscolarApp (Agenda Escolar mini-app), FamiliaApp (Família Carvalho mini-app), HorasProApp (work-hours tracking mini-app), NutriguimaApp (nutrition mini-app), VAPID_PUBLIC_KEY (push notification key constant)

### Community 16 - "package.json"
Cohesion: 0.25
Nodes (7): description, name, private, scripts, build, deploy, version

### Community 18 - "Tema (FINAL- orfao)"
Cohesion: 0.60
Nodes (4): applyTheme(), getEligibleProfileIds(), isInQuietHours(), resolveThemeName()

### Community 19 - "Supabase fn: manage-member"
Cohesion: 0.40
Nodes (3): corsHeaders, SERVICE_KEY, SUPABASE_URL

## Knowledge Gaps
- **65 isolated node(s):** `ASSETS`, `fs`, `path`, `crypto`, `{ execSync }` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LucasApp()` connect `App Escola Grenchen (Lucas)` to `Apps principais montadas no index.html`, `App Escola Grenchen — utilitarios de data`, `Escola Grenchen — campos de formulario`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `RapportApp()` connect `App Arnold Rapport` to `Apps principais montadas no index.html`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `CarvalhoSuite()` connect `Apps principais montadas no index.html` to `App Escola Grenchen (Lucas)`, `App Arnold Rapport`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `LucasApp()` (e.g. with `CarvalhoSuite()` and `SchoolTimeField()`) actually correct?**
  _`LucasApp()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `_regenerator()` (e.g. with `f()` and `GeneratorFunction()`) actually correct?**
  _`_regenerator()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `RpTagesView()` (e.g. with `RapportApp()` and `load()`) actually correct?**
  _`RpTagesView()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `RpPlanungView()` (e.g. with `RapportApp()` and `saveJob()`) actually correct?**
  _`RpPlanungView()` has 2 INFERRED edges - model-reasoned connections that need verification._