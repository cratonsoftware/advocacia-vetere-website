# PLANO-EXECUCAO.md — Runbook de Execução

> Guia operacional para executar, em sessões separadas e sem retrabalho, todas as correções e melhorias documentadas em [`MELHORIAS.md`](./MELHORIAS.md) e [`BLOG-SEO.md`](./BLOG-SEO.md). Este arquivo é a **fonte única de verdade do progresso** — sempre leia o §6 (Registro de progresso) antes de começar e atualize-o ao terminar.
>
> Mantido pela CRATON Software. Última revisão: 2026-06-19.

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

**7 sessões essenciais + 1 opcional (testes).** Ordem por dependência e risco:

| #                   | Sessão                       | Foco                                                                 | Depende de | Modelo      | Risco      |
| ------------------- | ---------------------------- | -------------------------------------------------------------------- | ---------- | ----------- | ---------- |
| **S1**              | **P0 — Indexação do artigo** | Pré-renderizar `/blog/:slug` + deploy hook                           | —          | **Opus**    | Médio      |
| **S2**              | Quick wins de SEO/UX         | Correções pequenas e seguras                                         | —          | Sonnet      | Baixo      |
| **S3**              | Banco — fundação E-E-A-T     | `authors`, view ISO/`updated_at`, capas no Storage                   | S1         | **Opus**    | Médio-Alto |
| **S4**              | Schema & SERP                | meta dedicados, JSON-LD Article rico, Breadcrumb, LegalService       | S3         | **Opus**    | Médio      |
| **S5**              | Topical authority & GEO/AEO  | tags, páginas de categoria, TL;DR/FAQ, `llms.txt`                    | S3         | Sonnet/Opus | Médio      |
| **S6**              | Performance & modernização   | OnPush/zoneless, fontes WOFF2, preconnect, NgOptimizedImage, índices | —          | Sonnet      | Médio      |
| **S7**              | Acessibilidade & UX          | reduced-motion, skip link, foco, contraste, skeletons, manifest      | —          | Sonnet      | Baixo      |
| **S8** _(opcional)_ | Testes & verificação final   | smoke tests + auditoria de fechamento                                | todas      | Opus/Sonnet | Baixo      |

> S2, S6 e S7 são independentes e podem ser feitas em qualquer ordem após a S1. S4 e S5 **dependem** da S3 (precisam dos campos novos do banco). **S1 deve ser a primeira e sozinha** — destrava todo o resto de SEO.

---

## 3. Modelo e configuração recomendados

**Modelos (Claude):**

- **Opus 4.8** — sessões arquiteturais e críticas: **S1, S3, S4, S5** e a S8. Exigem raciocínio sobre SSR, migração de schema e arquitetura de SEO; vale o modelo mais capaz para não errar.
- **Sonnet 4.6** — sessões mais mecânicas: **S2, S6, S7**. Boa relação custo/qualidade para edições pontuais e repetitivas.
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
| S5 — Topical & GEO | ⬜ | — | — | Depende de S3 |
| S6 — Performance | ⬜ | — | — |  |
| S7 — Acessibilidade | ⬜ | — | — |  |
| S8 — Testes (opc.) | ⬜ | — | — |  |

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

**S5 — Topical authority & GEO/AEO** _(detalhes: `BLOG-SEO.md` §4.3, §6, §7)_

- ⬜ `tags` por artigo + linkagem interna — G6
- ⬜ Páginas de categoria `/blog/categoria/:slug` (usar `category.slug`) — G7
- ⬜ `tldr` + `faq` por artigo → `FAQPage` — G8
- ⬜ `/llms.txt` dinâmico a partir da view — §4.5
- ⬜ **Follow-up da S4:** criar a rota/página `/autor/:slug` (perfil da autora — bio, OAB, `sameAs`) e **trocar `author.url`** no `ArtigoComponent` de `baseUrl` (home) para `${baseUrl}/autor/${data.author?.slug}`. Hoje o campo `url` do JSON-LD `Person` aponta para a home **propositadamente**, para não gerar 404 antes da página existir (decisão registrada na S4). Ao criar a página, incluir a rota no `api/sitemap.ts`.

**S6 — Performance & modernização** _(detalhes: `MELHORIAS.md` §1.1, §4; `BLOG-SEO.md` §4.4)_

- ⬜ `OnPush` em todos os componentes (e avaliar zoneless) — §1.1
- ⬜ Migrar estado para signals/`AsyncPipe` — §1.2
- ⬜ Fontes WOFF2 + preload das críticas — §4.1
- ⬜ `preconnect` (Supabase, Google Maps, Web3Forms) — §4.2
- ⬜ `NgOptimizedImage` + alvo LCP < 2,0s / CLS < 0,1 — §3.8/§4.4
- ⬜ Índices `category_id` e `published_at` — G13

**S7 — Acessibilidade & UX** _(detalhes: `MELHORIAS.md` §3)_

- ⬜ `prefers-reduced-motion` (pulse/bounce/autoplay) — §3.2
- ⬜ Skip link para `<main>` — §3.3
- ⬜ Estados de foco visíveis (`focus-visible`) — §3.4
- ⬜ Contraste e tamanho de micro-textos — §3.5
- ⬜ Skeletons de carregamento — §3.11
- ⬜ `manifest.webmanifest` + apple-touch-icon — §2.5

**S8 — Testes & verificação final** _(opcional)_

- ⬜ Smoke tests: `SeoService`, `BlogService.formatDate` — `MELHORIAS.md` §1.8
- ⬜ Auditoria final: Lighthouse/CWV, Rich Results, sitemap, indexação

---

## 7. Checklists de validação por sessão

- **S1:** `curl -sL <url-artigo>` mostra canonical self + título/H1 do artigo + corpo; GSC "Testar URL ativa" indexável; Rich Results sem erro; recrawl Ahrefs com `Is indexable: true`.
- **S2:** build ok; enviar formulário cai em `/sucesso`; navegar de `/blog` para "Sobre" funciona; imagens com `lazy`; sem "Comartilhar".
- **S3:** `select` na view retorna `publishedAt`/`updatedAt` ISO e objeto `author`; RLS ativo na nova tabela (`get_advisors security`); capas servidas do Storage.
- **S4:** Rich Results Test valida `BlogPosting` com `author`, `datePublished`, `dateModified`; `LegalService` com telefone/geo/horário; cartões sociais corretos.
- **S5:** `/blog/categoria/familia` renderiza com SEO próprio; `FAQPage` válido; `/llms.txt` acessível e correto.
- **S6:** Lighthouse — LCP < 2,0s, INP < 200ms, CLS < 0,1; bundle sem `zone.js` (se zoneless); fontes WOFF2 no network.
- **S7:** navegação 100% por teclado; skip link visível ao focar; contraste AA; `prefers-reduced-motion` respeitado.

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
