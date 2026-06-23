# Relatório Técnico de Mudanças — Site Advocacia Vetere

### Implementação das sessões S1 a S8 (engenharia)

> Documento técnico complementar ao **`RELATORIO-MUDANCAS-S1-S8.md`** (executivo). Enquanto aquele descreve _o quê_ e _por quê_ em linguagem de negócio, este detalha _como_: escopo, arquivos/camadas tocadas, decisões técnicas, hashes de commit e validação.
>
> Mantido pela CRATON Software. Base: `PLANO-EXECUCAO.md` §6 + inspeção do código em produção (`main`). Stack: Angular 21 SSR · TailwindCSS 4 · Supabase (REST/PostgREST) · Vercel. Período: 2026-06-19 a 2026-06-22.

---

## 0. Convenções e contexto de arquitetura

- **Render:** `outputMode: server` (`@angular/ssr` + Express mínimo em `src/server.ts`). Render modes declarados em `app.routes.server.ts`.
- **Dados:** acesso ao Supabase via `HttpClient` (não o SDK no cliente) — requisito para o SSR aguardar os dados antes de emitir o HTML. Exceção: `api/sitemap.ts` e `api/llms.ts` (Serverless) usam fetch/SDK fora do ciclo de render.
- **Transfer cache:** `withHttpTransferCacheOptions({ includeRequestsWithAuthHeaders: true })` — obrigatório por causa do header `apikey`.
- **Disciplina de entrega:** 1 sessão = 1 escopo = 1 branch = 1 PR, com Definition of Done (build verde, validação, docs e registro de progresso atualizados).

| Sessão | Branch                      | Commit               | Camada principal           |
| ------ | --------------------------- | -------------------- | -------------------------- |
| S1     | `fix/article-prerender-seo` | `ff0a688`            | SSR routing                |
| S2     | `fix/quick-wins-seo-ux`     | `f499d40`            | Front (templates/serviço)  |
| S3     | `feat/db-eeat-foundation`   | `5c8de94`, `9e74ae4` | Banco (Supabase)           |
| S4     | `feat/seo-schema-serp`      | `3f22e3e`            | SEO/JSON-LD                |
| S5     | `feat/topical-geo-aeo`      | `f5e8b71`            | Rotas/Serverless/SEO       |
| S6     | `perf/cwv-modernization`    | `0a4243d`            | Build/runtime/assets       |
| S7     | `feat/a11y-ux`              | `fbc4de2`            | CSS/templates/PWA          |
| S8     | `test/final-verification`   | `cc4e898`            | Testes/rota autor/SEO fino |

---

## S1 — Pré-renderização do artigo (correção do P0)

**Arquivos:** `src/app/app.routes.server.ts`; doc `BLOG-SEO.md §10.6`.

**Diagnóstico:** `/blog/:slug` estava como `RenderMode.Server`, mas a função SSR não era invocada em produção; a Vercel servia o `index.html` da Home como _catch-all_. Sintoma: canonical → home, `Is indexable: false`, content hash duplicado da Home.

**Implementação (Opção A — pré-renderização):**

- `/blog/:slug` migrado para `RenderMode.Prerender` com `getPrerenderParams()` → `getPublishedArticleSlugs()`, que faz `fetch` na view `published_articles?select=slug` em **tempo de build** (credenciais via `environment`, geradas por `set-env.cjs`).
- Cada artigo vira `blog/<slug>/index.html` estático com SEO próprio embutido — elimina a dependência do roteamento da função SSR.
- **Rebuild ao publicar:** Vercel Deploy Hook acionado por webhook do Supabase (`INSERT`/`UPDATE` em `articles`). A URL do hook é segredo (não versionada) — configuração de painel, fora do repo.

**Decisão técnica:** em falha de rede/Supabase no build, `getPrerenderParams` loga e retorna `[]` para não quebrar o deploy. _(Esta tolerância silenciosa virou dívida — ver Apêndice A.)_

**Validação:** `curl` da URL com canonical self + title/H1/corpo do artigo; GSC Inspeção de URL; Rich Results; recrawl Ahrefs.

---

## S2 — Quick wins de SEO/UX

**Arquivos:** `blog.service.ts`, `header/footer/hero` templates, `contato.component.{ts,html}`, `mapa.component.html`, templates de imagem.

