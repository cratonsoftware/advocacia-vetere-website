# CLAUDE.md — Advocacia Vetere Website

> Contexto permanente para o Claude Code. Leia antes de qualquer intervenção no projeto.

> **Documentação relacionada:** [`README.md`](./README.md) (uso) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) (arquitetura técnica e fluxo de dados) · [`MELHORIAS.md`](./MELHORIAS.md) (backlog de melhorias priorizado) · [`BLOG-SEO.md`](./BLOG-SEO.md) (banco, blog e SEO de alto nível) · [`PLANO-EXECUCAO.md`](./PLANO-EXECUCAO.md) (runbook de execução por sessões + registro de progresso) · [`MODELO-ARTIGO-BLOG.md`](./MODELO-ARTIGO-BLOG.md) (guia autocontido de autoria de artigos para a IA da Dra. — mapeado ao Supabase) · [`ANALISE-SEO-GEMINI-AHREFS.md`](./ANALISE-SEO-GEMINI-AHREFS.md) (análise consolidada Gemini × Ahrefs × estado real + plano priorizado).

---

## Governança de Documentação e Progresso (OBRIGATÓRIO)

Estas regras valem para **qualquer** intervenção no projeto e têm precedência operacional. O objetivo é evitar retrabalho e manter o contexto íntegro entre sessões.

1. **README e CLAUDE sempre atualizados.** Ao final de toda sessão/alteração, o agente **deve** revisar e atualizar o [`README.md`](./README.md) e este `CLAUDE.md` para refletir o estado real (stack, rotas, schema, comandos, padrões, decisões). Nenhuma sessão é considerada concluída com esses arquivos desatualizados. Quando uma decisão técnica mudar, atualizar também o documento de referência correspondente (`ARCHITECTURE.md`, `BLOG-SEO.md`, `MELHORIAS.md`).

2. **Marcar SEMPRE, de forma explícita, o que já foi feito.** A **fonte única de verdade do progresso** é o §6 (Registro de progresso) do [`PLANO-EXECUCAO.md`](./PLANO-EXECUCAO.md). Antes de iniciar qualquer trabalho, **ler o registro** para não refazer o que já está concluído. Ao concluir um item, **marcá-lo `✅` com data e hash do commit/PR**. Legenda: ⬜ Pendente · 🔄 Em andamento · ✅ Concluído · ⏸️ Bloqueado. Não confiar na memória da conversa para saber o que foi feito — confiar no registro.

3. **Trabalho em sessões fechadas.** Seguir o runbook do [`PLANO-EXECUCAO.md`](./PLANO-EXECUCAO.md): uma sessão = um escopo = uma branch = um PR, com **ritual de entrada** (ler docs + registro) e **ritual de saída** (build verde, validação, docs atualizados, progresso marcado, commit + preview). Ao concluir o escopo, **encerrar a sessão** — não emendar a próxima na mesma conversa.

4. **Definition of Done.** Nenhum item é "feito" sem: `npm run build` sem erros, validação específica aprovada, documentação atualizada e progresso marcado. Em caso de bloqueio, registrar `⏸️` com a causa.

5. **Execução de comandos pesados é do operador, não do agente.** O agente **não** executa por conta própria operações de Git (`branch`, `checkout`, `add`, `commit`, `push`, `merge`, `rebase`, `reset`), builds (`npm run build`, `ng build` e afins) nem outras ações custosas ou demoradas. Em vez disso, **monta o comando exato**, explica o que ele faz e o resultado esperado, e **pede ao operador para executá-lo** — aguardando a saída (ou um "ok") antes de prosseguir. Tentativas e retentativas automáticas desperdiçam a cota de uso e o tempo do operador. Permanecem livres para o agente as ações **leves**: ler, editar e escrever arquivos do projeto, inspeções rápidas (grep/leitura) e consultas via MCP. **Exceção:** quando o operador autorizar explicitamente ("pode rodar"), o agente executa aquele comando específico.

6. **`MODELO-ARTIGO-BLOG.md` é contrato com a IA da Dra. — manter sincronizado (OBRIGATÓRIO).** O [`MODELO-ARTIGO-BLOG.md`](./MODELO-ARTIGO-BLOG.md) é a **única ponte** da IA assistente da Dra. (que **não** tem acesso ao Supabase nem a esta documentação) com a estrutura real dos artigos. **Qualquer** mudança que afete os campos do artigo, seus formatos/limites, a renderização ou o SEO — nova coluna em `articles`/view `published_articles`, alteração no `SeoService`, no `artigo.component`, no fluxo de capa (Storage/1200×630), nas regras de slug/FAQ/ética OAB, etc. — **deve ser refletida imediatamente** nesse arquivo, na mesma sessão da alteração. Documento desatualizado = artigos cadastrados errados. Tratar como parte da Definition of Done (regra 4).

---

## Sobre o Projeto

Site profissional da Dra. Maria Fernanda Vetere, advogada com escritório em Tambaú-SP. Desenvolvido e mantido pela **CRATON Software** (craton.com.br).

Este é um dos projetos mais representativos do portfólio da CRATON — qualquer intervenção deve ser feita com máxima atenção técnica, maturidade, elegância e consistência. Nenhuma mudança é pequena o suficiente para ser feita de qualquer jeito.

**Domínio em produção:** https://www.mfernandavetere.adv.br **Repositório:** público — GitHub (luizfsouzadev) **Hospedagem:** Vercel Free (deploy automático via push na branch main) **Autor registrado:** CRATON Software (cratonsoftware) — package.json

