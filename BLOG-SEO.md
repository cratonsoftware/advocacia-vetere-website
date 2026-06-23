# BLOG-SEO.md — Banco, Blog e SEO de Alto Nível

> Levantamento técnico que documenta o banco Supabase do projeto **advocacia-vetere-website**, correlaciona sua estrutura com o site Angular e com o tratamento atual de SEO, e define o padrão-alvo para um blog jurídico com SEO **exemplar** — incluindo as mudanças de busca de 2025–2026 (E-E-A-T/YMYL, AI Overviews, GEO/AEO, Core Web Vitals e `llms.txt`).
>
> Mantido pela CRATON Software. Complementa [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`CLAUDE.md`](./CLAUDE.md) e [`MELHORIAS.md`](./MELHORIAS.md). Última revisão: 2026-06-19 · Projeto Supabase: `advocacia-vetere-website` (ref `ckcfiqluyoiaqjdjgfbl`, região `sa-east-1`, Postgres 17).
>
> **Escopo:** documentação e planejamento. Nada aqui altera código ou banco — as migrações são propostas, não executadas.

---

## 1. Estado atual do banco (documentação completa)

O schema `public` tem **3 tabelas** e **1 view**. O RLS está ativo nas três tabelas, com políticas públicas somente-leitura — confirmando o pressuposto de segurança do `ARCHITECTURE.md`.

### 1.1 Tabela `articles`

| Coluna              | Tipo                        | Notas                                                                        |
| ------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| `id`                | `uuid` PK                   | `gen_random_uuid()`                                                          |
| `category_id`       | `uuid` FK → `categories.id` | sem índice próprio                                                           |
| `title`             | `varchar`                   | título (usado como `<title>` **e** `<h1>`)                                   |
| `slug`              | `varchar` **unique**        | índice `articles_slug_key`                                                   |
| `excerpt`           | `text`                      | resumo (usado no card **e** como meta description **e** como OG description) |
| `content`           | `text`                      | corpo em Markdown (amostra: ~9 KB)                                           |
| `cover_image`       | `varchar`                   | **hoje aponta para URL externa (istockphoto)** — ver §5                      |
| `read_time_minutes` | `int`                       | default `3`                                                                  |
| `is_published`      | `bool`                      | default `false`                                                              |
| `published_at`      | `timestamptz`               | data de publicação (nullable)                                                |
| `created_at`        | `timestamptz`               | default `now()`                                                              |
| `updated_at`        | `timestamptz`               | default `now()` — **existe, mas não é exposto à aplicação**                  |

### 1.2 Tabela `categories`

| Coluna                      | Tipo                 | Notas                                                   |
| --------------------------- | -------------------- | ------------------------------------------------------- |
| `id`                        | `uuid` PK            |                                                         |
| `name`                      | `varchar` **unique** | hoje há 1 registro: **"Familia"** (sem acento — ver §5) |
| `slug`                      | `varchar` **unique** | ex.: `familia`                                          |
| `created_at` / `updated_at` | `timestamptz`        |                                                         |

### 1.3 Tabela `google_reviews`

| Coluna                      | Tipo          | Notas       |
| --------------------------- | ------------- | ----------- |
| `id`                        | `uuid` PK     |             |
| `author_name`               | `varchar`     |             |
| `rating`                    | `int`         |             |
| `text`                      | `text`        |             |
| `profile_photo_url`         | `text`        |             |
| `relative_time_description` | `varchar`     |             |
| `created_at`                | `timestamptz` | 5 registros |

### 1.4 View `published_articles` (a que o site realmente consome)

> **Atualizado na S3 (2026-06-19):** a view abaixo é o **estado pré-S3** (histórico). O estado vigente é o da §6.3 — retrocompatível e enriquecido com `publishedAt`/`updatedAt` (ISO), `author`, campos de SEO dedicados e `security_invoker`.

