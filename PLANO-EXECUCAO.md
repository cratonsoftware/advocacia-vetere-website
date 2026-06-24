# PLANO-EXECUCAO.md — Runbook de Execução

> Guia operacional para executar, em sessões separadas e sem retrabalho, todas as correções e melhorias documentadas em [`MELHORIAS.md`](./MELHORIAS.md) e [`BLOG-SEO.md`](./BLOG-SEO.md). Este arquivo é a **fonte única de verdade do progresso** — sempre leia o §6 (Registro de progresso) antes de começar e atualize-o ao terminar.
>
> Mantido pela CRATON Software. Última revisão: 2026-06-23.

---

## 1. Por que dividir em sessões

Sessões longas degradam a qualidade: o contexto se acumula, o agente perde o fio e começa a "delirar" (inventar, repetir, contradizer decisões anteriores). A estratégia para evitar isso:

- **Uma sessão = um escopo coeso = uma branch = um PR.**
- Cada sessão **começa do zero** lendo os documentos (ritual de entrada, §4) — o contexto que importa está nos arquivos, não na memória da conversa.
- Cada sessão **termina fechada**: build verde, validado, documentação atualizada e progresso marcado (ritual de saída, §5).
- A **fonte única de verdade** é o §6 deste arquivo. Nunca confie na memória da conversa para saber "o que já foi feito" — confie no registro.

> Regra de ouro: ao concluir o escopo da sessão, **encerre a janela**. Não emende a próxima sessão na mesma conversa.

---

## 2. Quantas sessões — recomendação

**S1–S10 concluídas** (fundação de SEO/E-E-A-T/performance/a11y + correções de conteúdo + diagnóstico GSC). **Novas sessões S11–S18** consolidam a **dívida técnica e as melhorias ainda em aberto** mapeadas no Apêndice A do `RELATORIO-TECNICO-S1-S8.md` e nos "Próximos passos" do `RELATORIO-MUDANCAS-S1-S8.md`. Ordem por dependência e risco:

| #                    | Sessão                       | Foco                                                                    | Depende de | Modelo      | Risco      |
| -------------------- | ---------------------------- | ----------------------------------------------------------------------- | ---------- | ----------- | ---------- |
| **S1**               | P0 — Indexação do artigo     | Pré-renderizar `/blog/:slug` + deploy hook                              | —          | **Opus**    | Médio      |
| **S2**               | Quick wins de SEO/UX         | Correções pequenas e seguras                                            | —          | Sonnet      | Baixo      |
| **S3**               | Banco — fundação E-E-A-T     | `authors`, view ISO/`updated_at`, capas no Storage                      | S1         | **Opus**    | Médio-Alto |
| **S4**               | Schema & SERP                | meta dedicados, JSON-LD Article rico, Breadcrumb, LegalService          | S3         | **Opus**    | Médio      |
| **S5**               | Topical authority & GEO/AEO  | tags, páginas de categoria, TL;DR/FAQ, `llms.txt`                       | S3         | Sonnet/Opus | Médio      |
| **S6**               | Performance & modernização   | OnPush/zoneless, fontes WOFF2, preconnect, NgOptimizedImage, índices    | —          | Sonnet      | Médio      |
| **S7**               | Acessibilidade & UX          | reduced-motion, skip link, foco, contraste, skeletons, manifest         | —          | Sonnet      | Baixo      |
| **S8** _(opcional)_  | Testes & verificação final   | smoke tests + auditoria de fechamento                                   | todas      | Opus/Sonnet | Baixo      |
| **S9**               | Correções de conteúdo        | "Advogada Familiarista" (≠ Especialista), título e FAQ do artigo        | —          | Sonnet      | Baixo      |
| **S10**              | Diagnóstico GSC — indexação  | `robots.txt` no GSC + relatórios de indexação que não atualizam         | —          | Sonnet      | Baixo      |
| **S11**              | Robustez do build (guard P0) | Falhar o build se o pré-render de slugs vier vazio em produção          | —          | **Opus**    | Médio      |
| **S12**              | Higiene de repo & build      | `.gitattributes`/EOL CRLF; `engines`/`.nvmrc` (Node fixo)               | —          | Sonnet      | Baixo      |
| **S13**              | Centralização de constantes  | `site.config.ts` (URL base, WhatsApp, contato, horário, `'Todos'`)      | S12        | Sonnet/Opus | Médio      |
| **S14**              | Testes SSR de rotas          | render tests das rotas pré-renderizadas (complementa os smoke tests)    | —          | Sonnet/Opus | Baixo      |
| **S15**              | Descoberta interna & rodapé  | expor categorias/autor no blog, seção ativa no menu, reforma do rodapé  | —          | Sonnet      | Médio      |
| **S16**              | Mapa personalizado           | Google Cloud API + sync Supabase, estilo da marca, pontos de referência | —          | **Opus**    | Médio-Alto |
| **S17** _(opcional)_ | Conteúdo & conversão         | selo OAB no hero, CTA WhatsApp contextual, "ver mais" nas avaliações    | —          | Sonnet      | Baixo      |
| **S18** _(opcional)_ | Auditoria final pós-deploy   | Lighthouse/CWV, Rich Results, confirmação de RLS, smoke check           | todas      | Sonnet      | Baixo      |

> S1–S11 e S12–S15 estão **✅ concluídas** (ver §6.1). Das pendentes:
>
> - **S11 (maior prioridade técnica) ✅ concluída** — fechou o buraco que reabriu o P0 de indexação (artigo herdando o SEO da Home) entre a S1 e a S8, de forma silenciosa, com guard de build em produção.
> - **S12 deveria vir cedo:** há 47 arquivos "modificados" que são só conversão LF→CRLF (`git diff -w` = 0). Normalizar EOL **antes** de abrir branches de feature evita ruído em diffs/PRs.
> - **S13 depende da S12** (mexe em muitos arquivos — melhor sobre uma árvore com EOL já normalizado).
> - **S14, S15, S16** são independentes entre si. **S16** (mapa via Google Cloud) é a de maior risco/escopo.
> - **S17 e S18 são opcionais** e não bloqueiam nenhum DoD.
> - **Ordem recomendada (restante):** S12 → S13/S14 → S15/S16 → S17/S18.

---

## 3. Modelo e configuração recomendados

**Modelos (Claude):**

- **Opus 4.8** — sessões arquiteturais e críticas: **S1, S3, S4, S5, S8, S11** e **S16**. Exigem raciocínio sobre SSR, robustez de build, migração de schema, arquitetura de SEO e integração com Google Cloud; vale o modelo mais capaz para não errar.
- **Sonnet 4.6** — sessões mais mecânicas: **S2, S6, S7, S9, S10, S12, S14, S15, S17, S18**. Boa relação custo/qualidade para edições pontuais, correções de conteúdo, higiene de repo, testes, UX e diagnóstico operacional. **S13** (centralização de constantes) pode ser Sonnet ou Opus conforme o tamanho do refactor.
- **Haiku** — não recomendado para execução destas sessões (ok apenas para tarefas triviais isoladas).

**Configuração de cada sessão:**

1. **Use o Plan Mode primeiro** — peça o plano da sessão, aprove, depois execute. Reduz drasticamente erro e desvio de escopo.
2. **Conecte os MCPs necessários** antes de começar:
    - **Supabase** (migrações, leitura de schema) — essencial em S1, S3, S5.
    - **Vercel** (deploy, logs, deploy hooks) — essencial em S1.
    - **GitHub** (branch/PR) — todas as sessões.
3. **Trabalhe sempre em branch de feature** (`feat/...`, `fix/...`) — nunca direto na `main`. O preview deploy da Vercel valida antes do merge.
4. **Mantenha o task list ativo** durante a sessão (uma task por item do escopo).
5. **Não acumule:** se a sessão ficar longa/pesada, encerre, faça commit do que está pronto, marque o progresso e retome em nova sessão.

---

## 4. Ritual de ENTRADA (início de toda sessão)

Execute nesta ordem, sempre:

1. Ler [`CLAUDE.md`](./CLAUDE.md) e [`ARCHITECTURE.md`](./ARCHITECTURE.md) (contexto permanente).
2. Ler o **§6 Registro de progresso** deste arquivo — saber exatamente o que já foi feito e o que falta. **Não refazer o que está ✅.**
3. Ler a seção específica do escopo da sessão em [`MELHORIAS.md`](./MELHORIAS.md) e/ou [`BLOG-SEO.md`](./BLOG-SEO.md).
4. Criar a branch da sessão.
5. Criar as tasks (uma por item do escopo) e marcá-las conforme avança.

---

## 5. Ritual de SAÍDA (Definition of Done — toda sessão)

Uma sessão só está **concluída** quando **todos** os itens abaixo forem verdadeiros:

