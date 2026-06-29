# ARCHITECTURE.md — Advocacia Vetere

> Documento técnico de arquitetura do site da Dra. Maria Fernanda Vetere. Mantido pela CRATON Software. Complementa o `CLAUDE.md` (contexto operacional) e o `README.md` (uso). Última revisão: 2026-06-23.

---

## 1. Visão geral

Aplicação **Angular 21 com SSR** (`outputMode: server`), hospedada na **Vercel**, com CMS de blog e avaliações no **Supabase** (acessado via REST/PostgREST). O objetivo central do projeto é **SEO** — por isso o conteúdo é renderizado no servidor antes de chegar ao navegador.

```
Navegador
   │
   ▼
Vercel (Edge/Serverless + estáticos)
   ├── Angular SSR (Express, src/server.ts) ─── renderiza HTML por rota
   │        │
   │        └── HttpClient ──► Supabase REST (PostgREST)
   │                              ├── published_articles
   │                              ├── categories
   │                              └── google_reviews
   │
   └── /api/sitemap (Serverless Function) ──► Supabase (slugs) ──► sitemap.xml
                              ▲
                              │ (rewrite em vercel.json: /sitemap.xml → /api/sitemap)

Pipeline externo (fora do runtime do site):
   Google Cloud (Places/Business) ──► sincronização agendada ──► Supabase.google_reviews
```

---

## 2. Renderização (SSR)

O servidor Express em `src/server.ts` tem responsabilidade mínima: servir os estáticos do build e repassar todas as outras requisições ao `AngularNodeAppEngine`. Não há lógica de negócio no Express.

### Render modes por rota (`src/app/app.routes.server.ts`)

| Rota                    | Modo        | Motivo                                                                                                                               |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                     | `Prerender` | Conteúdo estático — máxima performance/SEO                                                                                           |
| `/blog`                 | `Prerender` | Listagem pré-renderizada                                                                                                             |
| `/blog/:slug`           | `Prerender` | Pré-renderizado por slug (`getPrerenderParams`) — HTML estático, SEO próprio, indexável                                              |
| `/blog/categoria/:slug` | `Prerender` | Página de categoria (hub) pré-renderizada por slug (`getPrerenderParams` lê `categories`) — `CollectionPage` + `BreadcrumbList` (S5) |
| `/autor/:slug`          | `Prerender` | Página de perfil de autor pré-renderizada por slug (`getPrerenderParams` lê `authors`) — `ProfilePage` + `Person` (S8 follow-up)     |
| `/sucesso`              | `Prerender` | Página simples, `noIndex`                                                                                                            |
| `/404`                  | `Prerender` | Erro estático, `noIndex`                                                                                                             |
| `/**`                   | `Server`    | Fallback                                                                                                                             |

> O roteamento de aplicação (`app.routes.ts`) usa `loadComponent` (lazy) em todas as rotas. As páginas que dependem de dados (`/blog`, `/blog/:slug`) buscam via `HttpClient` para que o SSR aguarde a resposta antes de emitir o HTML.

> **Guard de build contra pré-render vazio (S11).** Os três `getPrerenderParams` (`/blog/:slug`, `/blog/categoria/:slug`, `/autor/:slug`) passam pelo helper `fetchPrerenderSlugs(resource, label)` em `app.routes.server.ts`. Ele **loga a contagem** de slugs por recurso e, em **produção** (`process.env['VERCEL_ENV'] === 'production'`), **aborta o build** se a lista vier vazia — impedindo que um deploy suba com os artigos caindo no fallback de SEO da Home (o P0 que reabriu silenciosamente entre a S1 e a S8). Em **preview/local** o comportamento segue tolerante (`[]`), sem travar o desenvolvimento. Detalhes em [`BLOG-SEO.md`](./BLOG-SEO.md) §10.8.

---

## 3. Acesso a dados (Supabase via REST)

**Decisão-chave:** os serviços usam `HttpClient` apontando para a Supabase REST API (PostgREST) — **não** o SDK `@supabase/supabase-js` no cliente. Motivo: o SSR do Angular só rastreia requisições feitas via `HttpClient` para decidir quando o HTML está pronto. O SDK usa `fetch` nativo e a renderização ocorreria antes dos dados chegarem (meta tags e HTML vazios).

> Exceção legítima: `api/sitemap.ts` **usa** o SDK `@supabase/supabase-js`, porque roda como Serverless Function isolada (fora do ciclo de render do Angular).

Padrão dos serviços (`blog.service.ts`, `review.service.ts`):

```typescript
private readonly apiUrl = `${environment.supabaseUrl}/rest/v1`;
private readonly headers = new HttpHeaders({
  apikey: environment.supabaseKey,
  Authorization: `Bearer ${environment.supabaseKey}`,
});
// ...catchError(() => of([])) em todas as chamadas
```

