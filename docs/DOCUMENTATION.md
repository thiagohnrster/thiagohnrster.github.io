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
  lenis.min.js                → não usado (ver débito técnico)
  jquery-3.7.1.min.js, jquery-migrate-3.4.1.min.js
  jquery-confirm.min.js
  jquery.visualnav.js / .min.js
  lucide.js

styles/
  css/
    style.css                        → CSS do site, escrito à mão
    jquery-confirm-custom-theme.css  → tema custom dos modais
    boxicons/                        → ícones usados no site (regular/filled/brands)
    jquery-confirm/3.3.4/
    fontawesome/7.1.0/                → não usado no site (ver débito técnico)
    tabler-icons/                    → não usado no site (ver débito técnico)
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
| **GSAP** (+ **ScrollTrigger**) | Motor de todas as animações por scroll: fade-in de seções, parallax da ilustração do hero, contadores e barras de progresso animados, reveal de títulos, efeito de "digitação" nos pre-titles |
| **SplitType 0.3.4** | Quebra os títulos em `<span>` por caractere, usado pelo GSAP para o efeito de "acender" letra por letra ao entrar na tela |

O scroll da página é o nativo do navegador — **Lenis** foi removido do projeto (não é mais carregado em `index.html` nem referenciado em nenhum script próprio; `js/lenis.min.js` ficou órfão, ver débito técnico). O scroll suave ao clicar em âncoras (menu e `.scroll-to`) é feito via `window.scrollTo({ behavior: 'smooth' })`.

### Interação
| Biblioteca | Função no site |
|---|---|
| **jquery-confirm 3.3.4** | Abre os modais de case de projeto — cada clique num card carrega o HTML de `modals/*.html` via AJAX (`content: 'url:/modals/hdc-eventos.html'`) |
| **jquery.visualnav** | Carregado no `<head>`, mas **nunca instanciado** — o destaque do link ativo do menu é feito por lógica própria em `site.js`, não por este plugin (ver débito técnico) |

### Ícones
- **Boxicons** (regular, filled, brands) — único set realmente usado no site
- **Font Awesome 7.1.0** e **Tabler Icons** — presentes em `styles/css/` mas não carregados em `index.html` (débito técnico)
- **lucide.js** — presente em `js/` sem nenhuma referência no código (débito técnico)

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
2. **Hero** (`#intro`) — título de apresentação, ilustração SVG, botões "Saiba mais" / "Download CV", ícones sociais (LinkedIn, GitHub).
3. **Stats** (`#stats`) — 4 indicadores numéricos animados (anos de experiência, projetos entregues, % HTML/CSS/JS, xícaras de café).
4. **Sobre** (`#sobre`) — texto de apresentação, barras de progresso de skill (HTML, CSS, JavaScript, UI/UX, Design Responsivo) e grade de cards de ferramentas/bibliotecas (Less, Sass, Bootstrap, Angular JS, GSAP, jQuery).
5. **Projetos** (`#projetos`) — 4 cards de "Trabalhos recentes", cada um abrindo um modal com case de projeto ao clicar.
6. **Contato** (`#contato`) — lista de canais: e-mail, WhatsApp, LinkedIn, GitHub.
7. **Footer** — copyright com ano atual gerado via `Date().getFullYear()`, assinatura "Design by Thiago Celestino".

## Sistema de modais de projeto

Cada card em `#projetos` tem um `id` (`card_1`…`card_4`). Um clique dispara `scripts.js`, que abre um `$.dialog()` do jquery-confirm carregando o fragmento correspondente via AJAX:

| Card | Modal | Projeto | Status |
|---|---|---|---|
| `card_1` | `modals/hdc-eventos.html` | HDC Eventos — plataforma de gestão de eventos | Em desenvolvimento |
| `card_2` | `modals/rubrum-site-v2.html` | Rubrum — Site Comercial V2 | Em desenvolvimento |
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
- Reveal de título por caractere em cada `.content` ao entrar na tela (usa `SplitType`)
- Efeito de "digitação" nos pre-titles (`preparePreTitleTyping()`), encaixado na mesma timeline de fade de cada seção
- Anima contadores e barras de progresso da seção de stats e de skills
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

## Itens conhecidos / débito técnico

- **`styles/scss/` vazia** — pasta preparada para um fluxo com Sass que não está em uso; o CSS é escrito e mantido diretamente em `style.css`.
- **`jquery.visualnav`** carregado mas nunca instanciado — o destaque do nav ativo é feito por lógica própria em `site.js`. Provável resíduo de uma versão anterior do site.
- **`fontawesome/7.1.0/`, `tabler-icons/` e `js/lucide.js`** — bibliotecas de ícones presentes no projeto mas não referenciadas em nenhum arquivo carregado por `index.html` (só aparecem numa linha comentada dentro de `modals/hdc-eventos.html`).
- **`site.webmanifest`** tem `name` e `short_name` vazios.
- **`js/lenis.min.js`** não é mais carregado em `index.html` nem referenciado em `site.js`/`scripts.js` — o Lenis foi removido e o smooth scroll passou a ser nativo (`window.scrollTo`). Arquivo órfão no repo.
- Um levantamento de UX/conteúdo mais aprofundado (responsividade, hierarquia da seção de contato, estados dos cards de projeto) foi feito separadamente e está disponível como artifact publicado nesta conversa.
