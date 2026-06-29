# Análise SEO consolidada — Gemini × Ahrefs × estado real do projeto

> **Data:** 2026-06-29 · Mantido pela CRATON Software. Cruza três fontes: (1) o relatório estratégico do Gemini, (2) o Site Audit do Ahrefs de 29/06/2026 (`app.ahrefs.com/site-audit`) e (3) o estado real do código/banco documentado em `BLOG-SEO.md`, `MELHORIAS.md`, `PLANO-EXECUCAO.md` e no próprio repositório.
>
> **Objetivo:** separar, com base em evidência, o que **já está feito**, o que **faz sentido implementar** e o que **não faz sentido** (ou é prematuro). Não altera código nem banco — é diagnóstico e priorização.

---

## 1. Resumo executivo

A fundação técnica do site está **excelente** e contradiz boa parte dos alarmes do relatório do Gemini — que não teve acesso ao código nem ao histórico de execução (S1–S15) e fotografou um estado antigo.

O Ahrefs confirma objetivamente: **Health Score 100/100, 0 erros**, todas as 5 páginas HTML **indexáveis e com canonical self-referente**. O problema crítico que o próprio Gemini descreveu (o artigo herdando o SEO da Home) **já está resolvido e validado** — o artigo agora indexa com título, canonical e schema próprios.

O verdadeiro gargalo **não é técnico**. É:

1. **Falta de conteúdo** — há **1 artigo publicado**. Sem volume, não há o que ranquear (tráfego orgânico = 0).
2. **Presença local/off-site** — Google Business Profile, consistência NAP, e-mail próprio `@adv.br`.
3. **Higiene fina on-page** — 7 tipos de aviso menores do Ahrefs (nenhum é erro), todos de baixo esforço.

Ou seja: a casa está construída e sólida; falta **mobiliar de conteúdo** e **colocar a placa na rua**.

---

## 2. O que o Ahrefs encontrou (interpretado)

**Panorama:** 9 URLs internas rastreadas · 5 páginas HTML · 4 redirects · **0 quebradas** · Health **100**. As 5 páginas HTML indexáveis são exatamente as esperadas, todas `200`, indexáveis e self-canonical: Home, `/blog`, `/blog/traicao-da-direito-a-indenizacao`, `/blog/categoria/familia`, `/autor/maria-fernanda-vetere`.

> **Confirmação do P0:** "Canonical tag distribution: Self-referencing 5" + "Indexable 5". A correção da S1/S8/S11 (pré-renderização por slug + guard de build) está funcionando em produção. **Não há regressão.**

As issues abertas são **9 warnings + 8 notices, 0 errors**. Tradução e prioridade:

| Issue (Ahrefs)                                | Qtd | O que é                                                          | Gravidade | Onde tratar                                |
| --------------------------------------------- | --- | ---------------------------------------------------------------- | --------- | ------------------------------------------ |
| **Structured data — rich results validation** | 4   | Google aponta problema/recomendação em algum schema de 4 páginas | **Média** | Investigar via Rich Results Test (§2.1)    |
| **Multiple H1 tags**                          | 1   | Uma página tem mais de um `<h1>`                                 | **Média** | Conteúdo do artigo no Supabase (§2.2)      |
| **Meta description too long**                 | 3   | 3 páginas com meta description acima de ~160 caracteres          | Baixa     | Encurtar (Supabase e/ou config de páginas) |
| **Title too long**                            | 2   | 2 páginas com `<title>` acima de ~60 caracteres                  | Baixa     | Encurtar título / rever sufixo (§2.3)      |
| **3XX redirect**                              | 4   | Redirects apex→www e http→https — esperados                      | Nenhuma   | Nenhuma ação (saudável)                    |
| **HTTP to HTTPS redirect**                    | 2   | Idem — força HTTPS                                               | Nenhuma   | Nenhuma ação (saudável)                    |
| **Redirect chain**                            | 1   | Uma URL redireciona em 2 saltos em vez de 1                      | Baixa     | Achatar para salto único (§2.4)            |

### 2.1 Structured data — rich results validation error (4 páginas)

Esse é o item técnico mais relevante. Revisei o `SeoService` e os schemas emitidos (`BlogPosting`, `BreadcrumbList`, `FAQPage`, `CollectionPage`, `ProfilePage`/`Person`, `LegalService`) — estão **bem formados**. Logo, o mais provável é uma das hipóteses abaixo, e a única forma de cravar é olhar a mensagem exata do Google:

- um **campo recomendado** ausente que o Google sinaliza (ex.: algo do `Article`/`LocalBusiness`);
- a **política do `FAQPage`** (desde 2023 o Google só exibe FAQ rica para sites de governo/saúde — pode reportar como inelegível/aviso);
- formatação de um campo específico (ex.: `priceRange`, `openingHoursSpecification`).

