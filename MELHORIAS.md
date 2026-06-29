# MELHORIAS.md — Advocacia Vetere

> Catálogo de melhorias possíveis para o site da Dra. Maria Fernanda Vetere. Elaborado pela CRATON Software a partir de uma leitura completa do código-fonte. **Nenhuma sugestão aqui altera o código** — este é um documento de planejamento. Cada item preserva a essência do projeto: elegância sóbria, SSR para SEO e o padrão técnico CRATON.

Última revisão: 2026-06-29 · Stack analisada: Angular 21 SSR · TailwindCSS 4 · Supabase · Vercel

> **Documentos correlatos (2026-06-29):** [`ANALISE-SEO-GEMINI-AHREFS.md`](./ANALISE-SEO-GEMINI-AHREFS.md) (análise consolidada Gemini × Ahrefs × estado real, com o plano priorizado) e [`MODELO-ARTIGO-BLOG.md`](./MODELO-ARTIGO-BLOG.md) (guia de autoria de artigos para a IA da Dra., mapeado ao Supabase).

---

## Como ler este documento

Cada item recebe duas etiquetas:

- **Impacto**: `Alto` · `Médio` · `Baixo` — quanto move o ponteiro (SEO, conversão, performance, manutenção).
- **Esforço**: `P` (pequeno, < 1h) · `M` (médio, algumas horas) · `G` (grande, > 1 dia).

Sugestão de ordem de ataque: priorizar **Alto impacto / esforço P–M** primeiro (a seção "Quick wins" no fim consolida esses).

---

## 0. Correção crítica (P0) — artigo não indexável, herdando o SEO da Home

> **Esta é a prioridade máxima do projeto.** Confirmada por crawl Ahrefs + requisição direta ao servidor em 2026-06-19.

**Sintoma:** a URL do artigo (`/blog/traicao-da-direito-a-indenizacao`) retorna HTTP 200, mas com `canonical` apontando para a **Home**, `Is indexable: false`, e title/H1/OG/conteúdo **idênticos aos da Home** (content hash duplicado). A resposta crua do servidor para essa URL é o HTML completo da Home.

**Causa raiz:** a rota `/blog/:slug` (`RenderMode.Server`) **não está sendo renderizada no servidor em produção** — a Vercel serve o `index.html` pré-renderizado da Home como _fallback_. O `ArtigoComponent`/`SeoService` nunca executam para essa URL, então ela herda todo o SEO e o conteúdo da Home e o Google não a indexa (canonical para outra página).

**Tratamento (resumo):**

- **Recomendado:** pré-renderizar os artigos — mudar `/blog/:slug` para `RenderMode.Prerender` com `getPrerenderParams()` lendo os slugs do Supabase no build; cada artigo vira HTML estático com SEO próprio. Acionar rebuild via **Vercel Deploy Hook + webhook do Supabase** ao publicar.
- **Alternativa (publicação instantânea):** garantir que a função SSR da Vercel realmente atenda `/blog/:slug` (revisar deploy/`vercel.json`/variáveis de ambiente), em vez de cair no fallback estático.
- **Reforço:** usar _route resolver_ para definir o SEO antes do render; garantir canonical self quando houver slug.

**Diagnóstico completo, evidências, código e passos de validação:** [`BLOG-SEO.md`](./BLOG-SEO.md) §10.

> Sem isso, as demais melhorias de SEO de artigo (§7/§2) não têm efeito — a página precisa primeiro **existir com SEO próprio e ser indexável**.

> **✅ P0 confirmado resolvido (auditoria Ahrefs de 2026-06-29).** O Site Audit reportou **Health Score 100/100, 0 erros**, com as **5 páginas HTML indexáveis e canonical self-referente** (Home, `/blog`, o artigo, `/blog/categoria/familia`, `/autor/maria-fernanda-vetere`). A correção da S1 + o guard de build da S11 (§1.10) estão funcionando em produção. Detalhes da auditoria em [`BLOG-SEO.md`](./BLOG-SEO.md) §11 e em [`ANALISE-SEO-GEMINI-AHREFS.md`](./ANALISE-SEO-GEMINI-AHREFS.md).

---

## 0.1 Auditoria Ahrefs (2026-06-29) — higiene on-page e plano priorizado