| Item                        | Implementação                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Data ISO p/ SEO (§1.4)      | `formatDate()` deixa de destruir o ISO; preserva data crua para meta/JSON-LD e separa o rótulo pt-BR          |
| Navegação por âncora (§3.1) | `href="#x"` → `routerLink="/"` + `fragment="x"` em header, menu mobile, footer e hero (funciona fora da home) |
| Typo (§3.10)                | "Comartilhar" → "Compartilhar"                                                                                |
| Imagens (§3.8)              | `loading="lazy"` nas imagens + `fetchpriority="high"` no hero                                                 |
| `title` no iframe (§3.9)    | descrição acessível do mapa                                                                                   |
| Anti-spam (§3.7)            | honeypot `botcheck` (Web3Forms)                                                                               |
| Código morto (§1.5)         | remoção de `formatarTelefone()`/`enviarMensagem()` não usados                                                 |
| Redirect `/sucesso` (§3.6)  | N/A — redirect configurado na plataforma Web3Forms                                                            |

---

## S3 — Fundação E-E-A-T (banco de dados)

**Camada:** Supabase (migrações aditivas via MCP). **Sem alteração de front.** Migrações: `create_authors_table`, `add_eeat_columns_to_articles`, `evolve_published_articles_view`, `fix_familia_category_accent`, `create_article_covers_storage_bucket`, `harden_view_and_storage_security`.

- **Tabela `authors`** (`id, name, slug, role, oab, bio, avatar_url, same_as jsonb, ...`) + RLS `SELECT` público; seed da autora (OAB/SP 527.527, `same_as` Instagram/Facebook).
- **Colunas aditivas em `articles`:** `author_id`, `meta_title`, `meta_description`, `cover_image_alt`, `tags text[]`, `tldr`, `faq jsonb`, `canonical_url`, `noindex`, `locale`. Índices `articles(category_id)` e `articles(published_at desc)`.
- **View `published_articles` evoluída** — **retrocompatível**: mantém os campos antigos e adiciona `publishedAt`/`updatedAt` (ISO cru), `metaTitle`, `metaDescription`, `coverImageAlt`, `tags`, `tldr`, `faq`, `locale`, `canonicalUrl`, `noindex`, `categorySlug` e `author` (objeto JSON). Marcada `security_invoker = true` (respeita RLS das tabelas base).
- **Storage:** bucket público `article-covers`; capa 1200×630 (`<slug>.png`) substitui o hotlink do istockphoto; `cover_image_alt` preenchido.

**Decisões-chave:** migração **não destrutiva** (não quebrar a view nem o modelo `Artigo`, que consome `select=*`); `security_invoker` para que a view não burle o RLS; `get_advisors security` ficou limpo.

---

## S4 — JSON-LD rico e SERP

**Arquivos:** `core/services/seo.service.ts`, `core/models/seo.model.ts`, `pages/artigo/artigo.component.ts`, `core/services/blog.service.ts`, `api/sitemap.ts`.

- **`SeoService` multi-bloco:** múltiplos blocos JSON-LD por página, identificados por atributo `data-seo` (`main`/`breadcrumb`), via helper que obtém/cria `script[type="application/ld+json"][data-seo=...]`.
- **`BlogPosting` rico:** `mainEntityOfPage`, `image` como `ImageObject` (1200×630 + `caption`), `datePublished`/`dateModified` (ISO), `inLanguage`, `articleSection`, `keywords` (quando há `tags`), `author` como `Person` (`jobTitle`, `identifier` OAB, `sameAs`).
- **`BreadcrumbList`** (Início › Blog › Artigo) em bloco separado.
- **`LegalService` da home enriquecido:** `telephone`, `email`, `PostalAddress` completo, `GeoCoordinates`, `OpeningHoursSpecification` (Seg–Sex 09–12 / 13–17), `sameAs`, `priceRange`, `logo`, `areaServed`.
- **Transporte de data:** `BlogService.formatDate` deriva `dateIso`/`updatedAtIso` de `publishedAt`/`updatedAt` via `.toISOString()` (timestamps do PostgREST não têm `T` — por isso `new Date(...).toISOString()`, nunca `split('T')`).
- **`og:locale=pt_BR`** + `og:image:alt`; `lastmod` de home/`blog` no sitemap (data de modificação mais recente).

**Fora de escopo (decisão):** `aggregateRating` (política do Google) e `twitter:site/creator` (sem perfil X).

---

## S5 — Autoridade temática e GEO/AEO

**Arquivos:** `app.routes.{ts,server.ts}`, `pages/categoria/*`, `blog.service.ts`, `pages/artigo/*`, `seo.service.ts`, `api/llms.ts`, `api/sitemap.ts`, `vercel.json`.