```sql
-- ESTADO PRÉ-S3 (histórico)
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
- **Correção a um apontamento anterior:** o item §1.3 do `MELHORIAS.md` ("artigos sem `order`") estava **incorreto** — a ordenação existe na view. `getLatestArticles(3)` retorna de fato os 3 mais recentes. _(Corrigido também no `MELHORIAS.md`.)_
- A view **não expõe**: `updated_at` (→ impossível gerar `dateModified`), `category.slug`, nem qualquer campo de SEO dedicado. Isso é a raiz de boa parte das lacunas da §5.

### 1.5 RLS e índices

- **RLS:** `articles` → `SELECT public` com `is_published = true AND published_at <= now()`; `categories`, `google_reviews` e (S3) `authors` → `SELECT public` (`true`). Sem políticas de escrita anônima. ✅
- **Índices:** PKs e uniques (`slug`, `name`) + **(S3)** `articles_category_id_idx` e `articles_published_at_idx (desc)`.

---

## 2. Correlação banco ↔ site

Fluxo de dados (detalhado em `ARCHITECTURE.md`): **view `published_articles` → Supabase REST → `BlogService` (HttpClient) → componentes → `SeoService`**.

| Campo da view             | Modelo `Artigo` (Angular) | Onde é usado                                                 | Papel de SEO                               |
| ------------------------- | ------------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| `title`                   | `title`                   | `<h1>`, `<title>`, `og:title`, JSON-LD `headline`            | Título / headline                          |
| `excerpt`                 | `excerpt`                 | card, `description`, `og:description`, JSON-LD `description` | Meta description (papel acumulado)         |
| `content`                 | `content`                 | `<markdown>` no artigo                                       | Corpo (palavras, headings, links)          |
| `coverImage`              | `coverImage`              | `<img>`, `og:image`, JSON-LD `image`                         | Imagem social/artigo                       |
| `readTime`                | `readTime`                | exibição                                                     | —                                          |
| `category`                | `category`                | badge, "Especialista em {categoria}"                         | `articleSection` (não usado)               |
| `date` (= `published_at`) | `date`                    | exibição **e** `publishedDate` no SEO                        | `datePublished` / `article:published_time` |

**Pontos de atrito identificados na correlação:**

1. **Data quebrada para robôs.** `BlogService.formatDate()` sobrescreve `date` com a string pt-BR (`"18 de Junho de 2026"`) e esse valor é passado como `publishedDate` ao `SeoService`, que o injeta em `article:published_time` e no `datePublished` do JSON-LD — campos que exigem **ISO 8601**. O banco tem `published_at` como `timestamptz` válido; o problema é só de transporte/formatação. _(= `MELHORIAS.md` §1.4, confirmado.)_
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

Todo site de advocacia é **YMYL** (_Your Money or Your Life_) por padrão — Google aplica o escrutínio máximo de qualidade. O _core update_ de dez/2025 atingiu duramente sites YMYL, e a atualização das _Quality Rater Guidelines_ (set/2025) **endureceu a exigência de atribuição de autoria em páginas jurídicas**.

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

| Métrica | Mede                | Limiar "bom" (2026)                                            |
| ------- | ------------------- | -------------------------------------------------------------- |
| **LCP** | carregamento        | **< 2,0 s** _(apertado de 2,5 s no core update de mar/2026)_   |
| **INP** | responsividade      | **< 200 ms** _(métrica mais reprovada — 43% dos sites falham)_ |
| **CLS** | estabilidade visual | **< 0,1**                                                      |

Aplicação: priorizar o LCP do hero e da capa do artigo (preload/`fetchpriority`), reservar espaço de imagem (CLS), e manter o JS leve (INP — onde `OnPush`/zoneless da `MELHORIAS.md` ajudam).

### 4.5 `llms.txt` — padrão emergente para crawlers de IA

> **✅ APLICADO na S5 (2026-06-20)** — `/llms.txt` é gerado dinamicamente pela Serverless `api/llms.ts` (reescrita de `/llms.txt` via `vercel.json`), a partir da view `published_articles`: cabeçalho do escritório, páginas principais, áreas de atuação, categorias do blog e cada artigo com uma linha (`tldr`→fallback `excerpt`). Cache `s-maxage=86400`.

Arquivo Markdown na raiz do domínio que **curadoria** o conteúdo mais valioso e "AI-friendly" para LLMs — análogo a um sitemap voltado a IA. Adoção crescente, ainda não honrado por todos os provedores, mas **baixo custo e upside real** de citação. Recomendação: gerar um `/llms.txt` (e opcionalmente `/llms-full.txt`) listando home, áreas de atuação e os artigos do blog com uma linha de descrição cada — preferencialmente **gerado dinamicamente** a partir da view `published_articles`, como já é feito com o sitemap.

---

## 5. Gap analysis do banco para SEO exemplar

O que **falta no dado** hoje para sustentar tudo da §4 (priorizado por impacto):

> **Atualização S3 (2026-06-19):** o lado-banco das lacunas foi resolvido. ✅ resolvidos: **G1** (tabela `authors` + seed), **G2** (`updatedAt` na view), **G3** (ISO na view; transporte no front feito na S2), **G4** (`meta_title`/`meta_description` — consumo no front = S4), **G6** (`tags`), **G8** (`tldr`/`faq` — `FAQPage` no front = S5), **G9** (`cover_image_alt`), **G11** (`locale`), **G12** (categoria "Família"), **G13** (índices). **G5** ✅: capa 1200×630 no bucket `article-covers` e `cover_image` apontando para a URL pública do Storage. ⬜ Restam para front: **G7** (rota `/blog/categoria/:slug` — S5) e o uso de **G10** (`canonical_url`/`noindex` já existem como colunas — consumo = S4).
>
> **Atualização S4 (2026-06-19):** **consumo no front** das lacunas resolvido — **G4** (`metaTitle`/`metaDescription` consumidos pelo `ArtigoComponent`), **G9** (`coverImageAlt` → `og:image:alt` + `caption` do `ImageObject`), **G11** (`locale` → `inLanguage`) e a entidade de autor **G1** agora viram JSON-LD `Person` (com `identifier` OAB e `sameAs`). O JSON-LD do artigo passou a `BlogPosting` rico + `BreadcrumbList`; o `LegalService` da home foi enriquecido. **G10** (`canonicalUrl`/`noindex`) segue como coluna disponível; o consumo fino foi deixado para a S5 junto com o restante do controle por artigo.
>
> **Atualização S5 (2026-06-20):** **consumo no front** das lacunas de topical authority e GEO/AEO resolvido — **G6** (`tags` como chips + linkagem interna: categoria clicável e seção "Leia também"), **G7** (rota `/blog/categoria/:slug` com `CollectionPage` + `BreadcrumbList`, pré-renderizada) e **G8** (`tldr` em bloco de resposta direta + `faq` em seção visível com `FAQPage` JSON-LD). Adicionado o `/llms.txt` dinâmico (§4.5, `api/llms.ts`). **G10** (`canonicalUrl`/`noindex`) **permanece** como coluna disponível, ainda não cabeada no front (fora do escopo declarado da S5). Follow-up remanescente: página `/autor/:slug` (o `author.url` segue apontando para a home).

| #   | Lacuna                                                                                | Impacto        | Por quê                                                              |
| --- | ------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------- |
| G1  | **Entidade de autor** (tabela `authors`) com bio, OAB, `sameAs`                       | Alto           | Sinal #1 de E-E-A-T/YMYL para Direito (§4.1)                         |
| G2  | **`updated_at` não exposto na view**                                                  | Alto           | Sem `dateModified` — perde frescor (§4.2)                            |
| G3  | **Data ISO não chega ao SEO** (formatação destrói o ISO)                              | Alto           | `datePublished` inválido para robôs (§2.1)                           |
| G4  | **`meta_title` e `meta_description` dedicados**                                       | Alto           | Hoje `title`/`excerpt` acumulam papéis; impossível otimizar SERP/CTR |
| G5  | **`cover_image` é hotlink externo (istockphoto, 612px, com parâmetros de watermark)** | Alto           | Risco de licença, LCP ruim, sem controle de 1200×630 e sem `alt`     |
| G6  | **`tags`/`keywords` por artigo**                                                      | Médio          | Autoridade tópica, linkagem interna, `keywords` no schema            |
| G7  | **Páginas de categoria** (rota + uso de `category.slug`)                              | Médio          | Hubs de topical authority; hoje filtro é client-side                 |
| G8  | **Campos para FAQ/resposta direta** (TL;DR, FAQ)                                      | Médio          | GEO/AEO e rich result `FAQPage` (§4.3)                               |
| G9  | **`cover_image_alt`**                                                                 | Médio          | Acessibilidade + SEO de imagem                                       |
| G10 | **`canonical_url` / `noindex` por artigo**                                            | Baixo          | Controle fino (conteúdo duplicado, despublicar)                      |
| G11 | **`locale`/`inLanguage`**                                                             | Baixo          | Multi-idioma futuro; hoje assumir `pt-BR`                            |
| G12 | **Categoria "Familia" sem acento**                                                    | Baixo          | Qualidade de dado / exibição                                         |
| G13 | **Índices em `category_id` e `published_at`**                                         | Baixo (escala) | Performance de filtro/ordenção ao crescer                            |

---

## 6. Esquema-alvo proposto (migração **aditiva**, não destrutiva)

> **✅ APLICADO na S3 (2026-06-19)** — toda a §6 foi executada via MCP Supabase como migração aditiva e não destrutiva (migrações `create_authors_table`, `add_eeat_columns_to_articles`, `evolve_published_articles_view`, `fix_familia_category_accent`, `create_article_covers_storage_bucket`, `harden_view_and_storage_security`). A view é `security_invoker` e o `get_advisors security` ficou **limpo**. Único item parcial: a **imagem** de capa 1200×630 ainda será enviada ao bucket pelo operador (infra de Storage e `cover_image_alt` já concluídos). O texto abaixo descreve o esquema agora vigente.

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

Expor os novos campos **mantendo** os nomes atuais (retrocompatível) e **adicionando** o que falta — em especial `published_at` cru (ISO) e `updated_at`. **Definição efetivamente aplicada na S3** (`security_invoker` para respeitar o RLS das tabelas base):

```sql
create or replace view public.published_articles as
select
  a.id, a.slug, a.title, a.excerpt, a.content,
  a.cover_image                              as "coverImage",
  (a.read_time_minutes || ' min de leitura'::text) as "readTime",
  c.name                                     as category,
  a.published_at                             as date,
  -- novos campos (anexados ao final p/ compatibilidade do CREATE OR REPLACE)
  a.published_at                             as "publishedAt",   -- ISO cru p/ schema
  a.updated_at                               as "updatedAt",     -- dateModified
  coalesce(a.meta_title, a.title)            as "metaTitle",
  coalesce(a.meta_description, a.excerpt)    as "metaDescription",
  a.cover_image_alt                          as "coverImageAlt",
  a.tags                                     as tags,
  a.tldr                                     as tldr,
  a.faq                                      as faq,
  a.locale                                   as locale,
  a.canonical_url                            as "canonicalUrl",
  a.noindex                                  as noindex,
  c.slug                                     as "categorySlug",
  json_build_object(
    'name', au.name, 'role', au.role, 'oab', au.oab,
    'slug', au.slug, 'avatar', au.avatar_url, 'bio', au.bio, 'sameAs', au.same_as
  )                                          as author
