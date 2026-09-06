# Graph Report - carvalho-suites  (2026-09-02)

## Corpus Check
- 328 files · ~441,239 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 483 nodes · 868 edges · 45 communities (33 shown, 12 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 165 edges (avg confidence: 0.85)
- Token cost: 89,960 input · 0 output

## Community Hubs (Navigation)
- App Escola Grenchen (Lucas)
- Apps principais — snapshots v75/FINAL
- App Arnold Rapport
- App Voz (gravador + tradutor)
- Helpers Babel (runtime, Lucas)
- CI/CD — Deploy e Arquivo Voz
- Apps principais da suite
- App Hauswart (faturação)
- App Hauswart (FINAL, protegido)
- Helpers Babel (runtime)
- PWA Manifest (v75)
- PWA Manifest
- build.js — script de build
- Snapshots e ícones (v75/FINAL)
- deploy.js — script de deploy
- package.json
- Edge Function: manage-member
- Theme (T/applyTheme)
- Service Worker (v75)
- Service Worker (FINAL)
- SQL: agenda_monteurs
- SQL: escolar_perfil
- SQL: escolar_perfil (tabela)
- Edge Function: escolar-test-reminder
- SQL: horas_projects
- Edge Function: send-push
- Edge Function: subby-reminders
- Service Worker (root)
- Tabela: voz_gravacoes

## God Nodes (most connected - your core abstractions)
1. `LucasApp()` - 51 edges
2. `VozApp()` - 31 edges
3. `_regenerator()` - 28 edges
4. `RpTagesView()` - 26 edges
5. `_asyncToGenerator()` - 24 edges
6. `RpPlanungView()` - 24 edges
7. `RpWochenView()` - 20 edges
8. `_slicedToArray()` - 19 edges
9. `flash()` - 15 edges
10. `README.md (Carvalho Suite project docs)` - 14 edges

## Surprising Connections (you probably didn't know these)
- `HorasProApp (hours tracking app)` --semantically_similar_to--> `HorasProApp (FINAL-index.html)`  [INFERRED] [semantically similar]
  index.html → FINAL-index.html
- `AgendaProApp (job scheduling app)` --semantically_similar_to--> `AgendaProApp (FINAL-index.html)`  [INFERRED] [semantically similar]
  index.html → FINAL-index.html
- `FamiliaApp (family calendar/events app)` --semantically_similar_to--> `FamiliaApp (FINAL-index.html)`  [INFERRED] [semantically similar]
  index.html → FINAL-index.html
- `EscolarApp (Vida Escolar / school agenda app)` --semantically_similar_to--> `EscolarApp (FINAL-index.html)`  [INFERRED] [semantically similar]
  index.html → FINAL-index.html
- `SubbyApp (subscriptions manager app)` --semantically_similar_to--> `SubbyApp (subscriptions manager, FINAL-index.html)`  [INFERRED] [semantically similar]
  index.html → FINAL-index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **GitHub Pages Deployment Pipeline** — _github_workflows_deploy_workflow, github_action_checkout, github_action_configure_pages, github_action_upload_pages_artifact, github_action_deploy_pages [INFERRED 0.85]
- **Voice Recording Archival Flow** — _github_workflows_voz_archive_workflow, scripts_voz_archive, service_supabase, service_google_drive [INFERRED 0.85]
- **CarvalhoSuite shell routing to its 7 mini-apps (index.html)** — index_carvalhosuite, index_horasproapp, index_agendaproapp, index_familiaapp, index_nutriguimaapp, index_escolarapp, index_lucasapp, index_subbyapp [EXTRACTED 1.00]
- **App components that read/write the shared Supabase backend** — index_horasproapp, index_agendaproapp, index_familiaapp, index_escolarapp, index_subbyapp, supabase_backend [EXTRACTED 1.00]
- **Three generated-bundle snapshots of the same src/ pipeline (v75 -> FINAL -> current)** — carvalho_suite_v75_index, final_index, index, readme_build_js [INFERRED 0.85]

## Communities (45 total, 12 thin omitted)

### Community 0 - "App Escola Grenchen (Lucas)"
Cohesion: 0.08
Nodes (58): _asyncToGenerator(), _defineProperty(), getMonday(), LucasApp(), addCondutor(), submit(), addVisitante(), AdminsSection() (+50 more)

### Community 1 - "Apps principais — snapshots v75/FINAL"
Cohesion: 0.06
Nodes (57): AgendaProApp (v75), CarvalhoSuite (shell component, v75), EscolarApp (v75), FamiliaApp (v75), HorasProApp (v75), NutriguimaApp (v75), AgendaProApp (FINAL-index.html), CarvalhoSuite (shell component, FINAL-index.html) (+49 more)

### Community 2 - "App Arnold Rapport"
Cohesion: 0.12
Nodes (39): RapportApp(), RpBtn(), RpConfirm(), RpField(), rpFmtD(), RpInput(), rpKW(), RpLabel() (+31 more)

### Community 3 - "App Voz (gravador + tradutor)"
Cohesion: 0.09
Nodes (30): VozApp(), cancelarEscuta(), clearSilenceTimer(), descartarGravacao(), falarTraducao(), guardarGravacao(), iniciarEscuta(), iniciarGravacao() (+22 more)

### Community 4 - "Helpers Babel (runtime, Lucas)"
Cohesion: 0.10
Nodes (32): addMin(), _arrayLikeToArray(), _arrayWithHoles(), _arrayWithoutHoles(), asyncGeneratorStep(), _next(), _throw(), dayDate() (+24 more)

### Community 5 - "CI/CD — Deploy e Arquivo Voz"
Cohesion: 0.11
Nodes (29): Deploy Carvalho Suite, Arquivar Voz para o Drive, actions/checkout@v4, actions/configure-pages@v4, actions/deploy-pages@v4, actions/setup-node@v4, actions/upload-pages-artifact@v3, archiveOne() (+21 more)

### Community 6 - "Apps principais da suite"
Cohesion: 0.09
Nodes (13): HorasProApp(), AgendaProApp(), FamiliaApp(), NutriguimaApp(), EscolarApp(), CarvalhoSuite(), vgBlankForm(), vgType() (+5 more)

### Community 7 - "App Hauswart (faturação)"
Cohesion: 0.28
Nodes (17): HwArquivoTab(), HwCfgTab(), hwChf(), HwDash(), HwDatePick(), HwEmpty(), HwFld(), hwFmtDate() (+9 more)

### Community 8 - "App Hauswart (FINAL, protegido)"
Cohesion: 0.28
Nodes (17): HwArquivoTab(), HwCfgTab(), hwChf(), HwDash(), HwDatePick(), HwEmpty(), HwFld(), hwFmtDate() (+9 more)

### Community 9 - "Helpers Babel (runtime)"
Cohesion: 0.22
Nodes (16): _arrayLikeToArray(), _arrayWithHoles(), _arrayWithoutHoles(), _defineProperty(), _iterableToArray(), _iterableToArrayLimit(), _nonIterableRest(), _nonIterableSpread() (+8 more)

### Community 10 - "PWA Manifest (v75)"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, lifestyle, productivity, lang (+6 more)

### Community 11 - "PWA Manifest"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, lifestyle, productivity, lang (+6 more)

### Community 12 - "build.js — script de build"
Cohesion: 0.18
Nodes (11): BUILD_NO_FILE, crypto, { execSync }, fs, JS_SECTIONS, main(), OUT_FILE, path (+3 more)

### Community 13 - "Snapshots e ícones (v75/FINAL)"
Cohesion: 0.22
Nodes (10): build-number.txt (build counter, value 230), icon-192.png (PWA icon, 192x192, v75 snapshot), icon-512.png (PWA icon, 512x512, v75 snapshot), carvalho-suite-v75/index.html (older build snapshot, v75), FINAL-build-number.txt (build counter, value 178), FINAL-index.html (generated app bundle snapshot), icon-192.png (PWA icon, 192x192, root), icon-512.png (PWA icon, 512x512, root) (+2 more)

### Community 14 - "deploy.js — script de deploy"
Cohesion: 0.33
Nodes (9): apiRequest(), fs, getSha(), https, main(), path, putFile(), SRC_FILES (+1 more)

### Community 15 - "package.json"
Cohesion: 0.25
Nodes (7): description, name, private, scripts, build, deploy, version

### Community 17 - "Edge Function: manage-member"
Cohesion: 0.40
Nodes (3): corsHeaders, SERVICE_KEY, SUPABASE_URL

## Ambiguous Edges - Review These
- `Arquivar Voz para o Drive` → `Backup Supabase Data (workflow, referenced)`  [AMBIGUOUS]
  .github/workflows/voz-archive.yml · relation: references
- `EscolarApp (Vida Escolar / school agenda app)` → `lucas.html (redirect stub to escola-grenchen GitHub Pages site)`  [AMBIGUOUS]
  lucas.html · relation: conceptually_related_to
- `LucasApp (Escola do Lucas app)` → `lucas.html (redirect stub to escola-grenchen GitHub Pages site)`  [AMBIGUOUS]
  lucas.html · relation: conceptually_related_to

## Knowledge Gaps
- **76 isolated node(s):** `ASSETS`, `fs`, `path`, `crypto`, `{ execSync }` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Arquivar Voz para o Drive` and `Backup Supabase Data (workflow, referenced)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `EscolarApp (Vida Escolar / school agenda app)` and `lucas.html (redirect stub to escola-grenchen GitHub Pages site)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `LucasApp (Escola do Lucas app)` and `lucas.html (redirect stub to escola-grenchen GitHub Pages site)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `CarvalhoSuite()` connect `Apps principais da suite` to `App Escola Grenchen (Lucas)`, `App Arnold Rapport`, `App Voz (gravador + tradutor)`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Why does `LucasApp()` connect `App Escola Grenchen (Lucas)` to `Helpers Babel (runtime, Lucas)`, `Apps principais da suite`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Why does `VozApp()` connect `App Voz (gravador + tradutor)` to `Apps principais da suite`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `LucasApp()` (e.g. with `CarvalhoSuite()` and `SchoolTimeField()`) actually correct?**
  _`LucasApp()` has 6 INFERRED edges - model-reasoned connections that need verification._