- **Rota `/blog/categoria/:slug`** (`CategoriaComponent`), `RenderMode.Prerender` com `getCategorySlugs` (lê `categories` no build); SEO próprio `CollectionPage` (com `isPartOf` o `Blog`) + `BreadcrumbList`.
- **Serviços novos:** `getCategoryBySlug`, `getArticlesByCategorySlug` (filtra a view por `categorySlug`), `getRelatedArticles` (mesma categoria, `slug=neq.atual`, `limit`).
- **Artigo:** chips de `tags`, badge de categoria clicável (artigo e cards do `/blog`), bloco **TL;DR** e seção visível de **FAQ** (campo `faq` como fonte única — não duplicar no Markdown), seção "Leia também".
- **`FAQPage`:** bloco JSON-LD `data-seo="faq"` criado/removido conforme presença de `faq`.
- **`/llms.txt` dinâmico** (`api/llms.ts`): Markdown curado a partir da view (escritório, páginas principais, áreas, categorias, artigos com `tldr`→fallback `excerpt`); rewrite em `vercel.json`; cache `s-maxage=86400`. Páginas de categoria também entram no `api/sitemap.ts`.

**Decisão:** `canonicalUrl`/`noindex` (G10) ficaram como colunas disponíveis, com cabeamento no front adiado para a S8.

---

## S6 — Performance e modernização (CWV)

**Arquivos:** `app.config.ts`, `angular.json`, `src/index.html`, fontes (`assets/fonts`), templates com imagem, `blog`/`blog-preview`/`reviews`/`artigo`/`categoria`.

- **Zoneless:** `provideZonelessChangeDetection()` em `app.config.ts`; `zone.js` removido dos `polyfills` do build (`"polyfills": []`) — `zone.js`/`zone.js/testing` permanecem só na configuração de **test**.
- **OnPush** em todos os componentes. Em componentes com `subscribe` direto (`reviews`, `artigo`, `categoria`), uso de `ChangeDetectorRef.markForCheck()`; nos demais, migração para `toSignal()`/`computed()`/`signal()` (`blog`, `blog-preview`).
- **`NgOptimizedImage`** com `IMAGE_LOADER` identity (`config.src`) para servir URLs externas do Supabase Storage; hero com `priority`; cards com `fill` em containers `relative h-*`; `sobre` com `width`/`height` reais → reserva de espaço (CLS).
- **Fontes WOFF2** (~60% menores) como formato primário, TTF/OTF como fallback; `preload` de `AnticDidone-Regular.woff2` e `Inter-VariableFont` no `index.html`.
- **`preconnect`** para Supabase, `maps.googleapis.com`/`maps.gstatic.com` e `api.web3forms.com`.
- Índices de banco (G13) já aplicados na S3.

**Alvo CWV:** LCP < 2,0s, INP < 200ms, CLS < 0,1.

---

## S7 — Acessibilidade e UX

**Arquivos:** `src/styles.scss`, `app.component.html`, templates diversos, `src/manifest.webmanifest`, `angular.json` (assets), `src/index.html`.

- **`prefers-reduced-motion`:** bloco `@media` global em `styles.scss` zera durações; `motion-safe:animate-*` nos templates; autoplay do carrossel condicionado a `window.matchMedia('(prefers-reduced-motion: reduce)')` dentro de `afterNextRender`.
- **Skip link:** `<a href="#main-content" class="skip-link">` antes do header; `<main id="main-content" tabindex="-1">`; classe `.skip-link` (visível ao focar).
- **`focus-visible`:** regra global `*:focus-visible { outline: 2px solid var(--color-n4); outline-offset: 3px }`.
- **Contraste/tamanho:** piso de `text-[11px]` em micro-rótulos; opacidades elevadas; separadores decorativos com `aria-hidden="true"`.
- **Skeletons:** `blog-preview` distingue `undefined` (skeleton) de `[]` (vazio) removendo o `initialValue` do `toSignal`; `artigo` e `categoria` com skeleton e `aria-busy="true"`.
- **PWA leve:** `manifest.webmanifest` (adicionado aos assets do `angular.json`) + `apple-touch-icon`.

---

## S8 — Testes, página de autor e SEO fino

**Arquivos:** `pages/autor/*`, `app.routes.{ts,server.ts}`, `blog.service.ts`, `seo.service.ts`, `seo.model.ts`, `pages/artigo/artigo.component.ts`, `api/sitemap.ts`, `api/llms.ts`, `*.spec.ts`, `package.json`.

**Follow-ups da S5 (executados primeiro):**