from articles a
join categories c on a.category_id = c.id
left join authors au on a.author_id = au.id
where a.is_published = true and a.published_at <= now()
order by a.published_at desc;

alter view public.published_articles set (security_invoker = true);
```

> O front mantém `date` (label) para exibição, mas passa a usar `publishedAt`/`updatedAt` (ISO) para o `SeoService` (consumo = S4). Resolve G2 e G3 no banco de uma vez. Como o `BlogService` usa `select=*`, os campos novos trafegam sem alterar o modelo `Artigo`.

### 6.4 Imagens de capa (G5) — armazenamento próprio

Migrar capas para **Supabase Storage** (bucket público `article-covers`), em **1200×630** (proporção OG) e formato moderno (WebP/AVIF), preenchendo `cover_image_alt`. Elimina risco de licença do istockphoto, melhora LCP e dá controle do cartão social.

> **Status S3 (2026-06-19) — concluído:** bucket público `article-covers` (objetos servidos via URL pública; sem policy de listagem, por recomendação do linter); imagem `traicao-da-direito-a-indenizacao.png` (1200×630) enviada ao bucket e `cover_image` do artigo atualizado para a URL pública do Storage (`/storage/v1/object/public/article-covers/<slug>.png`); `cover_image_alt` preenchido. Hotlink do istockphoto eliminado. Convenção: **nome do arquivo da capa = `<slug>.png`**.

---

## 7. JSON-LD alvo para artigos (spec de referência)

> **✅ APLICADO na S4 (2026-06-19)** — o `SeoService` passou a montar exatamente o `BlogPosting` abaixo (`mainEntityOfPage`, `ImageObject` 1200×630 com `caption`, `datePublished`/`dateModified` ISO, `inLanguage`, `articleSection`, `keywords` quando há `tags`, `author` `Person` com `jobTitle`, `identifier` OAB e `sameAs`). Foram acrescentados, em blocos JSON-LD separados (identificados por `data-seo`), o **`BreadcrumbList`** (Início › Blog › Artigo) em toda página de artigo. O `LegalService` da home foi enriquecido (telefone, e-mail, endereço completo, `geo`, `openingHoursSpecification`, `sameAs`, `priceRange`, `logo`). Pendente apenas a validação no Rich Results Test pós-deploy (precisa de URL de preview/produção).

> **✅ S5 (2026-06-20):** o `FAQPage` foi implementado — o `SeoService` emite um bloco JSON-LD separado (`data-seo="faq"`) quando o artigo tem `faq`, em paralelo a `main`/`breadcrumb`, e a seção visível de FAQ é renderizada a partir do mesmo campo `faq` (fonte única; ver nota em `CLAUDE.md` sobre não duplicar no Markdown). Também na S5: páginas de categoria (`/blog/categoria/:slug`, `CollectionPage` + `BreadcrumbList`), `tags` + linkagem interna (G6) e `/llms.txt` (§4.5).

Estado atual (`BlogPosting`) vs. alvo. O `SeoService` passaria a montar:

```jsonc
{
	"@context": "https://schema.org",
	"@type": "BlogPosting",
	"mainEntityOfPage": { "@type": "WebPage", "@id": "https://www.mfernandavetere.adv.br/blog/<slug>" },
	"headline": "<title> (≤110 chars)",
	"description": "<metaDescription>",
	"image": { "@type": "ImageObject", "url": "<coverImage 1200x630>", "width": 1200, "height": 630 },
	"datePublished": "<publishedAt ISO>", // G3
	"dateModified": "<updatedAt ISO>", // G2
	"inLanguage": "pt-BR",
	"articleSection": "<category>",
	"keywords": "<tags join>",
	"author": {
		// G1 / E-E-A-T
		"@type": "Person",
		"name": "Dra. Maria Fernanda Vetere",
		"jobTitle": "Advogada",
		"identifier": "OAB/SP 527.527",
		"url": "https://www.mfernandavetere.adv.br/autor/maria-fernanda-vetere",
		"sameAs": ["https://instagram.com/mfernandavetere", "..."],
	},
	"publisher": {
		"@type": "LegalService",
		"name": "Dra. Maria Fernanda Vetere | Advocacia & Consultoria",
		"logo": { "@type": "ImageObject", "url": "https://www.mfernandavetere.adv.br/assets/cards/card-home.png" },
	},
}
```

Acrescentar, em blocos separados, **`BreadcrumbList`** (toda página de artigo) e **`FAQPage`** (quando `faq` existir). Validar sempre no Rich Results Test.

> **Resolvido (S8 follow-up, 2026-06-21):** a rota/página `/autor/:slug` foi criada (`AutorComponent`, Prerender, `ProfilePage` + `Person`) e o `author.url` do `Person` no `ArtigoComponent` passou a apontar para `${baseUrl}/autor/${data.author?.slug}` (fallback à home se sem slug). O override `canonical_url`/`noindex` por artigo (G10) também foi cabeado no front via `SeoConfig.canonical`/`noIndex`. Rastreado em `PLANO-EXECUCAO.md` §6.2 (S8).

---

## 8. Roadmap priorizado

**Fase 1 — Fundação E-E-A-T e dados (Alto impacto)**

1. Expor `published_at` (ISO) e `updated_at` na view; corrigir o transporte da data no front (G2, G3).
2. Criar `authors` + `author_id`, assinar artigos, criar página `/autor/:slug` e `author` no JSON-LD (G1).
3. Migrar capas para Storage 1200×630 + `cover_image_alt` (G5, G9).

**Fase 2 — Otimização de SERP e schema (Alto/Médio)** 4. `meta_title`/`meta_description` dedicados (G4). 5. Enriquecer JSON-LD do artigo (`dateModified`, `ImageObject`, `inLanguage`, `articleSection`, `keywords`, `mainEntityOfPage`) + `BreadcrumbList` (§7, §4.2). 6. Enriquecer o `LegalService` da home (telefone, geo, horário, `sameAs`) — já listado em `MELHORIAS.md` §2.1.

**Fase 3 — Topical authority e busca generativa (Médio)** 7. `tags` + páginas de categoria (`/blog/categoria/:slug`) usando `category.slug` (G6, G7). 8. `tldr` + `faq` por artigo → resposta direta e `FAQPage` (G8, §4.3). 9. Gerar `/llms.txt` dinâmico a partir da view (§4.5).

**Fase 4 — Performance e escala (contínuo)** 10. Core Web Vitals: LCP < 2,0 s (preload de capa/hero), INP (OnPush/zoneless), CLS (reserva de imagem) — §4.4. 11. Índices `category_id` e `published_at`; `canonical_url`/`noindex`/`locale` (G10, G11, G13). 12. Corrigir "Familia" → "Família" (G12).

---

## 9. Resumo executivo

O banco está **bem modelado e seguro** para o estágio atual (RLS correto, view camelCase, ordenação e agendamento prontos), mas foi desenhado para **renderizar cards**, não para **SEO de alto nível**. As lacunas decisivas são três e todas de alto retorno: **(1)** ausência de entidade de autor credenciado — o sinal mais importante para conteúdo jurídico YMYL em 2026; **(2)** `updated_at` e a data ISO não chegam ao schema, enfraquecendo frescor e validade dos dados estruturados; **(3)** campos de SEO acumulam papéis e a capa é um hotlink externo. Resolver a Fase 1 já coloca o blog em outro patamar de confiança aos olhos do Google e dos motores generativos; as Fases 2–4 consolidam autoridade tópica, presença em AI Overviews/citação por LLMs e performance.

---

## 10. Diagnóstico crítico — artigo herdando o SEO da Home (P0)

> **Severidade: P0 (crítico).** Identificado a partir de um crawl Ahrefs do site em produção (arquivos `overview.csv`, `duplicates.csv`, `outlinks_internal_links.csv`) e confirmado por requisição direta ao servidor em 2026-06-19. Este é o problema de SEO mais grave do projeto hoje: **o único artigo publicado não é indexável e duplica a Home.**
>
> **✅ RESOLVIDO na S1 (2026-06-19)** — `/blog/:slug` passou a ser pré-renderizado por slug (Opção A). Detalhes da correção em §10.6.

### 10.1 Sintoma (evidência)

Para a URL `https://www.mfernandavetere.adv.br/blog/traicao-da-direito-a-indenizacao`:

