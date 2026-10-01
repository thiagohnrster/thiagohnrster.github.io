#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera a versão em inglês do site (pasta /en/) a partir das páginas em português.

    python tools/i18n/build_en.py

Regra: o português é a fonte. Mudou um texto ou a estrutura de uma página em PT?
Rode este script de novo — ele reescreve en/index.html e en/projetos/*.html.
Cada texto traduzido está nas listas abaixo (PT → EN). Se um texto PT mudar e o
par não for mais encontrado, o script para e avisa qual par precisa ser atualizado.

A 404 (404.html) é uma página só, bilíngue: os textos em inglês ficam nos
atributos data-en do próprio 404.html.
"""
import io, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BASE = 'https://thiagohnrster.github.io'

PAGES = {
    'index.html': '/',
    'projetos/grade.html': '/projetos/grade.html',
    'projetos/rubrum-site-v2.html': '/projetos/rubrum-site-v2.html',
    'projetos/rubrum.html': '/projetos/rubrum.html',
    'projetos/rubrum-site-v1.html': '/projetos/rubrum-site-v1.html',
}

# --------------------------------------------------------------------------
# Textos comuns (nav, menu, rodapé, contato). Aplicados onde existirem.
# --------------------------------------------------------------------------
COMMON = [
    ('aria-label="Thiago Celestino — início"', 'aria-label="Thiago Celestino — home"'),
    ('<nav aria-label="Principal">', '<nav aria-label="Main">'),
    ('data-label="Sobre"><span>Sobre</span>', 'data-label="About"><span>About</span>'),
    ('data-label="Projetos"><span>Projetos</span>', 'data-label="Projects"><span>Projects</span>'),
    ('data-magnetic>Entre em contato</a>', 'data-magnetic>Get in touch</a>'),
    ('aria-label="Abrir menu"', 'aria-label="Open menu"'),
    ('data-menu-link>Sobre <small>', 'data-menu-link>About <small>'),
    ('data-menu-link>Projetos <small>', 'data-menu-link>Projects <small>'),
    ('data-menu-link>Contato <small>', 'data-menu-link>Contact <small>'),
    ('</span> · Disponível</span>', '</span> · Available</span>'),
    ('/cv/CVTHIAGO-2025.pdf', '/cv/CVTHIAGO-2025-EN.pdf'),
    ('download>Currículo ↓</a>', 'download>Résumé ↓</a>'),
    ('<span class="mono muted">Contato — Tem um projeto em mente?</span>', '<span class="mono muted">Contact — Got a project in mind?</span>'),
    ('<h2 id="talk"><span data-split>Vamos</span><em data-split>conversar?</em></h2>', '<h2 id="talk"><span data-split>Let’s</span><em data-split>talk?</em></h2>'),
    ('          Copiar e-mail\n', '          Copy e-mail\n'),
    ('          Baixar currículo (PDF)\n', '          Download résumé (PDF)\n'),
    ('<nav class="links mono" aria-label="Redes">', '<nav class="links mono" aria-label="Social">'),
    ('data-scroll>Voltar ao topo ↑</a>', 'data-scroll>Back to top ↑</a>'),
    ('<span>Feito à mão em São Paulo</span>', '<span>Handmade in São Paulo</span>'),
    ('<span id="cursorLabel">ver</span>', '<span id="cursorLabel">view</span>'),
    ('desenvolvedor front-end.">', 'front-end developer.">'),
]

# Textos comuns às páginas de case
CASE = [
    ('Todos os projetos</a>', 'All projects</a>'),
    ('<dt class="mono muted">Ano</dt>', '<dt class="mono muted">Year</dt>'),
    ('<dt class="mono muted">Tipo</dt>', '<dt class="mono muted">Type</dt>'),
    ('id="sobre-projeto">Sobre o projeto</span>', 'id="sobre-projeto">About the project</span>'),
    ('aria-label="Tecnologias utilizadas"', 'aria-label="Technologies used"'),
    ('<li>Compilador LESS</li>', '<li>LESS compiler</li>'),
    ('<span class="label mono muted">Meu papel</span>', '<span class="label mono muted">My role</span>'),
    ('<span class="label mono muted">Destaque</span>', '<span class="label mono muted">Highlight</span>'),
    ('id="telas">Telas</span>', 'id="telas">Screens</span>'),
    ('<span class="mono muted">04 capturas</span>', '<span class="mono muted">04 screenshots</span>'),
    ('<span class="mono muted">05 capturas</span>', '<span class="mono muted">05 screenshots</span>'),
    ('data-cursor="ampliar"', 'data-cursor="zoom in"'),
    ('data-cursor="próximo"', 'data-cursor="next"'),
    ('Próximo projeto — (', 'Next project — ('),
    ('Acessar projeto ↗</a>', 'Visit project ↗</a>'),
    ('Acessar repositório ↗</a>', 'View repository ↗</a>'),
    (' • Case • Thiago Celestino', ' • Case Study • Thiago Celestino'),
    ('. Case do portfólio de Thiago Celestino, ', '. Case study from the portfolio of Thiago Celestino, '),
    ('(01) Case — ', '(01) Case study — '), ('(02) Case — ', '(02) Case study — '),
    ('(03) Case — ', '(03) Case study — '), ('(04) Case — ', '(04) Case study — '),
]
# "Abrir tela NN em tamanho real"
for i in range(1, 6):
    CASE.append(('aria-label="Abrir tela %02d em tamanho real"' % i, 'aria-label="Open screen %02d at full size"' % i))

# --------------------------------------------------------------------------
# Por página — todos os pares são obrigatórios (o script falha se não achar).
# --------------------------------------------------------------------------
HOME = [
    ('<meta name="description" content="Portfólio de Thiago Celestino, desenvolvedor front-end especializado em HTML, CSS e JavaScript. Criação de interfaces modernas, performáticas e responsivas.">',
     '<meta name="description" content="Portfolio of Thiago Celestino, a front-end developer specializing in HTML, CSS and JavaScript. Modern, fast and responsive interfaces.">'),
    ('<meta name="keywords" content="desenvolvedor front-end, html, css, javascript, portfolio front-end, web developer">',
     '<meta name="keywords" content="front-end developer, html, css, javascript, front-end portfolio, web developer, gsap">'),
    ('content="Portfólio • Thiago Celestino • Desenvolvedor Front-End"', 'content="Portfolio • Thiago Celestino • Front-End Developer"'),
    ('content="Portfólio de Thiago Celestino, desenvolvedor front-end especializado em HTML, CSS e JavaScript. Criação de interfaces modernas, performáticas e responsivas."',
     'content="Portfolio of Thiago Celestino, a front-end developer specializing in HTML, CSS and JavaScript. Modern, fast and responsive interfaces."'),
    ('<title>Portfólio &bull; Thiago Celestino &bull; Desenvolvedor Front-End</title>', '<title>Portfolio &bull; Thiago Celestino &bull; Front-End Developer</title>'),
    ('aria-label="Carregando página"', 'aria-label="Loading page"'),
    ('<span>Portfólio — Ed. 2026</span>', '<span>Portfolio — Ed. 2026</span>'),
    ('<span>Desenvolvedor Front-End</span>', '<span>Front-End Developer</span>'),
    ('<p class="lead" data-intro="lines">Codifico interfaces <em>elegantes,</em> ágeis e pensadas nos mínimos detalhes.</p>',
     '<p class="lead" data-intro="lines">I code <em>elegant,</em> fast interfaces, crafted down to the smallest detail.</p>'),
    ('<p class="sub" data-intro="fade">Um híbrido de designer e desenvolvedor: estética e performance no mesmo commit, com interações fluidas e impacto visual.</p>',
     '<p class="sub" data-intro="fade">Part designer, part developer: aesthetics and performance in the same commit, with fluid interactions and visual impact.</p>'),
    ('<textPath href="#circ">ROLE PARA EXPLORAR • ROLE PARA EXPLORAR • </textPath>', '<textPath href="#circ">SCROLL TO EXPLORE • SCROLL TO EXPLORE • </textPath>'),
    ('aria-label="Ir para os projetos"', 'aria-label="Go to projects"'),
    ('<span class="mono muted">4 projetos — 2019/2026</span>', '<span class="mono muted">4 projects — 2019/2026</span>'),
    ('<h2 id="projTitle">Projetos <em>selecionados</em></h2>', '<h2 id="projTitle">Selected <em>work</em></h2>'),
    ('data-cursor="ver case"', 'data-cursor="view case"'),
    ('data-cursor="ver"', 'data-cursor="view"'),
    ('<span>Plataforma de gestão de eventos</span>', '<span>Event management platform</span>'),
    ('<span>Redesign da presença comercial</span>', '<span>Redesign of the commercial website</span>'),
    ('<span>Sistema de gestão de embalagens</span>', '<span>Packaging management system</span>'),
    ('<span>Promoção da plataforma comercial</span>', '<span>Marketing site for the platform</span>'),
    ('<span class="pill">Plataforma web</span>', '<span class="pill">Web platform</span>'),
    ('<span class="label mono muted">Sobre</span>', '<span class="label mono muted">About</span>'),
    ('<p class="manifesto" id="manifesto">Design e código a serviço de <em>quem usa</em>. Desenho as telas, penso no movimento e entrego o front-end, do primeiro rascunho <em>à última transição.</em></p>',
     '<p class="manifesto" id="manifesto">Design and code in service of <em>the people who use it</em>. I design the screens, think through the motion and ship the front-end, from the first sketch <em>to the last transition.</em></p>'),
    ('<span class="mono muted">Anos de experiência</span>', '<span class="mono muted">Years of experience</span>'),
    ('<span class="mono muted">Projetos entregues</span>', '<span class="mono muted">Projects delivered</span>'),
    ('<span class="mono muted">Xícaras de café</span>', '<span class="mono muted">Cups of coffee</span>'),
    ('<span class="mono" style="font-weight:600">O que eu faço</span>', '<span class="mono" style="font-weight:600">What I do</span>'),
    ('<h2>Design <em>&amp;</em> código</h2>', '<h2>Design <em>&amp;</em> code</h2>'),
    ('<h3>Design de interface</h3><p>Do rascunho à tela final — como no Grade, desenhado do zero.</p>',
     '<h3>Interface design</h3><p>From the first sketch to the final screen — like Grade, designed from scratch.</p>'),
    ('<h3>Desenvolvimento front-end</h3><p>Desde 2019 construindo sozinho o front-end do Rubrum.</p>',
     '<h3>Front-end development</h3><p>Building Rubrum’s front-end on my own since 2019.</p>'),
    ('<h3>Motion &amp; interação</h3><p>GSAP e microinterações — como as deste site.</p>',
     '<h3>Motion &amp; interaction</h3><p>GSAP and micro-interactions — like the ones on this site.</p>'),
    ('<span class="ln">  papel: ', '<span class="ln">  role: '),
    ('<span class="ln">  foco: <span class="s">\'mínimos detalhes\'</span>,</span>', '<span class="ln">  focus: <span class="s">\'the smallest details\'</span>,</span>'),
    ('<span class="v">npm run surpreender</span>', '<span class="v">npm run surprise</span>'),
]

GRADE = [
    ('Grade — Plataforma de gestão de eventos.', 'Grade — Event management platform.'),
    ('<p class="case-lead">Plataforma de gestão de eventos</p>', '<p class="case-lead">Event management platform</p>'),
    ('alt="Tela do projeto Grade"', 'alt="Screen from the Grade project"'),
    ('<dd>Publicado em 31 de julho de 2026</dd>', '<dd>Published on July 31, 2026</dd>'),
    ('<p>Plataforma web para gerenciamento e divulgação de eventos, permitindo a criação, organização e acompanhamento de eventos de forma centralizada.</p>',
     '<p>A web platform for managing and promoting events, so events can be created, organized and tracked in one place.</p>'),
    ('<p>O sistema oferece recursos para cadastro de eventos, gerenciamento de participantes, exibição de informações detalhadas e integração entre organizadores e usuários.</p>',
     '<p>It covers event registration, attendee management, detailed event pages and the connection between organizers and attendees.</p>'),
    ('<p>Projeto pessoal, feito do zero por mim: design das telas, front-end e back-end em Laravel. Um jeito de levar uma ideia inteira do rascunho ao ar, sem depender de ninguém.</p>',
     '<p>A personal project, built from scratch by me: the screen design, the front-end and a Laravel back-end. A way to take a whole idea from sketch to live on my own.</p>'),
    ('<p>A busca de eventos. Logo na entrada, uma pergunta simples — encontre o próximo evento da sua área — e um campo que leva direto ao que interessa.</p>',
     '<p>The event search. Right at the entrance, one simple prompt — find the next event in your field — and a single field that takes you straight to what matters.</p>'),
    ('<p>O resto da plataforma foi pensado a partir dela: descobrir primeiro, organizar depois.</p>',
     '<p>The rest of the platform was designed around it: discover first, organize later.</p>'),
    ('alt="Home do Grade com faixa roxa, o título “Encontre o próximo evento da sua área”, campo de busca e cards dos próximos eventos"',
     'alt="Grade home page with a purple banner, the heading “Encontre o próximo evento da sua área” (find the next event in your field), a search field and cards for upcoming events"'),
    ('</span> Home — busca em destaque e os próximos eventos</figcaption>', '</span> Home — search up front and the upcoming events</figcaption>'),
    ('alt="Página do evento Dominando Claude na Prática no Grade, com banner, descrição, recursos do evento e card com data, local, confirmados e organizador"',
     'alt="Event page for “Dominando Claude na Prática” on Grade, with a banner, description, event amenities and a card with date, city, attendees and organizer"'),
    ('</span> Página do evento — descrição, data, local e organizador</figcaption>', '</span> Event page — description, date, location and organizer</figcaption>'),
    ('alt="Resultado da busca por “Claude” no Grade mostrando o card do evento Dominando Claude na Prática"',
     'alt="Grade search results for “Claude” showing the card for the event “Dominando Claude na Prática”"'),
    ('</span> Busca de eventos — resultados por palavra-chave</figcaption>', '</span> Event search — results by keyword</figcaption>'),
    ('alt="Tela de login do Grade com fundo escuro quadriculado e card branco com e-mail e senha"',
     'alt="Grade sign-in screen with a dark grid background and a white card with e-mail and password fields"'),
    ('</span> Login — tela de entrada</figcaption>', '</span> Sign-in screen</figcaption>'),
    ('alt="Lista de eventos do Grade com a busca fixa no menu ao rolar e o rodapé escuro com a marca"',
     'alt="Grade event list with the search pinned to the header while scrolling, and the dark footer with the logo"'),
    ('</span> Cards de eventos, busca fixa no topo e rodapé</figcaption>', '</span> Event cards, search pinned to the top, and footer</figcaption>'),
]

V2 = [
    ('Rubrum Site V2 — Redesign da presença comercial.', 'Rubrum Site V2 — Redesign of the commercial website.'),
    ('<p class="case-lead">Redesign da presença comercial</p>', '<p class="case-lead">Redesign of the commercial website</p>'),
    ('alt="Tela do projeto Rubrum Site V2"', 'alt="Screen from the Rubrum Site V2 project"'),
    ('<dd>Publicado — em evolução</dd>', '<dd>Live — still evolving</dd>'),
    ('<p>Redesign completo do site comercial da plataforma Rubrum, sistema de gerenciamento de embalagens.</p>',
     '<p>A complete redesign of the commercial website for Rubrum, a packaging management platform.</p>'),
    ('<p>O projeto apresenta uma nova identidade visual com foco em clareza, modernidade e conversão, comunicando de forma objetiva os diferenciais da plataforma para o público-alvo.</p>',
     '<p>It brings a new visual identity focused on clarity, a modern look and conversion, presenting what sets the platform apart in a direct way for its audience.</p>'),
    ('<span class="dot"></span>No ar em v2.rubrum.com.br — e seguindo em evolução', '<span class="dot"></span>Live at v2.rubrum.com.br — and still evolving'),
    ('<p>Estou programando o front-end do redesign do site comercial.</p>', '<p>I’m building the front-end of the commercial website redesign.</p>'),
    ('<span class="label mono muted">O que muda</span>', '<span class="label mono muted">What changes</span>'),
    ('<p>Em relação ao V1, muda tudo um pouco: identidade visual mais moderna e limpa, animações com GSAP que dão ritmo à página e um texto mais focado em vender — benefícios claros e chamadas diretas para agendar uma demonstração.</p>',
     '<p>Compared to V1, a bit of everything changes: a cleaner, more modern visual identity, GSAP animations that give the page its rhythm, and copy that is more focused on selling — clear benefits and direct calls to book a demo.</p>'),
    ('alt="Hero do site Rubrum V2 com o título “Gestão de artes simplificada e sem riscos” e uma ilustração 3D de embalagem"',
     'alt="Rubrum V2 hero with the heading “Gestão de artes simplificada e sem riscos” (artwork management made simple and risk-free) and a 3D packaging illustration"'),
    ('</span> Hero — produto em 3D e chamada para agendar uma demonstração</figcaption>', '</span> Hero — 3D product and a call to book a demo</figcaption>'),
    ('alt="Seção “Onde problemas recorrentes viram soluções inteligentes” com card sobre a última versão das artes e prévia de artes, facas e mockups"',
     'alt="Section “Onde problemas recorrentes viram soluções inteligentes” (where recurring problems become smart solutions) with a card about the latest artwork version and a preview of artwork, dielines and mockups"'),
    ('</span> O Software — problemas e soluções em cards que deslizam</figcaption>', '</span> The software — problems and solutions in sliding cards</figcaption>'),
    ('alt="Seção “Travas inteligentes que bloqueiam erros manuais” com card escuro de organização automática e ilustração 3D de pastas"',
     'alt="Section “Travas inteligentes que bloqueiam erros manuais” (smart locks that block manual errors) with a dark card about automatic organization and a 3D folder illustration"'),
    ('</span> Diferenciais — travas inteligentes contra erros manuais</figcaption>', '</span> Differentiators — smart locks against manual errors</figcaption>'),
    ('alt="Carrossel com os cards Migração de artes, Personalização visual, Treinamentos ao vivo e Acesso seguro com SSO"',
     'alt="Carousel with the cards Artwork migration, Visual customization, Live training and Secure SSO access"'),
    ('</span> Implantação — carrossel de serviços de apoio</figcaption>', '</span> Onboarding — carousel of support services</figcaption>'),
]

RUBRUM = [
    ('Rubrum — Sistema de gestão de embalagens.', 'Rubrum — Packaging management system.'),
    ('<p class="case-lead">Sistema de gestão de embalagens</p>', '<p class="case-lead">Packaging management system</p>'),
    ('Case study — Plataforma web</span>', 'Case study — Web platform</span>'),
    ('<dd>Plataforma web</dd>', '<dd>Web platform</dd>'),
    ('alt="Tela do projeto Rubrum"', 'alt="Screen from the Rubrum project"'),
    ('<dd>Publicado em 24 de julho de 2019</dd>', '<dd>Published on July 24, 2019</dd>'),
    ('<p>Plataforma web SaaS completa para gerenciamento de embalagens, permitindo todo o controle centralizado, rastreamento e organização em toda a cadeia de produção.</p>',
     '<p>A complete SaaS web platform for packaging management, with centralized control, tracking and organization across the whole production chain.</p>'),
    ('<p>O sistema oferece uma interface intuitiva para cadastro, consulta e acompanhamento do desenvolvimento das embalagens em tempo real.</p>',
     '<p>It offers an intuitive interface for registering, looking up and following packaging development in real time.</p>'),
    ('<p>Cuido do front-end do Rubrum desde a primeira versão, em 2019. Sou o único desenvolvedor front-end do produto: toda tela que o usuário vê foi construída por mim, integrada ao back-end em Laravel.</p>',
     '<p>I’ve been in charge of Rubrum’s front-end since its first version, in 2019. I’m the product’s only front-end developer: every screen users see was built by me, wired into the Laravel back-end.</p>'),
    ('<p>A linha do tempo de aprovação. Cada arte passa por várias etapas — edição, revisão, aprovações, envio ao fornecedor e encerramento — e a linha mostra, num só olhar, em que ponto ela está e o que ainda falta.</p>',
     '<p>The approval timeline. Every artwork goes through several stages — editing, review, approvals, sending to the supplier and closing — and the timeline shows at a glance where it stands and what is still left.</p>'),
    ('<p>É a parte do sistema que deixa um processo longo, com muitas pessoas envolvidas, simples de acompanhar.</p>',
     '<p>It’s the part of the system that makes a long process, with many people involved, easy to follow.</p>'),
    ('<span class="mono muted">04 capturas — ambiente de demonstração</span>', '<span class="mono muted">04 screenshots — demo environment</span>'),
    ('alt="Tela de um ticket no Rubrum com a timeline de aprovação (Aberto, Edição, Revisão, Primeira Aprovação, Demais Aprovações, Finalização, Envio da Arte, PDF do Fornecedor e Encerramento) e as instruções do ciclo"',
     'alt="A ticket in Rubrum with the approval timeline (Opened, Editing, Review, First approval, Other approvals, Finalization, Artwork delivery, Supplier PDF and Closing) and the cycle instructions"'),
    ('</span> Ticket — a timeline de aprovação, etapa por etapa</figcaption>', '</span> Ticket — the approval timeline, stage by stage</figcaption>'),
    ('alt="Lista de tickets do workflow no Rubrum, cada um com ícones mostrando em que etapa da aprovação está"',
     'alt="Workflow ticket list in Rubrum, each ticket with icons showing which approval stage it is in"'),
    ('</span> Workflow — tickets com o status de cada etapa</figcaption>', '</span> Workflow — tickets with the status of each stage</figcaption>'),
    ('alt="Dashboard do Rubrum com indicadores de tickets em andamento, atrasados e funções do usuário"',
     'alt="Rubrum dashboard with indicators for tickets in progress, overdue tickets and the user’s roles"'),
    ('</span> Dashboard — indicadores dos tickets</figcaption>', '</span> Dashboard — ticket indicators</figcaption>'),
    ('alt="Página do produto Ruby Cola no Rubrum listando as embalagens de mercado com códigos de barras"',
     'alt="Ruby Cola product page in Rubrum listing its market packaging with barcodes"'),
    ('</span> Produto — todas as embalagens de uma marca</figcaption>', '</span> Product — every package of a brand</figcaption>'),
]

V1 = [
    ('Rubrum Site V1 — Promoção da plataforma comercial.', 'Rubrum Site V1 — Marketing site for the platform.'),
    ('<p class="case-lead">Promoção da plataforma comercial</p>', '<p class="case-lead">Marketing site for the platform</p>'),
    ('alt="Tela do projeto Rubrum Site V1"', 'alt="Screen from the Rubrum Site V1 project"'),
    ('<dd>Publicado em 05 de agosto de 2020</dd>', '<dd>Published on August 5, 2020</dd>'),
    ('<p>Primeiro site comercial desenvolvido para divulgar a plataforma Rubrum, sistema de gerenciamento de embalagens.</p>',
     '<p>The first commercial website built to promote Rubrum, a packaging management platform.</p>'),
    ('<p>O projeto estabeleceu a presença digital da plataforma, apresentando suas funcionalidades e diferenciais de forma acessível para potenciais clientes.</p>',
     '<p>It established the platform’s online presence, presenting its features and differentiators in an approachable way for potential customers.</p>'),
    ('<p>Programei o front-end do primeiro site comercial do Rubrum — a porta de entrada da plataforma na internet.</p>',
     '<p>I built the front-end of Rubrum’s first commercial website — the platform’s front door on the web.</p>'),
    ('<span class="label mono muted">Objetivo</span>', '<span class="label mono muted">Goal</span>'),
    ('<p>O objetivo era direto: apresentar o sistema de forma clara para quem ainda não conhecia a ideia de gerenciar artes de embalagem num só lugar.</p>',
     '<p>The goal was simple: present the system clearly to people who weren’t yet familiar with the idea of managing packaging artwork in one place.</p>'),
    ('alt="Hero do site Rubrum V1 em vermelho com o título “Gestão de artes simplificada e sem riscos” e uma lata Ruby Cola cercada por cards de recursos"',
     'alt="Red Rubrum V1 hero with the heading “Gestão de artes simplificada e sem riscos” (artwork management made simple and risk-free) and a Ruby Cola can surrounded by feature cards"'),
    ('</span> Hero — lata com os recursos do sistema em cards</figcaption>', '</span> Hero — a can with the system’s features in cards</figcaption>'),
    ('alt="Seção “Use um fluxo validado por líderes de mercado” com a tela de um ticket do sistema Rubrum dentro de um notebook"',
     'alt="Section “Use um fluxo validado por líderes de mercado” (use a workflow validated by market leaders) with a Rubrum ticket screen inside a laptop"'),
    ('</span> Fluxo validado — o sistema dentro do notebook</figcaption>', '</span> Proven workflow — the system inside a laptop</figcaption>'),
    ('alt="Seção “Todas as embalagens na sua mão” com a lista de embalagens do sistema num tablet e o menu de ações aberto"',
     'alt="Section “Todas as embalagens na sua mão” (all your packaging in your hand) with the system’s packaging list on a tablet and the actions menu open"'),
    ('</span> Arquivos — todas as embalagens num tablet</figcaption>', '</span> Files — all the packaging on a tablet</figcaption>'),
    ('alt="Seção “Fotos e mockups 3D sempre atualizados” com o catálogo de embalagens Ruby Cola dentro de um notebook"',
     'alt="Section “Fotos e mockups 3D sempre atualizados” (photos and 3D mockups always up to date) with the Ruby Cola packaging catalog inside a laptop"'),
    ('</span> Catálogo digital — fotos e mockups 3D</figcaption>', '</span> Digital catalog — photos and 3D mockups</figcaption>'),
]

PER_PAGE = {
    'index.html': HOME,
    'projetos/grade.html': GRADE,
    'projetos/rubrum-site-v2.html': V2,
    'projetos/rubrum.html': RUBRUM,
    'projetos/rubrum-site-v1.html': V1,
}


def lang_switch_pt(pt_path):
    return ('<a class="lang-switch mono" href="%s" hreflang="pt-BR" lang="pt-BR" data-lang="pt" '
            'aria-label="Ler esta página em português"><span aria-hidden="true">PT</span>'
            '<span class="is-on" aria-hidden="true">EN</span></a>') % pt_path


def build(rel, pt_path):
    src = io.open(os.path.join(ROOT, rel), encoding='utf-8').read()
    s = src
    errors = []

    # 1) idioma e metadados
    s = s.replace('<html lang="pt-BR">', '<html lang="en">', 1)
    s = s.replace('<meta property="og:locale" content="pt_BR">\n\t<meta property="og:locale:alternate" content="en_US">',
                  '<meta property="og:locale" content="en_US">\n\t<meta property="og:locale:alternate" content="pt_BR">', 1)
    en_path = '/en' + pt_path
    s = s.replace('<link rel="canonical" href="%s%s">' % (BASE, pt_path), '<link rel="canonical" href="%s%s">' % (BASE, en_path), 1)
    s = s.replace('<meta property="og:url" content="%s%s">' % (BASE, pt_path), '<meta property="og:url" content="%s%s">' % (BASE, en_path), 1)

    # 2) sem redirecionamento automático na versão em inglês
    s = re.sub(r'\t<!-- i18n:redirect.*?<!-- /i18n:redirect -->\n', '', s, count=1, flags=re.S)

    # 3) caminhos: tudo que aponta para páginas do site ganha /en
    s = s.replace('href="/"', 'href="/en/"')
    s = s.replace('href="/#', 'href="/en/#')
    s = s.replace('href="/projetos/', 'href="/en/projetos/')
    s = s.replace('"href_matches":"/projetos/*"', '"href_matches":"/en/projetos/*"')
    # a home usa caminhos relativos para CSS/JS/fontes — em /en/ eles precisam ser absolutos
    s = s.replace('href="styles/', 'href="/styles/').replace('src="js/', 'src="/js/')

    # 4) botão de idioma aponta de volta para o português
    s, n = re.subn(r'<a class="lang-switch[^>]*>.*?</a>', lambda m: lang_switch_pt(pt_path), s, count=1, flags=re.S)
    if not n:
        errors.append('botão .lang-switch não encontrado')

    # 5) textos
    for a, b in COMMON + (CASE if rel.startswith('projetos/') else []):
        s = s.replace(a, b)
    for a, b in PER_PAGE[rel]:
        if a not in s:
            errors.append('texto PT não encontrado: ' + a[:90])
        s = s.replace(a, b)

    if errors:
        print('ERRO em %s:\n  - %s' % (rel, '\n  - '.join(errors)))
        return False

    out = os.path.join(ROOT, 'en', rel)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with io.open(out, 'w', encoding='utf-8', newline='') as f:
        f.write(s)
    print('ok  en/%s' % rel)
    return True


if __name__ == '__main__':
    ok = all([build(rel, path) for rel, path in PAGES.items()])
    sys.exit(0 if ok else 1)
