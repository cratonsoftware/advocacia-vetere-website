# Advocacia Vetere — Website

Site profissional da **Dra. Maria Fernanda Vetere**, advogada com escritório em Tambaú/SP, com atuação em Direito de Família e Sucessões, Cível e Trabalhista.

Desenvolvido e mantido pela **[CRATON Software](https://craton.com.br)**.

🔗 **Produção:** https://www.mfernandavetere.adv.br

---

## Stack

| Camada                  | Tecnologia                                       |
| ----------------------- | ------------------------------------------------ |
| Framework               | Angular 21 (SSR — `@angular/ssr` + Express)      |
| Estilização             | TailwindCSS 4 (`@theme` em CSS) + SCSS           |
| Ícones                  | Angular Material (`MatIcon`, SVGs próprios)      |
| CMS (blog + avaliações) | Supabase via REST API (PostgREST + `HttpClient`) |
| Markdown                | `ngx-markdown` + `@tailwindcss/typography`       |
| Máscara de formulário   | `ngx-mask`                                       |
| Envio de formulário     | Web3Forms                                        |
| Sitemap + `llms.txt`    | Vercel Serverless Functions (`xmlbuilder2`)      |
| Métricas                | `@vercel/analytics` + `@vercel/speed-insights`   |
| Hospedagem              | Vercel (deploy automático na branch `main`)      |

A arquitetura completa está documentada em **[`ARCHITECTURE.md`](./ARCHITECTURE.md)**. O contexto operacional e padrões de código estão em **[`CLAUDE.md`](./CLAUDE.md)**. Melhorias planejadas em **[`MELHORIAS.md`](./MELHORIAS.md)**.

---

## Pré-requisitos

- Node.js **22** e npm (`nvm use` na raiz do projeto usa o `.nvmrc` automaticamente)
- Um arquivo `.env` na raiz (ver `.env.example`):

```
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_anon_supabase
```

> A chave/URL são injetadas no build pelo script `scripts/set-env.cjs` (gera `src/environments/environment.ts`, não versionado) e lidas em runtime pela função de sitemap.

---

## Como rodar

```bash
# instalar dependências
npm install

# desenvolvimento (http://localhost:4200)
npm run dev

# build de produção
npm run build

# servir o build SSR localmente
npm run serve:ssr:advocacia-vetere-website

# rodar os testes unitários (Karma + Jasmine, headless)
npm run test -- --watch=false --browsers=ChromeHeadless

# formatar o projeto (Prettier)
npm run format
```

> Os scripts `pre*` (`prebuild`/`predev`/`preserve`/`pretest`) rodam automaticamente `generate-icons.cjs` e `set-env.cjs`. **Não remover** — eles geram a lista de ícones e o arquivo de ambiente (o `pretest` garante que os testes encontrem `environment.ts`/ícones, ambos não versionados).

---

## Estrutura

```
src/app/
  core/        → config (site.config.ts — constantes centrais), models e services (blog, reviews, SEO) + smoke tests (*.spec.ts)
  features/    → blocos da home (header, hero, sobre, areas, reviews, contato, mapa, footer…)
  pages/       → rotas (home, blog, artigo, categoria, autor, sucesso, not-found) + render tests (*.component.spec.ts)
  testing/     → seo-dom.helper.ts (utilitários/mocks dos render tests)
api/sitemap.ts → Serverless Function do sitemap dinâmico
api/llms.ts    → Serverless Function do /llms.txt dinâmico (GEO/AEO)
scripts/       → hooks de pré-build
```

---

## Render modes (SSR)

| Rota                                                                                     | Modo      |
| ---------------------------------------------------------------------------------------- | --------- |
| `/`, `/blog`, `/blog/:slug`, `/blog/categoria/:slug`, `/autor/:slug`, `/sucesso`, `/404` | Prerender |
| `/**`                                                                                    | Server    |

> Cada artigo (`/blog/:slug`) e cada página de categoria (`/blog/categoria/:slug`) é pré-renderizado como HTML estático: o `getPrerenderParams()` em `app.routes.server.ts` lê, em tempo de build, os slugs publicados (artigos) e os slugs de `categories` (categorias) no Supabase, garantindo SEO próprio (canonical self, title/H1, OG, JSON-LD) e indexabilidade. Ao publicar/editar um artigo, um **Vercel Deploy Hook** acionado por um **webhook do Supabase** dispara o rebuild (~1–2 min). Ver `BLOG-SEO.md` §10.
>
> **SEO de schema (S4):** o `SeoService` injeta `BlogPosting` rico (`ImageObject`, `datePublished`/`dateModified`, `author` `Person` com OAB/`sameAs`, `inLanguage`, `articleSection`, `keywords`, `mainEntityOfPage`) + `BreadcrumbList` nos artigos, e `LegalService` enriquecido (telefone, e-mail, endereço, geo, horário, `sameAs`) na home; `og:locale=pt_BR` e `lastmod` de home/`blog` no sitemap. Ver `BLOG-SEO.md` §7 e `ARCHITECTURE.md` §5.
>
> **Topical authority & GEO/AEO (S5):** tags por artigo + linkagem interna (categoria clicável, seção "Leia também"); páginas de categoria (`/blog/categoria/:slug`) com `CollectionPage` + `BreadcrumbList`; bloco TL;DR e seção de FAQ por artigo, com `FAQPage` JSON-LD; e `/llms.txt` dinâmico (`api/llms.ts`, rewrite em `vercel.json`) gerado a partir da view. Ver `BLOG-SEO.md` §4.3/§4.5/§7.
>
> **Página de autor & SEO fino (S8 — follow-up):** página de perfil `/autor/:slug` (E-E-A-T) pré-renderizada, com `ProfilePage` + `Person` (OAB/`sameAs`), listando os artigos da autora; o `author.url` do JSON-LD do artigo passou a apontar para `/autor/:slug`. Override de canônica (`canonicalUrl`) e `noindex` por artigo agora são consumidos no front. Autores entram no `sitemap.xml` e no `/llms.txt`.
>
> **Robustez do build (S11):** o `getPrerenderParams()` loga a contagem de slugs por recurso e, em produção (`VERCEL_ENV=production`), **aborta o build** se o pré-render de artigos/categorias/autores vier vazio — evitando um deploy verde mas quebrado (artigos herdando o SEO da Home, não indexáveis). Em preview/local mantém-se tolerante. Ver `BLOG-SEO.md` §10.8.

---

## Deploy

Deploy automático na Vercel a cada push na branch `main` (branches de feature geram preview deployments).

> **Sempre rodar `npm run build` localmente antes de mergear na `main`** — o build deve completar sem erros.

---

## Convenções

- Código em **inglês**; conteúdo em **português brasileiro**.
- Commits no padrão **Conventional Commits** (ex.: `feat(...)`, `fix(...)`, `refactor(...)`).
- Formatação automática via Prettier (`prettier-plugin-organize-imports` + `prettier-plugin-tailwindcss`).
- Detalhes de padrões em [`CLAUDE.md`](./CLAUDE.md).

---

© Dra. Maria Fernanda Vetere · OAB/SP 527.527 — Desenvolvido por [CRATON Software](https://craton.com.br).