| Sinal (Ahrefs)        | Valor observado                                                     | Esperado                |
| --------------------- | ------------------------------------------------------------------- | ----------------------- |
| HTTP status           | `200`                                                               | `200`                   |
| **Is indexable page** | **`false`**                                                         | `true`                  |
| **Canonical URL**     | **`https://www.mfernandavetere.adv.br/`** (a Home)                  | a própria URL do artigo |
| Is self-canonical     | `false`                                                             | `true`                  |
| Title                 | título da Home                                                      | título do artigo        |
| H1                    | "Advocacia Estratégica com Olhar Humanizado." (hero da Home)        | título do artigo        |
| Open Graph / Twitter  | da Home                                                             | do artigo               |
| **Content hash**      | **idêntico ao da Home** (`No. of pages having the same content: 2`) | único                   |
| Is in sitemap         | `true`                                                              | `true`                  |

A **resposta crua do servidor** (sem JavaScript) para a URL do artigo retorna o HTML completo da **Home** (hero, "Sobre", "Áreas", contato, mapa, rodapé), com `canonical` e meta tags da Home. Confirmação direta, não apenas inferência do Ahrefs.

### 10.2 Causa raiz

A rota `/blog/:slug` está declarada como `RenderMode.Server` (`app.routes.server.ts`), mas **em produção ela não está sendo renderizada pelo servidor** — a plataforma (Vercel) está servindo o `index.html` **pré-renderizado da Home** como _fallback_ para a URL do artigo.