---

## Stack Técnica

| Camada                | Tecnologia                                              | Versão           |
| --------------------- | ------------------------------------------------------- | ---------------- |
| Framework             | Angular                                                 | ^21.0.0          |
| SSR                   | @angular/ssr + Express                                  | ^21.2.7 / ^5.1.0 |
| Estilização           | TailwindCSS                                             | ^4.0.0           |
| CSS preprocessador    | SCSS                                                    | —                |
| UI Components         | Angular Material (apenas `MatIcon`, para SVGs próprios) | ^21.0.0          |
| Banco de dados / CMS  | Supabase (via REST API + HttpClient)                    | ^2.103.3         |
| Markdown              | ngx-markdown                                            | ^21.2.0          |
| Máscara de formulário | ngx-mask                                                | ^21.0.1          |
| Envio de formulário   | Web3Forms (endpoint externo via `<form action>`)        | —                |
| Sitemap dinâmico      | xmlbuilder2 (via Vercel Serverless Function)            | ^4.0.3           |
| Analytics             | @vercel/analytics + @vercel/speed-insights              | ^2.0.x           |
| Formatação            | Prettier + plugins (organize-imports, tailwindcss)      | ^3.7.4           |
| Tipagem               | TypeScript                                              | ~5.9.3           |
| Change Detection      | Zoneless (`provideZonelessChangeDetection`) + `OnPush`  | Angular 21 (S6)  |
| Imagens               | `NgOptimizedImage` (identity loader para URLs externas) | Angular 21 (S6)  |
| Fontes                | WOFF2 (primário) + TTF/OTF fallback; preload críticas   | S6               |
| Web Manifest          | `manifest.webmanifest` + apple-touch-icon               | S7               |

---

## Arquitetura

### SSR (Server-Side Rendering)

O projeto usa `outputMode: server` com `@angular/ssr`. Todo o conteúdo é renderizado no servidor antes de chegar ao browser — isso é fundamental para o SEO. **Nunca converter rotas para renderização client-side sem motivo explícito.**

O servidor Express (`src/server.ts`) é responsável exclusivamente por:

- Servir a aplicação Angular SSR
- Repassar requisições não tratadas para o Angular Router

### Render Modes por Rota (`app.routes.server.ts`)

| Rota                    | Modo        | Motivo                                                                                                                                                                            |
| ----------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                     | `Prerender` | Conteúdo estático — máxima performance e SEO                                                                                                                                      |
| `/blog`                 | `Prerender` | Listagem de artigos pré-renderizada com conteúdo real                                                                                                                             |
| `/blog/:slug`           | `Prerender` | Pré-renderizado por slug via `getPrerenderParams()` (lê os slugs publicados no Supabase no build) — HTML estático com SEO próprio e indexável                                     |
| `/blog/categoria/:slug` | `Prerender` | Página de categoria (hub) pré-renderizada por slug via `getPrerenderParams()` (lê os slugs de `categories` no build) — SEO próprio `CollectionPage` + `BreadcrumbList` (S5)       |
| `/autor/:slug`          | `Prerender` | Página de perfil de autor (E-E-A-T) pré-renderizada por slug via `getPrerenderParams()` (lê os slugs de `authors` no build) — SEO próprio `ProfilePage` + `Person` (S8 follow-up) |
| `/sucesso`              | `Prerender` | Página simples sem dados dinâmicos                                                                                                                                                |
| `/404`                  | `Prerender` | Página de erro estática                                                                                                                                                           |
| `/**`                   | `Server`    | Fallback para rotas não mapeadas                                                                                                                                                  |

### Pré-renderização de artigos (`/blog/:slug`)

Cada artigo é **pré-renderizado** como `blog/<slug>/index.html` estático. O `getPrerenderParams()` em `app.routes.server.ts` busca os slugs publicados na view `published_articles` do Supabase **em tempo de build** (credenciais via `environment`, geradas por `set-env.cjs`). Isso garante SEO próprio por artigo (canonical self, `title`/`h1`, Open Graph, JSON-LD `BlogPosting`) e elimina a dependência do roteamento da função SSR.

Em falha de rede/Supabase durante o build, `getPrerenderParams()` registra o erro. **Guard de produção (S11):** o helper `fetchPrerenderSlugs` em `app.routes.server.ts` loga a contagem de slugs e, quando `process.env['VERCEL_ENV'] === 'production'`, **aborta o build** se a lista vier vazia (artigos/categorias/autores) — impedindo que um deploy verde suba com os artigos herdando o SEO da Home (o P0 que reabriu entre a S1 e a S8). Em **preview/local** mantém o fallback `[]` tolerante. Para publicar/editar sem deploy manual, configurar um **Vercel Deploy Hook** acionado por um **webhook do Supabase** (`INSERT`/`UPDATE` em `articles`), disparando rebuild (~1–2 min). A URL do Deploy Hook é segredo e **não** entra no repositório. Histórico e passo a passo: `BLOG-SEO.md` §10 (guard de build: §10.8).

### Domínios permitidos (security.allowedHosts)

```
localhost, 127.0.0.1, mfernandavetere.adv.br, www.mfernandavetere.adv.br, *.vercel.app
```

Não adicionar hosts não autorizados sem revisar implicações de segurança.

### Scripts de pré-build

Dois scripts são executados antes de `serve`, `dev`, `build` e `test` (hooks `pre*`):