### Tabelas consumidas

| Tabela / view | Consumida por | Campos relevantes |
| --- | --- | --- |
| `published_articles` | `BlogService` | retrocompat: `id, slug, title, excerpt, content, coverImage, readTime, category, date`; **novos (S3)**: `publishedAt`/`updatedAt` (ISO), `metaTitle`, `metaDescription`, `coverImageAlt`, `tags`, `tldr`, `faq`, `locale`, `canonicalUrl`, `noindex`, `categorySlug`, `author` (objeto) |
| `categories` | `BlogService` | `id, name, slug` |
| `google_reviews` | `ReviewsService` | `author_name, rating, text, profile_photo_url, relative_time_description` |
| `authors` _(S3)_ | via view `author`; e direto pelo `BlogService` (`getAuthorBySlug`, S8) na página `/autor/:slug` | `name, slug, role, oab, bio, avatar_url, same_as` — entidade de autor (E-E-A-T) |

> A view `published_articles` aplica `ORDER BY published_at DESC`, filtra `is_published AND published_at <= now()` e é `security_invoker` (respeita o RLS das tabelas base). O front consome a view com `select=*`, então os campos novos da S3 trafegam sem quebrar o modelo `Artigo`. **Schema completo das tabelas base (`articles`, `categories`, `authors`, `google_reviews`), RLS, índices e a evolução para SEO (aplicada na S3)** estão em [`BLOG-SEO.md`](./BLOG-SEO.md).

### Transfer Cache

Configurado em `app.config.ts` com `withHttpTransferCacheOptions({ includeRequestsWithAuthHeaders: true })`. Como as chamadas levam o header `apikey`, a flag `includeRequestsWithAuthHeaders` é **obrigatória** — sem ela o cliente refaria todas as requisições ao hidratar (double-fetch).

### Segurança da chave

A `supabaseKey` é embutida no bundle do cliente (ver §6). Isso pressupõe que seja a **chave anon** e que o **RLS esteja ativo** com políticas somente-leitura (`SELECT` público) nas três tabelas acima e nenhuma escrita anônima. Confirmar no painel Supabase faz parte da manutenção de segurança.

---

## 4. Avaliações (Google ↔ Supabase) e Mapa

### Avaliações

As avaliações exibidas são **avaliações reais do Google Business**. O fluxo é:

1. Um processo de sincronização **agendado e pontual** consulta o Google Cloud (Places/Business) para capturar as avaliações do estabelecimento.
2. Os dados são gravados na tabela **`google_reviews`** do Supabase.
3. O site lê apenas o Supabase (`ReviewsService.getReviews()`, `limit=5`) via `HttpClient` — **o site não chama a Google Cloud API em tempo de execução**.

Isso evita exposição de chave Google no cliente e poupa quota (avaliações mudam raramente). O `ReviewsComponent` ainda traz um **fallback estático** de avaliações caso o Supabase retorne vazio ou falhe, garantindo que a seção nunca apareça quebrada.

### Mapa

A localização usa um **iframe de embed do Google Maps** (`mapa.component.html`). A intenção original era integrar o Supabase ao Google Cloud para um mapa personalizado, **mas isso não foi executado** — atualmente é apenas o embed padrão. Item registrado em `MELHORIAS.md`.

---

## 5. SEO

Camadas de SEO do projeto:

- **`SeoService`** (`core/services/seo.service.ts`): injeta `title`, `description`, Open Graph (incl. `og:locale=pt_BR` e `og:image:alt`), Twitter Card, `canonical` e **JSON-LD** por página. Usa o token `DOCUMENT` (SSR-safe) para manipular `<head>`. Suporta **múltiplos blocos JSON-LD** por página, identificados pelo atributo `data-seo` (`main` + `breadcrumb`). **Sufixo de marca no `<title>`** (2026-06-29): ` | Dra. Maria Fernanda Vetere` é anexado **exceto** em `type==='article'` (ou quando o título já contém a marca) — em artigos o `meta_title` é o `<title>` literal e deve ficar ≤60. Ver `BLOG-SEO.md` §11.5.
- **JSON-LD por tipo** _(S4)_:
    - `article` → **`BlogPosting` rico**: `mainEntityOfPage`, `image` como `ImageObject` (1200×630 + `caption`), `datePublished`/`dateModified` (ISO), `inLanguage`, `articleSection`, `keywords` (quando há `tags`), `author` como `Person` (`jobTitle`, `identifier` OAB, `sameAs`) — sinais de E-E-A-T. Acompanha um bloco **`BreadcrumbList`** (Início › Blog › Artigo).
    - `slug === 'blog'` → `Blog`
    - `slug` iniciando com `blog/categoria` → **`CollectionPage`** (`isPartOf` o `Blog`) + `BreadcrumbList` _(S5)_
    - `type='profile'` (página de autor) → **`ProfilePage`** com `mainEntity` **`Person`** (`jobTitle`, `identifier` OAB, `sameAs`, `worksFor` o `LegalService`) + `BreadcrumbList` _(S8 follow-up)_
    - default (home) → **`LegalService` enriquecido**: `telephone`, `email`, `address` completo, `geo`, `openingHoursSpecification`, `sameAs`, `priceRange`, `logo`, `areaServed`, `knowsAbout` (negócio local).
    - **`FAQPage`** _(S5)_ — bloco separado (`data-seo="faq"`) emitido quando o artigo tem `faq`; criado/removido conforme presença.