Encadeamento do problema:

1. As rotas `/` e `/blog` são `Prerender` → geram arquivos estáticos (`index.html`, `blog/index.html`).
2. `/blog/:slug` é `Server` → deveria ser atendida pela **função SSR** do Angular.
3. Como a requisição a `/blog/<slug>` **não chega à função SSR** (ou a função não está sendo deployada/roteada), e não existe arquivo estático para esse caminho, o servidor entrega o `index.html` da raiz (Home) como _catch-all_.
4. Resultado: o navegador/robô recebe o HTML da Home naquela URL. O `ArtigoComponent` e o `SeoService` **nunca executam o passe de SSR do artigo**, então `canonical`, `title`, OG, JSON-LD e conteúdo são os da Home.
5. Com o `canonical` apontando para a Home, o Google trata o artigo como duplicata e **não o indexa** (`Is indexable: false`).

> Observação importante: o Supabase funciona no SSR — a prova é que o `blog-preview` da Home (que também lê o Supabase) renderiza o artigo corretamente no HTML da Home. O defeito é exclusivamente de **roteamento/entrega da rota dinâmica**, não de dados.

### 10.3 Tratamento

Duas abordagens. A primeira é a recomendada para este projeto.

#### Opção A — Pré-renderizar os artigos (recomendada)