> Origem: Site Audit do Ahrefs (`app.ahrefs.com/site-audit`) de 2026-06-29, cruzado com o relatório estratégico do Gemini. **Conclusão central:** a base técnica está exemplar (Health 100, 0 erros, P0 resolvido); o gargalo real é **falta de conteúdo** (1 artigo, tráfego orgânico 0) e **presença local/off-site**, não engenharia. Análise completa e triagem do que faz/não faz sentido em [`ANALISE-SEO-GEMINI-AHREFS.md`](./ANALISE-SEO-GEMINI-AHREFS.md).

Itens acionáveis novos (nenhum é erro; todos warnings/notices de baixo esforço):

- **0.1.a — H1 duplicado em 1 página — Impacto Médio · Esforço P — ✅ corrigido no banco (2026-06-29; aguarda rebuild).** Causa confirmada: o `content` do artigo "Traição" começava com um `#` (no `ngx-markdown`, `#` → `<h1>`), gerando um segundo H1 além do `title`. **Correção aplicada (Supabase):** `#` rebaixado para `##` (e espaçamentos duplos normalizados), **sem alterar uma única palavra** — validado por comparação que ignora marcação/espaços (`texto_identico_ignorando_marcacao = true`); `updated_at` atualizado. Prevenido para os próximos artigos pela regra do [`MODELO-ARTIGO-BLOG.md`](./MODELO-ARTIGO-BLOG.md) ("começar em `##`"). **Pendente:** rebuild/deploy (a página é pré-renderizada) + recrawl Ahrefs para zerar a issue.
- **0.1.b — Erro de validação de dados estruturados (rich results) em 4 páginas — Impacto Médio · Esforço P — 🔧 corrigido no código (aguarda build/deploy).** **Causa confirmada** via Rich Results Test (2026-06-29): o `publisher` do `BlogPosting` (e o `worksFor` do `Person` no autor) era um `LegalService` "tronco" (só `name`/`logo`); o Google o detecta como Local Business e acusa 4 _non-critical issues_ — `Missing field "telephone"/"priceRange"/"address"/"image"`. A home passa limpa por ter o `LegalService` completo (por isso só 4 das 5 páginas). **Correção aplicada:** helper `legalServiceEntity()` no `SeoService` que devolve o `LegalService` completo (com `telephone`, `priceRange`, `address`, `image` e `@id` compartilhado `…/#legalservice`), usado como `publisher` (artigo/blog/categoria) e `worksFor` (autor); `@id` também adicionado ao `LegalService` da home (consolidação de entidade). Spec adicionado em `seo.service.spec.ts`. **Pendente:** `npm run build` + deploy + recrawl Ahrefs para confirmar 0 issues.
- **0.1.c — Meta description longa (3 páginas) — Impacto Baixo · Esforço P.** Encurtar para 120–160 caracteres (no `meta_description`/`excerpt` dos artigos e/ou na config das páginas).
- **0.1.d — Title longo (2 páginas) — Impacto Baixo · Esforço P.** O sufixo automático `| Dra. Maria Fernanda Vetere` infla títulos já longos (ex.: `/blog`, artigo) acima de ~60 caracteres. Encurtar títulos-base, usar `meta_title` curtos (≤60) nos artigos e/ou rever a aplicação do sufixo em artigo/listagem.
- **0.1.e — Redirect chain (1) — Impacto Baixo · Esforço P.** Achatar para salto único (`http://` → `https://www` diretamente).

**Plano priorizado (síntese — detalhe na análise consolidada):**

1. **P0 — Conteúdo:** produzir artigos com o `MODELO-ARTIGO-BLOG.md` (pilares Divórcio, Alimentos/Guarda, Sucessões; cadência quinzenal; linkagem interna). É o que destrava o resto.
2. **P1 — Higiene técnica:** itens 0.1.a–0.1.e (sessão curta).
3. **P2 — Conversão/prova social:** widget flutuante de WhatsApp + CTAs contextuais (§5; S17); schema `Review`/`aggregateRating` a partir de `google_reviews` (§2.1, validando política e ética OAB).
4. **P3 — Off-site (não-código):** Google Business Profile + NAP consistente; e-mail próprio `@adv.br`.
5. **Reavaliar com dados:** landing pages por serviço ("silos") e trilha de tráfego pago (cautela ética) — prematuros sem tração de blog.

