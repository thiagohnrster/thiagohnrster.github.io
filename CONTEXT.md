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
1. **Header** — logo, navegação (Home / Sobre / Projetos) e CTA "Entre em contato" (`mailto:`). *(Não adicionar um link "Contato" separado no menu — o CTA já cobre isso.)* Abaixo de ~900px de largura, a navegação vira um botão hambúrguer que abre um painel cheio com os mesmos 3 links + CTA, centralizados.
2. **Hero (`#intro`)** — headline, ilustração, botões "Saiba mais" e "Download CV" (`cv/CVTHIAGO-2025.pdf`), ícones sociais, cursor customizado (bloco azul piscando, estilo terminal) e um fundo animado de ícones de UI à deriva atrás do conteúdo. Ver detalhes técnicos em [CLAUDE.md](CLAUDE.md).
3. **Stats (`#stats`)** — 4 indicadores animados: 5+ anos de experiência, 4 projetos entregues, 95% HTML/CSS/JS, 1000+ xícaras de café.
4. **Sobre (`#sobre`)** — texto de apresentação e um console de skills (visual de terminal, `node skills.js`): HTML5/CSS·Sass/Javascript/Angular JS mostram em quantos dos 4 projetos reais foram usados (em vez de uma porcentagem inventada), UI/UX e Design Responsivo ganham uma frase qualitativa. Grade de ferramentas/bibliotecas abaixo, sem mudança.
5. **Projetos (`#projetos`)** — 4 cards que abrem modais de case (ver tabela abaixo), com thumbnail em frame unificado (barra de chrome + duotone) e reordenados pra mostrar os projetos com data real primeiro.
6. **Contato (`#contato`)** — lista de canais + botões "Copiar e-mail" e "Chamar no Whatsapp".
7. **Footer** — copyright com ano dinâmico, assinatura "Design by Thiago Celestino".

## Projetos exibidos (cards → modal)

Ordem de exibição no site (reordenados por data de publicação, mais recente primeiro):

| Ordem visual | Card | Modal | Projeto | Contexto exibido | Status exibido no site |
|---|---|---|---|---|---|
| 1º | `card_1` | `modals/grade.html` | Grade — plataforma de gestão de eventos (HTML5, CSS3, JS, Angular JS, Laravel 5, PHP) | Plataforma de gestão de eventos · Full-stack | Publicado — 31 de Julho de 2026 |
| 2º | `card_3` | `modals/rubrum-site-v1.html` | Rubrum — Site Comercial V1 | Landing page · Divulgação da plataforma web | Publicado — 05 de Agosto de 2020 |
| 3º | `card_4` | `modals/rubrum.html` | Rubrum — plataforma de gestão de embalagens | Gestão de embalagens · Plataforma web | Publicado — 24 de Julho de 2019 |
| 4º | `card_2` | `modals/rubrum-site-v2.html` | Rubrum — Site Comercial V2 | Landing page · Redesign | "Prévia em breve" |

Cada modal traz: vídeo de preview, descrição do projeto, lista de tecnologias (pills coloridas) e, quando disponível, link para o projeto publicado. Os `id`s (`card_1`…`card_4`) não mudaram de significado — `hdc-eventos.html` foi removido do repo e `card_1` passou a apontar para `modals/grade.html`, o projeto mais recente.

## Decisões e histórico relevantes

