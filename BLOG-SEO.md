# BLOG-SEO.md — Banco, Blog e SEO de Alto Nível

> Levantamento técnico que documenta o banco Supabase do projeto **advocacia-vetere-website**, correlaciona sua estrutura com o site Angular e com o tratamento atual de SEO, e define o padrão-alvo para um blog jurídico com SEO **exemplar** — incluindo as mudanças de busca de 2025–2026 (E-E-A-T/YMYL, AI Overviews, GEO/AEO, Core Web Vitals e `llms.txt`).
>
> Mantido pela CRATON Software. Complementa [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`CLAUDE.md`](./CLAUDE.md) e [`MELHORIAS.md`](./MELHORIAS.md).
> Última revisão: 2026-06-19 · Projeto Supabase: `advocacia-vetere-website` (ref `ckcfiqluyoiaqjdjgfbl`, região `sa-east-1`, Postgres 17).
>
> **Escopo:** documentação e planejamento. Nada aqui altera código ou banco — as migrações são propostas, não executadas.

---

## 1. Estado atual do banco (documentação completa)

O schema `public` tem **3 tabelas** e **1 view**. O RLS está ativo nas três tabelas, com políticas públicas somente-leitura — confirmando o pressuposto de segurança do `ARCHITECTURE.md`.

### 1.1 Tabela `articles`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `category_id` | `uuid` FK → `categories.id` | sem índice próprio |
| `title` | `varchar` | título (usado como `<title>` **e** `<h1>`) |
| `slug` | `varchar` **unique** | índice `articles_slug_key` |
| `excerpt` | `text` | resumo (usado no card **e** como meta description **e** como OG description) |
| `content` | `text` | corpo em Markdown (amostra: ~9 KB) |
| `cover_image` | `varchar` | **hoje aponta para URL externa (istockphoto)** — ver §5 |
| `read_time_minutes` | `int` | default `3` |
| `is_published` | `bool` | default `false` |
| `published_at` | `timestamptz` | data de publicação (nullable) |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` — **existe, mas não é exposto à aplicação** |

### 1.2 Tabela `categories`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | |
| `name` | `varchar` **unique** | hoje há 1 registro: **"Familia"** (sem acento — ver §5) |
| `slug` | `varchar` **unique** | ex.: `familia` |
| `created_at` / `updated_at` | `timestamptz` | |

### 1.3 Tabela `google_reviews`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | |
| `author_name` | `varchar` | |
| `rating` | `int` | |
| `text` | `text` | |
| `profile_photo_url` | `text` | |
| `relative_time_description` | `varchar` | |
| `created_at` | `timestamptz` | 5 registros |

### 1.4 View `published_articles` (a que o site realmente consome)

```sql
SELECT a.id, a.slug, a.title, a.excerpt, a.content,
       a.cover_image          AS "coverImage",
       (a.read_time_minutes || ' min de leitura') AS "readTime",
       c.name                 AS category,
       a.published_at         AS date