**Ação:** rodar cada uma das 4 URLs no **Rich Results Test** (`search.google.com/test/rich-results`) e no **Schema Markup Validator** (`validator.schema.org`) e copiar a mensagem exata. Com isso, corrijo o `SeoService` cirurgicamente. Não vale "consertar no escuro".

### 2.2 Multiple H1 tags (1 página) — provável causa e por que importa

Cada template de página do projeto tem **um único `<h1>` estático**. O único lugar onde um segundo H1 pode surgir dinamicamente é o **Markdown do campo `content`**: no `ngx-markdown`, uma linha iniciada por `#` vira `<h1>`. Como o Ahrefs aponta exatamente **1 página**, a causa quase certa é que o **artigo "Traição" tem um `#` no corpo**, gerando um segundo H1 (o primeiro é o `title`).

**Ação:** no Supabase, editar o `content` do artigo e rebaixar qualquer `#` para `##`/`###`. **Isso valida diretamente uma regra do `MODELO-ARTIGO-BLOG.md`** ("não repita o H1 no `content`; comece em `##`") — a regra já previne esse erro nos próximos artigos. Confirmar a URL exata no detalhe da issue do Ahrefs.

### 2.3 Title too long (2 páginas) — efeito do sufixo automático

O `SeoService` anexa `| Dra. Maria Fernanda Vetere` a quase todo título. Em páginas cujo título-base já é longo, o resultado estoura ~60 caracteres. Exemplos prováveis:

- `/blog`: base "Blog Vetere | Análises e Orientações Jurídicas" + sufixo → ~73 caracteres.
- artigo "Traição...": ~62 + sufixo (~30) → ~92 caracteres.

**Ação (escolher uma):** (a) encurtar os títulos-base; (b) usar `meta_title` curtos nos artigos (o template já recomenda ≤60); ou (c) reavaliar se o sufixo deve ser aplicado em páginas de artigo/listagem. É cosmético (o Google trunca, não penaliza), mas afeta o CTR. Recomendo (b)+(a).

### 2.4 Redirect chain (1)

Uma URL faz 2 saltos (provável `http://apex → https://apex → https://www`). **Ação:** ajustar a regra de redirecionamento para ir de `http://` (apex ou www) **direto** para `https://www` em um único salto. Ganho marginal de crawl/PageRank; baixa prioridade.

---

## 3. Recomendações do Gemini — triagem (feito / fazer / não fazer)

### 3.1 Já implementado (o Gemini não sabia)

| Recomendação do Gemini                                    | Status no projeto                                                             |
| --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Artigo deve ter SEO próprio e ser indexável (o "P0")      | ✅ Resolvido (S1) e blindado por guard de build (S11); confirmado pelo Ahrefs |
| `LegalService` com endereço/telefone/horário/geo/`sameAs` | ✅ Home emite `LegalService` completo (S4)                                    |
| Schema de autor credenciado (E-E-A-T) com OAB             | ✅ Tabela `authors`, `Person` com OAB, página `/autor/:slug` (S3/S8)          |
| `BreadcrumbList`, `FAQPage`, resposta direta (TL;DR)      | ✅ Todos implementados (S4/S5)                                                |
| Páginas/hubs de categoria                                 | ✅ `/blog/categoria/:slug` pré-renderizada (S5)                               |
| Otimização para motores de IA (GEO/AEO), `llms.txt`       | ✅ `tldr`/FAQ + `/llms.txt` dinâmico (S5)                                     |
| Capa social própria 1200×630 (fim do hotlink istockphoto) | ✅ Storage `article-covers` (S3)                                              |
| `meta_title`/`meta_description` dedicados                 | ✅ Colunas + consumo no front (S3/S4)                                         |

Conclusão: a maior parte da "auditoria técnica" do Gemini está **desatualizada**. A base já é exemplar.

### 3.2 Faz sentido — entra no roadmap