Para um blog jurídico de baixo volume e conteúdo que muda pouco, **pré-renderizar cada artigo** é a solução mais robusta, mais rápida (melhor Core Web Vitals) e que **elimina a dependência do roteamento da função SSR**.

- Mudar `/blog/:slug` de `Server` para **`Prerender` com `getPrerenderParams()`**, buscando todos os slugs publicados no Supabase em tempo de build:

```typescript
// app.routes.server.ts (conceito)
{
  path: 'blog/:slug',
  renderMode: RenderMode.Prerender,
  async getPrerenderParams() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/published_articles?select=slug`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    const articles = await res.json();
    return articles.map((a: { slug: string }) => ({ slug: a.slug }));
  },
}
```

- Cada artigo passa a ser um `blog/<slug>/index.html` estático, com **SEO próprio embutido** (title, canonical self, OG, JSON-LD, conteúdo completo).
- Para manter o conteúdo fresco sem deploy manual, configurar um **Vercel Deploy Hook** acionado por um **webhook do Supabase** em `INSERT`/`UPDATE` da tabela `articles` (publicação dispara rebuild). Custo: a publicação não é instantânea (~1–2 min de build) — aceitável para este caso.
- Atualizar o `api/sitemap.ts` continua válido (já lista os slugs).

#### Opção B — Fazer o SSR dinâmico realmente rodar

Se for desejável publicação **instantânea** (sem rebuild), é preciso garantir que a Vercel invoque a **função SSR** do Angular para `/blog/:slug`:

- Verificar se o deploy está realmente publicando a função SSR (`@angular/ssr` + adaptador Vercel) e não tratando o app como SPA estática.
- Revisar o `vercel.json`: hoje ele só tem o _rewrite_ do sitemap. Garantir que **não exista** um _catch-all_ para `/index.html` e que o _framework preset_ detecte o SSR. Um `vercel.json` custom pode desativar a configuração zero-config do Angular — alinhar `buildCommand`/`outputDirectory`/`functions` ao output do `@angular/ssr`.
- Confirmar que as variáveis `SUPABASE_URL`/`SUPABASE_KEY` existem no ambiente da função em produção.

#### Reforços de robustez (valem para A ou B)

- **Resolver de rota** para o artigo: buscar o dado via _route resolver_ antes da ativação do componente, definindo o SEO de forma determinística **antes** do render — mais confiável que depender do timing do `ngOnInit`.
- Garantir que o `SeoService` sempre escreva um **canonical self** quando houver `slug` (já faz, desde que execute no passe correto).
- Combinar com as correções de SEO de artigo da §7 (data ISO, `dateModified`, autor/E-E-A-T, `BreadcrumbList`).

### 10.4 Validação (após a correção)

1. `curl -sL https://www.mfernandavetere.adv.br/blog/<slug>` → conferir no HTML cru: `<title>` do artigo, `<link rel="canonical">` apontando para a própria URL, `<h1>` = título do artigo e o corpo do artigo presente.
2. **Google Search Console → Inspeção de URL → Testar URL ativa**: indexável, canonical = self.
3. **Rich Results Test**: schema `Article`/`BlogPosting` válido.
4. Recrawl no **Ahrefs**: `Is indexable: true`, `Is self-canonical: true`, content hash único.
5. Reenviar o sitemap e solicitar indexação no GSC.