---

## 1. Arquitetura e Código

### 1.1 Adotar `OnPush` (e avaliar zoneless) — Impacto Médio · Esforço M

O `CLAUDE.md` define `OnPush` e signals como padrão, mas **nenhum componente usa `ChangeDetectionStrategy.OnPush`** hoje, e a app roda com `provideZoneChangeDetection`. Em um site majoritariamente estático e pré-renderizado, `OnPush` em todos os componentes é seguro e reduz ciclos de verificação. O Angular 21 também suporta `provideZonelessChangeDetection()`, que dispensa o `zone.js` do bundle — ganho real de tamanho inicial. Recomenda-se: (1) `OnPush` em todos os componentes como primeiro passo; (2) avaliar zoneless em uma branch de teste, validando o autoplay das avaliações e o `MatIcon`.

### 1.2 Migrar estado de componente para signals / `AsyncPipe` — Impacto Médio · Esforço M

Os componentes hoje fazem `subscribe()` manual e gravam em propriedades de classe (`allArticles`, `latestArticles`, `article`, etc.). Isso conflita com a diretriz de signals do `CLAUDE.md` e exige gestão manual de assinatura. Caminhos recomendados, em ordem de modernidade:

- `toSignal()` sobre os observables dos serviços, ou
- `AsyncPipe` no template (desliga a assinatura automaticamente), ou
- a nova **`resource()` / `rxResource()` API** para os fetches do blog/artigo.

Benefício colateral: combina perfeitamente com `OnPush`.

### 1.3 Ordenação dos artigos — ✅ já resolvido na view _(correção)_

**Apontamento revisado após leitura do banco.** As queries não têm `order`, mas a **view `published_articles` já ordena por `published_at DESC`** (e filtra publicados com `published_at <= now()`). Portanto `getLatestArticles(3)` retorna de fato os mais recentes — **não há bug aqui**. Mantido apenas como registro. Detalhes em [`BLOG-SEO.md`](./BLOG-SEO.md) §1.4.

### 1.4 Preservar a data ISO para o SEO — Impacto Alto · Esforço P · _(bug de SEO)_

`BlogService.formatDate()` **sobrescreve** `article.date` com a string formatada em pt-BR (ex.: `"19 de Junho de 2026"`). Em seguida, `ArtigoComponent` passa esse mesmo valor como `publishedDate` para o `SeoService`, que o injeta em `article:published_time` e no `datePublished` do JSON-LD. Esses campos exigem **ISO 8601** (`2026-06-19`). Hoje os robôs recebem uma data inválida. Recomenda-se manter dois campos no modelo: `date` (ISO, cru) e `dateLabel` (formatado para exibição).

### 1.5 Remover código morto no formulário de contato — Impacto Baixo · Esforço P

`ContatoComponent` tem `formatarTelefone()` e `enviarMensagem()` que **não são chamados** — o formulário envia direto para o Web3Forms via `action`/`method="POST"` e a máscara é feita pelo `ngx-mask`. Remover os dois métodos elimina confusão e a dependência implícita de `alert()`/`console.log`.

### 1.6 Centralizar constantes e configuração — Impacto Médio · Esforço M — ✅ S13 (2026-06-23)

> **Aplicado na S13:** criado `src/app/core/config/site.config.ts` como fonte única — `SITE_URL`, `BUSINESS` (telefone/e-mail/endereço/geo/horário/`sameAs`/`priceRange`), `WHATSAPP_PHONE`/`WHATSAPP_MESSAGE`/`WHATSAPP_URL` e `ALL_CATEGORIES_LABEL` (`'Todos'`). Consumido por `SeoService`, páginas (`artigo`/`categoria`/`autor`/`blog`), `AppComponent` e `ContatoComponent`. As Serverless Functions (`api/sitemap.ts`, `api/llms.ts`) e o `src/robots.txt` — fora do bundle Angular — mantêm a URL base com **duplicação consciente e documentada** (comentário apontando a fonte canônica).

Havia valores espalhados que deveriam viver em um único `app.constants.ts` / `site.config.ts`:

- A **URL base** `https://www.mfernandavetere.adv.br` aparecia em `SeoService`, em `api/sitemap.ts` e no `robots.txt`.
- O **link de WhatsApp** (com a mesma mensagem pré-preenchida) estava duplicado em `app.component.html` e `contato.component.html`.
- A categoria mágica `'Todos'`, telefone, e-mail, endereço e horário apareciam hardcoded em vários templates.