- [ ] `npm run build` completa **sem erros nem warnings críticos**.
- [ ] A **validação específica** da sessão passou (ver checklist de cada sessão, §7).
- [ ] **`README.md` e `CLAUDE.md` atualizados** se algo mudou (stack, rotas, schema, comandos, padrões). _(Obrigatório por governança — ver `CLAUDE.md`.)_
- [ ] Documentos de referência atualizados se a decisão mudou (`ARCHITECTURE.md`, `BLOG-SEO.md`, `MELHORIAS.md`).
- [ ] **§6 Registro de progresso atualizado**: itens marcados ✅ com data e hash do commit/PR.
- [ ] Commit em **Conventional Commits** + push + **preview deploy verificado** na Vercel.

---

## 6. Registro de progresso (FONTE ÚNICA DE VERDADE)

> Legenda: ⬜ Pendente · 🔄 Em andamento · ✅ Concluído · ⏸️ Bloqueado Ao concluir um item, troque o status, preencha **Data** e **Commit/PR**, e adicione nota se necessário.

### 6.1 Status das sessões

| Sessão | Status | Data | Commit/PR | Notas |
| --- | --- | --- | --- | --- |
| S1 — P0 Indexação | ✅ | 2026-06-19 | ff0a688 | Opção A: `/blog/:slug` Prerender + `getPrerenderParams`; **merge + validado em produção**; rebuild ao publicar documentado |
| S2 — Quick wins | ✅ | 2026-06-19 | f499d40 | 7 de 8 itens aplicados; §3.6 (redirect) N/A — configurado na plataforma Web3Forms |
| S3 — Banco E-E-A-T | ✅ | 2026-06-19 | 5c8de94 · 9e74ae4 | Migração aditiva aplicada via MCP Supabase; view retrocompatível com ISO+author; `get_advisors security` **limpo**; capa migrada ao Storage (`cover_image` → URL pública do bucket `article-covers`) |
| S4 — Schema & SERP | ✅ | 2026-06-19 | 3f22e3e | Branch `feat/seo-schema-serp`; build verde + push. Meta dedicados, JSON-LD Article rico, BreadcrumbList, LegalService enriquecido, og:locale + lastmod no sitemap. **Pós-deploy:** validar no Rich Results Test (preview/produção). **Follow-up S5:** trocar `author.url` da home para `/autor/maria-fernanda-vetere` quando a rota existir (ver §6.2 S5) |
| S5 — Topical & GEO | ✅ | 2026-06-20 | f5e8b711 | **Build verde + commit na `main`.** Tags + linkagem interna (G6), páginas de categoria `/blog/categoria/:slug` (G7), TL;DR + FAQ + `FAQPage` (G8), `/llms.txt` dinâmico (§4.5) + categorias no sitemap. Artigo de exemplo semeado (tags/tldr/faq) via Supabase; FAQ migrada do Markdown p/ o campo `faq`. **Pós-deploy:** validar no preview/produção (Rich Results / `/blog/categoria/familia` / `/llms.txt`). Follow-up: página `/autor/:slug` |
| S6 — Performance | ✅ | 2026-06-20 | 0a4243d6 | OnPush + zoneless (zone.js removido), signals/toSignal/computed, WOFF2 (~60% menor), preconnect, NgOptimizedImage (hero priority, fill nos cards, identity loader). Build verde. |
| S7 — Acessibilidade | ✅ | 2026-06-20 | fbc4de2f | reduced-motion, skip link, focus-visible, contraste micro-textos, skeletons, manifest. Build verde + validado. |
| S8 — Testes & verificação | ✅ | 2026-06-22 | cc4e8983 | **DoD completo.** Build verde + testes 100% (2026-06-21); merge + deploy validados em produção (2026-06-22): canonical self no artigo, todas as páginas indexadas, sitemap com `/autor/...` e página de autor no ar. Follow-ups (`/autor/:slug`, `author.url`, `canonicalUrl`/`noindex`), smoke tests e hook `pretest` entregues. P0 da auditoria **resolvido** (era falha de pré-render por env de Build; rebuild corrigiu). |
| S9 — Correções de conteúdo | ✅ | 2026-06-23 | 8bb3546a | Badge de autoria do artigo: "Especialista em categoria" → texto fixo "Advogada Familiarista". Supabase: `title`/`meta_title` do artigo atualizados; `faq = NULL`. Slug preservado. |
| S10 — Diagnóstico GSC | ✅ | 2026-06-23 | e96de4cb | Causa: `s-maxage=86400` no sitemap (cache de CDN de 24 h) → Googlebot recebia sitemap stale; "erro desconhecido" do GSC = transiente (Serverless Function timeout no passado). Correção: `s-maxage=3600, stale-while-revalidate=86400` em `api/sitemap.ts` + `api/llms.ts`; comentário `src/robots.txt` corrigido. Ações do operador no GSC documentadas em `BLOG-SEO.md` §10.7. |
| S11 — Robustez do build | ✅ | 2026-06-23 | 1d3a8a3a | Helper único `fetchPrerenderSlugs(resource, label)` em `app.routes.server.ts`: loga a contagem de slugs (artigos/categorias/autores) e, em produção (`VERCEL_ENV==='production'`), **aborta o build** se a lista vier vazia (guard aplicado aos três geradores). Preview/local mantêm `[]` tolerante. Smoke check pós-deploy documentado em `BLOG-SEO.md` §10.8. Lógica verificada por simulação (6/6 ramificações). Docs: §10.8 + ARCHITECTURE §2/§6 + CLAUDE.md + README. |
| S12 — Higiene de repo & build | ✅ | 2026-06-23 | 72f10db6 | `.gitattributes` (`* text=auto eol=lf` + binários), `.nvmrc` (`22`), `engines` `>=22 <23` no `package.json`. `git add --renormalize .` normaliza os 69 arquivos de ruído EOL. README + CLAUDE atualizados. |
| S13 — Centralização de constantes | ✅ | 2026-06-23 | 17232002 | `src/app/core/config/site.config.ts` (`SITE_URL`, `BUSINESS`, `WHATSAPP_*`, `ALL_CATEGORIES_LABEL`) consumido por `SeoService`, páginas (`artigo`/`categoria`/`autor`/`blog`), `AppComponent` e `ContatoComponent`. `api/*` e `robots.txt` mantêm a URL base com **duplicação documentada** (fora do bundle). Build/commit/preview concluídos. |
| S14 — Testes SSR de rotas | ✅ | 2026-06-24 | ca1844e0 | Render tests das 5 rotas pré-renderizadas (`home`/`blog`/`artigo`/`categoria`/`autor` `.component.spec.ts`) verificando `<h1>`, canonical self e JSON-LD por tipo; helper compartilhado `src/app/testing/seo-dom.helper.ts` (`provideRenderTestStubs`: loader de imagem transparente + `MatIconRegistry` falso + `PRECONNECT_CHECK_BLOCKLIST` → saída de teste limpa). Smoke tests de serviço da S8 mantidos. Integração via glob do `tsconfig.spec.json` (sem mudar `package.json`/`angular.json`). `npm run test` **34/34 verde, sem warnings**. Origem: `MELHORIAS.md` §1.8. |
| S15 — Descoberta interna & rodapé | ✅ | 2026-06-24 | — | Categorias do `/blog` → `RouterLink` para `/blog/categoria/:slug`; autora no artigo → link `/autor/:slug`; `routerLinkActive` no header (Blog ativo em `/blog/*`, home em `/`); rodapé 4 colunas (contato `BUSINESS` + redes sociais SVG inline + links blog/autor). Spec do blog atualizado (+2 testes). Commit/hash pendente do operador. |
| S16 — Mapa personalizado | ⬜ | — | — | Substituir o embed padrão por mapa via Google Cloud API (estilo da marca, pontos de referência, sem concorrentes), com chave server-side e cache em Supabase. Planejado no `CLAUDE.md` (Mapa — estado real). Origem: "Próximos passos" #4. |
| S17 — Conteúdo & conversão _(opcional)_ | ⬜ | — | — | Selo OAB próximo ao CTA do hero; CTA de WhatsApp contextual por seção; "ver mais" nas avaliações longas (`line-clamp-6`). Origem: `MELHORIAS.md` §5 e §3.12. |
| S18 — Auditoria final pós-deploy _(opcional)_ | ⬜ | — | — | Lighthouse/CWV (LCP<2,0s, INP<200ms, CLS<0,1), Rich Results, confirmação de RLS/anon key (§1.7) e smoke check do canonical de um artigo. Não bloqueia DoD. Origem: Apêndice A.6 / `MELHORIAS.md` §1.7. |

### 6.2 Status por item (granular)

**S1 — P0 Indexação do artigo** _(detalhes: `BLOG-SEO.md` §10)_