- **Rota `/autor/:slug`** (`AutorComponent`), `RenderMode.Prerender` com `getAuthorSlugs` (lê `authors` no build).
- **Serviços:** `getAuthorBySlug` (aliases PostgREST `avatar:avatar_url`, `sameAs:same_as`) e `getArticlesByAuthorSlug` (filtra a view por `author->>slug`, operador JSON do PostgREST).
- **`SeoService`:** ramo `type='profile'` → `ProfilePage` com `mainEntity` `Person` rico (`jobTitle`, `identifier` OAB, `sameAs`, `worksFor` o `LegalService`) + `BreadcrumbList`.
- **SEO fino (G10):** `SeoConfig.canonical` sobrescreve canonical/`og:url`/`@id`; `SeoConfig.noIndex` → `robots: noindex,nofollow`. `ArtigoComponent` passou `author.url`→`/autor/:slug` (fallback à home), `canonical`=`canonicalUrl` e `noIndex`=`noindex` por artigo.
- **Sitemap/llms:** entradas `/autor/:slug`.

**Testes (smoke):** `seo.service.spec.ts` (montagem de tags + JSON-LD por tipo: BlogPosting/LegalService/Blog/CollectionPage/ProfilePage, override de canonical, breadcrumb/faq) e `blog.service.spec.ts` (`formatDate`: ISO 8601, fallback, rótulo pt-BR, normalização de `\n`, null). Hook **`pretest`** adicionado (`generate-icons` + `set-env`) para que `ng test` compile num checkout limpo.

**Auditoria final (achado P0 reincidente):** antes do merge, a URL do artigo voltou a servir o HTML/SEO da Home (canonical→home) — causado por **pré-render vazio no build** (env de Build na Vercel). Após conferir as variáveis de Build e mergear (rebuild completo), revalidado em produção: canonical self, todas as páginas indexadas, sem `[prerender] Falha` no log; `/blog`, `/sitemap.xml` (com `/autor/...`) e `/llms.txt` corretos.

> Nota FAQ: `FAQPage` valida no Rich Results Test, mas o Google restringe o rich result visual de FAQ a sites gov/saúde desde 2023 — a ausência do "sanfona" na SERP é política, não erro (a marcação segue útil para validação e GEO/AEO).

---

## Estado final do roteamento (`app.routes.server.ts`)

| Rota                    | Render mode | Origem dos params                                      |
| ----------------------- | ----------- | ------------------------------------------------------ |
| `/`                     | Prerender   | —                                                      |
| `/blog`                 | Prerender   | —                                                      |
| `/blog/categoria/:slug` | Prerender   | `getCategorySlugs` (tabela `categories`)               |
| `/blog/:slug`           | Prerender   | `getPublishedArticleSlugs` (view `published_articles`) |
| `/autor/:slug`          | Prerender   | `getAuthorSlugs` (tabela `authors`)                    |
| `/sucesso`              | Prerender   | —                                                      |
| `/404`                  | Prerender   | —                                                      |
| `/**`                   | Server      | fallback                                               |

---

## Apêndice A — Dívida técnica e itens em aberto (verificados no código)

1. **🟠 Pré-render tolerante a falha (alto impacto, baixo esforço):** as três funções de slug em `app.routes.server.ts` ainda fazem `catch → return []`. Em produção, isso reabre o P0 silenciosamente (foi o que ocorreu entre S1 e S8). Proposta (`MELHORIAS §1.10`): em `VERCEL_ENV === 'production'` **e** lista vazia esperando ≥1 → lançar erro e abortar o build; manter `[]` em preview/local.
2. **🟡 Centralização de constantes (`MELHORIAS §1.6`):** URL base, link de WhatsApp (duplicado em `app.component.html` e `contato`), telefone/e-mail/endereço/horário hardcoded — candidatos a um `site.config.ts`.
3. **🟡 Reprodutibilidade do build (`§1.9`):** sem `engines`/`.nvmrc`.
4. **🟡 Testes SSR de rota (`§1.8`):** entregues apenas smoke tests de serviço; falta cobertura de renderização das rotas pré-renderizadas.
5. **🔴 Higiene de repositório (achado da auditoria, fora dos docs):** a árvore de trabalho tem 47 arquivos "modificados" que são **apenas conversão LF→CRLF** (`git diff -w` = 0 mudanças reais). Sem `.gitattributes`. Não commitar; normalizar EOL antes de novas features.
6. **⚪ Validações pontuais pós-deploy:** Lighthouse/CWV e Rich Results (não bloqueiam DoD).

---

_Relatório técnico consolidado a partir do `PLANO-EXECUCAO.md` §6 e do código em `main` · CRATON Software · 2026-06-22. Complementa o `RELATORIO-MUDANCAS-S1-S8.md` (executivo)._
