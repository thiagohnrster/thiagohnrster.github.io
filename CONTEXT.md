# CONTEXT.md

Contexto de negócio e conteúdo do site — complementa [CLAUDE.md](CLAUDE.md) (que foca em comandos e arquitetura técnica). Ver também [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md), a documentação técnica completa do projeto.

## O que é este projeto

Portfólio pessoal de **Thiago Celestino**, desenvolvedor front-end. Site estático de página única (`index.html`), em português, hospedado no GitHub Pages, sem back-end nem etapa de build.

- **Repositório:** `thcelestino`
- **Branch de produção:** `main` (deploy automático a cada push via `.github/workflows/jekyll-gh-pages.yml`)
- **Contato exibido no site:** e-mail `celesthiago@outlook.com`, WhatsApp `+55 11 97509-7733`, LinkedIn `linkedin.com/in/thiagohnrster`, GitHub `github.com/thiagohnrster`

## Objetivo do site

Apresentar Thiago como desenvolvedor front-end para potenciais clientes/empregadores: quem ele é, principais habilidades (HTML, CSS, JavaScript, UI/UX, Design Responsivo), ferramentas/bibliotecas que domina (Less, Sass, Bootstrap, Angular JS, GSAP, jQuery) e um portfólio de projetos recentes com cases detalhados em modal.

## Estrutura de conteúdo da página

Nessa ordem, todas dentro de `index.html`:

0. **Loading inicial (`#pageLoader`)** — tela cheia sobre tudo (inclusive o header) enquanto a página carrega de verdade: logo, tag `// carregando` com cursor piscando, barra de progresso e percentual. Some assim que fontes, ilustração do hero e o `load` da página terminam, e só então a animação de entrada do hero é liberada. Ver detalhes técnicos em [CLAUDE.md](CLAUDE.md).
1. **Header** — logo, navegação (Home / Sobre / Projetos) e CTA "Entre em contato" (`mailto:`). *(Não adicionar um link "Contato" separado no menu — o CTA já cobre isso.)*
2. **Hero (`#intro`)** — headline, ilustração, botões "Saiba mais" e "Download CV" (`cv/CVTHIAGO-2025.pdf`), ícones sociais.
3. **Stats (`#stats`)** — 4 indicadores animados: 5+ anos de experiência, 4 projetos entregues, 95% HTML/CSS/JS, 1000+ xícaras de café.
4. **Sobre (`#sobre`)** — texto de apresentação, barras de progresso de skill (HTML 95%, CSS 95%, JavaScript 75%, UI/UX 85%, Design Responsivo 80%) e grade de ferramentas/bibliotecas.
5. **Projetos (`#projetos`)** — 4 cards que abrem modais de case (ver tabela abaixo).
6. **Contato (`#contato`)** — lista de canais + botões "Copiar e-mail" e "Chamar no Whatsapp".
7. **Footer** — copyright com ano dinâmico, assinatura "Design by Thiago Celestino".

## Projetos exibidos (cards → modal)

| Card | Modal | Projeto | Status exibido no site |
|---|---|---|---|
| `card_1` | `modals/hdc-eventos.html` | HDC Eventos — plataforma de gestão de eventos (HTML5, Sass, JS, Angular JS, Laravel 5, PHP) | "Prévia em breve" |
| `card_2` | `modals/rubrum-site-v2.html` | Rubrum — Site Comercial V2 | "Prévia em breve" |
| `card_3` | `modals/rubrum-site-v1.html` | Rubrum — Site Comercial V1 | Publicado — 05 de Agosto de 2020 |
| `card_4` | `modals/rubrum.html` | Rubrum — plataforma de gestão de embalagens | Publicado — 24 de Julho de 2019 |

Cada modal traz: vídeo de preview, descrição do projeto, lista de tecnologias (pills coloridas) e, quando disponível, link para o projeto publicado.

## Decisões e histórico relevantes

- O menu de navegação foi deliberadamente mantido sem um item "Contato" — o botão CTA do header já direciona para contato via `mailto:`. Não reintroduzir esse link a menos que explicitamente pedido.
- `js/jquery.visualnav` foi carregado em versões anteriores do site para destacar o link ativo do menu, mas essa função foi substituída por lógica própria em `site.js`. O script antigo permanece carregado no `<head>` porém inativo (resíduo, não removido).
- A tela de loading (`js/loader.js`) foi adicionada porque a entrada do hero (GSAP) tocava assim que a página abria, mesmo com fontes/ilustração ainda carregando — o loader passou a segurar essa animação até a página estar de fato pronta. O progresso é sempre baseado em eventos reais de carregamento, nunca um timer fixo (pedido explícito).
- Fontes usadas no primeiro paint (`plus_jakarta_sansextrabold`, `plus_jakarta_sanssemibold`, `SourceCodePro-Medium`) ganharam `<link rel="preload">` e todas as faces ganharam `font-display: swap`, pra acelerar/suavizar o carregamento — decisão tomada em conjunto com o loader, já que ele mede exatamente esse carregamento.
- O **Lenis** (smooth scroll) foi removido do projeto: não é mais carregado em `index.html` nem referenciado em nenhum script próprio. O scroll suave ao clicar em links do menu ou em `.scroll-to` (logo, botão "Saiba mais") agora é feito via `window.scrollTo({ behavior: 'smooth' })` nativo, calculando o destino com a altura do header em repouso e um respiro fixo — ver detalhes técnicos em [CLAUDE.md](CLAUDE.md). O arquivo `js/lenis.min.js` ficou órfão no repo.
- O cálculo desse scroll suave (que antes existia duplicado em `site.js` e `scripts.js`) foi unificado numa única função, `window.smoothScrollTo()`, definida em `js/site.js` e reaproveitada por `scripts.js` — ver [CLAUDE.md](CLAUDE.md).
- Os pre-titles ("//" + rótulo, ex: "// sobre mim") ganharam um efeito de "digitação" via `preparePreTitleTyping()` em `site.js`, sincronizado com a animação de entrada de cada seção (hero, sobre, projetos, contato).

## Itens conhecidos / débito técnico

- `styles/scss/` está vazia — preparada para um fluxo Sass que nunca foi adotado; o CSS é mantido diretamente em `styles/css/style.css`.
- `styles/css/fontawesome/7.1.0/` e `styles/css/tabler-icons/` estão no repo mas não carregados em `index.html` — só aparecem numa referência comentada dentro de `modals/hdc-eventos.html`.
- `js/lucide.js` está presente mas não é referenciado em nenhum lugar do código carregado.
- `site.webmanifest` tem `name` e `short_name` vazios.
- Os cards 1 e 2 (HDC Eventos, Rubrum V2) ainda não têm link de projeto publicado — status "Prévia em breve".
- `plus_jakarta_sanslight` e `plus_jakarta_sansmedium` (fonte + `@font-face`) não são usados em nenhuma regra de `style.css` — mantidos por enquanto a pedido do usuário, sem custo de performance (arquivo não referenciado não é baixado).
- `js/lenis.min.js` está no repo mas não é mais carregado nem referenciado — resíduo da remoção do Lenis (ver decisões acima).

## Onde procurar mais detalhes

- Stack tecnológica completa, paleta de cores e responsabilidades de cada script: [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md).
- Comandos de desenvolvimento e arquitetura de código: [CLAUDE.md](CLAUDE.md).