- **Sitemap dinâmico**: `api/sitemap.ts` (Serverless) gera `/sitemap.xml` com `xmlbuilder2`, incluindo home, `/blog`, cada **página de categoria** (`/blog/categoria/:slug`, derivada dos `categorySlug` distintos — S5), cada **página de autor** (`/autor/:slug`, derivada de `authors` — S8) e cada artigo, todos com **`lastmod`** (home/`blog`/categorias/autores usam a data de modificação mais recente entre os artigos; artigos usam `updatedAt`). Reescrito via `vercel.json`.
- **`/llms.txt` dinâmico** _(S5, §4.5)_: `api/llms.ts` (Serverless) gera um Markdown curado para crawlers de IA (GEO/AEO) a partir da view `published_articles` — cabeçalho do escritório, páginas principais, áreas de atuação, **autores** (perfil com bio/OAB — S8), categorias e cada artigo com uma linha (`tldr`→fallback `excerpt`). Reescrito de `/llms.txt` via `vercel.json`.
- **`robots.txt`** (`src/robots.txt`): libera tudo e aponta para o sitemap.
- **Constantes centrais** _(S13)_: `src/app/core/config/site.config.ts` é a **fonte única** de `SITE_URL`, dados de contato (`BUSINESS`), link/mensagem do WhatsApp e o rótulo `'Todos'`. O `SeoService` (URL base + schema `LegalService`) e os componentes consomem dela. As Serverless `api/*` e o `src/robots.txt` — fora do bundle Angular — replicam a URL base com **duplicação consciente e documentada** (comentário apontando a fonte canônica).
- **`index.html`**: `lang="pt-BR"`, `theme-color`, favicons por `prefers-color-scheme`, verificação Google.

> Datas ISO para SEO: o `BlogService.formatDate` deriva `dateIso`/`updatedAtIso` de `publishedAt`/`updatedAt` (view S3, com `.toISOString()`), mantendo `date` apenas como rótulo pt-BR. **S8 (follow-up):** a página `/autor/:slug` passou a existir (`ProfilePage` + `Person`) e o `author.url` do JSON-LD do artigo agora aponta para ela; o consumo fino de `canonicalUrl`/`noindex` por artigo (G10) foi cabeado no front (`SeoConfig.canonical`/`noIndex`).

---

## 6. Build, variáveis de ambiente e scripts

### Hooks de pré-build (`package.json`)

Executados antes de `serve`, `dev` e `build` (`pre*`). **Não remover.**