- `scripts/generate-icons.cjs` — geração de ícones/assets
- `scripts/set-env.cjs` — injeção de variáveis de ambiente no build

**Nunca remover os hooks `pre*` do package.json.** Qualquer build sem esses scripts pode gerar assets inconsistentes ou variáveis ausentes em produção. O hook `pretest` (S8) garante que `npm run test` também encontre `environment.ts` e a lista de ícones (ambos gerados, não versionados) — sem ele os specs não compilam num checkout limpo.

### Sitemap dinâmico e `/llms.txt`

Nem o sitemap nem o `llms.txt` são gerados pelo Express. São **Vercel Serverless Functions** (`api/sitemap.ts` e `api/llms.ts`), reescritas via `vercel.json`:

```json
{
	"rewrites": [
		{ "source": "/sitemap.xml", "destination": "/api/sitemap" },
		{ "source": "/llms.txt", "destination": "/api/llms" }
	]
}
```

O `api/sitemap.ts` busca os slugs de artigos no Supabase e gera o XML com xmlbuilder2, incluindo home, `/blog`, cada **página de categoria** (`/blog/categoria/:slug`, derivada dos `categorySlug` distintos), cada **página de autor** (`/autor/:slug`, derivada de `authors`) e cada artigo, todos com `lastmod`. O `robots.txt` aponta para `https://www.mfernandavetere.adv.br/sitemap.xml`.

O `api/llms.ts` (S5, §4.5 do `BLOG-SEO.md`) gera dinamicamente um Markdown curado para crawlers de IA (GEO/AEO) a partir da view `published_articles`: cabeçalho do escritório, páginas principais, áreas de atuação, **autores** (perfil com bio/OAB), categorias do blog e cada artigo com uma linha (`tldr` → fallback `excerpt`).

Quando novas rotas forem adicionadas, atualizar `api/sitemap.ts` (e, se fizer sentido, `api/llms.ts`) para incluí-las.

---

## Padrões de Código

### Geral

- **Idioma do código:** inglês (variáveis, funções, comentários, commits)
- **Idioma do conteúdo:** português brasileiro
- Formatação gerenciada pelo Prettier — não formatar manualmente, usar `npm run format`
- Imports organizados automaticamente pelo plugin `prettier-plugin-organize-imports`
- Classes Tailwind ordenadas automaticamente pelo plugin `prettier-plugin-tailwindcss`

### Angular

- Componentes criados com estilo `scss` (definido nos schematics do angular.json)
- Nomenclatura de arquivos com sufixo por tipo: `.component.ts`, `.service.ts`, `.directive.ts`, `.pipe.ts`, `.resolver.ts`, `.guard.ts`
- Separadores de tipo com ponto (`.`) para guards, interceptors, modules, pipes e resolvers — conforme schematics
- **Todos os componentes usam `ChangeDetectionStrategy.OnPush`** (aplicado na S6 — não omitir em novos componentes)
- O projeto usa **zoneless** (`provideZonelessChangeDetection()` em `app.config.ts`; `zone.js` removido dos polyfills em `angular.json`). Com zoneless + OnPush, mudanças de estado em callbacks `subscribe` **exigem** `ChangeDetectorRef.markForCheck()` — sem isso, o template não atualiza
- Signals e o novo modelo reativo do Angular 17+ são preferidos sobre Subject/BehaviorSubject para estado local; usar `toSignal()` para observables e `computed()` para estado derivado
- Evitar `any` — tipar tudo explicitamente

### SSR e SEO

- Cada rota deve ter metadados únicos: `title`, `description`, Open Graph e Twitter Card
- Usar `Meta` e `Title` services do Angular para injeção dinâmica de metadados
- Dados estruturados Schema.org devem ser injetados via script JSON-LD no `<head>` de cada página relevante
- **Nunca usar `document`, `window` ou `localStorage` diretamente** — sempre verificar `isPlatformBrowser` antes ou usar `PLATFORM_ID`
- Imagens devem ter `alt` descritivo e usar `loading="lazy"` exceto para imagens above-the-fold
- **Tipos de JSON-LD do `SeoService`** (por `config.type`/`slug`): `article`→`BlogPosting`, `slug='blog'`→`Blog`, `blog/categoria/*`→`CollectionPage`, `type='profile'`→`ProfilePage`+`Person` (página de autor), default→`LegalService`. Blocos coexistem por `data-seo` (`main`/`breadcrumb`/`faq`).
- **SEO fino por artigo (S8):** `SeoConfig.canonical` sobrescreve canonical/`og:url`/`@id` (consome `canonicalUrl` do artigo); `noIndex` consome `noindex`. O `author.url` do `Person` aponta para `/autor/:slug` (fallback à home se sem slug).
- **Sufixo de marca no `<title>` (2026-06-29):** o `SeoService` anexa ` | Dra. Maria Fernanda Vetere` ao `<title>` **exceto** quando `config.type === 'article'` (ou quando o título-base já contém a marca). Em artigos o `meta_title` é o `<title>` autoritativo e deve ficar **≤60** (sem o sufixo de 31 chars, que estourava o limite). Regra espelhada no `MODELO-ARTIGO-BLOG.md`. Não reintroduzir o sufixo em artigos.
- **Autoria, títulos e descrições (2026-06-30 — auditoria Ahrefs/LinkedIn/OpenGraph):** (1) `meta name="author"` no `index.html` = **"Dra. Maria Fernanda Vetere"** (dona do conteúdo, E-E-A-T); o crédito da CRATON virou `meta name="generator"` (além do rodapé) — **não** voltar a usar `author` para a agência. (2) `<title>` em **todas** as páginas deve ficar **≤60** e idealmente carregar sinal local (ex.: home → "… | Advocacia em Tambaú-SP"; autor → "{nome} | {role} em Tambaú-SP"). (3) `meta description` alvo **≤125** (preview social mobile corta ~125; Google tolera até ~160) — descrições de `blog`/`categoria`/`autor` já enxugadas nos componentes. **Pendente (decisão do operador):** `meta_description` dos artigos no Supabase ainda em 129–136 → se adotar o teto de 125, refletir no `MODELO-ARTIGO-BLOG.md`. (4) **og:image:** os cards estáticos `card-home.png`/`card-blog.png` estão em **1122×650** mas o `SeoService` declara **1200×630** — regerar os dois em 1200×630 (pendente, fora desta sessão). Capas de artigo do Storage já estão 1200×630.