Centralizar reduz risco de divergência (ex.: mudar o telefone em um lugar e esquecer outro).

### 1.7 Segurança da chave Supabase — Impacto Alto · Esforço P (verificação)

A `supabaseKey` é injetada no bundle do cliente (`set-env.cjs` → `environment.ts`) e enviada nos headers via `HttpClient`. Isso é aceitável **apenas se for a chave anon e o RLS estiver ativo** com políticas somente-leitura nas tabelas `published_articles`, `categories` e `google_reviews`. Ação: confirmar no painel Supabase que (a) RLS está ON nessas tabelas, (b) existem policies `SELECT` públicas e nenhuma policy de escrita anônima. Documentar isso no `ARCHITECTURE.md` (já incluído).

### 1.8 Cobertura de testes — Impacto Médio · Esforço G — ✅ S8 (2026-06-21) + S14 (2026-06-24)

> **Aplicado na S8:** criados os primeiros specs — `seo.service.spec.ts` (montagem de tags + JSON-LD por tipo: BlogPosting/LegalService/Blog/CollectionPage/ProfilePage, canonical override, breadcrumb/faq) e `blog.service.spec.ts` (`formatDate`: ISO 8601, fallback, rótulo pt-BR, normalização de `\n`, null). Hook `pretest` adicionado para gerar `environment.ts`/ícones antes de `ng test`.
>
> **Aplicado na S14 (2026-06-24, completa o item):** render tests das rotas pré-renderizadas — `home`/`blog`/`artigo`/`categoria`/`autor` `.component.spec.ts` — verificando o `<h1>` renderizado, a canonical self e os blocos JSON-LD por tipo, com fetches do Supabase mockados (`HttpTestingController`) e `slug` via `ActivatedRoute` stub. Utilitários/mocks compartilhados em `src/app/testing/seo-dom.helper.ts`.

O Karma está configurado, mas **não havia um único `.spec.ts`**. Sem precisar buscar 100%, valeria um conjunto mínimo de testes de fumaça: `SeoService` (montagem de tags e JSON-LD por tipo), `BlogService.formatDate` (após corrigir 1.4) e renderização SSR das rotas pré-renderizadas. Protege exatamente as partes mais sensíveis (SEO).

### 1.9 Fixar a versão do Node — Impacto Baixo · Esforço P

Não há `engines` no `package.json` nem `.nvmrc`. Para builds reproduzíveis (local e Vercel), fixar a major do Node usada. Evita "funciona na minha máquina".

### 1.10 Falhar o build quando o pré-render de artigos vier vazio — Impacto Alto · Esforço P · _(robustez de SEO)_

**Origem: auditoria da S8 (2026-06-21).** Hoje, em falha de rede/Supabase durante o build, `getPublishedArticleSlugs()` (e `getCategorySlugs`/`getAuthorSlugs`) em `app.routes.server.ts` engole o erro e retorna `[]` para **não quebrar o deploy**. O efeito colateral é perigoso: se a lista vier vazia, **nenhum artigo é pré-renderizado** e cada URL de artigo cai no fallback estático da Home (canonical → home, não indexável) — exatamente o P0 da S1, que **voltou a acontecer em produção** e só foi detectado pela auditoria manual, não pelo build.

Proposta: transformar a falha silenciosa em **falha barulhenta** apenas em produção. No `getPrerenderParams` dos artigos, se o ambiente for de produção (ex.: `process.env['VERCEL_ENV'] === 'production'`) **e** a lista de slugs vier vazia enquanto se espera ≥1 artigo publicado, **lançar erro e abortar o build** — assim um deploy nunca sobe com os artigos quebrados sem ninguém perceber. Em preview/local, manter o fallback `[]` tolerante (não travar o fluxo de desenvolvimento). Complementos opcionais: logar a contagem de slugs pré-renderizados no build e/ou um _smoke check_ pós-deploy (curl do canonical de um artigo) no pipeline.

> Mantém a robustez (preview/local não quebram) e fecha o buraco que deixou o artigo não indexável em produção entre a S1 e a S8.

---

## 2. SEO (oportunidade local mais relevante)

