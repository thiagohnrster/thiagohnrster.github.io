# CONTEXT.md

Contexto de negócio e conteúdo do site — complementa [CLAUDE.md](CLAUDE.md) (que foca em comandos e arquitetura técnica). Ver também [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md), a documentação técnica completa do projeto.

## O que é este projeto

Portfólio pessoal de **Thiago Celestino**, desenvolvedor front-end. Site estático (home em `index.html` + uma página por case em `projetos/`), em português com versão em inglês gerada em `/en/`, hospedado no GitHub Pages, sem back-end nem etapa de build.

- **Repositório:** `thcelestino`
- **Branch de produção:** `main` (deploy automático a cada push via `.github/workflows/jekyll-gh-pages.yml`)
- **Contato exibido no site:** e-mail `celesthiago@outlook.com`, WhatsApp `+55 11 97509-7733`, LinkedIn `linkedin.com/in/thiagohnrster`, GitHub `github.com/thiagohnrster`

## Objetivo do site

Apresentar Thiago como desenvolvedor front-end (e designer de interface) para potenciais clientes/empregadores: quem ele é, o que faz (design de interface, desenvolvimento front-end, motion), a stack (HTML5, CSS/Sass, JavaScript, GSAP, Angular JS, UI/UX) e um portfólio de projetos com uma página de case para cada um.

## Estrutura de conteúdo da página

Home (`index.html`), nesta ordem (redesign editorial, set/2026):

0. **Loading (`#pageLoader`)** — logo + barra fina + contador `000`–`100`, com progresso real; só na primeira visita da sessão. Sai como cortina e libera a entrada do hero.
1. **Header (`#nav`)** — logo, navegação Home / Sobre / Projetos, botão PT/EN, relógio de São Paulo e CTA "Entre em contato" (rola até o contato). No mobile vira menu (cortina) com Home / Sobre / Projetos / Contato, relógio, e-mail, redes e currículo.
2. **Hero (`#top`)** — nome gigante "Thiago (front-end) / Celestino", frase "Codifico interfaces elegantes…", texto de apoio e botão circular "role para explorar".
3. **Faixa da stack** — HTML5 + CSS/Sass + JavaScript + GSAP + Angular JS + UI/UX, em loop.
4. **Projetos (`#projetos`)** — "Projetos selecionados": 4 linhas com prévia que segue o cursor (no mobile, cards com a imagem); cada linha abre a página do case (tabela abaixo).
5. **Sobre (`#sobre`)** — manifesto ("Design e código a serviço de quem usa…") e 4 números: 05+ anos de experiência, 04 projetos entregues, 95% HTML · CSS · JavaScript, 1K+ xícaras de café.
6. **Serviços (`#servicos`)** — bloco azul "Design & código": design de interface, desenvolvimento front-end, motion & interação, e um terminal (`skills.js`) digitando.
7. **Contato / rodapé (`#contato`)** — "Vamos conversar?", e-mail com "Copiar e-mail" e "Baixar currículo (PDF)", links LinkedIn / GitHub / WhatsApp / Voltar ao topo e o "CELESTINO" gigante decorativo.

Ao entrar na tela pela primeira vez, Projetos, Sobre, Serviços e Contato aparecem "compilando" (esqueleto de código + cursor revelando o visual).

## Projetos exibidos (linha → página de case)

Ordem de exibição na home:

| Ordem | Página | Projeto | Linha na home | Ano | Status no case | Link |
|---|---|---|---|---|---|---|
| 01 | `projetos/grade.html` | Grade | Plataforma de gestão de eventos · Full-stack | 2026 | Publicado em 31 de julho de 2026 | repositório no GitHub |
| 02 | `projetos/rubrum-site-v2.html` | Rubrum Site V2 | Redesign da presença comercial · Landing page | 2026 | Publicado — em evolução | v2.rubrum.com.br |
| 03 | `projetos/rubrum.html` | Rubrum | Sistema de gestão de embalagens · Plataforma web | 2019 | Publicado em 24 de julho de 2019 | modelo.rubrum.com.br |
| 04 | `projetos/rubrum-site-v1.html` | Rubrum Site V1 | Promoção da plataforma comercial · Landing page | 2020 | Publicado em 05 de agosto de 2020 | www.rubrum.com.br |

Cada case traz: voltar para a lista, título, imagem principal, ficha (Ano / Tipo / Status / Link), "Sobre o projeto" + stack, telas (quando houver), "Próximo projeto" (em loop) e o mesmo rodapé de contato. Os antigos modais (`modals/*.html`) foram apagados do repo.

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
- **"Vamos conversar?" cortado no macOS (out/2026):** reportado pelo Vitor — o "?" do título do contato aparecia cortado no Mac. Corrigido (o título não é mais quebrado em caixas por palavra) e, junto, o título deixou de sair da tela em celulares de 320px (a fonte agora se limita à largura da tela). Detalhes em [CLAUDE.md](CLAUDE.md).
- **SEO técnico (out/2026):** o site ganhou `robots.txt`, `sitemap.xml` (PT + EN, com as versões de idioma ligadas) e dados estruturados schema.org em todas as páginas (quem é o Thiago, perfis do LinkedIn/GitHub, cada case como projeto com ano/stack/link, trilha Home → Projetos → case). Arquivos internos do projeto (`CLAUDE.md`, `CONTEXT.md`, `docs/`, `tools/`, `package.json`) deixaram de ser publicados no site. Nada visual mudou. Google Search Console: verificação pelo arquivo `google3b6b93f13d9fc1e3.html` na raiz (não apagar). Depois do deploy: clicar em "Verificar", enviar o `sitemap.xml` e importar a propriedade no Bing Webmaster Tools. Feito em 05/10/2026: propriedade verificada, indexação da home (PT e EN) solicitada e sitemap enviado (o "Não foi possível buscar" inicial é normal em propriedade nova). Depois vieram títulos com o nome primeiro, descrições mais completas nos cases, Open Graph completo e `rel="me"` nos links do LinkedIn/GitHub. Por último: manifest preenchido, barra do navegador no celular na cor do site (`theme-color`) e `meta keywords` removido. Pendente, opcional: segundo método de verificação no Search Console (meta tag) como reserva do arquivo HTML.

## Itens conhecidos / débito técnico

- `styles/scss/` está vazia — preparada para um fluxo Sass que nunca foi adotado; o CSS é mantido diretamente em `styles/css/style.css`.
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