FROM articles a
JOIN categories c ON a.category_id = c.id
WHERE a.is_published = true AND a.published_at <= now()
ORDER BY a.published_at DESC;
```

Observações relevantes:

- A view **já entrega os campos em camelCase** exatamente como o modelo `Artigo` do Angular espera (`coverImage`, `readTime`).
- A view **já ordena por `published_at DESC`** e **já filtra** publicados com data ≤ agora (agendamento de publicação funciona).
- **Correção a um apontamento anterior:** o item §1.3 do `MELHORIAS.md` ("artigos sem `order`") estava **incorreto** — a ordenação existe na view. `getLatestArticles(3)` retorna de fato os 3 mais recentes. *(Corrigido também no `MELHORIAS.md`.)*
- A view **não expõe**: `updated_at` (→ impossível gerar `dateModified`), `category.slug`, nem qualquer campo de SEO dedicado. Isso é a raiz de boa parte das lacunas da §5.

### 1.5 RLS e índices

- **RLS:** `articles` → `SELECT public` com `is_published = true AND published_at <= now()`; `categories` e `google_reviews` → `SELECT public` (`true`). Sem políticas de escrita anônima. ✅
- **Índices:** apenas PKs e uniques (`slug`, `name`). **Não há índice em `articles.category_id` nem em `published_at`** — irrelevante hoje (1 artigo), relevante para escala (§6).

---

## 2. Correlação banco ↔ site

Fluxo de dados (detalhado em `ARCHITECTURE.md`): **view `published_articles` → Supabase REST → `BlogService` (HttpClient) → componentes → `SeoService`**.

| Campo da view | Modelo `Artigo` (Angular) | Onde é usado | Papel de SEO |
|---|---|---|---|
| `title` | `title` | `<h1>`, `<title>`, `og:title`, JSON-LD `headline` | Título / headline |
| `excerpt` | `excerpt` | card, `description`, `og:description`, JSON-LD `description` | Meta description (papel acumulado) |
| `content` | `content` | `<markdown>` no artigo | Corpo (palavras, headings, links) |
| `coverImage` | `coverImage` | `<img>`, `og:image`, JSON-LD `image` | Imagem social/artigo |
| `readTime` | `readTime` | exibição | — |
| `category` | `category` | badge, "Especialista em {categoria}" | `articleSection` (não usado) |
| `date` (= `published_at`) | `date` | exibição **e** `publishedDate` no SEO | `datePublished` / `article:published_time` |

**Pontos de atrito identificados na correlação:**

1. **Data quebrada para robôs.** `BlogService.formatDate()` sobrescreve `date` com a string pt-BR (`"18 de Junho de 2026"`) e esse valor é passado como `publishedDate` ao `SeoService`, que o injeta em `article:published_time` e no `datePublished` do JSON-LD — campos que exigem **ISO 8601**. O banco tem `published_at` como `timestamptz` válido; o problema é só de transporte/formatação. *(= `MELHORIAS.md` §1.4, confirmado.)*
2. **`dateModified` impossível hoje.** `updated_at` existe na tabela mas não é exposto na view → o JSON-LD nunca tem `dateModified`, sinal forte de frescor para conteúdo YMYL.
3. **Papéis acumulados.** `title` serve a `<title>` e `<h1>`; `excerpt` serve a card, meta description e OG. Sem campos dedicados, é impossível otimizar cada um (comprimento, intenção, CTA) — ver §5/§6.
4. **Autor inexistente no dado.** O autor é string fixa no componente (`'Dra. Maria Fernanda Vetere'`). Não há entidade de autor com credenciais (OAB), bio e `sameAs` — o sinal de E-E-A-T mais importante para conteúdo jurídico (§4.1).
5. **Sem `keywords`/`tags`.** Para artigos, o `SeoService` cai num default genérico. Não há base para autoridade tópica nem para linkagem interna.
6. **Categoria sem página própria.** Existe `category.slug`, mas o `/blog` filtra client-side e não há rota `/blog/categoria/:slug`. Perde-se oportunidade de páginas de arquivo (hub) — pilar de topical authority.

---

## 3. O que o site já faz bem em SEO (linha de base)

Para não reinventar o que já está sólido:

- **SSR com prerender** (`/`, `/blog`) e `Server` por artigo — HTML completo para crawlers.
- **`SeoService`** injeta `title`, `description`, **Open Graph completo** (incl. `og:image:width/height`), **Twitter Card**, **canonical** e **JSON-LD** por tipo (`BlogPosting`, `Blog`, `LegalService`).
- **Transfer cache** evita double-fetch (com `includeRequestsWithAuthHeaders`).
- **Sitemap dinâmico** (`api/sitemap.ts`) com `lastmod` por artigo + `robots.txt` apontando para ele.
- **`index.html`** com `lang="pt-BR"`, `theme-color`, favicons por esquema de cor e verificação Google.

As seções 4–7 elevam essa base ao patamar "exemplar".

---

## 4. Fundamentos de um blog/artigo com SEO exemplar (2026)

> Pesquisa concreta (fontes ao final). O cenário de busca mudou: **AI Overviews aparecem em até ~60% das SERPs** e reduzem CTR do orgânico em até ~58%; **ChatGPT ~800M usuários semanais**, Gemini, Perplexity e Claude consolidados. Otimizar só para o "10 links azuis" ficou insuficiente.

### 4.1 E-E-A-T e YMYL — crítico para Direito

Todo site de advocacia é **YMYL** (*Your Money or Your Life*) por padrão — Google aplica o escrutínio máximo de qualidade. O *core update* de dez/2025 atingiu duramente sites YMYL, e a atualização das *Quality Rater Guidelines* (set/2025) **endureceu a exigência de atribuição de autoria em páginas jurídicas**.

A correção de maior impacto: **atribuir todo conteúdo a um advogado nomeado e credenciado, com página de bio vinculada e marcação em schema**. Um artigo assinado por advogada com **número de OAB verificável** e experiência real tem peso muito maior que o mesmo texto anônimo. As três falhas de E-E-A-T mais comuns — conteúdo anônimo, páginas-modelo e informação jurídica desatualizada — são todas corrigíveis. **Trust** é o sinal central do E-E-A-T.

Aplicação direta ao projeto: criar **entidade de autor** (bio, OAB/SP 527.527, formação, `sameAs` para redes/Google), assinar cada artigo, e expor `dateModified` para sinalizar atualização.

### 4.2 Structured data (Article) — bem além do atual

O `Article`/`BlogPosting`/`NewsArticle` deve trazer, alinhado ao conteúdo **visível**: `headline`, `image` (como `ImageObject` com dimensões), `datePublished`, `dateModified`, `author` (→ `Person` com `sameAs` e afiliação), `publisher` (com `logo`), `mainEntityOfPage`. Recomendado ainda: `inLanguage`, `articleSection`, `keywords`, `wordCount`. **Regra de ouro:** só marcar o que aparece na página, manter um bloco JSON-LD por entidade e validar no **Rich Results Test / Schema Validator** antes de publicar. Acrescentar **`BreadcrumbList`** (Início › Blog › Artigo) e, quando o artigo responder dúvidas, **`FAQPage`**.

### 4.3 GEO / AEO — otimizar para motores generativos

**GEO** (Generative Engine Optimization) mira ser **citado** por LLMs (ChatGPT, Claude, Gemini); **AEO** mira recursos de resposta como o AI Overview. Sinais que pesam hoje:

- **Autoridade de entidade é o "novo PageRank"** das buscas de IA: ser reconhecido como entidade confiável em fontes de terceiros pesa mais que links.
- **Conteúdo extraível e verificável:** respostas diretas no topo, definições claras, dados com fonte, estrutura em perguntas/headings. Perplexity premia citações verificáveis; Claude valoriza verificação multi-fonte e tom não promocional; ChatGPT pondera reputação de domínio e legibilidade.
- **Estratégias baseadas em pesquisa elevam a visibilidade em IA em até ~40%.**

Aplicação: artigos com **resumo/resposta direta no início (TL;DR)**, headings em forma de pergunta, blocos de definição, FAQ marcada, e consistência de entidade (mesmo nome, OAB e `sameAs` em todo o site, Google Business e diretórios jurídicos).

### 4.4 Core Web Vitals (limiares 2026)

Confirmados como fator de ranqueamento (page experience). Limiares "bons" no 75º percentil:

| Métrica | Mede | Limiar "bom" (2026) |
|---|---|---|
| **LCP** | carregamento | **< 2,0 s** *(apertado de 2,5 s no core update de mar/2026)* |
| **INP** | responsividade | **< 200 ms** *(métrica mais reprovada — 43% dos sites falham)* |
| **CLS** | estabilidade visual | **< 0,1** |

Aplicação: priorizar o LCP do hero e da capa do artigo (preload/`fetchpriority`), reservar espaço de imagem (CLS), e manter o JS leve (INP — onde `OnPush`/zoneless da `MELHORIAS.md` ajudam).

### 4.5 `llms.txt` — padrão emergente para crawlers de IA

Arquivo Markdown na raiz do domínio que **curadoria** o conteúdo mais valioso e "AI-friendly" para LLMs — análogo a um sitemap voltado a IA. Adoção crescente, ainda não honrado por todos os provedores, mas **baixo custo e upside real** de citação. Recomendação: gerar um `/llms.txt` (e opcionalmente `/llms-full.txt`) listando home, áreas de atuação e os artigos do blog com uma linha de descrição cada — preferencialmente **gerado dinamicamente** a partir da view `published_articles`, como já é feito com o sitemap.

---

## 5. Gap analysis do banco para SEO exemplar

O que **falta no dado** hoje para sustentar tudo da §4 (priorizado por impacto):

| # | Lacuna | Impacto | Por quê |
|---|---|---|---|
| G1 | **Entidade de autor** (tabela `authors`) com bio, OAB, `sameAs` | Alto | Sinal #1 de E-E-A-T/YMYL para Direito (§4.1) |
| G2 | **`updated_at` não exposto na view** | Alto | Sem `dateModified` — perde frescor (§4.2) |
| G3 | **Data ISO não chega ao SEO** (formatação destrói o ISO) | Alto | `datePublished` inválido para robôs (§2.1) |
| G4 | **`meta_title` e `meta_description` dedicados** | Alto | Hoje `title`/`excerpt` acumulam papéis; impossível otimizar SERP/CTR |
| G5 | **`cover_image` é hotlink externo (istockphoto, 612px, com parâmetros de watermark)** | Alto | Risco de licença, LCP ruim, sem controle de 1200×630 e sem `alt` |
| G6 | **`tags`/`keywords` por artigo** | Médio | Autoridade tópica, linkagem interna, `keywords` no schema |
| G7 | **Páginas de categoria** (rota + uso de `category.slug`) | Médio | Hubs de topical authority; hoje filtro é client-side |
| G8 | **Campos para FAQ/resposta direta** (TL;DR, FAQ) | Médio | GEO/AEO e rich result `FAQPage` (§4.3) |
| G9 | **`cover_image_alt`** | Médio | Acessibilidade + SEO de imagem |
| G10 | **`canonical_url` / `noindex` por artigo** | Baixo | Controle fino (conteúdo duplicado, despublicar) |
| G11 | **`locale`/`inLanguage`** | Baixo | Multi-idioma futuro; hoje assumir `pt-BR` |
| G12 | **Categoria "Familia" sem acento** | Baixo | Qualidade de dado / exibição |
| G13 | **Índices em `category_id` e `published_at`** | Baixo (escala) | Performance de filtro/ordenção ao crescer |

---

## 6. Esquema-alvo proposto (migração **aditiva**, não destrutiva)

> Proposta — não aplicada. Tudo aditivo e retrocompatível com a view atual.

### 6.1 Nova tabela `authors` (E-E-A-T)

```sql
create table public.authors (
  id          uuid primary key default gen_random_uuid(),
  name        varchar not null,
  slug        varchar unique not null,
  role        varchar,                 -- "Advogada"
  oab         varchar,                 -- "OAB/SP 527.527"
  bio         text,                    -- bio rica para página /autor e schema
  avatar_url  text,
  same_as     jsonb default '[]',      -- ["instagram", "linkedin", "google business"...]
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
-- RLS: SELECT public (mesmo padrão das demais)
```

### 6.2 Colunas aditivas em `articles`

```sql
alter table public.articles
  add column author_id        uuid references public.authors(id),
  add column meta_title       varchar,        -- fallback: title
  add column meta_description varchar,        -- fallback: excerpt (120–160 chars)
  add column cover_image_alt  varchar,
  add column tags             text[] default '{}',
  add column tldr             text,           -- resposta direta (GEO/AEO)
  add column faq              jsonb,          -- [{q, a}] → FAQPage
  add column canonical_url    varchar,        -- override opcional
  add column noindex          boolean default false,
  add column locale           varchar default 'pt-BR';
-- índices para escala:
create index on public.articles (category_id);
create index on public.articles (published_at desc);
```

### 6.3 View `published_articles` evoluída

Expor os novos campos **mantendo** os nomes atuais (retrocompatível) e **adicionando** o que falta — em especial `published_at` cru (ISO) e `updated_at`:

```sql
-- pseudo: adicionar à view existente
... ,
a.published_at                      AS "publishedAt",   -- ISO cru p/ schema
a.updated_at                        AS "updatedAt",     -- dateModified
coalesce(a.meta_title, a.title)     AS "metaTitle",
coalesce(a.meta_description, a.excerpt) AS "metaDescription",
a.cover_image_alt                   AS "coverImageAlt",
a.tags                              AS tags,
a.tldr                              AS tldr,
a.faq                               AS faq,
a.locale                            AS locale,
c.slug                              AS "categorySlug",
json_build_object(
  'name', au.name, 'role', au.role, 'oab', au.oab,
  'slug', au.slug, 'avatar', au.avatar_url, 'sameAs', au.same_as
)                                   AS author
FROM articles a
JOIN categories c ON a.category_id = c.id
LEFT JOIN authors au ON a.author_id = au.id
WHERE a.is_published AND a.published_at <= now()
ORDER BY a.published_at DESC;
```

> O front mantém `date` (label) para exibição, mas passa a usar `publishedAt`/`updatedAt` (ISO) para o `SeoService`. Resolve G2 e G3 de uma vez.

### 6.4 Imagens de capa (G5) — armazenamento próprio

Migrar capas para **Supabase Storage** (bucket público `article-covers`), em **1200×630** (proporção OG) e formato moderno (WebP/AVIF), preenchendo `cover_image_alt`. Elimina risco de licença do istockphoto, melhora LCP e dá controle do cartão social.

---

## 7. JSON-LD alvo para artigos (spec de referência)

Estado atual (`BlogPosting`) vs. alvo. O `SeoService` passaria a montar:

```jsonc
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://www.mfernandavetere.adv.br/blog/<slug>" },
  "headline": "<title> (≤110 chars)",
  "description": "<metaDescription>",
  "image": { "@type": "ImageObject", "url": "<coverImage 1200x630>", "width": 1200, "height": 630 },
  "datePublished": "<publishedAt ISO>",        // G3
  "dateModified": "<updatedAt ISO>",           // G2
  "inLanguage": "pt-BR",
  "articleSection": "<category>",
  "keywords": "<tags join>",
  "author": {                                   // G1 / E-E-A-T
    "@type": "Person",
    "name": "Dra. Maria Fernanda Vetere",
    "jobTitle": "Advogada",
    "identifier": "OAB/SP 527.527",
    "url": "https://www.mfernandavetere.adv.br/autor/maria-fernanda-vetere",
    "sameAs": ["https://instagram.com/mfernandavetere", "..."]
  },
  "publisher": {
    "@type": "LegalService",
    "name": "Dra. Maria Fernanda Vetere | Advocacia & Consultoria",
    "logo": { "@type": "ImageObject", "url": "https://www.mfernandavetere.adv.br/assets/cards/card-home.png" }
  }
}
```

Acrescentar, em blocos separados, **`BreadcrumbList`** (toda página de artigo) e **`FAQPage`** (quando `faq` existir). Validar sempre no Rich Results Test.

---

## 8. Roadmap priorizado

**Fase 1 — Fundação E-E-A-T e dados (Alto impacto)**
1. Expor `published_at` (ISO) e `updated_at` na view; corrigir o transporte da data no front (G2, G3).
2. Criar `authors` + `author_id`, assinar artigos, criar página `/autor/:slug` e `author` no JSON-LD (G1).
3. Migrar capas para Storage 1200×630 + `cover_image_alt` (G5, G9).

**Fase 2 — Otimização de SERP e schema (Alto/Médio)**
4. `meta_title`/`meta_description` dedicados (G4).
5. Enriquecer JSON-LD do artigo (`dateModified`, `ImageObject`, `inLanguage`, `articleSection`, `keywords`, `mainEntityOfPage`) + `BreadcrumbList` (§7, §4.2).
6. Enriquecer o `LegalService` da home (telefone, geo, horário, `sameAs`) — já listado em `MELHORIAS.md` §2.1.

**Fase 3 — Topical authority e busca generativa (Médio)**
7. `tags` + páginas de categoria (`/blog/categoria/:slug`) usando `category.slug` (G6, G7).
8. `tldr` + `faq` por artigo → resposta direta e `FAQPage` (G8, §4.3).
9. Gerar `/llms.txt` dinâmico a partir da view (§4.5).

**Fase 4 — Performance e escala (contínuo)**
10. Core Web Vitals: LCP < 2,0 s (preload de capa/hero), INP (OnPush/zoneless), CLS (reserva de imagem) — §4.4.
11. Índices `category_id` e `published_at`; `canonical_url`/`noindex`/`locale` (G10, G11, G13).
12. Corrigir "Familia" → "Família" (G12).

---

## 9. Resumo executivo

O banco está **bem modelado e seguro** para o estágio atual (RLS correto, view camelCase, ordenação e agendamento prontos), mas foi desenhado para **renderizar cards**, não para **SEO de alto nível**. As lacunas decisivas são três e todas de alto retorno: **(1)** ausência de entidade de autor credenciado — o sinal mais importante para conteúdo jurídico YMYL em 2026; **(2)** `updated_at` e a data ISO não chegam ao schema, enfraquecendo frescor e validade dos dados estruturados; **(3)** campos de SEO acumulam papéis e a capa é um hotlink externo. Resolver a Fase 1 já coloca o blog em outro patamar de confiança aos olhos do Google e dos motores generativos; as Fases 2–4 consolidam autoridade tópica, presença em AI Overviews/citação por LLMs e performance.

---

## Fontes

- [Learn About Article Schema Markup — Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Structured Data Guide 2026: rich snippets & AI visibility — ClickForest](https://www.clickforest.com/en/blog/structured-data-google)
- [Schema Markup Best Practices for AI Citations (2025) — Geneo](https://geneo.app/blog/schema-markup-best-practices-ai-citations-2025/)
- [Schema Markup & Structured Data for GEO in AI Search (2025) — Geneo](https://geneo.app/blog/schema-markup-structured-data-best-practices-geo-ai-search-2025/)
- [What is Generative Engine Optimization (GEO)? 2026 Guide — Frase.io](https://www.frase.io/blog/what-is-generative-engine-optimization-geo)
- [GEO vs AEO vs SEO Guide 2026 — Jasper](https://www.jasper.ai/blog/geo-aeo)
- [Generative Engine Optimization (GEO): Complete 2026 Guide — Enrich Labs](https://www.enrichlabs.ai/blog/generative-engine-optimization-geo-complete-guide-2026)
- [Core Web Vitals 2026: INP, LCP, CLS Optimization Guide — Senorit](https://senorit.de/en/blog/core-web-vitals-2026)
- [Core Web Vitals 2026 Guide — DigitalApplied](https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide)
- [Meet llms.txt, a proposed standard for AI website content crawling — Search Engine Land](https://searchengineland.com/llms-txt-proposed-standard-453676)
- [What Is LLMs.txt & Should You Use It? — Semrush](https://www.semrush.com/blog/llms-txt/)
- [E-E-A-T and YMYL for Lawyers: What They Mean in 2026 — Rankings.io](https://rankings.io/blog/eeat-ymyl-for-lawyers/)
- [YMYL Compliance for Legal Sites — eSEOspace](https://eseospace.com/blog/ymyl-compliance-for-legal-sites-content-that-avoids-penalties/)