> O projeto já é forte em SEO (SSR + prerender, meta tags por rota, JSON-LD, sitemap dinâmico, canonical). As melhorias abaixo elevam principalmente o **SEO local** — decisivo para uma advogada com escritório físico em Tambaú/SP.

### 2.1 Enriquecer o JSON-LD `LegalService` — Impacto Alto · Esforço M — ✅ S4 (2026-06-19)

> **Aplicado na S4:** adicionados `telephone`, `email`, `address` completo (`streetAddress`/`postalCode`), `geo`, `openingHoursSpecification` (Seg–Sex 09:00–12:00 / 13:00–17:00), `sameAs` (Instagram/Facebook/TikTok), `priceRange` e `logo`. **`aggregateRating` ficou de fora** (depende da política do Google para exibir nota agregada) — reavaliar em sessão futura.

O schema atual de `LegalService` traz nome, endereço (cidade/UF) e `areaServed`, mas **omite sinais fortes de negócio local**. Adicionar:

- `telephone`, `email`
- `address` completo (`streetAddress`, `postalCode`)
- `geo` (latitude/longitude — já conhecidas pelo embed do mapa)
- `openingHoursSpecification` (Seg–Sex 09:00–12:00 / 13:00–17:00)
- `sameAs` com os perfis sociais (Instagram, Facebook, TikTok)
- `priceRange` e `image`/`logo` consistentes
- `aggregateRating` derivado das avaliações (se a política do Google permitir exibir)

Isso melhora o rich result e a ficha de conhecimento local.

### 2.2 `BreadcrumbList` nos artigos — Impacto Médio · Esforço P — ✅ S4 (2026-06-19)

> **Aplicado na S4:** bloco JSON-LD `BreadcrumbList` (Início › Blog › Artigo) injetado em toda página de artigo, em bloco separado do `BlogPosting` (atributo `data-seo="breadcrumb"`).

O checklist do `CLAUDE.md` cita `BreadcrumbList`, mas ele **não é injetado**. Adicionar breadcrumb (Início › Blog › Artigo) no JSON-LD da página de artigo ajuda o Google a montar a trilha de navegação no resultado de busca.

### 2.3 `og:locale` e Twitter handles — Impacto Baixo · Esforço P — ✅ S4 (2026-06-19, parcial)

> **Aplicado na S4:** `og:locale=pt_BR` e `og:image:alt` adicionados no `SeoService`. `twitter:site`/`twitter:creator` **não** foram adicionados — não há perfil X/Twitter da marca (reavaliar se um perfil for criado).

Faltam `og:locale` (`pt_BR`) e, se houver perfil, `twitter:site` / `twitter:creator`. Pequenos, mas completam o cartão social.

### 2.4 `lastmod` no sitemap para home e blog — Impacto Baixo · Esforço P — ✅ S4 (2026-06-19)

> **Aplicado na S4:** `/` e `/blog` passaram a emitir `<lastmod>` = data de modificação mais recente entre os artigos (`updatedAt`). Os artigos passaram a usar `updatedAt` (antes usavam `date`/publicação).

`api/sitemap.ts` só emite `lastmod` nos artigos. Home e `/blog` poderiam ter `lastmod` (ex.: data do artigo mais recente) para sinalizar frescor.

### 2.5 Manifest / ícones / PWA leve — Impacto Baixo · Esforço M

Não há `manifest.webmanifest` nem `apple-touch-icon`. Um manifest mínimo melhora a apresentação ao salvar na tela inicial e é um sinal de qualidade. Não precisa virar PWA completo.

---

## 3. Design, UX e Acessibilidade

### 3.1 Corrigir navegação entre páginas (âncoras) — Impacto Alto · Esforço M · _(bug de UX)_

Header, menu mobile e footer usam `href="#sobre"`, `href="#areas"`, `href="#contato"`, etc. Esses âncoras **só funcionam na home**. A partir de `/blog` ou de um artigo, clicar em "Sobre Mim" não leva a lugar nenhum (ou só adiciona `#` à URL do blog). O logo e "Início" usam `href="#"`. Recomenda-se trocar para `routerLink="/"` com `fragment="sobre"` (e `routerLink="/"` no logo), garantindo navegação correta de qualquer rota.

### 3.2 Respeitar `prefers-reduced-motion` — Impacto Médio · Esforço P