### 10.5 Prioridade

Este item é **P0 e antecede** as demais melhorias de SEO de artigo: enriquecer schema, autor e data (§4–§7) só tem efeito depois que a página do artigo **existir com SEO próprio e for indexável**. Registrado também no topo do [`MELHORIAS.md`](./MELHORIAS.md).

---

### 10.6 Resolução aplicada (S1 — 2026-06-19)

**Status: ✅ Corrigido na S1** (branch `fix/article-prerender-seo`). Adotada a **Opção A** (pré-renderização).

- `app.routes.server.ts`: `/blog/:slug` passou de `RenderMode.Server` para **`RenderMode.Prerender`** com `getPrerenderParams()`, que busca os slugs publicados na view `published_articles` do Supabase **em tempo de build** (credenciais via `environment`, geradas pelo hook `set-env.cjs`). Em falha de rede/Supabase no build, registra o erro e retorna `[]` para **não** quebrar o deploy.
- Cada artigo passa a ser um `blog/<slug>/index.html` estático com **SEO próprio** (canonical self, `title`/`h1`, OG, JSON-LD `BlogPosting`), eliminando a dependência do roteamento da função SSR que causava o fallback para a Home.
- `api/sitemap.ts` permanece válido (já lista os slugs).

**Rebuild ao publicar — a configurar no painel (fora do repositório, pois a URL é um segredo):**

1. **Vercel → Project → Settings → Git → Deploy Hooks:** criar um hook (ex.: nome `supabase-publish`, branch `main`) e copiar a URL gerada (contém token secreto — **não** commitar).
2. **Supabase → Database → Webhooks → Create a new hook:** tabela `articles`, eventos `INSERT` e `UPDATE`, tipo HTTP `POST`, URL = a do Deploy Hook. _(Alternativa: trigger SQL com `net.http_post` lendo a URL do **Vault**, nunca hardcoded.)_
3. Resultado: publicar/editar um artigo dispara o rebuild (~1–2 min) e gera o novo `index.html` estático. Publicação não é instantânea — aceitável para este caso (Opção B seria necessária para publicação instantânea).

> Validação pós-deploy: ver §10.4 (curl com canonical self + título/H1/corpo; GSC Inspeção de URL; Rich Results; recrawl Ahrefs).