- ✅ `/blog/:slug` → `Prerender` com `getPrerenderParams()` lendo slugs do Supabase _(2026-06-19, `ff0a688`)_
- ✅ Rebuild ao publicar documentado (Deploy Hook + webhook) — `BLOG-SEO.md` §10.6 _(criação do hook/webhook no painel = ação do usuário, conforme combinado)_
- ✅ Validar: HTML cru com canonical self, title/H1 do artigo, conteúdo presente _(preview Vercel + produção, 2026-06-19)_
- ✅ Validado em produção (2026-06-19): home, blog e artigo carregam SEO próprio e separado após o merge. GSC/Rich Results/Ahrefs em monitoramento de reindexação.

**S2 — Quick wins** _(detalhes: `MELHORIAS.md` §7)_

- ✅ Data ISO no SEO (`dateIso` no modelo; `formatDate()` preserva ISO; SEO usa `dateIso`) — §1.4 _(2026-06-19, f499d40)_
- ✅ Campo `redirect` no formulário → N/A (redirect já configurado diretamente na plataforma Web3Forms) — §3.6
- ✅ Corrigir "Comartilhar" → "Compartilhar" — §3.10 _(2026-06-19, f499d40)_
- ✅ Navegação por âncora com `routerLink` + `fragment` (header, mobile, footer, hero) — §3.1 _(2026-06-19, f499d40)_
- ✅ `loading="lazy"` nas imagens + `fetchpriority="high"` no hero — §3.8 _(2026-06-19, f499d40)_
- ✅ `title` no iframe do mapa — §3.9 _(2026-06-19, f499d40)_
- ✅ Honeypot anti-spam no formulário (`botcheck`) — §3.7 _(2026-06-19, f499d40)_
- ✅ Remover código morto do contato (`formatarTelefone`, `enviarMensagem`) — §1.5 _(2026-06-19, f499d40)_

**S3 — Banco: fundação E-E-A-T** _(detalhes: `BLOG-SEO.md` §6 e §7)_

- ✅ Tabela `authors` (+ RLS SELECT público) + seed da autora (OAB/SP 527.527, `same_as` Instagram/Facebook) — G1 _(2026-06-19, migração `create_authors_table`)_
- ✅ Colunas aditivas em `articles` (`author_id`, `meta_title`, `meta_description`, `cover_image_alt`, `tags`, `tldr`, `faq`, `canonical_url`, `noindex`, `locale`) + índices `category_id`/`published_at desc`; backfill do artigo (autora + alt) — G4/G6/G8/G9/G10/G11/G13 _(2026-06-19, migração `add_eeat_columns_to_articles`)_
- ✅ View `published_articles` expõe `publishedAt`/`updatedAt` (ISO), `author`, `metaTitle`/`metaDescription`, `coverImageAlt`, `tags`, `tldr`, `faq`, `locale`, `canonicalUrl`, `noindex`, `categorySlug` — retrocompatível + `security_invoker` — G2/G3 _(2026-06-19, migrações `evolve_published_articles_view` e `harden_view_and_storage_security`)_
- ✅ Migrar capas para Supabase Storage 1200×630 + `cover_image_alt` — G5/G9: bucket público `article-covers`, imagem `traicao-da-direito-a-indenizacao.png` enviada pelo operador, `cover_image` apontando para a URL pública do Storage e `cover_image_alt` preenchido. URL pública validada. _(2026-06-19, migração `create_article_covers_storage_bucket` + update de `cover_image`)_
- ✅ Corrigir categoria "Familia" → "Família" — G12 _(2026-06-19, migração `fix_familia_category_accent`)_

**S4 — Schema & SERP** _(detalhes: `BLOG-SEO.md` §7; `MELHORIAS.md` §2)_ — _código aplicado 2026-06-19 na branch `feat/seo-schema-serp`; build/commit/preview pendentes do operador_

- ✅ `meta_title`/`meta_description` dedicados no front — G4 _(ArtigoComponent usa `metaTitle`/`metaDescription` da view; modelo `Artigo` estendido; `BlogService.formatDate` deriva `dateIso`/`updatedAtIso` de `publishedAt`/`updatedAt`)_
- ✅ JSON-LD Article rico (`dateModified`, `ImageObject`, `inLanguage`, `articleSection`, `keywords`, `mainEntityOfPage`, `author` Person com `identifier` OAB + `sameAs`) _(`SeoService.setJsonLd`)_
- ✅ `BreadcrumbList` nas páginas de artigo — §2.2 _(bloco JSON-LD separado por `data-seo`; Início › Blog › Artigo)_
- ✅ Enriquecer `LegalService` da home (telefone, e-mail, endereço completo, geo, `openingHoursSpecification`, `sameAs`, `priceRange`, `logo`) — §2.1
- ✅ `og:locale` (`pt_BR`) + `og:image:alt` no `SeoService`; `lastmod` de home/blog no `api/sitemap.ts` (data de modificação mais recente) — §2.3/§2.4

**S5 — Topical authority & GEO/AEO** _(detalhes: `BLOG-SEO.md` §4.3, §6, §7)_ — _código aplicado 2026-06-20 na branch `feat/topical-geo-aeo`; build/commit/preview pendentes do operador_

- ✅ `tags` por artigo + linkagem interna — G6 _(chips de `tags` no artigo; badge de categoria clicável no artigo e nos cards do `/blog`; seção "Leia também" via `BlogService.getRelatedArticles`)_
- ✅ Páginas de categoria `/blog/categoria/:slug` (usar `categorySlug`) — G7 _(`CategoriaComponent` + rota; Prerender via `getCategorySlugs`; `CollectionPage` + `BreadcrumbList`; `getCategoryBySlug`/`getArticlesByCategorySlug`)_
- ✅ `tldr` + `faq` por artigo → `FAQPage` — G8 _(bloco TL;DR no topo; seção de FAQ a partir do campo `faq`; `SeoService` emite `FAQPage` em bloco `data-seo="faq"`; modelo `Artigo` ganhou `tldr`/`faq`)_
- ✅ `/llms.txt` dinâmico a partir da view — §4.5 _(`api/llms.ts` + rewrite no `vercel.json`; páginas de categoria também adicionadas ao `api/sitemap.ts`)_
- ✅ Dados de validação semeados no artigo de exemplo (tags, TL;DR, 5 FAQs) via Supabase; a seção "Perguntas frequentes" foi migrada do Markdown `content` para o campo `faq` (fonte única, sem duplicação)
- ✅ **Follow-up (executado na S8, 2026-06-21):** criada a rota/página `/autor/:slug` (`AutorComponent`, Prerender via `getAuthorSlugs`, `ProfilePage` + `Person` + `BreadcrumbList`, lista de artigos da autora via `getArticlesByAuthorSlug`); `author.url` do `ArtigoComponent` agora aponta para `${baseUrl}/autor/${data.author?.slug}` (fallback à home se sem slug); rota incluída em `api/sitemap.ts` e `api/llms.ts`.

**S6 — Performance & modernização** _(detalhes: `MELHORIAS.md` §1.1, §4; `BLOG-SEO.md` §4.4)_ — _código aplicado 2026-06-20 na branch `perf/cwv-modernization`; build/commit/push pendentes do operador_

- ✅ `OnPush` em todos os componentes + `provideZonelessChangeDetection()` + zone.js removido de `angular.json` polyfills — §1.1 _(2026-06-20, 0a4243d6)_
- ✅ Estado migrado para `toSignal()` + `computed()` + `signal()` nos componentes com lógica (`BlogComponent`, `BlogPreviewComponent`); `ChangeDetectorRef.markForCheck()` nos componentes com `subscribe` direto (`ReviewsComponent`, `ArtigoComponent`, `CategoriaComponent`) — §1.2 _(2026-06-20, 0a4243d6)_
- ✅ 8 fontes convertidas para WOFF2 (~60% menores); `@font-face` atualizado para WOFF2 como formato primário + TTF/OTF como fallback — §4.1 _(2026-06-20, 0a4243d6)_
- ✅ `<link rel="preload">` para AnticDidone e Inter VariableFont em `src/index.html` — §4.1 _(2026-06-20, 0a4243d6)_
- ✅ `<link rel="preconnect">` para Supabase, Google Maps e Web3Forms em `src/index.html` — §4.2 _(2026-06-20, 0a4243d6)_
- ✅ `NgOptimizedImage` + `IMAGE_LOADER` identity (para URLs externas Supabase); hero com `priority` + `fill`; sobre com `width`/`height` reais (1365×2048); cards com `fill` em containers `relative h-*` — §3.8/§4.4 _(2026-06-20, 0a4243d6)_
- ✅ Índices `category_id` e `published_at desc` — G13 _(já aplicados em S3, migração `add_eeat_columns_to_articles`, 2026-06-19, 5c8de94)_

**S7 — Acessibilidade & UX** _(detalhes: `MELHORIAS.md` §3)_

