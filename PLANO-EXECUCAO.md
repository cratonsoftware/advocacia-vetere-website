# PLANO-EXECUCAO.md — Runbook de Execução

> Guia operacional para executar, em sessões separadas e sem retrabalho, todas as correções e melhorias documentadas em [`MELHORIAS.md`](./MELHORIAS.md) e [`BLOG-SEO.md`](./BLOG-SEO.md).
> Este arquivo é a **fonte única de verdade do progresso** — sempre leia o §6 (Registro de progresso) antes de começar e atualize-o ao terminar.
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

| # | Sessão | Foco | Depende de | Modelo | Risco |
|---|---|---|---|---|---|
| **S1** | **P0 — Indexação do artigo** | Pré-renderizar `/blog/:slug` + deploy hook | — | **Opus** | Médio |
| **S2** | Quick wins de SEO/UX | Correções pequenas e seguras | — | Sonnet | Baixo |
| **S3** | Banco — fundação E-E-A-T | `authors`, view ISO/`updated_at`, capas no Storage | S1 | **Opus** | Médio-Alto |
| **S4** | Schema & SERP | meta dedicados, JSON-LD Article rico, Breadcrumb, LegalService | S3 | **Opus** | Médio |
| **S5** | Topical authority & GEO/AEO | tags, páginas de categoria, TL;DR/FAQ, `llms.txt` | S3 | Sonnet/Opus | Médio |
| **S6** | Performance & modernização | OnPush/zoneless, fontes WOFF2, preconnect, NgOptimizedImage, índices | — | Sonnet | Médio |
| **S7** | Acessibilidade & UX | reduced-motion, skip link, foco, contraste, skeletons, manifest | — | Sonnet | Baixo |
| **S8** *(opcional)* | Testes & verificação final | smoke tests + auditoria de fechamento | todas | Opus/Sonnet | Baixo |

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
- [ ] **`README.md` e `CLAUDE.md` atualizados** se algo mudou (stack, rotas, schema, comandos, padrões). *(Obrigatório por governança — ver `CLAUDE.md`.)*
- [ ] Documentos de referência atualizados se a decisão mudou (`ARCHITECTURE.md`, `BLOG-SEO.md`, `MELHORIAS.md`).
- [ ] **§6 Registro de progresso atualizado**: itens marcados ✅ com data e hash do commit/PR.
- [ ] Commit em **Conventional Commits** + push + **preview deploy verificado** na Vercel.

---

## 6. Registro de progresso (FONTE ÚNICA DE VERDADE)

> Legenda: ⬜ Pendente · 🔄 Em andamento · ✅ Concluído · ⏸️ Bloqueado
> Ao concluir um item, troque o status, preencha **Data** e **Commit/PR**, e adicione nota se necessário.

### 6.1 Status das sessões

| Sessão | Status | Data | Commit/PR | Notas |
|---|---|---|---|---|
| S1 — P0 Indexação | ⬜ | — | — | Prioridade máxima; fazer primeiro e sozinha |
| S2 — Quick wins | ⬜ | — | — | |
| S3 — Banco E-E-A-T | ⬜ | — | — | Migração aditiva (não destrutiva) |
| S4 — Schema & SERP | ⬜ | — | — | Depende de S3 |
| S5 — Topical & GEO | ⬜ | — | — | Depende de S3 |
| S6 — Performance | ⬜ | — | — | |
| S7 — Acessibilidade | ⬜ | — | — | |
| S8 — Testes (opc.) | ⬜ | — | — | |

### 6.2 Status por item (granular)

**S1 — P0 Indexação do artigo** *(detalhes: `BLOG-SEO.md` §10)*
- ⬜ `/blog/:slug` → `Prerender` com `getPrerenderParams()` lendo slugs do Supabase
- ⬜ Vercel Deploy Hook + webhook do Supabase (rebuild ao publicar) — *ou* garantir função SSR dinâmica (Opção B)
- ⬜ Validar: HTML cru com canonical self, title/H1 do artigo, conteúdo presente
- ⬜ Validar: GSC (Inspeção de URL) + Rich Results Test + recrawl Ahrefs

