# Portfólio Thiago Celestino — Documentação

Site estático de portfólio pessoal de **Thiago Celestino**, desenvolvedor front-end. Página única (single-page), em português, sem back-end, banco de dados ou etapa de build — HTML, CSS e JS servidos diretamente.

## Sumário

- [Visão geral](#visão-geral)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Stack tecnológica](#stack-tecnológica)
- [Seções da página](#seções-da-página)
- [Sistema de modais de projeto](#sistema-de-modais-de-projeto)
- [Scripts JavaScript próprios](#scripts-javascript-próprios)
- [Fontes e ícones](#fontes-e-ícones)
- [Rodando localmente](#rodando-localmente)
- [Deploy](#deploy)
- [Detalhes de interação do hero e cursor](#detalhes-de-interação-do-hero-e-cursor)
- [Itens conhecidos / débito técnico](#itens-conhecidos--débito-técnico)

## Visão geral

| | |
|---|---|
| **Tipo** | Site estático, uma página só, sem framework |
| **Idioma** | Português (pt-BR) |
| **Autor / conteúdo** | Thiago Celestino — dev front-end |
| **Build step** | Nenhum — CSS e JS já estão em sua forma final, sem compilador |
| **Hospedagem** | GitHub Pages |
| **Navegação interna** | Âncoras (`#intro`, `#sobre`, `#projetos`, `#contato`) com scroll suave |

## Estrutura de pastas

```
index.html                  → página única, todas as seções
README.md                   → descrição curta do repositório
docs/DOCUMENTATION.md       → este arquivo
package.json                → só declara live-server (preview local), sem scripts de build
site.webmanifest            → ícones para "adicionar à tela inicial"
favicon.ico, apple-touch-icon.png, android-chrome-*.png

modals/                     → fragmentos HTML dos cases de projeto (carregados via AJAX)
  hdc-eventos.html
  rubrum.html
  rubrum-site-v1.html
  rubrum-site-v2.html

js/                          → bibliotecas de terceiros + scripts próprios
  loader.js                  → próprio — tela de carregamento inicial (#pageLoader)
  site.js                    → próprio — animações de scroll (GSAP)
  scripts.js                 → próprio — modais, header sticky, scroll suave
  gsap.min.js, ScrollTrigger.js
  split-type.min.js
  jquery-3.7.1.min.js, jquery-migrate-3.4.1.min.js
  jquery-confirm.min.js

styles/
  css/
    style.css                        → CSS do site, escrito à mão
    jquery-confirm-custom-theme.css  → tema custom dos modais
    boxicons/                        → ícones usados no site (regular/filled/brands)
    jquery-confirm/3.3.4/
  fonts/                             → Plus Jakarta Sans self-hosted (6 pesos × 5 formatos)
  scss/                              → pasta vazia, sem uso atual

images/layout/
  logo_tc.svg, logo_tc.webp
  programming.svg                    → ilustração do hero
  project_thumb_1.png … project_thumb_4.png

cv/
  CVTHIAGO-2025.pdf                  → currículo, baixável pelo botão do hero

.github/workflows/
  jekyll-gh-pages.yml                → deploy automático no GitHub Pages
```

## Stack tecnológica

### Base
- **HTML5** semântico
- **CSS3** escrito à mão em `styles/css/style.css` (sem Sass/Less ativo, apesar da pasta `scss` existir vazia)
- **jQuery 3.7.1** + **jQuery Migrate 3.4.1** como camada de manipulação de DOM e compatibilidade com APIs antigas

### Animação e scroll
| Biblioteca | Função no site |
|---|---|
| **GSAP** (+ **ScrollTrigger**) | Motor de todas as animações por scroll: fade-in de seções, parallax da ilustração e do fundo de átomos do hero, contador da seção de stats, reveal de títulos, efeito de "digitação" nos pre-titles e no console de skills |
| **SplitType 0.3.4** | Quebra os títulos em `<span>` por caractere, usado pelo GSAP para o efeito de "acender" letra por letra ao entrar na tela |
| **Canvas 2D (nativo)** | `heroAtomsBackground()` desenha o fundo animado do hero (ícones de UI à deriva) num `<canvas>`, sem biblioteca externa |

O scroll da página é o nativo do navegador — **Lenis** foi removido do projeto (não é mais carregado em `index.html`, nem referenciado em nenhum script próprio, e o arquivo `js/lenis.min.js` foi apagado do repo). O scroll suave ao clicar em âncoras (menu e `.scroll-to`) é feito via `window.scrollTo({ behavior: 'smooth' })`.

### Interação
| Biblioteca | Função no site |
|---|---|
| **jquery-confirm 3.3.4** | Abre os modais de case de projeto — cada clique num card carrega o HTML de `modals/*.html` via AJAX (`content: 'url:/modals/hdc-eventos.html'`) |

### Ícones
- **Boxicons** (regular, filled, brands) — único set realmente usado no site

### Tipografia
**Plus Jakarta Sans**, hospedada localmente (não via Google Fonts), nos pesos light / regular / medium / semibold / bold / extrabold, cada um em 5 formatos (`eot`, `svg`, `ttf`, `woff`, `woff2`) para compatibilidade ampla de navegador.

### Paleta de cores
| Cor | Uso |
|---|---|
| `#001833` | Fundo principal (body) |
| `#0e253f` | Fundo de seções alternadas (stats) |
| `#455a6d` | Texto de corpo padrão |
| `#2cb4ff` | Accent (destaque, links ativos, hover) |
| `#1f8efe` / `#03588c` / `#0367a6` | Variações de azul para botões e superfícies de card |
| `#ffffff` | Texto de destaque (`highlighted`) |

## Seções da página

Todas dentro de `<div class="master">`, na ordem em que aparecem:

1. **Header fixo** (`.header`) — logo, navegação (`Home`, `Sobre`, `Projetos`) e botão CTA "Entre em contato" (`mailto:`). Fica sólido (`.scrolled`) ao rolar a página.
2. **Hero** (`#intro`) — título de apresentação, ilustração SVG, botões "Saiba mais" / "Download CV", ícones sociais (LinkedIn, GitHub), fundo animado de ícones de UI em `<canvas>` (ver [Detalhes de interação](#detalhes-de-interação-do-hero-e-cursor)) e cursor customizado ativo em todo o site.
3. **Stats** (`#stats`) — 4 indicadores numéricos animados (anos de experiência, projetos entregues, % HTML/CSS/JS, xícaras de café).
4. **Sobre** (`#sobre`) — texto de apresentação e um console de terminal (`node skills.js`) no lugar de barras de porcentagem: HTML5, CSS/Sass e Javascript mostram em quantos dos 4 projetos reais foram usados; UI/UX e Design Responsivo ganham uma frase qualitativa. Grade de cards de ferramentas/bibliotecas abaixo (Less, Sass, Bootstrap, Angular JS, GSAP, jQuery), sem mudança.
5. **Projetos** (`#projetos`) — 4 cards de "Trabalhos recentes" com thumbnail em frame unificado (barra de chrome falsa + duotone), reordenados pra mostrar primeiro os projetos com data de publicação real. Cada um abre um modal com case de projeto ao clicar.
6. **Contato** (`#contato`) — lista de canais: e-mail, WhatsApp, LinkedIn, GitHub.
7. **Footer** — copyright com ano atual gerado via `Date().getFullYear()`, assinatura "Design by Thiago Celestino".

## Sistema de modais de projeto

Cada card em `#projetos` tem um `id` (`card_1`…`card_4`) — os `id`s não seguem mais a ordem visual (ver [Seções da página](#seções-da-página) e [CONTEXT.md](../CONTEXT.md) para a ordem exibida). Um clique dispara `scripts.js`, que abre um `$.dialog()` do jquery-confirm carregando o fragmento correspondente via AJAX:

| Card | Modal | Projeto | Status |
|---|---|---|---|
| `card_1` | `modals/hdc-eventos.html` | HDC Eventos — plataforma de gestão de eventos | Prévia em breve |
| `card_2` | `modals/rubrum-site-v2.html` | Rubrum — Site Comercial V2 | Prévia em breve |
| `card_3` | `modals/rubrum-site-v1.html` | Rubrum — Site Comercial V1 | Publicado (05/08/2020) |
| `card_4` | `modals/rubrum.html` | Rubrum — plataforma de gestão de embalagens | Publicado (24/07/2019) |

Cada fragmento de modal é um `<div>` isolado (sem `<html>`/`<head>` próprios) com: vídeo de preview, descrição do projeto, lista de tecnologias usadas, data/status e link para o projeto (quando disponível).

## Scripts JavaScript próprios

### `js/loader.js`
Controla a tela de carregamento inicial (`#pageLoader`), primeiro elemento do `<body>`. O progresso da barra reflete carregamento real — soma ponderada de `document.fonts.ready`, load da ilustração do hero e o evento `window.load` — suavizado por interpolação, nunca um timer fixo. Ao terminar, resolve a promise `window.__pageLoader.ready`, que `site.js` aguarda (`whenPageReady()`) antes de armar a animação de entrada do hero.

### `js/site.js`
Responsável por tudo que é decorativo/scroll:
- Registra o plugin `ScrollTrigger` no GSAP
- Calcula qual seção está ativa no viewport e marca o link correspondente do menu (`is-active`)
- Expõe `window.smoothScrollTo(target)`, função compartilhada que calcula o destino do scroll suave (header em repouso + gap fixo, ancorando no `.pre-title` da seção quando existir) e dispara `window.scrollTo({ behavior: 'smooth' })` — usada tanto pelo clique num link do menu (`a.nav-link`, aqui mesmo) quanto por `.scroll-to` em `scripts.js`
- Timeline de entrada do hero (badge, título, botões, ícones sociais)
- Parallax da ilustração do hero
- Fundo animado de átomos de UI no hero em `<canvas>` (`heroAtomsBackground()`) — ver [Detalhes de interação](#detalhes-de-interação-do-hero-e-cursor)
- Reveal de título por caractere em cada `.content` ao entrar na tela (usa `SplitType`)
- Efeito de "digitação" nos pre-titles (`preparePreTitleTyping()`), encaixado na mesma timeline de fade de cada seção
- Console de skills animado em "Sobre" (`skillsConsoleAnimate()`), reaproveitando a técnica de digitação por `steps()` do item acima
- Anima o contador da seção de stats
- Cursor customizado em todo o site (`cursorCaret()`) — ver [Detalhes de interação](#detalhes-de-interação-do-hero-e-cursor)
- Respeita `prefers-reduced-motion`, desativando as animações quando o usuário pede menos movimento

### `js/scripts.js`
Responsável pela interação de clique:
- Abre os 4 modais de projeto (`$.dialog`)
- Aplica `.scrolled` no header ao rolar a página
- Implementa scroll suave ao clicar em links `.scroll-to` (logo, botão "Saiba mais") delegando para `window.smoothScrollTo()`, definida em `site.js`
- Limpa hash da URL após navegação

## Fontes e ícones

- Fontes em `styles/fonts/`, referenciadas via `@font-face` em `style.css`
- Ícones via classes Boxicons (`bx`, `bxf`, `bxl`) — famílias regular, filled e brands, carregadas em `index.html`

## Rodando localmente

```bash
npx live-server
```

Não há script `start` configurado em `package.json` — `live-server` é a única dependência declarada, usada apenas para pré-visualização local (auto-reload ao salvar arquivos).

## Deploy

`.github/workflows/jekyll-gh-pages.yml` publica o site no **GitHub Pages** a cada push na branch `main`, usando o template padrão `actions/jekyll-build-pages`. Não há `_config.yml` nem nenhum recurso específico do Jekyll no projeto — como não há nada para o Jekyll processar, o build só repassa os arquivos estáticos como estão, funcionando na prática como uma publicação de HTML puro.

## Detalhes de interação do hero e cursor

### Fundo de átomos do hero

`.hero-atoms` (canvas) dentro de `.hero .container`, desenhado por `heroAtomsBackground()`. ~30 ícones de componentes de UI (botão, toggle, checkbox, rádio, chevron, cursor, badge, slider, sino, busca) à deriva atrás do conteúdo — deliberadamente **não** código nem pontos conectados (rede neural), por serem os dois clichês mais repetidos de fundo animado em portfólio de dev.

Cada átomo tem uma `depth` contínua (0.2 = longe … 1.0 = perto) da qual derivam tamanho, opacidade, espessura do traço e velocidade — múltiplos planos de profundidade, não dois grupos fixos. Reage a dois tipos de paralaxe, ambos ponderados por `depth`:
- **Mouse** — deslocamento proporcional à distância do cursor até o centro do hero.
- **Scroll** — via `ScrollTrigger` com `scrub` (mesma técnica de `heroLeft()`), até ±75px no plano mais à frente.

**Gotchas já corrigidos, não reintroduzir:**
- O wrap-around (átomo sai de um lado, reaparece do outro) calcula a posição usando a coordenada **renderizada** (lógica + paralaxe de mouse/scroll), não só a lógica — cortar aqui faz um átomo "escondido" reaparecer deslocado pelo paralaxe e ficar cortado pela borda do canvas.
- `resize()` recentraliza `mouse.x`/`mouse.y` no meio do hero — o valor inicial `{x:0,y:0}` enviesava o paralaxe pra esquerda antes do primeiro `mousemove` real.
- `.hero-atoms-vignette`, logo depois do canvas no HTML, aplica `radial-gradient(ellipse at center, transparent 45%, #001833 88%)` — elipse (não círculo) porque o hero é bem mais largo que alto; mascara qualquer corte residual de wrap nas bordas.

Pausa (sem `requestAnimationFrame` rodando) quando: a seção sai da viewport (`IntersectionObserver`), a aba perde foco (`visibilitychange`), ou o usuário pede `prefers-reduced-motion` (nesse caso desenha 1 quadro estático, sem loop).

### Console de skills em "Sobre"

`.term` + `skillsConsoleAnimate()`. Visualmente uma janela de terminal (`zsh — skills.js`) rodando `node skills.js`. Em vez de percentuais auto-atribuídos, mostra evidência real: HTML5/CSS·Sass/Javascript/Angular JS aparecem como barras ASCII (`■■■■`) com a contagem de em quantos dos 4 projetos da seção Projetos aquela tecnologia foi usada; UI/UX e Design Responsivo (que não são uma tag de projeto) ganham uma frase qualitativa em vez de um número. A animação usa um `typeReveal()` local que generaliza a técnica de `preparePreTitleTyping()` (revelar largura via `ease: steps(n)`) tanto pro comando digitado quanto pras barras, disparada por `ScrollTrigger` (`onToggle` reversível).

### Frame unificado dos cards de projeto

As 4 imagens reais (`project_thumb_1.png`…`project_thumb_4.png`) vêm de origens visuais muito diferentes (screenshot de painel, render de marketing rosa, foto de evento). Cada `.card-picture` ganhou uma barra de chrome falsa (`.card-chrome`: 3 bolinhas + um retângulo curto sem texto) e a imagem foi movida pra dentro de `.card-art`, com `filter: grayscale(.85)` na `<img>` (dessatura antes de qualquer tinta entrar — sem isso, cores muito saturadas na origem furam o duotone) e um `.card-duotone` (`mix-blend-mode: multiply`, azul-marinho) por cima. Os cards também têm `.card-description` (linha de contexto sob o título) e foram reordenados no HTML pra mostrar antes os projetos com data de publicação real.

### Cursor customizado

`.cursor-caret` + `cursorCaret()`. Um bloco azul piscando (estilo cursor de terminal, mesma linguagem visual do `.term` de Sobre) segue o mouse via `translate3d`, substituindo o ponteiro nativo do sistema (`.has-custom-cursor` aplica `cursor: none` globalmente — só ativado a partir do primeiro `mousemove` real, pra nunca existir um instante sem nenhum cursor visível). Sobre elementos interativos (`a`, `button`, `.btn`, `.card-wrapper`, etc.) o bloco vira um círculo em vez de sumir, preservando o sinal de "isso é clicável". Só ativa com `pointer: fine` (sem efeito em touch).

O jQuery Confirm exige dois ajustes específicos: seu overlay de modal usa `z-index: 99999999`, então `.cursor-caret` precisa ficar acima disso (hoje `100000000`); e seu botão de fechar define `cursor: pointer` com especificidade maior que a regra genérica `.has-custom-cursor *`, por isso existe `.has-custom-cursor .jconfirm-box * { cursor: none !important; }`, com `.jconfirm-closeIcon` incluído na lista de elementos interativos do script.

**Trade-off aceito:** com o cursor nativo escondido em todo o site, texto selecionável (parágrafos, contato) perde o indicador visual de I-beam — a seleção em si continua funcionando normalmente.

## Itens conhecidos / débito técnico

- **`styles/scss/` vazia** — pasta preparada para um fluxo com Sass que não está em uso; o CSS é escrito e mantido diretamente em `style.css`.
- **`site.webmanifest`** tem `name` e `short_name` vazios.
- Um levantamento de UX/conteúdo mais aprofundado (responsividade, hierarquia da seção de contato, estados dos cards de projeto) foi feito separadamente e está disponível como artifact publicado nesta conversa.