- ✅ `prefers-reduced-motion` — §3.2 _(2026-06-20, fbc4de2f): `styles.scss` com bloco `@media` global; `motion-safe:animate-pulse/bounce` nos templates; autoplay do carrossel condicional via `window.matchMedia`_
- ✅ Skip link para `<main>` — §3.3 _(2026-06-20, fbc4de2f): `<a href="#main-content" class="skip-link">` antes do header; `id="main-content" tabindex="-1"` no `<main>`; classe `.skip-link` em `styles.scss`_
- ✅ Estados de foco visíveis (`focus-visible`) — §3.4 _(2026-06-20, fbc4de2f): regra global `*:focus-visible { outline: 2px solid var(--color-n4); outline-offset: 3px; }` em `styles.scss`; `*:focus { outline: none }` remove o outline padrão apenas onde o `focus-visible` assume_
- ✅ Contraste e tamanho de micro-textos — §3.5 _(2026-06-20, fbc4de2f): `text-[8px]` → `text-[11px]` no badge "Especialista" do artigo; labels `text-[9px]` com opacidade (TL;DR, Temas, Compartilhar) → `text-[11px]` sem opacidade; supra-headings `/60` → `/80`; separadores decorativos com `aria-hidden="true"`; badges de categoria uniformizados para `text-[11px]`_
- ✅ Skeletons de carregamento — §3.11 _(2026-06-20, fbc4de2f): `blog-preview` distingue `undefined` (skeleton 3 cards) de `[]` (estado vazio) via remoção do `initialValue`; `artigo` e `categoria` com skeleton que imita layout real com `aria-busy`_
- ✅ `manifest.webmanifest` + apple-touch-icon — §2.5 _(2026-06-20, fbc4de2f): `src/manifest.webmanifest` criado; adicionado ao `angular.json` assets; `<link rel="manifest">` e `<link rel="apple-touch-icon">` no `index.html`_

**S8 — Testes & verificação final** _(concluída 2026-06-22, commit `cc4e8983` na branch `test/final-verification`; build verde + testes 100% + deploy validado)_

_Follow-ups (executados primeiro, a pedido):_

- ✅ Página `/autor/:slug` (`AutorComponent` + rota + Prerender `getAuthorSlugs`); `BlogService.getAuthorBySlug`/`getArticlesByAuthorSlug`.
- ✅ `SeoService`: ramo `ProfilePage`+`Person`; `SeoConfig.canonical` (override de canônica/`og:url`/`@id`).
- ✅ `ArtigoComponent`: `author.url`→`/autor/:slug`; `canonical`=`canonicalUrl` e `noIndex`=`noindex` por artigo.
- ✅ `api/sitemap.ts` e `api/llms.ts`: entradas de autor (`/autor/:slug`).

_Escopo S8:_

- ✅ Smoke tests: `seo.service.spec.ts` (tags + JSON-LD por tipo, canonical override, breadcrumb/faq, ProfilePage) e `blog.service.spec.ts` (`formatDate`: ISO, fallback, rótulo pt-BR, `\n`, null). Hook `pretest` adicionado para gerar `environment.ts`/ícones. — `MELHORIAS.md` §1.8
- ✅ Validação (operador, 2026-06-21): `npm run build` sem erros e `npm run test` **100% aprovado**.
- ✅ **Auditoria — achado P0 resolvido (2026-06-22):** antes do merge, a URL do artigo servia o HTML/SEO da Home (canonical→home), não indexável — sintoma da S1, causado por pré-render vazio no build (env de Build). Após conferir as env vars de Build na Vercel e mergear esta branch (rebuild completo), revalidado em produção: **canonical self** no artigo, todas as páginas indexadas, sem `[prerender] Falha` no log. `/blog`, `/sitemap.xml` (com `/autor/...`) e `/llms.txt` corretos.
- ✅ Auditoria pós-deploy (operador, 2026-06-22): canonical/indexação do artigo OK; `sitemap.xml` e página `/autor/maria-fernanda-vetere` no ar. _Pendências opcionais (não bloqueiam o DoD):_ Lighthouse/CWV pontual e Rich Results. **Nota FAQ:** a marcação `FAQPage` valida no Rich Results Test, mas o Google restringe o rich result visual de FAQ a sites gov/saúde desde 2023 — a ausência do "sanfona" na SERP é política do Google, não erro (a marcação segue útil para validação e GEO/AEO).

**S9 — Correções de conteúdo**

> **Motivo (importante):** a Dra. Maria Fernanda Vetere **não** possui título de especialista; anunciar "Especialista em ..." é incorreto e pode configurar publicidade irregular perante a OAB. O termo correto e seguro é **"Advogada Familiarista"** (atuação, não titulação).

- ✅ **Trocar "Especialista em {{categoria}}" → "Advogada Familiarista"** no rodapé de autoria do artigo — `src/app/pages/artigo/artigo.component.html:104`. Texto fixo, não derivado da categoria. _(2026-06-23, fix/content-corrections)_
- ✅ **Varredura completa:** `grep -ri "especialista" src/` — único resultado relevante é `areas.component.html:49` ("especialistas renomados", parceiros, mantido). `jobTitle` no `SeoService`/componentes usa fallback `'Advogada'`. `authors.role='Advogada'`, `authors.bio` sem referência a "especialista". Nenhuma outra correção necessária. _(2026-06-23, fix/content-corrections)_
- ✅ **Remover FAQ do artigo** — `faq = NULL` via UPDATE no Supabase (MCP). O template já oculta automaticamente. _(2026-06-23, via MCP Supabase)_
- ✅ **Alterar título do artigo** — `title` e `meta_title` atualizados para "Traição dá direito a indenização? Veja o que a lei diz sobre isso." via UPDATE no Supabase. Slug `traicao-da-direito-a-indenizacao` **preservado**. _(2026-06-23, via MCP Supabase)_
- ✅ **Rebuild/redeploy:** rebuild executado e HTML cru pós-deploy validado pelo operador — o artigo traz o **novo título** e **não** contém a seção "Perguntas frequentes" nem o JSON-LD `FAQPage`; slug preservado. _(2026-06-23)_

**S10 — Diagnóstico GSC: `robots.txt` e relatórios de indexação** _(concluída 2026-06-23, branch `fix/gsc-robots-indexing`)_

> **Causa-raiz identificada (2026-06-23):** o `api/sitemap.ts` usava `s-maxage=86400` (24 h de cache de CDN), fazendo Googlebot receber o sitemap stale quando batia num edge node que não havia expirado o cache. Dois fetches simultâneos ao mesmo URL retornaram conteúdo diferente (`lastmod 2026-06-20` vs `2026-06-23`) — prova do problema. O "erro desconhecido" no `robots.txt` é transiente (Serverless Function timeout no passado) e se resolve com nova leitura no GSC.

- ✅ **Diagnóstico de host/protocolo:** apex redireciona para www em ambos `robots.txt` e `sitemap.xml` ✅. `robots.txt` 200 `text/plain` correto. Sitemap 200 `text/xml` válido. _(2026-06-23)_
- ✅ **Cache agressivo no sitemap corrigido:** `api/sitemap.ts` e `api/llms.ts` — `s-maxage=86400` → `s-maxage=3600, stale-while-revalidate=86400`. Googlebot recebe sitemap no máximo 1 h desatualizado. _(2026-06-23, fix/gsc-robots-indexing)_
- ✅ **Comentário errado em `src/robots.txt` corrigido:** "Express" → "Vercel Serverless Function (api/sitemap.ts)". _(2026-06-23, fix/gsc-robots-indexing)_
- ✅ **Diagnóstico documentado** em `BLOG-SEO.md` §10.7 com causa, fix e ações do operador no GSC. _(2026-06-23)_
- ✅ **Ações do operador no GSC** (após deploy): (1) robots.txt → "Solicitar nova leitura"; (2) Sitemaps → "Reenviar `sitemap.xml`"; (3) Inspeção de URL → `/autor/maria-fernanda-vetere` → "Testar URL ativa" + "Solicitar indexação". Executadas com êxito pelo operador. _(2026-06-23)_ Latência de 3–7 dias nos relatórios de Cobertura é normal — usar "Inspeção de URL ativa" para estado em tempo real.

**S11 — Robustez do build (guard do P0)** _(concluída 2026-06-23, branch `fix/prerender-build-guard`; detalhes: `MELHORIAS.md` §1.10; doc: `BLOG-SEO.md` §10.8)_

> **Por quê:** entre a S1 e a S8 o P0 de indexação **voltou silenciosamente** em produção — o pré-render veio vazio (env de Build) e cada artigo caiu no fallback estático da Home (canonical → home). O build passou verde mesmo assim. Esta sessão impede que isso se repita sem ninguém perceber.
>
> _Nota: o `RELATORIO-TECNICO-S1-S8.md` (Apêndice A.1) não está versionado neste checkout; seu conteúdo está integralmente refletido em `MELHORIAS.md` §1.10, usado como fonte._