---

### 10.7 Diagnóstico GSC — "erro desconhecido" e relatórios que não atualizam (S10 — 2026-06-23)

**Status: ✅ Diagnosticado e corrigido na S10** (branch `fix/gsc-robots-indexing`).

#### Achados do diagnóstico

Fetches simultâneos realizados em 2026-06-23 para os quatro endpoints críticos:

| Endpoint | Status | Content-Type | Observação |
|---|---|---|---|
| `www` robots.txt | 200 | `text/plain; charset=utf-8` | ✅ Conteúdo correto |
| `apex` robots.txt | 200 (redirect → www) | `text/plain; charset=utf-8` | ✅ Apex redireciona corretamente |
| `www` sitemap.xml | 200 | `text/xml; charset=utf-8` | ⚠️ Conteúdo **desatualizado** — `lastmod 2026-06-20`, sem `/autor/...` |
| `apex` sitemap.xml | 200 (redirect → www) | `text/xml; charset=utf-8` | ✅ Conteúdo **fresco** — `lastmod 2026-06-23`, com `/autor/...` |

Os dois fetches ao `www` sitemap retornaram conteúdo diferente entre si — prova de que **diferentes edge nodes da Vercel tinham caches em momentos distintos**.

#### Causa-raiz: `s-maxage=86400` no sitemap (24 h de cache de CDN)

O header `Cache-Control: s-maxage=86400, stale-while-revalidate` (sem valor explícito para `stale-while-revalidate`) fazia com que:

1. O edge node cacheasse a resposta do `api/sitemap.ts` por **24 horas** após a última chamada.
2. Quando um novo deploy (e.g., S8 — adição de `/autor/...`) acontecia, os edge nodes com cache antigo continuavam servindo o sitemap desatualizado por até 24 h — em vez de chamar a Serverless Function.
3. Googlebot e GSC, ao bater em nodes com cache stale, recebiam um sitemap que não refletia as páginas mais recentes, explicando por que os relatórios de cobertura "não atualizam".
4. O `stale-while-revalidate` sem valor explícito é interpretado de forma inconsistente entre CDNs (Vercel trata como infinito) — antipadrão.

O "erro desconhecido" do GSC no robots.txt é **transiente** e não é defeito do arquivo: ocorreu quando a Serverless Function de sitemap retornou 500 ou sofreu timeout (cold start lento). O GSC registra o último erro sem auto-limpar — basta uma nova leitura bem-sucedida para resetar.

#### Correções aplicadas

1. **`api/sitemap.ts`** — cache reduzido de 24 h para 1 h, `stale-while-revalidate` com valor explícito:
   ```
   Cache-Control: s-maxage=3600, stale-while-revalidate=86400
   ```
   Semântica: resposta fresca por **1 hora** na edge; após isso, Vercel serve stale por até **24 h** enquanto revalida em background. Googlebot sempre recebe um sitemap no máximo 1 h desatualizado.

2. **`api/llms.ts`** — mesma correção por consistência.

3. **`src/robots.txt`** — comentário interno corrigido ("Express" → "Vercel Serverless Function (api/sitemap.ts)").

#### Ações obrigatórias do operador no GSC (sem código)

Após o deploy desta branch, executar no Google Search Console:

1. **GSC → Configurações → Rastreador de robots.txt → Testar → "Solicitar nova leitura"** — força o GSC a re-fetch o robots.txt e limpa o erro desconhecido.
2. **GSC → Sitemaps → selecionar `sitemap.xml` → "Reenviar"** — força novo fetch do sitemap com o conteúdo fresco (sem cache stale).
3. **GSC → Inspeção de URL → `https://www.mfernandavetere.adv.br/autor/maria-fernanda-vetere` → "Testar URL ativa"** — confirmar indexável. Se sim, clicar em "Solicitar indexação".
4. **Aguardar 3–7 dias** para os relatórios de Páginas / Cobertura refletirem o estado real — essa latência é estrutural do GSC e **não é bug**. Para estado em tempo real, usar sempre "Inspeção de URL → Testar URL ativa", nunca o relatório de Cobertura.

#### Propriedade GSC e tipo correto

- O `index.html` usa verificação por meta tag HTML (`google-site-verification`) — compatível com **propriedade URL-prefix** (`https://www.mfernandavetere.adv.br/`).
- O apex (`mfernandavetere.adv.br`) já redireciona para www — correto. Se o GSC exibir dados de ambos os prefixos, adicionar também a propriedade de domínio e verificar via DNS (`TXT` no registro do domínio) para ter visão unificada.

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
