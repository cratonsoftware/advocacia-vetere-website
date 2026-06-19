# CLAUDE.md — Advocacia Vetere Website
> Contexto permanente para o Claude Code. Leia antes de qualquer intervenção no projeto.

> **Documentação relacionada:** [`README.md`](./README.md) (uso) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) (arquitetura técnica e fluxo de dados) · [`MELHORIAS.md`](./MELHORIAS.md) (backlog de melhorias priorizado).

---

## Sobre o Projeto

Site profissional da Dra. Maria Fernanda Vetere, advogada com escritório em Tambaú-SP.
Desenvolvido e mantido pela **CRATON Software** (craton.com.br).

Este é um dos projetos mais representativos do portfólio da CRATON — qualquer intervenção deve ser feita com máxima atenção técnica, maturidade, elegância e consistência. Nenhuma mudança é pequena o suficiente para ser feita de qualquer jeito.

**Domínio em produção:** https://www.mfernandavetere.adv.br
**Repositório:** público — GitHub (luizfsouzadev)
**Hospedagem:** Vercel Free (deploy automático via push na branch main)
**Autor registrado:** CRATON Software (cratonsoftware) — package.json

---

## Stack Técnica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Angular | ^21.0.0 |
| SSR | @angular/ssr + Express | ^21.2.7 / ^5.1.0 |
| Estilização | TailwindCSS | ^4.0.0 |
| CSS preprocessador | SCSS | — |
| UI Components | Angular Material (apenas `MatIcon`, para SVGs próprios) | ^21.0.0 |
| Banco de dados / CMS | Supabase (via REST API + HttpClient) | ^2.103.3 |
| Markdown | ngx-markdown | ^21.2.0 |
| Máscara de formulário | ngx-mask | ^21.0.1 |
| Envio de formulário | Web3Forms (endpoint externo via `<form action>`) | — |
| Sitemap dinâmico | xmlbuilder2 (via Vercel Serverless Function) | ^4.0.3 |
| Analytics | @vercel/analytics + @vercel/speed-insights | ^2.0.x |
| Formatação | Prettier + plugins (organize-imports, tailwindcss) | ^3.7.4 |
| Tipagem | TypeScript | ~5.9.3 |

---

## Arquitetura

### SSR (Server-Side Rendering)
O projeto usa `outputMode: server` com `@angular/ssr`. Todo o conteúdo é renderizado no servidor antes de chegar ao browser — isso é fundamental para o SEO. **Nunca converter rotas para renderização client-side sem motivo explícito.**

O servidor Express (`src/server.ts`) é responsável exclusivamente por:
- Servir a aplicação Angular SSR
- Repassar requisições não tratadas para o Angular Router

### Render Modes por Rota (`app.routes.server.ts`)

| Rota | Modo | Motivo |
|---|---|---|
| `/` | `Prerender` | Conteúdo estático — máxima performance e SEO |
| `/blog` | `Prerender` | Listagem de artigos pré-renderizada com conteúdo real |
| `/blog/:slug` | `Server` | SEO dinâmico por artigo — cada slug tem meta tags únicas |
| `/sucesso` | `Prerender` | Página simples sem dados dinâmicos |
| `/404` | `Prerender` | Página de erro estática |
| `/**` | `Server` | Fallback para rotas não mapeadas |

### Domínios permitidos (security.allowedHosts)
```
localhost, 127.0.0.1, mfernandavetere.adv.br, www.mfernandavetere.adv.br, *.vercel.app
```
Não adicionar hosts não autorizados sem revisar implicações de segurança.

### Scripts de pré-build
Três scripts são executados antes de `serve`, `dev` e `build`:
- `scripts/generate-icons.cjs` — geração de ícones/assets
- `scripts/set-env.cjs` — injeção de variáveis de ambiente no build

**Nunca remover os hooks `pre*` do package.json.** Qualquer build sem esses scripts pode gerar assets inconsistentes ou variáveis ausentes em produção.