| Script                       | Função                                                                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/generate-icons.cjs` | Lê `src/assets/icons/*.svg` e gera `src/app/generated/icon-list.ts` (`ICON_NAMES`), consumido pelo `AppComponent` para registrar os SVGs no `MatIconRegistry`. |
| `scripts/set-env.cjs`        | Lê o `.env` (dotenv) e gera `src/environments/environment.ts` com `supabaseUrl`/`supabaseKey`.                                                                 |

Ambos os arquivos gerados estão no `.gitignore` (`/src/app/generated`, `/src/environments/environment.ts`) — são artefatos de build, não versionados.

### Variáveis de ambiente

`.env` (ver `.env.example`):

```
SUPABASE_URL=...
SUPABASE_KEY=...
```

Usadas em dois contextos: (1) injetadas no bundle do cliente via `set-env.cjs`; (2) lidas em runtime pela Serverless `api/sitemap.ts` via `process.env`.

> **Robustez do build (S11).** Em produção (`VERCEL_ENV=production`), o `app.routes.server.ts` **falha o build** se o pré-render de artigos/categorias/autores vier vazio — sintoma de Supabase indisponível ou env de Build (`SUPABASE_URL`/`SUPABASE_KEY`) ausente. Isso evita um deploy verde mas quebrado (artigos herdando o SEO da Home). Em preview/local mantém-se tolerante. Ver §2 e `BLOG-SEO.md` §10.8.

### Ícones (Angular Material)

Apenas o **`MatIcon`** do Angular Material é usado, como registro de SVGs próprios (`assets/icons`). Não há outros componentes Material em uso.

---

## 7. Estilização

- **TailwindCSS 4** configurado via CSS (`@theme` em `src/styles.scss`), não via `tailwind.config.js`.
- **Tokens de cor** da marca (`--color-n0`…`--color-n4`, `--color-destaque-*`) e da CRATON (`--color-cts-*`).
- **Tipografia**: Antic Didone (títulos), Inter (corpo), Poppins (rótulos), Black Gold (logotipo "VETERE"), via `@font-face` (TTF/OTF).
- **`@tailwindcss/typography`** aplicado ao conteúdo Markdown dos artigos (`ngx-markdown`).
- **SCSS** reservado a estilos que o Tailwind não expressa; usar `@use`/`@forward`, nunca `@import`.

---

## 8. Bibliotecas de runtime relevantes

| Lib                                            | Uso                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `ngx-markdown`                                 | Renderiza o `content` (Markdown) dos artigos com `prose`          |
| `ngx-mask`                                     | Máscara do campo de telefone no formulário de contato             |
| `@vercel/analytics` + `@vercel/speed-insights` | Métricas de produção, injetadas no `AppComponent.ngOnInit`        |
| `xmlbuilder2`                                  | Geração do XML do sitemap (Serverless)                            |
| Web3Forms (externo)                            | Endpoint de envio do formulário de contato (`action` no `<form>`) |

---

## 9. Estrutura de pastas (resumo)

```
src/app/
  core/
    config/      → site.config.ts (constantes centrais — S13)
    models/      → artigo, review, seo (interfaces)
    services/    → blog, review, seo
  features/      → blocos da home: header, hero, sobre, areas,
                   blog-preview, reviews, contato, mapa, footer
  pages/         → rotas: home, blog (lista), artigo (detalhe + not-found),
                   categoria (hub por categoria), autor (perfil), sucesso, not-found
                   (+ *.component.spec.ts: render tests das rotas pré-renderizadas — S14)
  core/services/ → blog, review, seo (+ *.spec.ts: smoke tests de SEO — S8)
  testing/       → seo-dom.helper.ts (utilitários/mocks dos render tests — S14)
  generated/     → icon-list.ts (gerado, não versionado)
api/
  sitemap.ts     → Serverless Function do sitemap
  llms.ts        → Serverless Function do /llms.txt (GEO/AEO)
scripts/
  generate-icons.cjs, set-env.cjs → hooks de pré-build
```

---

## 10. Fluxos críticos (resumo)

- **Home (`/`)**: prerender de `HeroComponent` … `MapaComponent`. `BlogPreviewComponent` e `ReviewsComponent` buscam Supabase durante o render.
- **Blog (`/blog`)**: prerender com `getAllArticles()` + `getCategories()`; filtro, busca e paginação são **client-side**.
- **Artigo (`/blog/:slug`)**: `Prerender` com `getPrerenderParams()` (lê os slugs publicados no Supabase no build); `getArticleBySlug()` define meta tags próprias (canonical self, OG, `BlogPosting`, `BreadcrumbList`, `FAQPage` quando há `faq`) e renderiza Markdown. Exibe TL;DR (`tldr`), chips de `tags`, FAQ (campo `faq`) e a seção "Leia também" (`getRelatedArticles`). Rebuild ao publicar via Vercel Deploy Hook + webhook do Supabase.
- **Categoria (`/blog/categoria/:slug`)**: `Prerender` com `getPrerenderParams()` (lê os slugs de `categories` no build); `getCategoryBySlug()` + `getArticlesByCategorySlug()` listam os artigos do hub; SEO próprio (`CollectionPage` + `BreadcrumbList`). Categoria inexistente → `noIndex` + mensagem.
- **Autor (`/autor/:slug`)** _(S8 follow-up)_: `Prerender` com `getPrerenderParams()` (lê os slugs de `authors` no build); `getAuthorBySlug()` (perfil) + `getArticlesByAuthorSlug()` (filtra a view por `author->>slug`) montam o perfil E-E-A-T (nome, OAB, bio, `sameAs`) e a lista de artigos da autora; SEO próprio (`ProfilePage` + `Person` + `BreadcrumbList`). Autor inexistente → `noIndex` + mensagem.
- **Contato**: `<form>` envia direto ao Web3Forms (POST). Página `/sucesso` existe para o pós-envio (ver `MELHORIAS.md` §3.6 sobre o campo `redirect`).
- **Sitemap**: requisição a `/sitemap.xml` → rewrite → `api/sitemap` → Supabase → XML com cache `s-maxage=86400`.
- **`llms.txt`**: requisição a `/llms.txt` → rewrite → `api/llms` → Supabase → Markdown com cache `s-maxage=86400`.