- **Separação de imagens: capa limpa × card social (2026-07-01):** decisão de SEO — a imagem **de compartilhamento** (com template/headline) é **separada** da imagem **da página/indexada**. Motivo: o Google Discover pede imagem grande **sem texto sobreposto e sem logo**; texto embutido serve às redes (CTR), não ao Discover. **Duas colunas em `articles`** (ambas `.webp`, links manuais do Storage): `cover_image` = **imagem limpa** (hero do artigo, cards do blog, `BlogPosting.image`/Google/Discover) e **`social_image`** = **imagem COM template** (feita no Canva) usada só em `og:image`/`twitter:image`. A view `published_articles` expõe `coverImage` e **`socialImage`** (migração `replace_og_headline_with_social_image`, `security_invoker` preservado + grants re-aplicados). Front: `SeoConfig.ogImage` **desacopla** `og:image`/`twitter:image` do `image`; `ArtigoComponent` seta `ogImage: data.socialImage || undefined` (fallback → `coverImage` limpa quando `social_image` vazio); o `BlogPosting.image` (JSON-LD) sempre com a **imagem limpa**. `robots` inclui `max-image-preview:large, max-snippet:-1, max-video-preview:-1`. Hero do artigo migrado de `h-[40vh]` para `aspect-[1200/630]` (evita corte no mobile). `cover_image` migrado de `.png`→`.webp` no Supabase (CloudConvert Fit=Crop, Strip=Yes, Q80, 1200×630, sem selo/texto). Mapeado no `MODELO-ARTIGO-BLOG.md` (campos `cover_image` limpo + `social_image`).
    - **Gerador de OG dinâmico — decisão registrada, NÃO implementado (2026-07-01):** chegou a ser prototipado um `api/og.tsx` (Serverless edge `@vercel/og`/Satori: painel `#572c1c` 669.9px + logo `mfv-logo-sem-cla-hor.png` a 70% + título Antic Didone + foto 530.1px) para gerar o card on-demand sem storage extra. **Removido a pedido do operador** (custo/benefício baixo no momento; mais prático fazer no Canva). Fica como opção futura. **Aprendizado a preservar se retomar:** o **Satori não decodifica WebP** (só PNG/JPEG/GIF/SVG) e a falha ocorre em streaming → gera **PNG de 0 bytes** (200, sem erro 500). Se retomar, a foto do card precisa ser PNG/JPEG (ex.: `.png` irmão ou capa em JPEG), e a dep `@vercel/og` volta ao `package.json`.

### Testes (S8 — aplicado 2026-06-21; S14 — render tests 2026-06-24)

Karma + Jasmine (já configurados). Rodar com `npm run test -- --watch=false --browsers=ChromeHeadless` (o hook `pretest` gera `environment.ts`/ícones).

**Smoke tests de serviço (S8):** `seo.service.spec.ts` (montagem de tags + JSON-LD por tipo, canonical override, breadcrumb/faq) e `blog.service.spec.ts` (`formatDate`: ISO 8601, fallback, rótulo pt-BR, `\n`).

**Render tests das rotas pré-renderizadas (S14):** um spec por rota — `home`, `blog`, `artigo`, `categoria`, `autor` `.component.spec.ts` — exercendo o pipeline **componente → template → `<head>`**: verificam o `<h1>` renderizado, a `canonical` self e os blocos JSON-LD esperados por tipo (`LegalService` na home, `Blog` em `/blog`, `BlogPosting`+`BreadcrumbList` no artigo, `CollectionPage`+`BreadcrumbList` na categoria, `ProfilePage`+`Person`+`BreadcrumbList` no autor). Os fetches do Supabase são mockados via `HttpTestingController`; o `slug` vem de um `ActivatedRoute` stub. Utilitários, factories de mock e os stubs comuns ficam em `src/app/testing/seo-dom.helper.ts` — `provideRenderTestStubs()` injeta um `IMAGE_LOADER` que devolve um PNG transparente (NgOptimizedImage sem 404 de assets) e um `MatIconRegistry` falso que devolve `<svg>` vazio para qualquer nome (os SVGs próprios só são registrados em runtime pelo `AppComponent`, ausente nos specs). Os specs também usam `provideRouter`, `provideMarkdown` e, na home, `provideEnvironmentNgxMask` (formulário de contato).

Ao criar novos serviços/SEO ou novas rotas, **adicionar specs** (smoke de serviço e/ou render test da rota).

### Navegação e descoberta interna (S15 — aplicado 2026-06-24)

