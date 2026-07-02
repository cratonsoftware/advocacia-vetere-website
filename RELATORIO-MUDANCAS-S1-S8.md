# Relatório de Mudanças — Site Advocacia Vetere

### Consolidação das sessões S1 a S8

> Documento executivo preparado pela **CRATON Software** sobre a evolução do site da Dra. Maria Fernanda Vetere (`mfernandavetere.adv.br`). Resume, em linguagem acessível, tudo o que foi implementado entre 19 e 22 de junho de 2026, com o impacto de cada entrega.
>
> Base: `PLANO-EXECUCAO.md` (registro oficial de progresso) confrontado com o código em produção. Período: **2026-06-19 a 2026-06-22**. Status geral: **8 de 8 sessões concluídas.**

---

## Visão geral

O trabalho foi organizado em **8 sessões fechadas**, cada uma com escopo, validação e entrega próprios — uma disciplina que evitou retrabalho e manteve o site sempre estável entre as etapas. O fio condutor de quase tudo foi **SEO de alto nível para um site jurídico**, somado a ganhos de performance, acessibilidade e qualidade técnica.

O ponto de partida tinha um problema grave: **o único artigo do blog não estava sendo indexado pelo Google** — ele aparecia para os buscadores como se fosse uma cópia da página inicial. Esse era o "paciente zero". A partir dele, o projeto evoluiu até um blog jurídico com fundamentos de autoridade (E-E-A-T), dados estruturados ricos, páginas de categoria e de autor, performance moderna e acessibilidade.

| Sessão | Tema                               | Resultado para o negócio                            |
| ------ | ---------------------------------- | --------------------------------------------------- |
| **S1** | Indexação do artigo                | Artigos passaram a ser encontráveis no Google       |
| **S2** | Ajustes rápidos                    | Correções de UX, formulário e navegação             |
| **S3** | Fundação de autoria (banco)        | Base de dados pronta para sinais de confiança       |
| **S4** | Dados estruturados e busca local   | Aparência rica nos resultados de busca              |
| **S5** | Autoridade temática e busca por IA | Conteúdo preparado para ChatGPT, Gemini etc.        |
| **S6** | Performance                        | Site mais rápido e leve                             |
| **S7** | Acessibilidade                     | Navegável por todos, inclusive por teclado/leitores |
| **S8** | Testes e página de autor           | Qualidade verificada + perfil da advogada no ar     |

---

## S1 — Indexação do artigo _(o problema mais crítico)_

**Data:** 2026-06-19 · **O que era o problema:** a página de cada artigo retornava, para o Google, o conteúdo da página inicial — com endereço "canônico" apontando para a home. Resultado: o artigo era tratado como duplicata e **não entrava no índice de busca**.

**O que foi feito:** cada artigo passou a ser gerado como uma página estática própria no momento da publicação (técnica de "pré-renderização"), com seu próprio título, endereço e conteúdo. Também foi desenhado o mecanismo de **reconstrução automática** ao publicar/editar um artigo no painel (sem deploy manual).

**Benefício:** os artigos do blog agora **podem ser encontrados no Google** com identidade própria — pré-condição para qualquer outra melhoria de SEO fazer efeito.

---

## S2 — Ajustes rápidos de SEO e experiência

**Data:** 2026-06-19 · Conjunto de sete correções pequenas e seguras:

- **Datas em formato técnico correto** para os buscadores (antes iam num formato que os robôs não entendiam).
- **Navegação entre páginas corrigida:** os links do menu, rodapé e topo (Sobre, Áreas, Contato) agora funcionam de qualquer página — antes só funcionavam na home.
- **Correção do texto "Comartilhar" → "Compartilhar".**
- **Imagens com carregamento otimizado** e prioridade para a imagem principal.
- **Proteção anti-spam** invisível no formulário de contato.
- **Acessibilidade do mapa** (descrição para leitores de tela).
- **Limpeza de código morto** no formulário.

**Benefício:** experiência mais coesa e profissional, formulário mais protegido e pequenos sinais de qualidade somados.

---

## S3 — Fundação de autoria e confiança _(banco de dados)_

**Data:** 2026-06-19 · Esta sessão preparou a **base de dados** para os sinais que o Google mais valoriza em sites jurídicos (a chamada confiança/E-E-A-T).

- Criação da **entidade de autor** (Dra. Maria Fernanda, com OAB/SP 527.527, biografia e redes sociais).
- Novos campos por artigo: título e descrição dedicados para busca, texto alternativo de imagem, **tags**, resumo (TL;DR), perguntas frequentes, idioma e controles de indexação.
- A capa do artigo deixou de ser uma **imagem externa de banco de imagens** (risco de licença e lentidão) e passou a ser hospedada e controlada pelo próprio projeto, no tamanho ideal para redes sociais (1200×630).
- Correção de dado: categoria "Familia" → **"Família"**.

**Benefício:** com a base pronta, o conteúdo jurídico passa a poder ser **assinado por uma advogada credenciada e verificável** — o sinal de confiança nº 1 para o Google em temas sensíveis como Direito. Tudo feito de forma aditiva, sem quebrar o que já existia.

---

## S4 — Dados estruturados e busca local

**Data:** 2026-06-19 · Tradução dos novos dados em **marcações que o Google lê** para montar resultados ricos:

- Cada artigo passou a expor dados completos: autor credenciado, data de publicação **e de atualização**, imagem, seção, idioma e palavras-chave.
- Adição da **trilha de navegação** ("Início › Blog › Artigo") nos resultados de busca.
- A página inicial ganhou um perfil de **negócio local completo**: telefone, e-mail, endereço, coordenadas, **horário de atendimento**, redes sociais e faixa de preço.
- Melhorias nos **cartões de compartilhamento** (quando o link é postado em redes sociais).

**Benefício:** maior chance de aparecer com **destaque visual** nos resultados e na ficha do Google (Maps/Busca) — decisivo para quem procura uma advogada na região de Tambaú/SP.

---

## S5 — Autoridade temática e busca por IA (GEO/AEO)

**Data:** 2026-06-20 · Preparação do conteúdo para o novo cenário de busca, em que **ChatGPT, Gemini, Perplexity e similares** respondem diretamente aos usuários:

- **Tags** e **links internos** entre artigos relacionados ("Leia também").
- Novas **páginas de categoria** (ex.: `/blog/categoria/familia`), que funcionam como vitrines temáticas.
- **Resumo direto (TL;DR)** no topo e seção de **Perguntas Frequentes** em cada artigo — formato que os mecanismos de IA preferem citar.
- Criação do **`/llms.txt`**, um índice do site voltado especificamente para os robôs de IA.

**Benefício:** o conteúdo fica mais "citável" pelos assistentes de IA e mais organizado por tema, construindo autoridade no assunto ao longo do tempo.

---

## S6 — Performance e modernização

**Data:** 2026-06-20 · Modernização técnica focada em **velocidade**:

- Adoção das práticas mais recentes do framework (Angular 21), removendo peso desnecessário do site.
- **Fontes ~60% mais leves** (conversão para o formato WOFF2).
- **Conexões antecipadas** com os serviços externos (banco de dados, mapa, formulário).
- **Imagens otimizadas** com reserva de espaço — evita que o layout "pule" enquanto carrega.

**Benefício:** site mais rápido para o visitante e melhores notas nos **Core Web Vitals**, que são fator de ranqueamento no Google.

---

## S7 — Acessibilidade e experiência

**Data:** 2026-06-20 · Tornar o site utilizável por **todas as pessoas**:

- Respeito à preferência de **"reduzir animações"** do sistema do usuário.
- **Link "pular para o conteúdo"** e navegação **100% por teclado** com foco visível.
- **Contraste e tamanho de textos** ajustados para leitura confortável.
- **Telas de carregamento** elegantes (em vez de áreas em branco).
- **Manifesto do app** e ícones para quando o site é salvo na tela inicial do celular.

**Benefício:** site mais inclusivo, mais profissional e alinhado às boas práticas de acessibilidade (WCAG) — relevante também para a reputação de um escritório jurídico.

---

## S8 — Testes, página de autor e verificação final

**Data:** 2026-06-21 a 2026-06-22 · Fechamento com qualidade verificada:

- Criação da **página de perfil da autora** (`/autor/maria-fernanda-vetere`), com biografia, OAB e a lista de artigos — reforçando a autoria credenciada em todo o site.
- Controle fino de indexação por artigo (endereço canônico e "não indexar" quando necessário).
- **Testes automatizados** das partes mais sensíveis (SEO e datas), para evitar regressões futuras.
- **Auditoria final em produção:** confirmado que os artigos estão indexáveis com endereço próprio, e que sitemap e página de autor estão no ar.

> **Achado importante da auditoria:** entre a S1 e a S8, o problema de indexação **havia voltado** em produção (por uma falha de variável de ambiente no build) e só foi detectado nesta verificação manual. Foi corrigido. _(Há uma recomendação de robustez para impedir que isso se repita silenciosamente — ver "Próximos passos".)_

**Benefício:** o projeto encerra o ciclo com qualidade comprovada e o perfil da advogada publicado — fechando o ciclo de autoridade iniciado na S3.

---

## Onde o site chegou

- **Blog indexável**, com cada artigo tendo identidade própria nos buscadores.
- **Autoria credenciada** (advogada com OAB) presente em dados estruturados e em página de perfil.
- **Resultados de busca ricos** (datas, trilha de navegação, perfil de negócio local) e conteúdo preparado para **busca por IA**.
- **Site rápido, acessível e moderno**, com testes automatizados protegendo o núcleo de SEO.
- **Documentação e processo** mantidos em dia a cada sessão (governança CRATON).

## Próximos passos sugeridos

Itens já mapeados e ainda em aberto (detalhados no relatório de auditoria):

1. **Robustez do build (prioridade):** fazer o deploy falhar de forma "barulhenta" se nenhum artigo for gerado — fecha o buraco que reabriu o problema de indexação entre a S1 e a S8.
2. **Melhorias de navegação e descoberta:** expor melhor as páginas de categoria e de autor a partir do blog; marcar a seção atual no menu.
3. **Reforma do rodapé** (mais funcional e elegante, com contatos e redes).
4. **Higiene de repositório:** normalizar fim de linha (CRLF) e fixar a versão do Node.

---

_Relatório consolidado a partir do `PLANO-EXECUCAO.md` · CRATON Software · 2026-06-22_