- ✅ Em `app.routes.server.ts`, helper único `fetchPrerenderSlugs(resource, label)` aplicado aos **três** geradores (artigos/categorias/autores): se `process.env['VERCEL_ENV'] === 'production'` **e** a lista vier vazia, **lança erro e aborta o build**. Fallback `[]` tolerante em **preview/local**. Decisão: guard nos três (sempre há ≥1 de cada publicado). _(2026-06-23, fix/prerender-build-guard)_
- ✅ Log da **contagem de slugs** por recurso no build (`[prerender] artigos: N slug(s)...`) para inspeção rápida no log da Vercel. _(2026-06-23)_
- ✅ _(Opcional)_ Smoke check pós-deploy documentado em `BLOG-SEO.md` §10.8: `curl` do canonical de um artigo conferindo `canonical` self (não-home) — ação do operador (sem pipeline CI no repo). _(2026-06-23)_
- ✅ `BLOG-SEO.md` §10.8 (novo), `ARCHITECTURE.md` §2/§6, `CLAUDE.md` e `README.md` atualizados com a garantia de build. _(2026-06-23)_
- ✅ Verificação de lógica por simulação Node (6/6 ramificações: produção+vazio/rede→throw; preview/local+vazio→[]; com slugs→log+retorno). _(2026-06-23)_

**S12 — Higiene de repositório & reprodutibilidade** _(detalhes: Apêndice A.3 e A.5; `MELHORIAS.md` §1.9)_

> **Fazer cedo** — antes de abrir branches de feature (S13/S14/S15…), para não poluir diffs com ruído de EOL.

- ✅ Adicionar **`.gitattributes`** normalizando EOL (`* text=auto eol=lf`, com exceções binárias para fontes/imagens) e renormalizar a árvore (`git add --renormalize .`) — resolve os 69 arquivos "modificados" que eram só LF→CRLF (`git diff -w` = 0). _(2026-06-23, 72f10db6)_
- ✅ Fixar a versão do Node: `engines` `>=22 <23` no `package.json` + `.nvmrc` com major `22` — builds reproduzíveis. _(2026-06-23, 72f10db6)_
- ✅ `npm run build` verde após a normalização; `README.md` e `CLAUDE.md` atualizados com pré-requisito Node 22. _(2026-06-23, 72f10db6)_

**S13 — Centralização de constantes** _(detalhes: Apêndice A.2; `MELHORIAS.md` §1.6)_ — _depende da S12 (EOL normalizado); branch `refactor/site-config`, 2026-06-23_

- ✅ Criado `src/app/core/config/site.config.ts` com: **`SITE_URL`** (`https://www.mfernandavetere.adv.br`), **`BUSINESS`** (telefone/e-mail/endereço/geo/horário/`sameAs`/`priceRange`), **`WHATSAPP_PHONE`/`WHATSAPP_MESSAGE`/`WHATSAPP_URL`** e **`ALL_CATEGORIES_LABEL`** (`'Todos'`). _(2026-06-23)_
- ✅ Substituídos os usos hardcoded no bundle Angular: `SeoService` (`baseUrl` + objeto `business` + `openingHoursSpecification` derivado dos períodos), `artigo`/`categoria`/`autor`/`blog` `.component.ts` (+ template do `artigo` e do `blog`), `AppComponent` (botão flutuante de WhatsApp) e `ContatoComponent` (WhatsApp, e-mail, telefone, endereço, horário). _(2026-06-23)_
- ✅ **`api/*` (Serverless) e `src/robots.txt`:** decisão = **duplicação consciente e documentada** (compilam/vivem fora do bundle Angular). Mantida a URL base local com comentário apontando `site.config.ts` como fonte canônica; valores inalterados. _(2026-06-23)_
- ✅ Revisão de divergência: `grep` da URL base/telefone/e-mail/WhatsApp/`'Todos'` retorna **apenas** a config (fora de `api/*`/`robots.txt`, documentados). `WHATSAPP_URL` mantido **byte-a-byte idêntico** ao link já validado em produção (mensagem e telefone extraídos como partes reutilizáveis). _(2026-06-23)_
- ✅ Build verde + commit (`refactor:`) + push + preview — **concluído pelo operador**. _(2026-06-24, 17232002)_

**S14 — Testes SSR de rotas** _(detalhes: `MELHORIAS.md` §1.8 — parte pendente; branch `test/ssr-route-rendering`, 2026-06-24)_

> _Nota: o `RELATORIO-TECNICO-S1-S8.md` (Apêndice A.4) não está versionado neste checkout; a parte pendente da cobertura de testes está refletida em `MELHORIAS.md` §1.8, usada como fonte._

- ✅ Cobertura de **renderização das rotas pré-renderizadas**: `/`, `/blog`, `/blog/:slug`, `/blog/categoria/:slug`, `/autor/:slug` — cada uma com um `*.component.spec.ts` verificando o `<h1>` renderizado, a canonical self e os blocos JSON-LD por tipo (`LegalService`/`Blog`/`BlogPosting`+breadcrumb/`CollectionPage`+breadcrumb/`ProfilePage`+`Person`+breadcrumb). Fetches do Supabase mockados via `HttpTestingController`; `slug` via `ActivatedRoute` stub; utilitários/mocks em `src/app/testing/seo-dom.helper.ts`. _(2026-06-24, test/ssr-route-rendering)_
- ✅ Integração ao `npm run test` **sem mudar config**: o `tsconfig.spec.json` já inclui `src/**/*.spec.ts`, então os novos specs entram automaticamente; hook `pretest` (gera `environment.ts`/ícones) já existe. Smoke tests de serviço da S8 **mantidos intactos**. _(2026-06-24)_
- ✅ `CLAUDE.md` (seção Testes), `ARCHITECTURE.md` §9, `README.md` e `MELHORIAS.md` §1.8 atualizados. _(2026-06-24)_
- ✅ Saída de teste limpa: `provideRenderTestStubs()` (helper) injeta loader de imagem transparente (sem 404 de assets), `MatIconRegistry` falso (sem "Unable to find icon") e `PRECONNECT_CHECK_BLOCKLIST` (silencia NG02956 da imagem `priority` do hero). _(2026-06-24)_
- ✅ `npm run test` **34/34 verde, sem erros/warnings** + commit (`test:`) — **concluído pelo operador**. _(2026-06-24, ca1844e0)_