- **Categorias do `/blog` como navegação:** os botões de filtro de categoria viraram `<a [routerLink]="['/blog/categoria', cat.slug]">` com `routerLinkActive` no `<nav aria-label="Filtrar por categoria">`. "Todos" rota para `/blog`. A busca textual permanece como filtro in-page (via `searchTerm` signal). O `setCategory()` foi removido — não adicionar de volta.
- **Autora no artigo com link:** no rodapé de autoria do artigo (`artigo.component.html`), o nome da autora é `<a [routerLink]="['/autor', article.author!.slug]">` quando `author.slug` está disponível (fallback: `<p>` texto simples). Manter esse padrão em qualquer ajuste futuro no componente.
- **`routerLinkActive` no header:** "Blog" ativo sem `exact` (cobre `/blog`, `/blog/:slug`, `/blog/categoria/:slug`); links de home com `[routerLinkActiveOptions]="{exact:true}"` (ativos só em `/`). O `header.component` importa `RouterLinkActive`. Manter esse padrão.
- **Rodapé 4 colunas (S15):** Col 1 marca/OAB; Col 2 navegação; Col 3 contato (de `BUSINESS`); Col 4 blog/autor + redes sociais (SVG inline de `BUSINESS.sameAs`). O `FooterComponent` expõe `business` e `whatsappUrl` via `site.config.ts`. Ícones sociais são SVG inline (`@switch socialPlatform(url)`) — não usar bibliotecas externas de ícones.

### TailwindCSS 4

- Este projeto usa **Tailwind v4** — a sintaxe e o sistema de configuração são diferentes do v3
- Configuração via CSS (`@theme`) em vez de `tailwind.config.js`
- Usar `@tailwindcss/typography` para conteúdo do blog (já instalado como devDependency)
- Evitar valores arbitrários (`[valor]`) quando existir token de design equivalente
- Classes utilitárias no template, não estilos inline

### SCSS

- SCSS apenas para estilos que Tailwind não consegue expressar (animações complexas, pseudo-elementos específicos, estilos de terceiros)
- Sem `@import` — usar `@use` e `@forward`
- Variáveis globais no `src/styles.scss` apenas se forem consumidas em múltiplos lugares

### Acessibilidade (S7 — aplicado 2026-06-20)

- **`prefers-reduced-motion`:** usar `motion-safe:animate-*` em vez de `animate-*` em todos os templates. O `styles.scss` já tem bloco `@media (prefers-reduced-motion: reduce)` global que zera durações. Em JS (ex: autoplay), checar `window.matchMedia('(prefers-reduced-motion: reduce)').matches` dentro de `afterNextRender` antes de iniciar.
- **Skip link:** presente em `app.component.html` (`<a href="#main-content" class="skip-link">`); `<main>` tem `id="main-content" tabindex="-1"`. Não remover.
- **`focus-visible`:** regra global em `styles.scss` (`*:focus-visible { outline: 2px solid var(--color-n4); }`). Não usar `focus:outline-none` sem alternativa visível.
- **Micro-textos:** piso mínimo de `text-[11px]` para rótulos com opacidade sobre fundo claro. Separadores decorativos (`•`, `/`) com `aria-hidden="true"`. Opacidade mínima `/70` em supra-headings sobre fundo claro.
- **Skeletons:** `blog-preview` usa `toSignal()` sem `initialValue` — `undefined` → skeleton 3 cards; `[]` → estado vazio; `[...]` → artigos. `artigo` e `categoria` têm skeleton com `aria-busy="true"` no estado `isLoading`.
- **Elementos decorativos:** SVGs puramente decorativos (seta do hero) com `aria-hidden="true"`.

### Correções de conteúdo (S9 — aplicado 2026-06-23)

- **Rodapé de autoria do artigo:** o badge abaixo do nome da autora exibe **"Advogada Familiarista"** (texto fixo em `artigo.component.html`). **Não usar** `article.category` nem qualquer derivação de categoria — a Dra. não é especialista certificada; anunciar "Especialista" configura publicidade irregular perante a OAB.
- **Varredura confirmada:** `jobTitle` no `SeoService` e componentes usa fallback `'Advogada'`; `authors.role = 'Advogada'`; `authors.bio` sem referência a "especialista". A menção a "especialistas renomados" em `areas.component.html` refere-se a parceiros do escritório — manter.
- **Artigo "Traição":** `title` e `meta_title` atualizados para "Traição dá direito a indenização? Veja o que a lei diz sobre isso." no Supabase; `faq = NULL` (seção FAQ e JSON-LD `FAQPage` ocultados automaticamente pelo template). Slug `traicao-da-direito-a-indenizacao` **preservado** — nenhum redirect necessário.

### Correções de UX/consistência (2026-07-01)

Lote de ajustes pontuais reportados pelo operador ao usar o site:

- **Bold do markdown no artigo:** o `prose` do `artigo.component.html` ganhou `prose-strong:text-n4 prose-strong:font-semibold`. Sem isso, o `<strong>` herdava o `--tw-prose-bold` padrão (quase preto) e ficava mais chamativo que os títulos. **Não** remover — manter o bold na paleta da marca (`text-n4`), não em preto puro.
- **Copiar link do artigo:** botão "Copiar link" na seção _Compartilhar_ (`artigo.component.html`), com `ArtigoComponent.copyLink()` usando `navigator.clipboard` sob `isPlatformBrowser` (SSR-safe) e feedback temporário via `linkCopied` (reset em 2,5s, com `markForCheck()` — zoneless).
- **Card "Leia também" padronizado:** o card da seção _Leia também_ foi igualado aos demais (blog/categoria/autor/home) — `aspect-[1200/630]`, `p-8`, título `text-2xl`, `excerpt` com `line-clamp-3`, CTA "Ler Artigo Completo" e **tag de categoria clicável** (`/blog/categoria/:slug`). Manter paridade com o card do `blog.component.html`.
- **Navegação entre artigos (bug):** `ArtigoComponent` passou a assinar `route.paramMap` (observable) via `switchMap` em vez de `route.snapshot` no `ngOnInit`. O Angular reaproveita a instância do componente ao navegar de `/blog/:slug` para outro `:slug` (ex.: clicar em "Leia também"), então o `snapshot` não recarregava os dados. O spec da rota agora provê `paramMap: of(convertToParamMap(...))` além do `snapshot`.
- **Aspect-ratio dos cards padronizado:** todos os cards de artigo (`blog`, `categoria`, `autor`, `blog-preview`, "Leia também") trocaram altura fixa (`h-56`/`h-44`) por `aspect-[1200/630]`, alinhando à proporção real das capas (evita corte arbitrário e inconsistência entre telas). Hero do artigo já usava `aspect-[1200/630]`.
- **Handle do TikTok:** corrigido para `@mfernandavetere.adv` (faltava o `.adv`) no `contato.component.html` e em `BUSINESS.sameAs` (`site.config.ts`, consumido pelo footer/schema).

### Configuração central — `site.config.ts` (S13 — aplicado 2026-06-23)

- **Fonte única de constantes:** `src/app/core/config/site.config.ts` exporta `SITE_URL`, `BUSINESS` (telefone, `telephoneDisplay`, e-mail, endereço, geo, `priceRange`, `sameAs`, `openingHours`), `WHATSAPP_PHONE`/`WHATSAPP_MESSAGE`/`WHATSAPP_URL` e `ALL_CATEGORIES_LABEL` (`'Todos'`). **Não** voltar a hardcodar esses valores em componentes/serviços/templates — importar da config.
- **Consumidores:** `SeoService` (`baseUrl` + `business`; `openingHoursSpecification` é derivado de `BUSINESS.openingHours.periods`), `ArtigoComponent`/`CategoriaComponent`/`AutorComponent` (`SITE_URL`), `BlogComponent` (sem `ALL_CATEGORIES_LABEL` desde S15 — filtro de categoria virou navegação), `AppComponent` e `ContatoComponent` (`WHATSAPP_URL` + campos de `BUSINESS`), `FooterComponent` (`BUSINESS` + `WHATSAPP_URL` — S15).
- **`api/*` e `robots.txt` (fora do bundle Angular):** por decisão arquitetural, mantêm a URL base **localmente** com **duplicação consciente e documentada** (comentário apontando `site.config.ts`). Ao alterar `SITE_URL`, atualizar também `api/sitemap.ts`, `api/llms.ts` e `src/robots.txt`.
- **`WHATSAPP_URL`** é mantido como string pré-codificada (byte-a-byte idêntica ao link validado em produção); `WHATSAPP_MESSAGE`/`WHATSAPP_PHONE` ficam disponíveis como partes reutilizáveis (ex.: CTAs contextuais previstos na S17).

---

## Identidade Visual da Marca (Advocacia Vetere)

Ao criar ou modificar qualquer elemento visual, respeitar rigorosamente a identidade do site. Nenhuma decisão estética é tomada por conveniência — o site é vitrine da CRATON e deve sempre refletir o mais alto padrão de design.

**Princípios visuais:**

- Elegância sóbria e profissional — adequada ao meio jurídico
- Layout limpo com hierarquia visual clara
- Tipografia cuidadosa — legibilidade máxima em qualquer tamanho de tela
- Responsividade impecável em todos os breakpoints: mobile, tablet, desktop e widescreen
- Sem gradientes chamativos, sem elementos decorativos sem propósito

**Performance visual:**

- Animações apenas quando agregam contexto ou feedback — nunca decorativas
- Transições suaves (`transition`, `ease`) preferidas sobre animações abruptas
- Nenhum layout shift (CLS) — reservar espaço para imagens e conteúdo dinâmico

---

## Supabase — CMS do Blog e Reviews

O blog e as reviews são alimentados pelo Supabase. **Todas as queries são feitas via `HttpClient` do Angular apontando para a Supabase REST API** (PostgREST), não via o SDK `@supabase/supabase-js`.

**Por que HttpClient e não o SDK?** O Angular SSR só rastreia requisições feitas via `HttpClient` para determinar quando o HTML está pronto para ser enviado. Se o SDK Supabase (que usa `fetch` nativo) for usado em componentes SSR, a renderização acontece antes dos dados chegarem — os meta tags SEO ficam ausentes e o HTML pré-renderizado fica vazio.

**Padrão de acesso à REST API:**

```typescript
private http = inject(HttpClient);
private readonly apiUrl = `${environment.supabaseUrl}/rest/v1`;
private readonly headers = new HttpHeaders({
  apikey: environment.supabaseKey,
  Authorization: `Bearer ${environment.supabaseKey}`,
});

// Exemplo de query
this.http.get<Artigo[]>(`${this.apiUrl}/published_articles?select=*`, { headers: this.headers })
```

**Sintaxe de filtros PostgREST:**