### Sitemap dinâmico
O sitemap **não** é gerado pelo Express. É uma **Vercel Serverless Function** em `api/sitemap.ts`, reescrita para `/sitemap.xml` via `vercel.json`:

```json
{
  "rewrites": [{ "source": "/sitemap.xml", "destination": "/api/sitemap" }]
}
```

A função busca os slugs de artigos no Supabase e gera o XML com xmlbuilder2. O `robots.txt` aponta para `https://www.mfernandavetere.adv.br/sitemap.xml`.

Quando novas rotas forem adicionadas, atualizar `api/sitemap.ts` para incluí-las.

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
- Usar `OnPush` change detection sempre que possível para performance
- Signals e o novo modelo reativo do Angular 17+ são preferidos sobre Subject/BehaviorSubject para estado local
- Evitar `any` — tipar tudo explicitamente

### SSR e SEO
- Cada rota deve ter metadados únicos: `title`, `description`, Open Graph e Twitter Card
- Usar `Meta` e `Title` services do Angular para injeção dinâmica de metadados
- Dados estruturados Schema.org devem ser injetados via script JSON-LD no `<head>` de cada página relevante
- **Nunca usar `document`, `window` ou `localStorage` diretamente** — sempre verificar `isPlatformBrowser` antes ou usar `PLATFORM_ID`
- Imagens devem ter `alt` descritivo e usar `loading="lazy"` exceto para imagens above-the-fold

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

**Por que HttpClient e não o SDK?**
O Angular SSR só rastreia requisições feitas via `HttpClient` para determinar quando o HTML está pronto para ser enviado. Se o SDK Supabase (que usa `fetch` nativo) for usado em componentes SSR, a renderização acontece antes dos dados chegarem — os meta tags SEO ficam ausentes e o HTML pré-renderizado fica vazio.

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

**Transfer Cache (evitar double-fetch na hidratação):**
Configurado em `app.config.ts` via `withHttpTransferCacheOptions({ includeRequestsWithAuthHeaders: true })`. Como as chamadas têm o header `apikey`, a opção `includeRequestsWithAuthHeaders: true` é obrigatória para que o cache funcione corretamente. Sem isso, o cliente refaria todas as chamadas ao hidratar.

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
1. Um processo de sincronização **agendado e pontual** consulta o Google Cloud (Places/Business) para capturar as avaliações do estabelecimento.
2. Os dados são gravados na tabela **`google_reviews`** do Supabase.
3. O site lê apenas o Supabase via `HttpClient` (`ReviewsService.getReviews()`, `limit=5`).

Isso evita expor chave Google no cliente e poupa quota. O `ReviewsComponent` mantém um **fallback estático** de avaliações para os casos em que o Supabase retorna vazio ou falha.

### Mapa — estado real
A localização usa um **iframe de embed do Google Maps** (`mapa.component.html`). A integração Supabase ↔ Google Cloud para um mapa personalizado foi **planejada, mas não executada** — hoje é apenas o embed padrão.

**Regras (para futura integração via Google Cloud API):**
- Chave da API exclusiva para este projeto — não reutilizar em outros
- Requisições feitas server-side / em pipeline de sincronização, nunca expondo a chave no client
- Manter o cache em Supabase (avaliações mudam raramente) — evitar quota desnecessária

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

| Nome | Largura mínima | Uso típico |
|---|---|---|
| `sm` | 640px | Smartphones grandes |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Telas largas |

**Mobile first sempre.** Estilo base = mobile. Breakpoints adicionam comportamento para telas maiores.

Testar em pelo menos: 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1280px (desktop padrão), 1920px (full HD).

---

## Comandos Úteis

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

Este projeto é mantido pela CRATON Software (Luiz Fernando de Souza, fundador).
É um dos cases mais completos e tecnicamente densos do portfólio — Angular 21 SSR, TailwindCSS 4, Supabase CMS, Google Cloud API, SEO especializado.

Qualquer decisão técnica deve ser consistente com o padrão estabelecido. Em caso de dúvida entre a solução mais simples e a mais robusta, optar pela mais robusta — este projeto não tem prazo de validade curto.
