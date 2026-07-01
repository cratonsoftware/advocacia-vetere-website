# Modelo de Artigo — Blog Vetere (guia de autoria para IA)

> **Para quem é este documento:** a IA assistente da Dra. Maria Fernanda Vetere, responsável por redigir os artigos do blog. Ela **não tem acesso ao Supabase nem à documentação técnica do projeto** — por isso, tudo o que é preciso saber para produzir um artigo perfeito está **aqui dentro**, de forma autocontida.
>
> **O que você (IA) deve produzir:** um arquivo `.md` preenchido **exatamente** no formato da seção [§8 — Formato de retorno](#8-formato-de-retorno-o-que-você-deve-me-entregar). Esse arquivo será usado por um humano (Luiz) para cadastrar o artigo no banco de dados (Supabase). Não invente campos, não omita campos obrigatórios, não mude os nomes dos campos.
>
> **Princípio nº 1 (regra de ouro do projeto):** _só existe na página o que está num campo estruturado._ Cada campo abaixo alimenta um lugar específico da página e/ou dos dados de SEO. Preencher bem cada campo é o que faz o artigo ranquear e converter.

---

## Índice

1. [Como o artigo vira página (mapa rápido)](#1-como-o-artigo-vira-página-mapa-rápido)
2. [Campos de identificação e publicação](#2-campos-de-identificação-e-publicação)
3. [Campos de SEO / aparência no Google](#3-campos-de-seo--aparência-no-google)
4. [Capa do artigo](#4-capa-do-artigo)
5. [Corpo do artigo (`content`) e Markdown suportado](#5-corpo-do-artigo-content-e-markdown-suportado)
6. [Campos de autoridade e busca por IA (TL;DR, FAQ, tags)](#6-campos-de-autoridade-e-busca-por-ia-tldr-faq-tags)
7. [Regras de ouro (ética OAB, slug, datas, não duplicar)](#7-regras-de-ouro)
8. [Formato de retorno (o que você deve me entregar)](#8-formato-de-retorno-o-que-você-deve-me-entregar)
9. [Checklist final antes de entregar](#9-checklist-final-antes-de-entregar)

---

## 1. Como o artigo vira página (mapa rápido)

Cada artigo gera uma página em `https://www.mfernandavetere.adv.br/blog/<slug>`. A tabela abaixo mostra, em resumo, para onde vai cada campo. Os detalhes vêm nas seções seguintes.

| Campo               | Obrigatório? | Onde aparece na página                        | Onde aparece no SEO / Google                               |
| ------------------- | ------------ | --------------------------------------------- | ---------------------------------------------------------- |
| `title`             | **Sim**      | Título principal grande (H1)                  | `<title>` e título azul no Google (se `meta_title` vazio)  |
| `slug`              | **Sim**      | Define a URL (`/blog/<slug>`)                 | A própria URL indexada                                     |
| `excerpt`           | **Sim**      | Resumo no card da listagem `/blog`            | Descrição do Google (se `meta_description` vazio)          |
| `content`           | **Sim**      | Corpo do texto (Markdown renderizado)         | Todo o conteúdo lido pelo Google e pelas IAs               |
| `category`          | **Sim**      | Etiqueta (badge) clicável acima do título     | `articleSection` no schema + página de categoria           |
| `author`            | **Sim**      | Assinatura no rodapé do artigo                | Autor (E-E-A-T) no schema — sinal crítico para Direito     |
| `cover_image`       | Recomendado  | Imagem grande de capa (foto limpa, WebP)      | Imagem indexada pelo Google/Discover + schema (foto limpa) |
| `cover_image_alt`   | Recomendado  | Texto alternativo da capa (leitores de tela)  | SEO de imagem + acessibilidade                             |
| `social_image`      | Opcional     | — (só no compartilhamento)                    | Imagem COM template (Canva, `.webp`) no card das redes     |
| `meta_title`        | Opcional     | — (não aparece no corpo)                      | Título azul no Google (sobrepõe `title`)                   |
| `meta_description`  | Opcional     | — (não aparece no corpo)                      | Descrição no Google (sobrepõe `excerpt`)                   |
| `tldr`              | Recomendado  | Caixa "Resposta direta" no topo do artigo     | Resposta extraível por IA (ChatGPT/Gemini/AI Overviews)    |
| `faq`               | Recomendado  | Seção "Perguntas frequentes" (sanfona) no fim | Rich snippet `FAQPage` no Google                           |
| `tags`              | Recomendado  | Chips "Temas:" no fim do artigo               | `keywords` no schema + autoridade temática                 |
| `read_time_minutes` | Opcional     | "X min de leitura" no topo                    | —                                                          |
| `published_at`      | **Sim**      | Data exibida no topo                          | `datePublished` (data de publicação)                       |
| `locale`            | Opcional     | —                                             | `inLanguage` (padrão `pt-BR`)                              |
| `canonical_url`     | Opcional     | —                                             | URL canônica (deixe vazio em 99% dos casos)                |
| `noindex`           | Opcional     | —                                             | Esconde do Google (deixe `false`)                          |

> **Importante:** os campos `category` e `author` no banco são ligações (chaves) para outras tabelas. Você **não precisa saber códigos internos** — basta informar o **nome** (ex.: categoria `Família`, autora `Dra. Maria Fernanda Vetere`). O Luiz faz a ligação no banco.

---

## 2. Campos de identificação e publicação

### `title` — Título do artigo · **OBRIGATÓRIO**

- **O que é:** o título principal do artigo.
- **Onde aparece:** é o **H1** grande no topo da página (fonte serifada elegante). Também vira o `<title>` da aba do navegador e o título azul clicável no Google **quando `meta_title` estiver vazio**, e é o `headline` nos dados estruturados.
- **Como escrever:** claro, específico e atrativo. Prefira a **dúvida real do cliente**, não jargão institucional. **Importante (atualizado em 2026-06-29):** em páginas de artigo o sistema **não** acrescenta mais o sufixo `| Dra. Maria Fernanda Vetere` ao `<title>` — o que você escreve em `title`/`meta_title` é exatamente o `<title>` que vai ao ar (o sufixo de 31 caracteres estourava o limite de ~60 do Google). De qualquer forma, **não** inclua o nome da Dra. no campo.
- **Tamanho ideal:** **50 a 70 caracteres** para o H1. Se o `title` passar de **60**, preencha um `meta_title` curto (≤60) para o `<title>`/Google — ver abaixo. O `headline` do schema deve ficar abaixo de ~110.
- **Exemplo bom:** `Pensão de alimentos: como é calculada e quem tem direito`
- **Exemplo ruim:** `Reflexões sobre a advocacia artesanal no Direito de Família` (abstrato, ninguém pesquisa isso)

### `slug` — Endereço da página · **OBRIGATÓRIO**

- **O que é:** o trecho final da URL: `/blog/<slug>`.
- **Onde aparece:** na URL indexada pelo Google e no link de compartilhamento. **Também é o nome do arquivo da imagem de capa** (convenção do projeto: `<slug>.png`).
- **Regras (siga à risca):**
    - tudo **minúsculo**, **sem acentos** e **sem caracteres especiais** (ç → c, ã → a);
    - palavras separadas por **hífen** (`-`), nunca espaço ou underline;
    - curto, descritivo e contendo a palavra-chave principal;
    - **único** (não pode repetir um slug já existente);
    - **uma vez publicado, não mude o slug** (quebra a URL e o ranqueamento). Em caso de erro, avise para tratar redirecionamento.
- **Exemplo:** título "Pensão de alimentos: como é calculada e quem tem direito" → slug `pensao-de-alimentos-como-e-calculada`

### `category` — Categoria · **OBRIGATÓRIO**

- **O que é:** o tema macro do artigo (ex.: `Família`, `Sucessões`, `Cível`, `Trabalhista`).
- **Onde aparece:** etiqueta (badge) clicável acima do título; agrupa o artigo na página de categoria (`/blog/categoria/<slug-da-categoria>`); define os artigos "Leia também" (mesma categoria); e vira o `articleSection` no schema.
- **Como informar:** escreva o **nome** da categoria, **com acento e maiúscula** (ex.: `Família`). Se for um tema novo que talvez ainda não exista no banco, **sinalize** ("categoria nova: Sucessões") para o Luiz criá-la.

### `author` — Autoria · **OBRIGATÓRIO**

- **O que é:** quem assina o artigo. Hoje há uma única autora: **Dra. Maria Fernanda Vetere**.
- **Onde aparece:** assinatura no rodapé do artigo (com link para o perfil `/autor/...`) e, sobretudo, como entidade **`Person`** nos dados estruturados — com nome, cargo e número da **OAB**. Esse é o **sinal nº 1 de confiança (E-E-A-T)** para conteúdo jurídico aos olhos do Google.
- **Como informar:** `Dra. Maria Fernanda Vetere` (padrão). Não invente outro autor.

### `read_time_minutes` — Tempo de leitura · Opcional (padrão: 3)

- **O que é:** estimativa em minutos. Vira o texto "X min de leitura" no topo.
- **Como estimar:** ~200–230 palavras por minuto. Um artigo de ~1.200 palavras ≈ 5–6 min.

### `published_at` — Data de publicação · **OBRIGATÓRIO**

- **O que é:** data/hora de publicação.
- **Onde aparece:** data exibida no topo (formato "29 de Junho de 2026") e `datePublished` no SEO.
- **Formato:** informe a data no padrão **`AAAA-MM-DD`** (ex.: `2026-06-29`). Se for uma data futura, o artigo só aparece quando essa data chegar (publicação agendada).

### `locale` — Idioma · Opcional (padrão: `pt-BR`)

- Deixe `pt-BR`. Só mude se o artigo for escrito em outro idioma.

> **Quem liga o "publicar" é o Luiz.** O campo técnico `is_published` (ligar/desligar) e a data de última edição (`updated_at`) são controlados no banco — você não precisa informá-los.

---

## 3. Campos de SEO / aparência no Google

Estes campos controlam **como o artigo aparece na busca**. Capricho aqui = mais cliques.

### `excerpt` — Resumo · **OBRIGATÓRIO**

- **O que é:** um resumo curto do artigo.
- **Onde aparece:** no **card da listagem** em `/blog`. **Além disso**, é usado como **descrição no Google e nas redes sociais** sempre que `meta_description` estiver vazio.
- **Tamanho ideal:** **120 a 160 caracteres** (para funcionar bem como descrição de busca).
- **Como escrever:** uma frase que resume a resposta + desperta curiosidade. Evite cortar no meio.

### `meta_title` — Título no Google · Opcional (substitui `title` na busca)

- **O que é:** versão do título otimizada **para o resultado de busca** (pode diferir do H1).
- **Onde aparece:** apenas no `<title>`/Google/redes — **não** aparece no corpo da página.
- **Quando usar:** quando o `title` (H1) ficou longo ou pouco "vendedor" para a SERP. Se deixar vazio, o Google usa o `title`. **Sempre preencha quando o `title` passar de 60 caracteres.**
- **Tamanho ideal:** **50 a 60 caracteres** — e este é o limite **real**, pois o sistema não anexa mais o sufixo do nome em artigos: o `meta_title` é exatamente o `<title>` que vai ao ar. Acima de 60 o Google corta. Coloque a palavra-chave no começo.
- **Exemplo:** `Pensão de Alimentos: Cálculo e Quem Tem Direito (2026)`

### `meta_description` — Descrição no Google · Opcional (substitui `excerpt` na busca)

- **O que é:** o textinho cinza abaixo do título no Google.
- **Onde aparece:** descrição em Google, Open Graph e Twitter — **não** aparece no corpo.
- **Quando usar:** quando quiser uma chamada diferente do `excerpt`, com **verbo de ação** e intenção clara.
- **Tamanho ideal:** **120 a 160 caracteres**.
- **Exemplo:** `Entenda como o juiz calcula a pensão de alimentos, quem pode pedir e o que fazer em caso de não pagamento. Tire suas dúvidas com a Dra. Maria Fernanda.`

---

## 4. Capa do artigo

### `cover_image` — Imagem de capa · Recomendado

- **O que é:** a **foto limpa** (só a foto, sem texto e sem logo) exibida no topo do artigo e indexada pelo Google/Discover.
- **Onde aparece:** capa no artigo, card da listagem e `BlogPosting.image` no schema. **Atenção (2026-07-01):** esta **não** é a imagem de compartilhamento nas redes — para isso existe o campo separado **`social_image`** (imagem com template). A capa fica limpa porque o Google Discover pede imagem **sem texto sobreposto e sem logo**.
- **Especificação técnica (quem sobe a imagem é o Luiz):**
    - formato **WebP** (CloudConvert: Fit = Crop, Strip = Yes, Quality = 80);
    - dimensão **1200 × 630 px** (1600 × 840 opcional para nitidez retina);
    - nome do arquivo = **`<slug>.webp`** (mesma convenção do slug);
    - **sem selo, sem texto** — apenas a foto;
    - armazenada no Storage do projeto.
- **O que você (IA) faz:** como você não sobe imagens, **descreva a capa ideal** em uma linha (tema, estilo sóbrio e profissional, sem texto sobreposto) e **sempre forneça o `cover_image_alt`**.

### `cover_image_alt` — Texto alternativo da capa · Recomendado

- **O que é:** descrição textual da imagem (para leitores de tela e SEO de imagem).
- **Como escrever:** descreva objetivamente o que a imagem mostra, de forma relacionada ao tema. 1 frase.
- **Exemplo:** `Aliança de casamento sobre documentos de divórcio em uma mesa de escritório.`

### `social_image` — Imagem de compartilhamento (com template) · Opcional

- **O que é:** o **link** da imagem **com o template** (painel marrom + logo + headline, feita no Canva) que aparece quando o artigo é compartilhado nas redes (LinkedIn/Facebook/WhatsApp/X). **Não** aparece no site — é exclusiva do `og:image`.
- **Formato:** `.webp` (ou `.jpg`), **1200 × 630 px**, enviada ao Storage; cole aqui a URL pública.
- **Se deixar vazio:** o compartilhamento cai automaticamente na `cover_image` (a foto limpa) — funciona, só não terá o template.
- **Divisão de papéis:** `cover_image` = **foto limpa** (site + Google/Discover); `social_image` = **foto com template** (só redes).

---

## 5. Corpo do artigo (`content`) e Markdown suportado

### `content` — Corpo do texto · **OBRIGATÓRIO**

- **O que é:** o texto completo do artigo, escrito em **Markdown**.
- **Como é renderizado:** o site converte o Markdown em HTML com tipografia jurídica elegante (títulos em fonte serifada, parágrafos espaçados, links em destaque, citações estilizadas). Você escreve Markdown puro; o estilo é aplicado automaticamente.

#### Regras estruturais do corpo (importante)

1. **NÃO repita o título (H1) dentro do `content`.** O H1 já é o campo `title`. **Comece os subtítulos do corpo em H2 (`##`)** e desça para H3 (`###`) nas subdivisões.
2. **NÃO escreva a seção de "Perguntas frequentes" dentro do `content`.** As FAQs vão no campo `faq` (a página monta a seção sozinha). Duplicar gera conteúdo repetido.
3. **NÃO repita o texto do `tldr`** literalmente no primeiro parágrafo — o TL;DR já aparece numa caixa própria no topo.
4. **Comece com uma resposta direta** à dúvida do título (1–2 parágrafos), depois aprofunde. Isso é o que as IAs de busca extraem e citam.
5. Cite **leis e jurisprudência** quando couber (ex.: "art. 1.694 do Código Civil", "STJ"). Densidade técnica = autoridade.
6. Use **links internos** para outras páginas do site quando fizer sentido (ex.: apontar para a página de contato ou para outro artigo). Veja a sintaxe de links abaixo.

#### Referência completa de Markdown suportado

Tudo abaixo é renderizado corretamente. Os exemplos estão em blocos de código para você ver a sintaxe crua.

**Títulos / seções** (use a partir do H2):

```markdown
## Título de seção (H2)

### Subtítulo (H3)

#### Detalhe (H4)
```

> Dica de SEO/IA: escreva alguns subtítulos **em forma de pergunta** (ex.: `## Quem pode pedir pensão de alimentos?`). Isso casa com a forma como as pessoas pesquisam.

**Ênfase:**

```markdown
Texto **em negrito** para termos-chave, _em itálico_ para nuance, e **_negrito itálico_** se necessário.
```

**Parágrafos e quebras:** separe parágrafos com **uma linha em branco**. Não use quebras manuais no meio da frase.

**Listas com marcadores** (deixe uma linha em branco antes da lista):

```markdown
Documentos necessários:

- Certidão de casamento
- Comprovantes de renda
- Documentos dos filhos
```

**Listas numeradas:**

```markdown
1. Reúna os documentos
2. Protocole o pedido
3. Acompanhe o processo
```

**Citações em destaque** (renderizadas como bloco serifado em itálico — ótimas para citar a lei):

```markdown
> "Os alimentos devem ser fixados na proporção das necessidades do reclamante e dos recursos da pessoa obrigada." — art. 1.694, §1º, Código Civil
```

**Links** (o texto do link fica em destaque):

```markdown
Texto com [link para a página de contato](https://www.mfernandavetere.adv.br/#contato). Ou para outro artigo: [veja nosso guia sobre guarda compartilhada](https://www.mfernandavetere.adv.br/blog/guarda-compartilhada).
```

**Tabelas** (úteis para comparações, ex.: divórcio amigável × litigioso):

```markdown
| Critério | Divórcio amigável | Divórcio litigioso |
| -------- | ----------------- | ------------------ |
| Prazo    | Rápido            | Mais longo         |
| Custo    | Menor             | Maior              |
| Acordo   | Sim               | Não há consenso    |
```

**Linha divisória:**

```markdown
---
```

**Código/termos literais** (raro em conteúdo jurídico, mas suportado): use crase `` `assim` ``.

#### O que **evitar** no `content`

- Não inserir **imagens** no meio do corpo (o fluxo de imagem do projeto é a capa). Se precisar de uma imagem específica no texto, sinalize ao Luiz em vez de embutir URL externa.
- Não usar **HTML cru** (`<div>`, `<span>`, scripts) — escreva Markdown.
- Não colar tabelas gigantes ou blocos sem espaço em branco antes — quebram a formatação.
- Não usar H1 (`#`) — começa em H2.

---

## 6. Campos de autoridade e busca por IA (TL;DR, FAQ, tags)

São os campos que mais ajudam a aparecer em **AI Overviews do Google** e a ser **citado por ChatGPT/Gemini**.

### `tldr` — Resposta direta · Recomendado

- **O que é:** um resumo-resposta de 1 a 3 frases que responde **imediatamente** a dúvida do título.
- **Onde aparece:** numa **caixa destacada "Resposta direta"** logo no topo do artigo (antes do corpo).
- **Por que importa:** é o trecho que motores generativos tendem a extrair e citar.
- **Tamanho ideal:** **40 a 60 palavras**, texto corrido (sem Markdown, sem listas).
- **Regra:** não repita essa frase igualzinha no primeiro parágrafo do `content`.
- **Exemplo:** `Sim, a pensão de alimentos pode ser pedida por filhos, ex-cônjuge e até pais idosos. O valor é calculado pelo binômio necessidade de quem recebe e possibilidade de quem paga — não existe percentual fixo em lei, embora 30% da renda seja uma referência comum na prática.`

### `faq` — Perguntas frequentes · Recomendado

- **O que é:** uma lista de pares **pergunta + resposta**.
- **Onde aparece:** seção **"Perguntas frequentes"** em formato sanfona (clicável) no fim do artigo, **e** gera o rich snippet **`FAQPage`** no Google (aquelas perguntas expansíveis no resultado de busca).
- **Quantidade ideal:** **3 a 6** perguntas reais que sobram na cabeça do leitor.
- **Regras importantes:**
    - a **resposta é exibida como texto simples** — **não use Markdown** nas respostas (sem `**negrito**`, sem links, sem listas; apenas texto corrido);
    - cada resposta deve ser **autossuficiente** (1 a 3 frases) e direta;
    - **não duplique** essas perguntas dentro do `content`.
- **Formato de entrega:** veja o bloco JSON na [§8](#8-formato-de-retorno-o-que-você-deve-me-entregar).

### `tags` — Temas · Recomendado

- **O que é:** palavras-chave/temas do artigo.
- **Onde aparece:** chips "Temas:" no fim do artigo + `keywords` nos dados estruturados.
- **Quantidade ideal:** **3 a 8** tags, em minúsculas, específicas.
- **Exemplo:** `pensão de alimentos`, `direito de família`, `guarda de filhos`, `cálculo de pensão`

---

## 7. Regras de ouro

São restrições do projeto e da profissão. **Violar qualquer uma destas invalida o artigo.**

1. **Ética OAB (Provimento 205/2021 e Código de Ética).** É publicidade informativa, **não** mercantil:
    - **Nunca** chame a Dra. de "**especialista**", "a melhor", "número 1" ou similar (ela é **Advogada**, não possui título de especialista certificado — anunciar isso é infração). O rótulo correto é **"Advogada"** ou **"Advogada Familiarista"**.
    - **Não** prometa resultados ("ganho garantido", "divórcio em X dias", "indenização certa").
    - **Não** mencione valores de honorários nem ofereça "promoções".
    - Tom **informativo, sóbrio e acolhedor** — informa e orienta, não capta de forma sensacionalista.
2. **Conteúdo correto e atualizado.** É conteúdo jurídico (YMYL — "sua vida/seu dinheiro"): cite a legislação correta e vigente; se uma lei mudou, reflita a versão atual. Quando citar prazos, artigos ou entendimentos do STJ/STF, garanta a precisão.
3. **Não duplicar.** FAQ vai só no campo `faq`; TL;DR vai só no campo `tldr`; o H1 vai só no `title`. Nada disso se repete dentro do `content`.
4. **Slug imutável após publicado.** Escolha um bom slug de primeira.
5. **Datas em formato `AAAA-MM-DD`.**
6. **Português brasileiro** em todo o conteúdo voltado ao leitor.
7. **Original.** Não copie texto de outros sites/escritórios; produza conteúdo autoral.

---

## 8. Formato de retorno (o que você deve me entregar)

Entregue **um único arquivo `.md`** com **exatamente** a estrutura abaixo. Preencha todos os campos obrigatórios; nos opcionais, escreva `(vazio)` se não usar. Mantenha os nomes dos campos como estão.

````markdown
# FICHA DO ARTIGO — para cadastro no Supabase

## title

Pensão de alimentos: como é calculada e quem tem direito

## slug

pensao-de-alimentos-como-e-calculada

## category

Família

## author

Dra. Maria Fernanda Vetere

## published_at

2026-06-29

## read_time_minutes

6

## locale

pt-BR

## meta_title

Pensão de Alimentos: Cálculo e Quem Tem Direito (2026)

## meta_description

Entenda como o juiz calcula a pensão de alimentos, quem pode pedir e o que fazer em caso de não pagamento. Orientação clara da Dra. Maria Fernanda Vetere.

## excerpt

Quem tem direito à pensão de alimentos e como o valor é definido na prática? Veja o que diz a lei, o binômio necessidade-possibilidade e os caminhos quando há inadimplência.

## cover_image_alt

Aliança de casamento sobre documentos jurídicos em uma mesa de escritório.

## cover_image (sugestão de imagem — quem sobe é o operador)

Foto sóbria e profissional de documentos/contrato e uma caneta sobre mesa de madeira, tom neutro, **sem texto e sem selo**. Arquivo: pensao-de-alimentos-como-e-calculada.webp (1200x630, WebP).

## social_image (opcional — URL da imagem COM template; vazio = usa a cover_image)

(vazio)

## tldr

Sim, a pensão de alimentos pode ser pedida por filhos, ex-cônjuge e até pais idosos. O valor é calculado pelo binômio necessidade de quem recebe e possibilidade de quem paga — não existe percentual fixo em lei, embora 30% da renda seja uma referência comum na prática.

## tags

pensão de alimentos, direito de família, guarda de filhos, cálculo de pensão, inadimplência alimentar

## content

## O que é a pensão de alimentos

Texto em Markdown começando em H2... (corpo completo aqui, seguindo a §5).

## Quem tem direito a pedir

...

## Como o valor é calculado

...

## faq (JSON — colar direto no campo `faq` do Supabase)

```json
[
	{ "q": "A pensão de alimentos é sempre 30% do salário?", "a": "Não. Não há percentual fixo em lei. O juiz fixa o valor conforme a necessidade de quem recebe e a possibilidade de quem paga; 30% é apenas uma referência comum na prática." },
	{ "q": "Filho maior de 18 anos tem direito a pensão?", "a": "Pode ter, especialmente se ainda estuda. O dever não cessa automaticamente aos 18 anos; é preciso ação para exonerar a obrigação." },
	{ "q": "O que fazer quando a pensão não é paga?", "a": "É possível executar a dívida, com risco de penhora de bens e até prisão civil do devedor nos casos previstos em lei." }
]
```

## canonical_url

(vazio)

## noindex

false
````

> **Notas sobre o formato de retorno:**
>
> - `tags`: entregue **separadas por vírgula** (o operador converte para o formato do banco).
> - `faq`: entregue como **JSON válido** (lista de objetos com `q` e `a`), pois o campo é JSON no banco. Lembre: as respostas (`a`) são **texto simples**, sem Markdown.
> - `content`: cole o Markdown completo do corpo (começando em `##`).
> - `category` e `author`: por **nome** — o operador faz a ligação interna.
> - `cover_image`: você descreve a **foto limpa** (sem texto/selo); o operador cria/sobe `(<slug>.webp)` em 1200×630.
> - `social_image`: opcional; URL da imagem **com template** (Canva) para as redes. Se vazio, o compartilhamento usa a `cover_image`. Quem produz/sobe é o operador.

---

## 9. Checklist final antes de entregar

- [ ] `title` claro, com a dúvida real do leitor, 50–70 caracteres, **sem** o sufixo do nome.
- [ ] `slug` minúsculo, sem acentos, com hífens, único e descritivo.
- [ ] `excerpt` entre 120–160 caracteres.
- [ ] `meta_title` (se usado) ≤ 60 caracteres; `meta_description` 120–160.
- [ ] `content` começa em **H2**, com **resposta direta** no início e densidade jurídica (leis citadas).
- [ ] **Sem** repetir FAQ, TL;DR ou H1 dentro do `content`.
- [ ] `tldr` de 40–60 palavras, texto corrido.
- [ ] `faq` com 3–6 pares, respostas em **texto simples** (sem Markdown), em JSON válido.
- [ ] `tags` de 3 a 8, específicas.
- [ ] `cover_image_alt` preenchido + descrição da capa sugerida.
- [ ] Conformidade **OAB**: nada de "especialista", promessa de resultado ou honorários.
- [ ] Conteúdo **original**, correto e atualizado.
- [ ] Arquivo entregue **exatamente** no formato da §8.

---

_Documento mantido pela CRATON Software para o projeto Advocacia Vetere. Reflete a estrutura real do banco e da renderização do site em junho de 2026. Em caso de dúvida sobre um campo, escreva o que faz mais sentido e sinalize a dúvida na entrega._