- `?select=*` — todas as colunas
- `?select=id,name,slug` — colunas específicas
- `?slug=eq.${slug}` — filtro de igualdade
- `?limit=3` — limitar resultados
- `?order=name.asc` — ordenação

**Transfer Cache (evitar double-fetch na hidratação):** Configurado em `app.config.ts` via `withHttpTransferCacheOptions({ includeRequestsWithAuthHeaders: true })`. Como as chamadas têm o header `apikey`, a opção `includeRequestsWithAuthHeaders: true` é obrigatória para que o cache funcione corretamente. Sem isso, o cliente refaria todas as chamadas ao hidratar.

**Schema E-E-A-T (S3 — aplicado 2026-06-19, migração aditiva e não destrutiva):** existe a tabela `authors` (entidade de autor com `oab`, `bio`, `same_as` — RLS `SELECT` público) e `articles` ganhou colunas aditivas (`author_id`, `meta_title`, `meta_description`, `cover_image_alt`, `tags`, `tldr`, `faq`, `canonical_url`, `noindex`, `locale`) + índices em `category_id` e `published_at`. A view `published_articles` é **retrocompatível** (mantém os campos antigos) e agora também expõe `publishedAt`/`updatedAt` em **ISO**, `author` (objeto), `metaTitle`/`metaDescription`, `coverImageAlt`, `tags`, `tldr`, `faq`, `locale`, `canonicalUrl`, `noindex` e `categorySlug`; é `security_invoker` (respeita o RLS das tabelas base). Capas: bucket público `article-covers` no Storage (a imagem 1200×630 é enviada manualmente; `cover_image` migra para o Storage como follow-up). Detalhes e schema completo em `BLOG-SEO.md` §6. **Não** quebrar a retrocompatibilidade da view nem remover colunas.

**Consumo de SEO no front (S4 — aplicado 2026-06-19):** o `ArtigoComponent` usa `metaTitle`/`metaDescription` dedicados e o `BlogService.formatDate` deriva `dateIso`/`updatedAtIso` de `publishedAt`/`updatedAt` via `.toISOString()` — os timestamps do PostgREST não têm `T`, então **não** usar `split('T')`. O `SeoService` monta um `BlogPosting` rico (`mainEntityOfPage`, `ImageObject` 1200×630 com `caption`, `datePublished`/`dateModified`, `inLanguage`, `articleSection`, `keywords`, `author` `Person` com `identifier` OAB e `sameAs`) + um bloco `BreadcrumbList` separado, e enriquece o `LegalService` da home (telefone, e-mail, endereço, `geo`, `openingHoursSpecification`, `sameAs`, `priceRange`, `logo`). Múltiplos blocos JSON-LD coexistem via atributo `data-seo` (`main`/`breadcrumb`). Também emite `og:locale=pt_BR` e `og:image:alt`; o `api/sitemap.ts` emite `lastmod` em home/`blog`. Detalhes em `BLOG-SEO.md` §7.

**Topical authority & GEO/AEO (S5 — aplicado 2026-06-20):** **G6** — `ArtigoComponent` exibe `tags` como chips, transforma o badge de categoria em link para `/blog/categoria/:slug` (no artigo e nos cards do `/blog`) e renderiza a seção "Leia também" (`BlogService.getRelatedArticles`, mesma categoria via `categorySlug`, exclui o atual). **G7** — nova rota `/blog/categoria/:slug` (`CategoriaComponent`), pré-renderizada (`getCategorySlugs` lê `categories` no build), com SEO próprio (`CollectionPage` + `BreadcrumbList`); `BlogService.getCategoryBySlug`/`getArticlesByCategorySlug`. **G8** — bloco TL;DR (`tldr`) no topo e seção visível de FAQ (`faq`) por artigo, com `FAQPage` em bloco JSON-LD separado (`data-seo="faq"`, criado/removido conforme presença) no `SeoService`. **§4.5** — `/llms.txt` dinâmico (`api/llms.ts`). Um novo bloco JSON-LD `data-seo="faq"` soma-se a `main`/`breadcrumb`. O `SeoConfig` ganhou `faq`; o modelo `Artigo` ganhou `tldr`/`faq` (`FaqItem`). Detalhes em `BLOG-SEO.md` §4.3/§4.5/§7.

> **Conteúdo do artigo vs. campo `faq`:** o FAQ é renderizado a partir do campo estruturado `faq` (fonte única) e gera o `FAQPage`. Ao cadastrar `faq`, **não** duplicar as mesmas perguntas no Markdown `content` (regra "só marcar o que aparece na página": a seção visível vem do campo). O artigo de exemplo teve a seção "Perguntas frequentes" migrada do `content` para o campo `faq`.

**Boas práticas obrigatórias:**

- Sempre tratar erros com `catchError` retornando `of([])` ou `of(null)`
- Dados sensíveis (chaves) apenas via variáveis de ambiente — nunca hardcoded
- Conteúdo do blog renderizado via `ngx-markdown` com o plugin `@tailwindcss/typography` aplicado
- SEO dinâmico por artigo: title, description e OG gerados a partir dos metadados de cada post
- Slugs de artigos devem ser únicos, descritivos e em português sem acentos (ex: `responsabilidade-civil-advogado`)

---

## Avaliações (Google ↔ Supabase) e Mapa

### Avaliações — estado real

As avaliações exibidas são avaliações reais do Google Business, mas **o site NÃO chama a Google Cloud API em tempo de execução**. O fluxo é:

1. A Edge Function **`fetch-google-reviews`** (Deno, `verify_jwt: true`), agendada via **pg_cron** (job `Atualizar Avaliações do Google`, `0 0 * * *` — diário), consulta a **Places API (New)** (`places.googleapis.com/v1/places/{id}`, `X-Goog-FieldMask: reviews`, `languageCode=pt-BR`) com os secrets `GOOGLE_API_KEY` + `PLACE_ID`. **Migração legacy→New em 2026-07-02** (a Places API legacy foi desabilitada no projeto do Google Cloud).
2. Os dados são gravados na tabela **`google_reviews`** do Supabase por **`upsert(onConflict: 'author_name')`** — **acumulativo, não-destrutivo** (o padrão antigo de `delete`+`insert` foi removido na revisão de 2026-07-02). A chave natural é `author_name` (uma avaliação por autor por local). Grava-se **todas as notas** (o filtro de qualidade fica na leitura).
3. O site lê apenas o Supabase via `HttpClient` (`ReviewsService.getReviews()`): **`rating=gte.4&order=review_time.desc.nullslast&limit=5`** — as **5 mais recentes com 4+ estrelas**.

Isso evita expor chave Google no cliente e poupa quota. O `ReviewsComponent` mantém um **fallback estático** de avaliações para os casos em que o Supabase retorna vazio ou falha.

**Schema de `google_reviews` (revisão 2026-07-02):** além de `author_name, rating, text, profile_photo_url, relative_time_description, created_at`, tem `review_time timestamptz` (data real da avaliação, do campo `publishTime` da Places API New, já em ISO 8601 — **fonte de ordenação por recência**, pois `relative_time_description` é string não-sortável), `author_url`, `language` e **índice único em `author_name`** (dedup do upsert). RLS `SELECT` público, sem escrita anônima (a escrita é só da Edge Function via service role).

**Limite conhecido (Places API):** a Places API retorna **no máximo 5 avaliações** por chamada, sem paginação. O upsert **acumula** o que o Google rotaciona ao longo do tempo, mas **não garante 100%** das avaliações. Cobertura total exigiria a **Google Business Profile API** (OAuth da titular, aprovação de acesso, IDs de localização) — registrado como follow-up, não implementado.

### Mapa — estado real

A localização usa um **iframe de embed do Google Maps** (`mapa.component.html`). **Esta é a abordagem definitiva e adotada** — simples, sem chave/quota e com CLS controlado. Uma alternativa de mapa personalizado via Google Cloud API foi avaliada e **descartada** (2026-07-02, decisão do operador): o embed atende melhor à sobriedade da marca e ao custo/benefício. Não reabrir esse caminho sem pedido explícito. O único cuidado no iframe é o `title` de acessibilidade (já aplicado).

---

## Vercel Analytics e Speed Insights

Já integrados via `@vercel/analytics` e `@vercel/speed-insights`. Não remover nem comentar — são dados de performance em produção que informam decisões de otimização.

---

## SEO — Checklist Permanente

A cada nova página ou componente relevante, verificar:

- [ ] Tag `<title>` única e descritiva (50–60 caracteres)
- [ ] Meta `description` única (120–160 caracteres)
- [ ] Open Graph: `og:title`, `og:description`, `og:image`, `og:url`
- [ ] Twitter Card configurado
- [ ] Schema.org JSON-LD adequado ao tipo de página (`LegalService`, `Article`, `BreadcrumbList`, etc.)
- [ ] URL canônica (`<link rel="canonical">`)
- [ ] Imagens com `alt` descritivo
- [ ] Heading hierarchy correta (um único `<h1>` por página)
- [ ] Sitemap atualizado para incluir a nova rota (`api/sitemap.ts`)
- [ ] Core Web Vitals não degradados (verificar Vercel Speed Insights após deploy)

---

## Responsividade — Breakpoints de Referência (Tailwind v4)

| Nome  | Largura mínima | Uso típico          |
| ----- | -------------- | ------------------- |
| `sm`  | 640px          | Smartphones grandes |
| `md`  | 768px          | Tablets             |
| `lg`  | 1024px         | Laptops             |
| `xl`  | 1280px         | Desktops            |
| `2xl` | 1536px         | Telas largas        |

**Mobile first sempre.** Estilo base = mobile. Breakpoints adicionam comportamento para telas maiores.

Testar em pelo menos: 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1280px (desktop padrão), 1920px (full HD).

---

## Comandos Úteis

> **Pré-requisito:** Node.js **22** (`.nvmrc` na raiz — `nvm use` seleciona automaticamente). O `package.json` declara `"engines": { "node": ">=22 <23" }`.

```bash
# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Servir o build SSR localmente
npm run serve:ssr:advocacia-vetere-website

# Formatar todo o projeto
npm run format
```

---

## Deploy

Deploy automático via Vercel na branch `main`. Branches de feature geram preview deployments automáticos.

**Nunca fazer push direto na main sem testar o build localmente.** O comando `npm run build` deve completar sem erros ou warnings críticos antes de qualquer merge.

---

## Contexto do Projeto — CRATON Software

Este projeto é mantido pela CRATON Software (Luiz Fernando de Souza, fundador). É um dos cases mais completos e tecnicamente densos do portfólio — Angular 21 SSR, TailwindCSS 4, Supabase CMS, Google Cloud API, SEO especializado.

Qualquer decisão técnica deve ser consistente com o padrão estabelecido. Em caso de dúvida entre a solução mais simples e a mais robusta, optar pela mais robusta — este projeto não tem prazo de validade curto.