1. **Volume de conteúdo / autoridade tópica (prioridade máxima).** É o gargalo real. Os 3 pilares do Gemini (Divórcio/Dissolução, Alimentos/Guarda, Planejamento Sucessório) são um excelente plano editorial. O `MODELO-ARTIGO-BLOG.md` foi criado exatamente para destravar a produção com qualidade e SEO corretos.
2. **Schema de avaliações (`Review`/`aggregateRating`).** O projeto já tem a tabela `google_reviews`; falta emitir o JSON-LD a partir dela para gerar estrelas no resultado de busca. Baixo esforço, alto impacto visual. _(Atenção: validar contra a política do Google de self-serving reviews — ver §4.)_
3. **Widget flutuante de WhatsApp.** A infra (`WHATSAPP_URL` em `site.config.ts`) já existe; faltam o widget persistente e os CTAs contextuais (já previstos para a S17). Forte alavanca de conversão (CRO).
4. **Google Business Profile + NAP consistente (off-site).** Maior impacto **local** em Tambaú — vence o "SEO programático" das bancas de fora justamente porque a Dra. tem endereço real no município. Não é código.
5. **E-mail próprio `@adv.br`.** Credibilidade e entregabilidade. Não é código.
6. **Higiene on-page do Ahrefs (§2).** H1 duplicado, títulos/descrições longos, redirect chain.

### 3.3 Não faz sentido agora (ou exige cautela)

- **Landing pages por serviço com URLs tipo `/divorcio-litigioso` ("silos").** Conceito válido, mas é uma reestruturação grande de arquitetura. **Prematuro** sem volume de blog e sem dados de demanda. O ganho de "anti-diluição de palavra-chave" que o Gemini cita se obtém, por ora, com **artigos verticalizados** — que já temos como produzir. Reavaliar quando o blog tiver tração.
- **Tráfego pago (Google Ads / Meta Ads), Pixel/remarketing, Lookalike.** Fora do escopo do site e do nosso trabalho de engenharia/SEO orgânico. É decisão de marketing/investimento e exige **cautela ética (OAB, Provimento 205/2021)** sobre captação. Pode entrar depois, como trilha separada.
- **Integrar avaliações "via API em tempo real" (como o Gemini sugere).** Contraria uma **decisão arquitetural correta** do projeto: as reviews são sincronizadas Google→Supabase em batch para **não expor a chave** no cliente e **poupar quota**. O caminho certo é emitir o schema de review **sobre o dado que já está no Supabase** — não chamar a API no runtime.
- **Reciclagem em vídeo / Reels / carrosséis / Stories.** Ótima estratégia de marca, mas é produção de conteúdo social, **não** mexe no site. Fora do escopo técnico; fica como recomendação para a operação.

---

## 4. Ressalva ética (OAB) — vale para tudo

Várias sugestões do Gemini tangenciam **captação e publicidade**. O projeto já segue (e deve manter) o Provimento 205/2021 e o Código de Ética: **nada de "especialista", promessas de resultado, honorários ou sensacionalismo**. Isso vale para artigos, CTAs, redes e qualquer schema (ex.: reviews não podem ser "self-serving" no sentido vedado). Essa regra está registrada no `MODELO-ARTIGO-BLOG.md` e no `CLAUDE.md` (S9).

---

## 5. Plano priorizado (síntese)

**P0 — Conteúdo (destrava tudo o mais)** Produzir artigos com o `MODELO-ARTIGO-BLOG.md`, seguindo os 3 pilares (Divórcio, Alimentos/Guarda, Sucessões), cadência quinzenal, com linkagem interna para contato e entre artigos.

**P1 — Higiene técnica rápida (1 sessão curta)** Corrigir o H1 duplicado do artigo (§2.2); rodar Rich Results Test nas 4 URLs e corrigir o schema (§2.1); encurtar títulos/descrições longos (§2.3); achatar o redirect chain (§2.4).

**P2 — Conversão e prova social** Widget flutuante de WhatsApp + CTAs contextuais (S17); schema `Review`/`aggregateRating` a partir de `google_reviews` (validar política e ética).

**P3 — Off-site (operação, não código)** Google Business Profile + NAP idêntico em todos os diretórios; migração de e-mail para `@adv.br`.

**Depois (reavaliar com dados)** Landing pages por serviço; trilha de tráfego pago (com cautela ética). Só com tração de blog e demanda comprovada.

---

## 6. Governança do `MODELO-ARTIGO-BLOG.md` (obrigatório)

Qualquer mudança no projeto que afete os campos, formatos, limites ou a renderização dos artigos (ex.: novo campo no banco, mudança no `SeoService`, no template do artigo, no fluxo de capa, nas regras de slug/FAQ) **deve ser refletida imediatamente no `MODELO-ARTIGO-BLOG.md`**. Esse documento é a **única ponte** da IA da Dra. (que não tem acesso ao banco nem à documentação) com a estrutura real. Documento desatualizado = artigos cadastrados errados.

---

_Próximo passo sugerido: rodar o Rich Results Test nas 4 URLs e me enviar as mensagens — fecho a correção do schema (§2.1). Em paralelo, posso integrar este plano como seção do `MELHORIAS.md`/`BLOG-SEO.md` se desejar._