- O menu de navegação foi deliberadamente mantido sem um item "Contato" — o botão CTA do header já direciona para contato via `mailto:`. Não reintroduzir esse link a menos que explicitamente pedido.
- `js/jquery.visualnav` foi carregado em versões anteriores do site para destacar o link ativo do menu, mas essa função foi substituída por lógica própria em `site.js`. O script antigo foi removido do repo por não ter mais uso.
- A tela de loading (`js/loader.js`) foi adicionada porque a entrada do hero (GSAP) tocava assim que a página abria, mesmo com fontes/ilustração ainda carregando — o loader passou a segurar essa animação até a página estar de fato pronta. O progresso é sempre baseado em eventos reais de carregamento, nunca um timer fixo (pedido explícito).
- Fontes usadas no primeiro paint (`plus_jakarta_sansextrabold`, `plus_jakarta_sanssemibold`, `SourceCodePro-Medium`) ganharam `<link rel="preload">` e todas as faces ganharam `font-display: swap`, pra acelerar/suavizar o carregamento — decisão tomada em conjunto com o loader, já que ele mede exatamente esse carregamento.
- O **Lenis** (smooth scroll) foi removido do projeto: não é mais carregado em `index.html` nem referenciado em nenhum script próprio, e o arquivo `js/lenis.min.js` foi apagado do repo. O scroll suave ao clicar em links do menu ou em `.scroll-to` (logo, botão "Saiba mais") agora é feito via `window.scrollTo({ behavior: 'smooth' })` nativo, calculando o destino com a altura do header em repouso e um respiro fixo — ver detalhes técnicos em [CLAUDE.md](CLAUDE.md).
- O cálculo desse scroll suave (que antes existia duplicado em `site.js` e `scripts.js`) foi unificado numa única função, `window.smoothScrollTo()`, definida em `js/site.js` e reaproveitada por `scripts.js` — ver [CLAUDE.md](CLAUDE.md).
- Os pre-titles ("//" + rótulo, ex: "// sobre mim") ganharam um efeito de "digitação" via `preparePreTitleTyping()` em `site.js`, sincronizado com a animação de entrada de cada seção (hero, sobre, projetos, contato).
- O hero ganhou um fundo animado em canvas (ícones de botão/toggle/checkbox/cursor à deriva) e um cursor customizado em todo o site — ambos avaliados e descartados em versões mais "clichê" antes de chegar nessa forma: um fundo de código e um de "rede neural" (pontinhos conectados, clichê de site de IA) foram propostos e rejeitados por não serem específicos de front-end. Ver [CLAUDE.md](CLAUDE.md) para detalhes técnicos e gotchas já corrigidos (wrap-around considerando paralaxe, viés de mouse não centralizado).
- As barras de porcentagem de skill em "Sobre" foram substituídas por um console de terminal (`node skills.js`) porque uma porcentagem auto-atribuída ("95% em HTML") não é uma métrica real nem verificável — a nova versão mostra em quantos dos 4 projetos reais cada tecnologia foi usada, amarrando "Sobre" à seção Projetos como evidência em vez de repetir informação solta.
- Os thumbnails da seção Projetos vinham de origens visuais muito diferentes (screenshot de painel, render de marketing, foto de evento) sem nenhum tratamento em comum. Ganharam uma barra de chrome falsa + um duotone (dessaturação + tinta azul) por cima de qualquer imagem de origem, unificando a leitura visual dos 4 cards.
- Border-radius dos botões de ação foi padronizado pra `15px` (antes pill/`999px`) — badges e tags de status/tecnologia continuam pill, por serem uma categoria de UI diferente (rótulo, não ação).
- **O site não era de fato responsivo** apesar de "Design Responsivo" aparecer como skill comprovada no console de "Sobre": `.container`/`header` tinham `min-width` fixo e cortavam conteúdo abaixo de ~1000px de largura. Isso foi corrigido com um breakpoint que reflowa header, hero, stats, "Sobre", cards e o modal de projeto pra tablet/celular, incluindo um menu hambúrguer novo (ver [CLAUDE.md](CLAUDE.md) para os detalhes técnicos e os gotchas já corrigidos nessa parte — vale a leitura antes de tocar em qualquer coisa relacionada ao menu mobile, já alguns bugs sutis já voltaram mais de uma vez durante o desenvolvimento).
- Outras correções da mesma auditoria: `<html lang="pt-BR">` (estava `en`), Open Graph/Twitter Card + `<link rel="canonical">` (o link não tinha preview decente ao compartilhar), `rel="noopener noreferrer"` em todos os links `target="_blank"`, e `defer` nos scripts de terceiros que bloqueavam o primeiro paint.
- O card "HDC Eventos" (`modals/hdc-eventos.html`) foi substituído por **Grade**, outra plataforma de gestão de eventos (mesmo stack: HTML5, CSS3, JS, Angular JS, Laravel 5, PHP), publicada em 31 de Julho de 2026 com link de repositório no GitHub — `modals/hdc-eventos.html` foi removido do repo e `js/scripts.js` passou a apontar `card_1` para `modals/grade.html`. Como Grade tem data real de publicação, ela assumiu a 1ª posição visual, empurrando os outros cards uma posição adiante (Rubrum V1 → 2º, Rubrum → 3º, Rubrum V2 seguindo por último por ainda não ter link publicado). `images/layout/project_thumb_4.png` foi reexportado/otimizado (~530KB → ~249KB) como thumbnail do novo card.
- Os arquivos da Plus Jakarta Sans em `styles/fonts/` foram substituídos por uma nova versão, com nomes no padrão `PlusJakartaSans-<Peso>.<ext>` (antes `plus_jakarta_sans_<peso>-webfont.<ext>`). Os `@font-face` em `style.css` e os `preload` em `index.html` foram reapontados para os novos arquivos; os nomes de `font-family` foram mantidos. O peso ExtraLight, que não tinha `@font-face`, não veio na nova versão.

