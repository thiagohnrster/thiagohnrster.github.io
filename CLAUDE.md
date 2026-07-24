# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Ver também [CONTEXT.md](CONTEXT.md) para o contexto de negócio/conteúdo do site (seções, projetos exibidos, débito técnico).

## Visão geral

Portfólio pessoal estático de Thiago Celestino (dev front-end), em português. Página única (`index.html`), sem framework, sem back-end, sem etapa de build — HTML/CSS/JS são servidos como estão. Hospedado no GitHub Pages.

## Comandos

Não há scripts de build, lint ou teste configurados em `package.json` (`npm test` só retorna erro proposital). O único comando relevante:

```bash
npx live-server
```

Sobe um servidor local com auto-reload ao salvar qualquer arquivo. `live-server` é a única dependência do projeto.

Deploy é automático: qualquer push em `main` dispara `.github/workflows/jekyll-gh-pages.yml`, que publica os arquivos estáticos no GitHub Pages via `actions/jekyll-build-pages`. Não existe `_config.yml` nem nada específico do Jekyll — o workflow apenas repassa os arquivos como estão.

## Arquitetura

**Tudo gira em torno de `index.html`.** As seções (`#intro`, `#stats`, `#sobre`, `#projetos`, `#contato`) estão todas nesse único arquivo, dentro de `<div class="master">`. Não há roteamento nem outras páginas HTML no domínio principal.

**Separação de responsabilidades em `js/`:**
- `js/loader.js` — tela de carregamento inicial (ver seção própria abaixo). Carregado com `defer`, antes de `site.js`.
- `js/site.js` — tudo que é decorativo/scroll: registra `ScrollTrigger` no GSAP, detecta a seção ativa no viewport para marcar o link do menu, timeline de entrada do hero, parallax da ilustração, reveal de título letra-a-letra via `SplitType`, efeito de "digitação" nos pre-titles (`preparePreTitleTyping()`), animação de contadores/barras de progresso. Respeita `prefers-reduced-motion`.
- `js/scripts.js` — tudo que é interação de clique: abre os modais de projeto (`$.dialog` do jquery-confirm), aplica `.scrolled` no header ao rolar, implementa scroll suave para links `.scroll-to` (mesmo cálculo de offset usado pelos links do menu em `site.js` — ver nota abaixo), limpa o hash da URL após navegar.
- Demais arquivos em `js/` são bibliotecas de terceiros (GSAP, ScrollTrigger, SplitType, jQuery + Migrate, jquery-confirm, jquery.visualnav, lucide, Lenis) — **não editar como se fossem código próprio**.

**Tela de carregamento (`#pageLoader`)** é o primeiro elemento do `<body>` em `index.html`, controlada por `js/loader.js`. O progresso da barra reflete carregamento **real** — soma ponderada de `document.fonts.ready`, o load da ilustração do hero e o evento `window.load` — suavizado por interpolação, não um timer falso; não trocar por um timer fixo. Ao terminar, `loader.js` resolve a promise `window.__pageLoader.ready`. `site.js` usa o helper `whenPageReady()` pra só armar a entrada do hero (o `IntersectionObserver` de `heroIntro` e o `ScrollTrigger` de `heroLeft`) depois que essa promise resolve — sem esse gate a animação tocaria escondida atrás do loader, já que o hero está visível desde o primeiro paint. Qualquer nova animação de entrada do hero deve passar pelo mesmo gate.

**Scroll suave para âncoras é calculado, não delegado a uma lib.** Tanto os links `a.nav-link` do menu (`site.js`) quanto os elementos `.scroll-to` (logo e botão "Saiba mais" — `scripts.js`) usam `window.scrollTo({ behavior: 'smooth' })` com o mesmo destino: altura do header **em repouso** (`headerHAtRest()`, que simula a classe `.scrolled` mesmo antes de a página ter rolado, já que o header fica mais baixo assim que o scroll começa) menos um `SCROLL_GAP` fixo de 40px, ancorando em `.content .pre-title` da seção-alvo quando ela existir (evita parar no respiro de 180px de padding-top da seção). São duas implementações independentes em arquivos diferentes — ao ajustar o cálculo em uma, replicar na outra.

**Efeito de "digitação" nos pre-titles** (`preparePreTitleTyping()` em `site.js`) transforma o texto após o "//" num bloco cuja largura é revelada em steps (simulando caractere a caractere), com um caret que some só ao final. O timeline retornado não roda isolado — é encaixado (`.add(tl, 0)`) na mesma timeline que já faz o fade de entrada da seção (hero, sobre, projetos, contato), pra tocarem sincronizados por construção. Respeita `prefers-reduced-motion` (define a largura final direto, sem animar).

**Modais de projeto são fragmentos HTML separados, carregados via AJAX.** Cada card em `#projetos` (`card_1`…`card_4`) tem um handler em `scripts.js` que abre um `$.dialog()` apontando para `modals/*.html` (`hdc-eventos.html`, `rubrum.html`, `rubrum-site-v1.html`, `rubrum-site-v2.html`). Cada arquivo em `modals/` é um `<div>` isolado, sem `<html>`/`<head>` próprios — ao editar um modal, mantenha esse formato de fragmento. O mapeamento card → modal está documentado em [CONTEXT.md](CONTEXT.md).

**CSS é um único arquivo escrito à mão:** `styles/css/style.css`. Não há Sass/Less ativo — `styles/scss/` existe mas está vazia e sem uso. Não introduzir um pipeline de build a menos que explicitamente pedido.

**Fontes self-hosted:** Plus Jakarta Sans (6 pesos) e Source Code Pro (5 pesos, usada nos "//" dos pre-titles e no loader) em `styles/fonts/`, referenciadas via `@font-face` em `style.css` — múltiplos formatos por peso, para compatibilidade ampla de navegador (não remover formatos sem necessidade). Todas as faces têm `font-display: swap`; as 3 usadas no primeiro paint (`plus_jakarta_sansextrabold`, `plus_jakarta_sanssemibold`, `SourceCodePro-Medium`) têm `<link rel="preload">` em `index.html`, antes dos stylesheets.

**Ícones:** só o set **Boxicons** (`bx`/`bxf`/`bxl`, carregado em `index.html`) está de fato em uso. `styles/css/fontawesome/`, `styles/css/tabler-icons/` e `js/lucide.js` existem no repo mas não são carregados por `index.html` — são débito técnico, não usar como se estivessem ativos sem confirmar antes.

## Notas específicas

- Não adicionar um link "Contato" na navegação do header — o botão CTA "Entre em contato" (`mailto:`) já cobre esse propósito.
- `js/jquery.visualnav.min.js` é carregado no `<head>` mas nunca instanciado — o destaque do link ativo do menu é feito por lógica própria em `site.js`, não por esse plugin. Não assumir que o plugin está funcionando.
- `plus_jakarta_sanslight` e `plus_jakarta_sansmedium` (`@font-face` + arquivos em `styles/fonts/`) não são referenciados em nenhuma regra de `style.css` — confirmado que o navegador nunca os baixa. Débito técnico, mantidos por enquanto a pedido do usuário.
- `js/lenis.min.js` não é mais carregado em `index.html` nem referenciado em `site.js`/`scripts.js` — o smooth scroll passou a ser feito via `window.scrollTo({ behavior: 'smooth' })` nativo (ver cálculo de offset acima). Arquivo órfão no repo, mesma categoria de débito técnico de `fontawesome`/`tabler-icons`/`lucide.js`.