**S2 — Quick wins** *(detalhes: `MELHORIAS.md` §7)*
- ⬜ Data ISO no SEO (expor `published_at`/`updated_at`; separar `date` cru de `dateLabel`) — §1.4
- ⬜ Campo `redirect` no formulário → `/sucesso` — §3.6
- ⬜ Corrigir "Comartilhar" → "Compartilhar" — §3.10
- ⬜ Navegação por âncora com `routerLink` + `fragment` — §3.1
- ⬜ `loading="lazy"` nas imagens + prioridade no hero — §3.8
- ⬜ `title` no iframe do mapa — §3.9
- ⬜ Honeypot anti-spam no formulário — §3.7
- ⬜ Remover código morto do contato — §1.5

**S3 — Banco: fundação E-E-A-T** *(detalhes: `BLOG-SEO.md` §6 e §7)*
- ⬜ Tabela `authors` (+ RLS SELECT público) — G1
- ⬜ Colunas aditivas em `articles` + índices — G4/G6/G8/G9/G10/G11/G13
- ⬜ View `published_articles` expõe `publishedAt`/`updatedAt` (ISO), autor, novos campos — G2/G3
- ⬜ Migrar capas para Supabase Storage 1200×630 + `cover_image_alt` — G5/G9
- ⬜ Corrigir categoria "Familia" → "Família" — G12

**S4 — Schema & SERP** *(detalhes: `BLOG-SEO.md` §7; `MELHORIAS.md` §2)*
- ⬜ `meta_title`/`meta_description` dedicados no front — G4
- ⬜ JSON-LD Article rico (`dateModified`, `ImageObject`, `inLanguage`, `articleSection`, `keywords`, `mainEntityOfPage`, `author` Person)
- ⬜ `BreadcrumbList` nas páginas de artigo — §2.2
- ⬜ Enriquecer `LegalService` da home (telefone, geo, horário, `sameAs`) — §2.1
- ⬜ `og:locale` + `lastmod` de home/blog no sitemap — §2.3/§2.4

**S5 — Topical authority & GEO/AEO** *(detalhes: `BLOG-SEO.md` §4.3, §6, §7)*
- ⬜ `tags` por artigo + linkagem interna — G6
- ⬜ Páginas de categoria `/blog/categoria/:slug` (usar `category.slug`) — G7
- ⬜ `tldr` + `faq` por artigo → `FAQPage` — G8
- ⬜ `/llms.txt` dinâmico a partir da view — §4.5

**S6 — Performance & modernização** *(detalhes: `MELHORIAS.md` §1.1, §4; `BLOG-SEO.md` §4.4)*
- ⬜ `OnPush` em todos os componentes (e avaliar zoneless) — §1.1
- ⬜ Migrar estado para signals/`AsyncPipe` — §1.2
- ⬜ Fontes WOFF2 + preload das críticas — §4.1
- ⬜ `preconnect` (Supabase, Google Maps, Web3Forms) — §4.2
- ⬜ `NgOptimizedImage` + alvo LCP < 2,0s / CLS < 0,1 — §3.8/§4.4
- ⬜ Índices `category_id` e `published_at` — G13

**S7 — Acessibilidade & UX** *(detalhes: `MELHORIAS.md` §3)*
- ⬜ `prefers-reduced-motion` (pulse/bounce/autoplay) — §3.2
- ⬜ Skip link para `<main>` — §3.3
- ⬜ Estados de foco visíveis (`focus-visible`) — §3.4
- ⬜ Contraste e tamanho de micro-textos — §3.5
- ⬜ Skeletons de carregamento — §3.11
- ⬜ `manifest.webmanifest` + apple-touch-icon — §2.5

**S8 — Testes & verificação final** *(opcional)*
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