- **Redesign editorial (branch `feature/redesign-awwwards`, set/2026):** o site foi refeito igual ao protótipo aprovado — novas seções e textos (manifesto em "Sobre", bloco "Design & código", contato "Vamos conversar?"), projetos em linhas com prévia; saíram a ilustração, o fundo de átomos, o console de skills, a grade de ferramentas e o botão Download CV. O menu mobile passou a ter "Contato", e o CTA do header rola até a seção de contato (antes era `mailto:`). Detalhes técnicos em [CLAUDE.md](CLAUDE.md). Os projetos deixaram de abrir em modal: cada um tem uma página de case própria em `projetos/` (link compartilhável, preview próprio no WhatsApp/LinkedIn, botão voltar funcionando), aberta com uma transição que expande a prévia até o topo do case.

## Itens conhecidos / débito técnico

- `styles/scss/` está vazia — preparada para um fluxo Sass que nunca foi adotado; o CSS é mantido diretamente em `styles/css/style.css`.
- `site.webmanifest` tem `name` e `short_name` vazios.
- O card 2 (Rubrum V2) ainda não tem link de projeto publicado — status "Prévia em breve".
- `plus_jakarta_sanslight` e `plus_jakarta_sansmedium` (fonte + `@font-face`) não são usados em nenhuma regra de `style.css` — mantidos por enquanto a pedido do usuário, sem custo de performance (arquivo não referenciado não é baixado).
- O cursor customizado esconde o ponteiro nativo do sistema em todo o site — texto selecionável (parágrafos do "Sobre", contato) perde o indicador visual de "aqui dá pra selecionar" (I-beam), embora a seleção em si continue funcionando. Trade-off aceito, não um bug.

## Onde procurar mais detalhes

- Stack tecnológica completa, paleta de cores e responsabilidades de cada script: [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md).
- Comandos de desenvolvimento e arquitetura de código: [CLAUDE.md](CLAUDE.md).

### Assinatura: site "compilando" ao vivo
- Em `js/site.js` (`liveBuild`): na 1ª vez que #projetos, #sobre, #servicos e #contato entram na tela (top 70%), cada bloco vira um esqueleto tracejado com a tag real (`<h2 #projTitle>`, `<li #card_1>`...) e o cursor azul em bloco passa revelando o visual final (clip-path). ~1s por seção; no canto aparece "render #secao" → "✓ compilado em 0,9s".
- Substitui as entradas antigas das linhas de projeto, stats, serviços e "Vamos conversar?". Contadores e o terminal digitando continuam.
- Voltando de um case (`tc-return`) a lista de projetos não é recompilada. Seção que passou fora da tela (âncora/menu) só é revelada. Sem animação com prefers-reduced-motion.
- CSS: bloco `/* SITE COMPILANDO */` no fim de `styles/css/style.css` (classes `lb-*`).

### Versão em inglês (/en/)
- Português é a fonte. As páginas em inglês ficam em `en/` (mesmos caminhos com o prefixo `/en`: `/en/`, `/en/projetos/grade.html`...). Elas são GERADAS por `python tools/i18n/build_en.py` — mudou texto ou estrutura em PT, rode o script de novo. As traduções (pares PT → EN) ficam no próprio script; se um texto PT mudar, o script avisa qual par atualizar.
- Botão PT/EN (`.lang-switch`, no `.nav-right`) leva para a mesma página no outro idioma e grava a escolha em `localStorage tc:lang`.
- Redirecionamento automático: script `i18n:redirect` no `<head>` das páginas PT. Na 1ª página aberta vinda de fora, se o navegador não estiver em português, vai para a versão `/en/`. Não redireciona quem já escolheu idioma, robôs/headless nem navegação interna.
- SEO: `hreflang` pt-BR / en / x-default (= en) em todas as páginas; canonical e og:url próprios em cada idioma.
- JS: `site.js` usa `T(pt, en)` conforme `<html lang>` (toast do e-mail, menu, "compilado em").
- 404: um arquivo só (`404.html`), bilíngue via atributos `data-en` + script no fim do body (inglês para `/en/...`, escolha EN ou navegador em outro idioma).
- Currículo: PT em `cv/CVTHIAGO-2025.pdf`, EN em `cv/CVTHIAGO-2025-EN.pdf` (as páginas em /en/ e a 404 em inglês apontam para o EN).