Há animações contínuas: `animate-pulse` permanente no botão flutuante de WhatsApp, `animate-bounce` na seta do hero e o **autoplay do carrossel** de avaliações. Para usuários com sensibilidade a movimento (e por boa prática WCAG), envolver essas animações em `@media (prefers-reduced-motion: reduce)` e pausar o autoplay quando a preferência estiver ativa.

### 3.3 Link "pular para o conteúdo" — Impacto Médio · Esforço P

Não existe skip link. Para navegação por teclado/leitor de tela, adicionar um link visualmente oculto (visível ao focar) que pule direto para `<main>`.

### 3.4 Estados de foco visíveis — Impacto Médio · Esforço P

Os inputs usam `focus:outline-none` substituindo o outline por `focus:border-n4` (ok). Já os **botões** (filtros do blog, paginação, setas do carrossel, CTAs) dependem do outline padrão. Definir um `focus-visible` consistente (anel discreto na cor da marca) melhora acessibilidade sem poluir o visual.

### 3.5 Contraste e tamanho dos micro-textos — Impacto Médio · Esforço M

O design usa muitos rótulos em `text-[9px]`/`text-[10px]` com `tracking` largo e, frequentemente, cor com opacidade reduzida (`text-n4/60`, `text-n3/60`). O texto base `n3` (#7a6a64) sobre `n0`/`n1` fica em ~4.9:1 (passa AA para texto normal, no limite), mas **as variações com opacidade em 9–10px tendem a falhar no AA**. Recomenda-se: validar com auditoria de contraste e subir o piso desses rótulos para ~11–12px ou reduzir a transparência. Preserva a estética, melhora a legibilidade.

### 3.6 Fluxo do formulário de contato — Impacto Alto · Esforço P

A página `/sucesso` existe e está bem feita, mas o **formulário não a referencia**. O Web3Forms só redireciona se houver um campo `redirect`. Hoje, ao enviar, o usuário cai na página padrão do Web3Forms em vez da `/sucesso` da marca. Adicionar `<input type="hidden" name="redirect" value="https://www.mfernandavetere.adv.br/sucesso">`. (Também explica por que `/sucesso` tem `noIndex` — está correto.)

### 3.7 Anti-spam no formulário — Impacto Médio · Esforço P

Sem honeypot/captcha, o endpoint público de e-mail está exposto a spam. O Web3Forms suporta honeypot (`botcheck`) e hCaptcha — adicionar ao menos o honeypot, que é invisível ao usuário.

### 3.8 `loading="lazy"` e LCP das imagens — Impacto Médio · Esforço P

Só o iframe do mapa tem `loading="lazy"`. As imagens dos cards de blog, da capa do artigo e da seção "Sobre" não têm. Já a imagem do **hero** (`8742.jpg`) é provavelmente o LCP e deveria ser priorizada (preload / `fetchpriority="high"`), enquanto as demais ficam `lazy`. Avaliar `NgOptimizedImage` para responsividade automática (`srcset`) e reserva de espaço (evita CLS).

### 3.9 `title` no iframe do mapa — Impacto Baixo · Esforço P

O `<iframe>` do Google Maps não tem atributo `title`, exigido por acessibilidade para descrever o conteúdo embutido. Adicionar `title="Mapa de localização do escritório em Tambaú/SP"`.

### 3.10 Corrigir o texto "Comartilhar" — Impacto Baixo · Esforço P · _(typo)_

Em `artigo.component.html`, o rótulo de compartilhamento está escrito **"Comartilhar"** (falta o "p" → "Compartilhar"). Pequeno, mas visível em todas as páginas de artigo.

### 3.11 Estados de carregamento (skeletons) — Impacto Baixo · Esforço M

`BlogPreviewComponent` define `isLoading` mas **não o usa no template**. O blog usa só texto "Carregando…". Skeletons leves (placeholders com a forma dos cards) deixam a experiência mais polida e reduzem a sensação de layout shift durante o fetch SSR/hidratação.

### 3.12 "Ver mais" nas avaliações longas — Impacto Baixo · Esforço P

As avaliações usam `line-clamp-6`, cortando textos longos sem opção de expandir. Um "ler mais" (ou tooltip) preserva o conteúdo sem quebrar o layout.

---

## 4. Performance

### 4.1 Fontes em WOFF2 + preload das críticas — Impacto Médio · Esforço M

As fontes são carregadas via `@font-face` em **TTF/OTF**, que são bem mais pesadas que WOFF2. Converter para WOFF2 (e subsetar para os glifos pt-BR usados) reduz bytes significativamente. Além disso, dar `preload` na(s) fonte(s) acima da dobra (Antic Didone do hero, Inter do corpo) evita FOIT/FOUT. Manter `font-display: swap` (já presente).

### 4.2 `preconnect` para origens externas — Impacto Baixo · Esforço P

Adicionar `<link rel="preconnect">` para o domínio do Supabase, `www.google.com` (mapa) e `api.web3forms.com` reduz o custo de handshake na primeira interação.

### 4.3 Cache das avaliações — Impacto Baixo · Esforço P

As avaliações mudam raramente. Como já vêm de uma tabela Supabase sincronizada periodicamente, vale confirmar que o `Cache-Control`/transfer cache evita refetch desnecessário na hidratação (o `withHttpTransferCacheOptions` já cobre o SSR→cliente; documentado no `ARCHITECTURE.md`).

---

## 5. Conteúdo e Conversão (sem perder a sobriedade)

Estas são sugestões opcionais, alinhadas ao tom jurídico:

- **Prova de credibilidade**: OAB já aparece no rodapé; considerar um selo discreto também próximo ao CTA do hero.
- **FAQ jurídico** (com schema `FAQPage`): responde dúvidas comuns (divórcio, inventário, pensão) e captura buscas de cauda longa — forte para SEO e para qualificar o lead antes do contato.
- **CTA de WhatsApp com contexto por seção**: hoje a mensagem pré-preenchida é genérica e idêntica em dois lugares; poderia variar levemente conforme a origem (ex.: a partir da seção de Família). Manter a sobriedade.

---

## 6. Documentação e Processo

- **README** estava no boilerplate do Angular CLI — **já reescrito** nesta entrega.
- **CLAUDE.md** continha imprecisões (ngx-mask ausente da stack; Web3Forms não citado; seção "Google Cloud" descrevia uma integração de mapa que não foi executada) — **já corrigido** nesta entrega.
- **ARCHITECTURE.md** — **criado** nesta entrega, com o fluxo real de dados (incl. sincronização de avaliações Supabase ↔ Google Cloud).
- Sugestão futura: um `CONTRIBUTING.md` curto com convenção de commits (o histórico já segue Conventional Commits) e o passo obrigatório `npm run build` antes do merge.

---

## 7. Quick wins (faça primeiro)

Ordenados por retorno imediato, todos de baixo esforço e baixo risco:

1. **Data ISO no SEO** (expor `published_at`/`updated_at` na view; separar `date` cru de `dateLabel`) — §1.4 e [`BLOG-SEO.md`](./BLOG-SEO.md)
2. **Campo `redirect` no formulário** → leva à `/sucesso` da marca — §3.6
3. **Corrigir "Comartilhar" → "Compartilhar"** — §3.10
4. **Navegação âncora com `routerLink`+`fragment`** — §3.1
5. **`loading="lazy"` nas imagens + prioridade no hero** — §3.8
6. **`title` no iframe do mapa** — §3.9
7. **Honeypot anti-spam no formulário** — §3.7
8. **Enriquecer JSON-LD `LegalService` (telefone, geo, horário, sameAs)** — §2.1
9. **Remover código morto do contato** — §1.5

---

## 8. O que NÃO mudar (essência a preservar)

Para que qualquer melhoria respeite a identidade do projeto:

- **SSR com prerender** das rotas estáticas e `Server` para `/blog/:slug` — base do SEO. Não converter para CSR.
- **Acesso ao Supabase via `HttpClient`** (não via SDK no cliente) — necessário para o SSR enxergar as requisições e renderizar com dados.
- **`withHttpTransferCacheOptions({ includeRequestsWithAuthHeaders: true })`** — obrigatório por causa do header `apikey`.
- **Paleta, tipografia e estética sóbria** — Antic Didone + Inter + Poppins, tons terrosos `n0–n4`, sem gradientes chamativos.
- **Os hooks `pre*`** do `package.json` (`generate-icons`, `set-env`) — removê-los quebra ícones e variáveis em produção.