**S15 — Descoberta interna & rodapé** _(detalhes: "Próximos passos" #2 e #3 do `RELATORIO-MUDANCAS-S1-S8.md`; branch `feat/discovery-footer`, 2026-06-24)_

- ✅ **Expor as páginas de categoria a partir do `/blog`:** botões de filtro convertidos em `<a [routerLink]>` que navegam para `/blog/categoria/:slug`; "Todos" rota para `/blog`; busca textual mantida como filtro in-page; `RouterLinkActive` no `<nav>` de categorias. Filtro de categoria no TS removido. _(2026-06-24)_
- ✅ **Expor o perfil de autor a partir do artigo:** nome "Dra. Maria Fernanda Vetere" no rodapé do artigo envolvido com `<a [routerLink]="['/autor', article.author!.slug]">` (fallback: texto puro quando slug nulo). _(2026-06-24)_
- ✅ **Seção ativa no menu:** `RouterLinkActive` adicionado ao `header.component` — "Blog" ativo (sem `exact`) em `/blog/*`; itens de home com `exact:true` (ativos em `/`). Aplicado em desktop e mobile. _(2026-06-24)_
- ✅ **Reforma do rodapé (4 colunas):** Col 1 logo/OAB; Col 2 navegação; Col 3 contato (tel clicável `tel:`, e-mail `mailto:`, endereço, horário) de `BUSINESS`; Col 4 blog/autor + redes sociais (Instagram/Facebook/TikTok) via SVG inline de `BUSINESS.sameAs` com `aria-label`. Grade 1→2→4 colunas (mobile→tablet→desktop). _(2026-06-24)_
- ✅ **Spec do blog atualizado:** comentário S15 + 2 novos testes — verifica link "Todos" para `/blog` e que categorias são renderizadas como `<a>` em `<nav>` com `aria-label="Filtrar por categoria"`. _(2026-06-24)_

**S16 — Mapa personalizado** _(detalhes: `CLAUDE.md` "Mapa — estado real"; "Próximos passos" #4)_

> Hoje a localização é um **embed padrão** do Google Maps (`mapa.component.html`). A integração via Google Cloud API foi **planejada, não executada**.

- ⬜ Implementar mapa via **Google Cloud API** com estilo da marca, pontos de referência e sem destacar concorrentes.
- ⬜ **Chave exclusiva** deste projeto, usada **server-side / em pipeline de sincronização** — nunca exposta no client (mesma disciplina das avaliações). Cache em Supabase para poupar quota.
- ⬜ Não degradar CWV/CLS (reservar espaço; `loading="lazy"` quando fizer sentido). Build verde; atualizar `CLAUDE.md`/`ARCHITECTURE.md`.

**S17 — Conteúdo & conversão (opcional)** _(detalhes: `MELHORIAS.md` §5 e §3.12)_

- ⬜ **Selo OAB discreto** próximo ao CTA do hero (prova de credibilidade), mantendo a sobriedade.
- ⬜ **CTA de WhatsApp contextual por seção** (mensagem pré-preenchida variando conforme a origem; hoje é genérica e duplicada — alinhar com S13).
- ⬜ **"Ver mais" nas avaliações longas** (`line-clamp-6` corta o texto sem expandir) — expandir/colapsar preservando o layout.

**S18 — Auditoria final pós-deploy (opcional)** _(detalhes: Apêndice A.6; `MELHORIAS.md` §1.7)_

- ⬜ **Lighthouse/CWV** em produção (LCP < 2,0s, INP < 200ms, CLS < 0,1).
- ⬜ **Rich Results Test** dos tipos (`BlogPosting`, `LegalService`, `CollectionPage`, `ProfilePage`, `FAQPage` onde houver).
- ⬜ **Confirmar RLS/anon key (§1.7):** RLS ON e policies `SELECT` públicas (sem escrita anônima) em `published_articles`/`categories`/`google_reviews`/`authors`; documentar no `ARCHITECTURE.md`.
- ⬜ **Smoke check** do canonical de um artigo (self, não-home) e do `/llms.txt`/`sitemap.xml`.

---

## 7. Checklists de validação por sessão

- **S1:** `curl -sL <url-artigo>` mostra canonical self + título/H1 do artigo + corpo; GSC "Testar URL ativa" indexável; Rich Results sem erro; recrawl Ahrefs com `Is indexable: true`.
- **S2:** build ok; enviar formulário cai em `/sucesso`; navegar de `/blog` para "Sobre" funciona; imagens com `lazy`; sem "Comartilhar".
- **S3:** `select` na view retorna `publishedAt`/`updatedAt` ISO e objeto `author`; RLS ativo na nova tabela (`get_advisors security`); capas servidas do Storage.
- **S4:** Rich Results Test valida `BlogPosting` com `author`, `datePublished`, `dateModified`; `LegalService` com telefone/geo/horário; cartões sociais corretos.
- **S5:** `/blog/categoria/familia` renderiza com SEO próprio; `FAQPage` válido; `/llms.txt` acessível e correto.
- **S6:** Lighthouse — LCP < 2,0s, INP < 200ms, CLS < 0,1; bundle sem `zone.js` (se zoneless); fontes WOFF2 no network.
- **S7:** navegação 100% por teclado; skip link visível ao focar; contraste AA; `prefers-reduced-motion` respeitado.
- **S9:** `grep -ri "especialista"` no `src/` não retorna nada referente à Dra. (apenas o caso legítimo de "especialistas" parceiros, se mantido); rodapé do artigo mostra "Advogada Familiarista"; após rebuild, o HTML cru do artigo traz o **novo título** e **não** contém a seção "Perguntas frequentes" nem o JSON-LD `FAQPage`; slug preservado (ou redirect 301 ativo). Build verde.
- **S10:** `curl -I` em `robots.txt` e `sitemap.xml` retorna 200 no host canônico (e apex redireciona p/ `www`); GSC relê o `robots.txt` sem erro; sitemap reenviado e aceito; diagnóstico documentado no `BLOG-SEO.md` §10.
- **S11:** build local/preview com lista vazia simulada **não** quebra; build com `VERCEL_ENV=production` e lista vazia **falha** (erro claro no log); deploy normal loga a contagem de slugs (≥1); canonical de um artigo segue self pós-deploy.
- **S12:** `git diff -w` continua limpo após renormalização; `.gitattributes` presente; `node -v` bate com `.nvmrc`/`engines`; `npm run build` verde; nenhum arquivo "fantasma" só de EOL nos PRs seguintes.
- **S13:** `grep` pela URL base/telefone/WhatsApp retorna **apenas** a config (fora de `api/*`, se aplicável); build verde; valores idênticos aos anteriores (sem divergência).
- **S14:** `npm run test` verde incluindo os testes de render das rotas pré-renderizadas (h1/canonical/JSON-LD presentes).
- **S15:** categorias e perfil de autor alcançáveis por navegação a partir do blog; item de menu da seção atual destacado; rodapé novo com contatos/redes e navegação por teclado/contraste OK; build verde.
- **S16:** mapa renderiza com estilo da marca; chave **não** aparece no bundle/cliente (inspecionar network/JS); cache em Supabase funcionando; sem regressão de CLS; build verde.
- **S17:** selo OAB visível e sóbrio no hero; CTA de WhatsApp varia por seção; avaliações longas expandem/colapsam sem quebrar layout.
- **S18:** relatórios Lighthouse/Rich Results anexados; RLS confirmado e documentado; smoke check do canonical/`sitemap.xml`/`llms.txt` OK.

---

## 8. Avaliação de didática da documentação

Estado atual dos documentos para execução **sem erro**:

- `CLAUDE.md` — contexto permanente ✅ (atualizado; agora com governança no §"Governança").
- `ARCHITECTURE.md` — fluxo de dados e schema ✅.
- `BLOG-SEO.md` — diagnósticos, schema-alvo, JSON-LD e validação **com código** ✅.
- `MELHORIAS.md` — backlog priorizado por impacto/esforço ✅.
- `PLANO-EXECUCAO.md` (este) — transforma os documentos de **referência** em **runbook executável** (sessões, DoD, registro de progresso) ✅.

> Os documentos eram fortes como **referência**, mas faltava o passo a passo de execução e o controle de progresso — exatamente o que este runbook adiciona. Com ele, cada sessão tem entrada, escopo, validação e saída inequívocos.

---

## 9. Prompt padrão de sessão

Cole o prompt da sessão correspondente no **início de uma conversa nova** (uma sessão = uma conversa). Use o **modelo recomendado** (§3) e deixe o agente entrar em **Plan Mode** antes de executar.

### 9.1 Template genérico (preencha `{{...}}`)

```
Você vai executar a {{SESSÃO: ex. S2}} do projeto Advocacia Vetere.

CONTEXTO (leia ANTES de propor qualquer coisa, nesta ordem):
1. CLAUDE.md e ARCHITECTURE.md (contexto permanente e arquitetura).
2. PLANO-EXECUCAO.md §6 (Registro de progresso) — a FONTE ÚNICA DE VERDADE.
   NÃO refaça nada que já esteja ✅. Considere as dependências entre sessões.
3. A seção de escopo desta sessão: {{REFERÊNCIAS: ex. MELHORIAS.md §7}}.

ESCOPO (faça SOMENTE isto, nada além):
{{LISTA DE ITENS da §6.2 desta sessão}}

REGRAS:
- Primeiro entre em Plan Mode e me apresente o plano APENAS desta sessão; aguarde minha aprovação antes de editar qualquer arquivo.
- Trabalhe em uma branch de feature ({{feat|fix}}/{{nome-curto}}); nunca direto na main.
- Mantenha o task list ativo (uma task por item do escopo).
- Se descobrir algo fora do escopo, NÃO faça: registre em MELHORIAS.md e siga.

DEFINITION OF DONE (obrigatório antes de encerrar):
- `npm run build` sem erros nem warnings críticos.
- Validação específica desta sessão (PLANO-EXECUCAO.md §7) aprovada.
- README.md e CLAUDE.md atualizados se algo mudou; docs de referência também.
- PLANO-EXECUCAO.md §6 atualizado: itens ✅ com data e hash do commit/PR.
- Commit em Conventional Commits + push + preview deploy verificado na Vercel.

Ao concluir, faça um resumo do que foi feito, do que ficou ⏸️ (com causa) e encerre a sessão.
```

### 9.2 Prompts prontos por sessão

**S1 — P0 Indexação do artigo (modelo: Opus + Plan Mode)**

```
Execute a S1 do projeto Advocacia Vetere.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6 e BLOG-SEO.md §10. Não refaça o que já estiver ✅.
Escopo (somente isto): corrigir a indexação do artigo, que hoje herda o SEO da Home.
- Mudar /blog/:slug para RenderMode.Prerender com getPrerenderParams() lendo os slugs do Supabase no build (Opção A do §10). Se eu pedir publicação instantânea, em vez disso aplicar a Opção B (garantir a função SSR dinâmica na Vercel).
- Configurar rebuild ao publicar (Vercel Deploy Hook + webhook do Supabase).
- Garantir SEO próprio do artigo (canonical self, title/H1/OG/JSON-LD).
Entre em Plan Mode e aguarde aprovação. Trabalhe em branch fix/article-prerender-seo.
Validação (§7 S1): curl da URL do artigo com canonical self + título/H1/corpo do artigo; GSC Inspeção de URL indexável; Rich Results sem erro; recrawl Ahrefs.
DoD: build verde, README/CLAUDE + docs atualizados, §6 marcado ✅ com data e commit, Conventional Commits + push + preview verificado. Resuma e encerre.
```

**S2 — Quick wins (modelo: Sonnet + Plan Mode)**

```
Execute a S2 do projeto Advocacia Vetere.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6 e MELHORIAS.md §7. Não refaça o que já estiver ✅.
Escopo (somente os itens da S2 no §6.2): data ISO no SEO (§1.4), campo redirect → /sucesso (§3.6), corrigir "Comartilhar" (§3.10), navegação âncora com routerLink+fragment (§3.1), loading=lazy + prioridade no hero (§3.8), title no iframe do mapa (§3.9), honeypot anti-spam (§3.7), remover código morto do contato (§1.5).
Entre em Plan Mode e aguarde aprovação. Branch fix/quick-wins-seo-ux.
Validação (§7 S2). DoD completo (build, docs, §6 ✅ com data/commit, push, preview). Resuma e encerre.
```

**S3 — Banco: fundação E-E-A-T (modelo: Opus + Plan Mode)**

```
Execute a S3 do projeto Advocacia Vetere. Pré-requisito: S1 concluída.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6 e BLOG-SEO.md §6 e §7. Não refaça o que já estiver ✅.
Escopo (somente S3): tabela authors + RLS SELECT público (G1); colunas aditivas em articles + índices (G4/G6/G8/G9/G10/G11/G13); evoluir a view published_articles expondo publishedAt/updatedAt (ISO), author e novos campos (G2/G3); migrar capas para Supabase Storage 1200×630 + cover_image_alt (G5/G9); corrigir categoria "Familia"→"Família" (G12).
IMPORTANTE: migração ADITIVA e não destrutiva; manter a view retrocompatível.
Entre em Plan Mode e aguarde aprovação. Use o MCP do Supabase. Branch feat/db-eeat-foundation.
Validação (§7 S3): select na view retorna ISO + author; get_advisors security sem alertas de RLS; capas servidas do Storage. DoD completo. Resuma e encerre.
```

**S4 — Schema & SERP (modelo: Opus + Plan Mode)**

```
Execute a S4 do projeto Advocacia Vetere. Pré-requisito: S3 concluída.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6, BLOG-SEO.md §7 e MELHORIAS.md §2. Não refaça o que já estiver ✅.
Escopo (somente S4): usar meta_title/meta_description dedicados (G4); JSON-LD Article rico (dateModified, ImageObject, inLanguage, articleSection, keywords, mainEntityOfPage, author Person); BreadcrumbList nos artigos (§2.2); enriquecer LegalService da home (telefone, geo, horário, sameAs) (§2.1); og:locale + lastmod de home/blog no sitemap (§2.3/§2.4).
Entre em Plan Mode e aguarde aprovação. Branch feat/seo-schema-serp.
Validação (§7 S4): Rich Results Test valida BlogPosting (author/datePublished/dateModified) e LegalService; cartões sociais corretos. DoD completo. Resuma e encerre.
```

**S5 — Topical authority & GEO/AEO (modelo: Opus ou Sonnet + Plan Mode)**

```
Execute a S5 do projeto Advocacia Vetere. Pré-requisito: S3 concluída.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6 e BLOG-SEO.md §4.3/§6/§7. Não refaça o que já estiver ✅.
Escopo (somente S5): tags por artigo + linkagem interna (G6); páginas de categoria /blog/categoria/:slug usando category.slug (G7); tldr + faq por artigo com FAQPage (G8); /llms.txt dinâmico a partir da view (§4.5).
Entre em Plan Mode e aguarde aprovação. Branch feat/topical-geo-aeo.
Validação (§7 S5): /blog/categoria/familia com SEO próprio; FAQPage válido; /llms.txt acessível e correto. DoD completo. Resuma e encerre.
```

**S6 — Performance & modernização (modelo: Sonnet + Plan Mode)**

```
Execute a S6 do projeto Advocacia Vetere.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6, MELHORIAS.md §1.1/§4 e BLOG-SEO.md §4.4. Não refaça o que já estiver ✅.
Escopo (somente S6): OnPush em todos os componentes e avaliar zoneless (§1.1); migrar estado para signals/AsyncPipe (§1.2); fontes WOFF2 + preload das críticas (§4.1); preconnect Supabase/Maps/Web3Forms (§4.2); NgOptimizedImage com alvo LCP<2,0s e CLS<0,1 (§3.8/§4.4); índices category_id e published_at (G13).
Entre em Plan Mode e aguarde aprovação. Branch perf/cwv-modernization.
Validação (§7 S6): Lighthouse LCP<2,0s, INP<200ms, CLS<0,1; WOFF2 no network. DoD completo. Resuma e encerre.
```

**S7 — Acessibilidade & UX (modelo: Sonnet + Plan Mode)**

```
Execute a S7 do projeto Advocacia Vetere.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6 e MELHORIAS.md §3. Não refaça o que já estiver ✅.
Escopo (somente S7): prefers-reduced-motion em pulse/bounce/autoplay (§3.2); skip link para <main> (§3.3); focus-visible consistente (§3.4); contraste e tamanho de micro-textos (§3.5); skeletons de carregamento (§3.11); manifest.webmanifest + apple-touch-icon (§2.5).
Entre em Plan Mode e aguarde aprovação. Branch feat/a11y-ux.
Validação (§7 S7): navegação 100% por teclado; skip link visível ao focar; contraste AA; reduced-motion respeitado. DoD completo. Resuma e encerre.
```

**S8 — Testes & verificação final (opcional; modelo: Opus/Sonnet + Plan Mode)**

```
Execute a S8 (verificação final) do projeto Advocacia Vetere. Pré-requisito: S1–S7 concluídas.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6 (confirme tudo ✅) e MELHORIAS.md §1.8.
Escopo (somente S8): smoke tests de SeoService e BlogService.formatDate; auditoria final (Lighthouse/CWV, Rich Results, sitemap, indexação no GSC).
Entre em Plan Mode e aguarde aprovação. Branch test/final-verification.
Validação: testes passando; auditoria sem regressões. DoD completo. Resuma o estado final do projeto e encerre.
```

**S9 — Correções de conteúdo (modelo: Sonnet + Plan Mode)**

```
Execute a S9 do projeto Advocacia Vetere.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6 (não refaça o que já estiver ✅).
CONTEXTO CRÍTICO: a Dra. Maria Fernanda Vetere NÃO é especialista certificada — anunciar "Especialista" é incorreto e arriscado perante a OAB. O termo correto é "Advogada Familiarista".
Escopo (somente S9):
1) Trocar "Especialista em {{categoria}}" por "Advogada Familiarista" no rodapé de autoria (src/app/pages/artigo/artigo.component.html:104), usando texto fixo (não derivar da categoria).
2) Varrer o projeto E os dados do Supabase (authors.bio, articles.content/meta_title/meta_description/tldr, Person do SeoService) por "especialista/specialty/jobTitle" e corrigir onde se referir à titulação da Dra. NÃO mexer em "especialistas renomados" de areas.component.html (são parceiros) sem confirmar o contexto.
3) Remover a FAQ do último artigo: esvaziar o campo `faq` (NULL/[]) na tabela articles via MCP Supabase — NÃO esconder pelo template (a fonte é o dado; o componente já oculta quando vazio).
4) Alterar o título do último artigo para: "Traição dá direito a indenização? Veja o que a lei diz sobre isso." (articles.title; revisar meta_title). PRESERVAR o slug atual para não quebrar indexação; se mudar, planejar redirect 301.
Lembre: /blog/:slug é PRÉ-RENDERIZADO — mudanças de dados só aparecem após rebuild (Deploy Hook/push). Valide o HTML cru pós-deploy.
Entre em Plan Mode e aguarde aprovação. Use o MCP do Supabase. Branch fix/content-corrections.
Validação (§7 S9). DoD completo (build, docs, §6 ✅ com data/commit, push, preview/rebuild). Resuma e encerre.
```

**S10 — Diagnóstico GSC: robots.txt e indexação (modelo: Sonnet + Plan Mode)**

```
Execute a S10 do projeto Advocacia Vetere.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6 e BLOG-SEO.md §10.
PROBLEMA: o Google Search Console reporta "erro desconhecido" ao acessar o robots.txt e os relatórios de indexação não atualizam, mesmo com muita coisa já indexada.
ACHADO INICIAL (2026-06-23): GET https://www.mfernandavetere.adv.br/robots.txt responde 200 text/plain correto — então provavelmente NÃO é defeito do arquivo. Investigue antes de mudar código.
Escopo (somente S10, diagnóstico-first):
1) Reproduzir/classificar o erro no GSC (Configurações → robots.txt: status, última leitura, mensagem exata) e solicitar nova leitura.
2) Verificar consistência de host: apex (mfernandavetere.adv.br) vs www — ambos devem responder 200 em robots.txt e sitemap.xml (idealmente apex→301→www). Conferir se a propriedade no GSC (Domínio vs Prefixo de URL) bate com o host canônico.
3) Validar a cadeia robots→sitemap: sitemap.xml 200 application/xml válido (rewrite vercel.json → api/sitemap.ts) e reenviar no GSC.
4) Conferir cache/headers da Vercel (sem cache agressivo, sem bloqueio de user-agent); avaliar `headers` no vercel.json só se necessário.
5) Relatórios que "não atualizam": documentar que o relatório de Páginas do GSC tem latência de dias; usar Inspeção de URL (Testar URL ativa) e Solicitar indexação para estado em tempo real.
Entregável: registrar causa provável + ajustes no BLOG-SEO.md §10. A sessão pode encerrar SEM alteração de código se a causa for de propriedade/latência do GSC.
Entre em Plan Mode e aguarde aprovação. Branch fix/gsc-robots-indexing (só se houver mudança de código).
Validação (§7 S10). DoD: se houver código, build verde + push + preview; sempre, docs atualizados e §6 marcado. Resuma e encerre.
```

**S11 — Robustez do build / guard do P0 (modelo: Opus + Plan Mode)**

```
Execute a S11 do projeto Advocacia Vetere. PRIORIDADE MÁXIMA das pendentes.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6, RELATORIO-TECNICO-S1-S8.md (Apêndice A.1) e MELHORIAS.md §1.10. Não refaça o que já estiver ✅.
CONTEXTO: entre a S1 e a S8 o P0 de indexação VOLTOU em produção porque o pré-render veio vazio (env de Build) e o build passou verde mesmo assim. Cada artigo caiu no fallback da Home (canonical→home).
Escopo (somente S11):
1) Em app.routes.server.ts, nos getPrerenderParams de artigos (avaliar categorias/autores): se VERCEL_ENV==='production' E a lista de slugs vier vazia esperando ≥1, LANÇAR erro e abortar o build. Manter [] tolerante em preview/local.
2) Logar a contagem de slugs pré-renderizados no build.
3) (Opcional) smoke check pós-deploy (curl do canonical de um artigo).
4) Atualizar BLOG-SEO.md §10 e ARCHITECTURE.md.
Entre em Plan Mode e aguarde aprovação. Branch fix/prerender-build-guard.
Validação (§7 S11). DoD completo (build verde, docs, §6 ✅, push, preview). Resuma e encerre.
```

**S12 — Higiene de repositório & reprodutibilidade (modelo: Sonnet + Plan Mode)**

```
Execute a S12 do projeto Advocacia Vetere. Faça ANTES de abrir branches de feature (S13+).
Leia antes: CLAUDE.md, PLANO-EXECUCAO.md §6, RELATORIO-TECNICO-S1-S8.md (Apêndice A.3 e A.5) e MELHORIAS.md §1.9.
CONTEXTO: 47 arquivos aparecem "modificados" mas são só conversão LF→CRLF (git diff -w = 0). Não há .gitattributes nem versão de Node fixada.
Escopo (somente S12):
1) Adicionar .gitattributes (ex.: * text=auto eol=lf, com exceções binárias p/ fontes/imagens) e renormalizar (git add --renormalize .).
2) Fixar Node: engines no package.json + .nvmrc com a major usada na Vercel.
3) Garantir npm run build verde após a normalização; atualizar README.md/CLAUDE.md (pré-requisitos).
ATENÇÃO: operações Git pesadas são do operador — monte os comandos exatos e peça execução.
Entre em Plan Mode e aguarde aprovação. Branch chore/repo-hygiene.
Validação (§7 S12). DoD completo. Resuma e encerre.
```

**S13 — Centralização de constantes (modelo: Sonnet/Opus + Plan Mode)**

```
Execute a S13 do projeto Advocacia Vetere. Pré-requisito: S12 (EOL normalizado).
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6, RELATORIO-TECNICO-S1-S8.md (Apêndice A.2) e MELHORIAS.md §1.6.
Escopo (somente S13): criar site.config.ts com URL base (hoje em SeoService, api/sitemap.ts e robots.txt), link/mensagem do WhatsApp (duplicado em app.component.html e contato), telefone/e-mail/endereço/horário e a categoria 'Todos'. Substituir os usos hardcoded.
ATENÇÃO: api/* são Serverless (fora do bundle Angular) — avaliar fonte compartilhada ou duplicação consciente e documentada.
Entre em Plan Mode e aguarde aprovação. Branch refactor/site-config.
Validação (§7 S13): nenhum valor divergiu; build verde. DoD completo. Resuma e encerre.
```

**S14 — Testes SSR de rotas (modelo: Sonnet/Opus + Plan Mode)**

```
Execute a S14 do projeto Advocacia Vetere.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6, RELATORIO-TECNICO-S1-S8.md (Apêndice A.4) e MELHORIAS.md §1.8.
Escopo (somente S14): testes de renderização das rotas pré-renderizadas (/, /blog, /blog/:slug, /blog/categoria/:slug, /autor/:slug) verificando h1, canonical self e blocos JSON-LD por tipo. Integrar ao npm run test (hook pretest já existe). Manter os smoke tests de serviço da S8.
Entre em Plan Mode e aguarde aprovação. Branch test/ssr-route-rendering.
Validação (§7 S14): npm run test verde com os novos testes. DoD completo. Resuma e encerre.
```

**S15 — Descoberta interna & rodapé (modelo: Sonnet + Plan Mode)**

```
Execute a S15 do projeto Advocacia Vetere.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6 e RELATORIO-MUDANCAS-S1-S8.md ("Próximos passos" #2 e #3).
Escopo (somente S15): expor as páginas de categoria (/blog/categoria/:slug) e o perfil de autor (/autor/:slug) a partir do blog; marcar a seção ativa no menu (routerLinkActive); reformar o rodapé (contatos, redes, OAB, links úteis) mantendo a sobriedade da marca. Preservar acessibilidade (foco/contraste/aria). Se a S13 já existir, consumir contatos da config.
Entre em Plan Mode e aguarde aprovação. Branch feat/discovery-footer.
Validação (§7 S15). DoD completo. Resuma e encerre.
```

**S16 — Mapa personalizado (modelo: Opus + Plan Mode)**

```
Execute a S16 do projeto Advocacia Vetere. Sessão de MAIOR risco/escopo.
Leia antes: CLAUDE.md (seções "Mapa — estado real" e "Avaliações"), ARCHITECTURE.md, PLANO-EXECUCAO.md §6 e RELATORIO-MUDANCAS-S1-S8.md ("Próximos passos" #4).
Escopo (somente S16): substituir o embed padrão (mapa.component.html) por um mapa via Google Cloud API com estilo da marca, pontos de referência e sem destacar concorrentes. Chave EXCLUSIVA do projeto, usada server-side / em pipeline, NUNCA no client; cache em Supabase para poupar quota (mesma disciplina das avaliações). Não degradar CWV/CLS.
ATENÇÃO: chaves só via variáveis de ambiente — nunca hardcoded. Confirme com o operador o provisionamento da chave antes de codar.
Entre em Plan Mode e aguarde aprovação. Branch feat/custom-map.
Validação (§7 S16): chave ausente do bundle; cache funcionando; sem regressão de CLS; build verde. DoD completo. Resuma e encerre.
```

**S17 — Conteúdo & conversão (opcional; modelo: Sonnet + Plan Mode)**

```
Execute a S17 (opcional) do projeto Advocacia Vetere.
Leia antes: CLAUDE.md, PLANO-EXECUCAO.md §6 e MELHORIAS.md §5 e §3.12.
Escopo (somente S17): selo OAB discreto perto do CTA do hero; CTA de WhatsApp contextual por seção (alinhar com a config da S13 se existir); "ver mais" nas avaliações longas (line-clamp-6) com expandir/colapsar. Manter a sobriedade da marca.
Entre em Plan Mode e aguarde aprovação. Branch feat/content-conversion.
Validação (§7 S17). DoD completo. Resuma e encerre.
```

**S18 — Auditoria final pós-deploy (opcional; modelo: Sonnet + Plan Mode)**

```
Execute a S18 (auditoria, opcional) do projeto Advocacia Vetere. Pré-requisito: demais sessões desejadas concluídas.
Leia antes: CLAUDE.md, ARCHITECTURE.md, PLANO-EXECUCAO.md §6, RELATORIO-TECNICO-S1-S8.md (Apêndice A.6) e MELHORIAS.md §1.7.
Escopo (somente S18): Lighthouse/CWV em produção (LCP<2,0s, INP<200ms, CLS<0,1); Rich Results dos tipos (BlogPosting/LegalService/CollectionPage/ProfilePage/FAQPage); confirmar RLS ON + policies SELECT públicas (sem escrita anônima) em published_articles/categories/google_reviews/authors e documentar no ARCHITECTURE.md; smoke check do canonical de um artigo, sitemap.xml e llms.txt.
Entre em Plan Mode e aguarde aprovação. Branch (só se houver código) chore/final-audit.
Validação (§7 S18). DoD: relatórios anexados, RLS confirmado/documentado, §6 marcado. Resuma o estado final e encerre.
```
