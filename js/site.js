// Cores usadas nas animações de reveal dos títulos (apagada -> acesa)
const TITLE_COLOR_DIM = '#0e253f';
const TITLE_COLOR_LIT = '#7c90a6';
const TITLE_ACCENT_DIM = '#09375c';
const TITLE_ACCENT_LIT = '#2cb4ff';
const titleCharColor = (isDim, target) => target.closest('.accent')
    ? (isDim ? TITLE_ACCENT_DIM : TITLE_ACCENT_LIT)
    : (isDim ? TITLE_COLOR_DIM : TITLE_COLOR_LIT);

// Adia o disparo de uma entrada até o loader (js/loader.js) liberar a página;
// sem isso a entrada do hero tocaria enquanto fontes/ilustração ainda carregam.
const whenPageReady = (cb) => {
    if (window.__pageLoader && window.__pageLoader.ready && typeof window.__pageLoader.ready.then === 'function') {
        window.__pageLoader.ready.then(cb);
    } else {
        cb();
    }
};

gsap.registerPlugin(ScrollTrigger);

// Scroll suave compartilhado por âncoras — usado tanto pelos links do menu
// (aqui embaixo) quanto pelos elementos .scroll-to em js/scripts.js. Fica em
// site.js porque este script já carrega (defer) antes do corpo de scripts.js
// rodar (dentro do $(document).ready).
const SCROLL_GAP = 40;

// Ao navegar para outra seção, pageYOffset > 0 e o header assume a classe
// "scrolled" (altura menor) assim que o scroll começa. Por isso o destino
// precisa ser calculado com a altura que o header terá em repouso, não com
// a altura atual — senão a seção anterior fica "vazando" alguns pixels
// abaixo do header quando as duas alturas divergem.
const headerHAtRest = () => {
    const $header = $('header');
    const wasScrolled = $header.hasClass('scrolled');
    if (!wasScrolled) $header.addClass('scrolled');
    const h = $header.outerHeight() || 0;
    if (!wasScrolled) $header.removeClass('scrolled');
    return h;
};

// Calcula o destino do scroll suave até `target` (seletor, elemento ou
// objeto jQuery) e dispara window.scrollTo. Seções como #sobre e #projetos
// têm 180px de padding-top no .content (respiro usado pela animação de
// entrada do título); por isso ancoramos na tag .pre-title visível quando
// ela existir, em vez do topo da própria section.
window.smoothScrollTo = function (target) {
    const $target = $(target);

    if (!$target.length) return;

    const $anchor = $target.find('.content .pre-title').first();
    const $scrollTarget = $anchor.length ? $anchor : $target;

    const targetY = $scrollTarget[0].getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - headerHAtRest() - SCROLL_GAP;

    window.scrollTo({ top: targetY, behavior: 'smooth' });
};

// Efeito de "digitação" nos pre-titles: o texto após o "//" vira um bloco que
// revela via width (com ease em steps, pra parecer caractere a caractere) e um
// caret que só some quando a digitação termina. Retorna um timeline pausado pra
// ser encaixado (via .add(tl, pos)) na MESMA timeline/ScrollTrigger que já faz
// o fade da section — sincroniza por construção, não por coincidência de tempo.
function preparePreTitleTyping(span, opts) {
    opts = opts || {};
    const CHAR_DURATION = opts.charDuration || 0.035;
    const MIN_DURATION = opts.minDuration || 0.2;
    const HIDE_DELAY = opts.hideDelay || 0.4;

    if (!span) return null;

    const accent = span.querySelector('.accent');
    const textNode = accent ? accent.nextSibling : span.firstChild;

    if (!textNode || textNode.nodeType !== Node.TEXT_NODE || !textNode.textContent.trim()) return null;

    const text = textNode.textContent;

    const typed = document.createElement('span');
    typed.className = 'pre-title-typed';
    typed.textContent = text;

    span.replaceChild(typed, textNode);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(typed, { width: 'auto' });
        return null;
    }

    const cursor = document.createElement('i');
    cursor.className = 'pre-title-cursor';
    span.appendChild(cursor);

    const fullWidth = typed.scrollWidth;
    gsap.set(typed, { width: 0 });

    // Sem "paused: true": este timeline é sempre encaixado (.add) dentro de outro
    // que já controla play/reverse (tlReveal ou o timeline com scrollTrigger) —
    // um timeline aninhado que nasce pausado fica travado mesmo com o pai tocando.
    return gsap.timeline({
        onComplete: () => cursor.classList.add('is-hidden'),
        onReverseComplete: () => cursor.classList.remove('is-hidden')
    }).to(typed, {
        width: fullWidth,
        duration: Math.max(text.length * CHAR_DURATION, MIN_DURATION),
        ease: `steps(${text.length})`
    })
        // espera com o caret ainda piscando antes de sumir, em vez de sumir na hora
        .to({}, { duration: HIDE_DELAY });
}

(function navActiveBySectionRange() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', navActiveBySectionRange);
        return;
    }

    const $nav = $('.navigation');
    const $header = $('header');
    const headerH = () => ($header.outerHeight() || 0);

    const $links = $nav.find('a.nav-link[href^="#"]');
    const sections = [];

    $links.each(function () {
        const href = $(this).attr('href');

        if (!href || href === '#' || href.indexOf('#') !== 0) return;

        const el = document.querySelector(href);

        if (!el) return;

        if (sections.some(s => s.id === href)) return;

        sections.push({ id: href, el, $link: $(this), start: 0, end: 0 });
    });

    if (!sections.length) return;

    $links.on('click', function (e) {
    	const href = $(this).attr('href');

        if (!href || href[0] !== '#') return;

        const $target = $(href);

        if (!$target.length) return;

        e.preventDefault();

        window.smoothScrollTo($target);
    });

    function closestSectionId(el) {
        if (!el) return null;

        let n = el.nodeType === 1 ? el : el.parentElement;

        while (n) {
            if (n.tagName && n.tagName.toLowerCase() === 'section' && n.id) return '#' + n.id;

            n = n.parentElement;
        }

        return null;
    }

    function computeRanges() {
        const pageY = window.pageYOffset || document.documentElement.scrollTop || 0;

        const hH = headerH();

        sections.forEach(s => {
            const rect = s.el.getBoundingClientRect();
            const top = rect.top + pageY;
            const end = rect.bottom + pageY;
            s.start = Math.max(0, Math.round(top - hH));
            s.end = Math.round(end - hH);
        });

        if (window.ScrollTrigger) {
            const triggers = ScrollTrigger.getAll();
            triggers.forEach(st => {
                if (!st || !st.vars || !st.vars.pin) return;      // só pins

                const trg = st.vars.trigger;

                if (!(trg instanceof Element)) return;

                const secId = closestSectionId(trg);

                if (!secId) return;

                const s = sections.find(x => x.id === secId);

                if (!s) return;

                if (typeof st.start === 'number') s.start = Math.min(s.start, Math.round(st.start - hH));

                if (typeof st.end === 'number') s.end = Math.max(s.end, Math.round(st.end - hH));
            });
        }

        // ordena por início
        sections.sort((a, b) => a.start - b.start);
    }

    // Marca link ativo pelo scrollY dentro do intervalo da seção
    let ticking = false;
    function onScroll() {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
            ticking = false;

            const yScroll = (window.pageYOffset || document.documentElement.scrollTop || 0);

            const y = yScroll + window.innerHeight * 0.33;

            let active = null;

            for (let i = 0; i < sections.length; i++) {
                const s = sections[i];
                if (y >= s.start && y < s.end) { active = s; break; }
            }

            if (!active) {
                const center = y;
                let best = null, bestDist = Infinity;

                sections.forEach(s => {
                    const mid = (s.start + s.end) / 2;
                    const d = Math.abs(center - mid);
                    if (d < bestDist) { bestDist = d; best = s; }
                });

                active = best || sections[0];
            }

            $links.removeClass('is-active').removeAttr('aria-current');

            if (active && active.$link) {
                active.$link.addClass('is-active').attr('aria-current', 'page');
            }
        });
    }

    function fullRecalc() { computeRanges(); onScroll(); }

    fullRecalc();

    window.addEventListener('load', fullRecalc);

    requestAnimationFrame(fullRecalc);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { fullRecalc(); });

    if (window.ScrollTrigger) {
        ScrollTrigger.addEventListener('refresh', fullRecalc);
        ScrollTrigger.addEventListener('refreshInit', () => { /* noop */ });
    }
})();

(function heroIntro() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', heroIntro);
        return;
    }
    if (!window.gsap) { console.error('[heroIntro] GSAP não encontrado'); return; }

    const hero = document.querySelector('#intro.hero') || document.querySelector('#intro');
    
    if (!hero) return;

    const badge = hero.querySelector('.hero-right .hero-pre-title span');
    const title = hero.querySelector('.hero-right .hero-title');
    const social = Array.from(hero.querySelectorAll('.hero-right .hero-social'));
    const btns = Array.from(hero.querySelectorAll('.hero-right .btn-group'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SplitCtor = (window.SplitType && (window.SplitType.default || window.SplitType)) || null;

    // Timeline (play na entrada, reverse na saída)
    let split = null, charTargets = [];
    const tlReveal = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .fromTo(badge, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 0)
        .fromTo(title, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.05)
        .fromTo(btns, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.05 }, 0.12)
        .fromTo(social, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.05 }, 0.32);

    // digitação do pre-title na mesma posição (0) do fade do badge, pra tocarem juntos
    const badgeTypeTl = preparePreTitleTyping(badge);
    if (badgeTypeTl) tlReveal.add(badgeTypeTl, 0);

    function buildSplitChars() {
        try { split && split.revert(); } catch (_) { }
        charTargets = [];
        if (title && SplitCtor && !reduceMotion) {
            try {
                split = new SplitCtor(title, { types: 'chars' });
                charTargets = split.chars || [];
                gsap.set(title, { overflow: 'hidden' });
                // remove tween antigo dos chars
                tlReveal.getChildren().forEach(t => { if (t.vars && t.vars.data === 'hero-chars') t.kill(); });
                gsap.set(charTargets, { color: (i, target) => titleCharColor(true, target) });
                tlReveal.to(charTargets, {
                    data: 'hero-chars',
                    color: (i, target) => titleCharColor(false, target),
                    duration: 0.28,
                    ease: 'power3.out',
                    stagger: { each: 0.02, from: 'start' }
                }, 0.05);
                const p = tlReveal.progress(); tlReveal.progress(0).progress(p);
            } catch { }
        }
    }
    
    buildSplitChars();

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.target !== hero) return;
            if (reduceMotion) {
                gsap.set([badge, title, social, btns], { clearProps: 'all', autoAlpha: 1, y: 0, scale: 1 });
                return;
            }
            if (entry.isIntersecting) {
                hero.classList.add('is-in');
                tlReveal.play();
            } else {
                hero.classList.remove('is-in');
                tlReveal.reverse();
            }
        });
    }, { threshold: 0.35 });

    whenPageReady(() => io.observe(hero));

    window.addEventListener('pagehide', () => {
        io.disconnect();
        try { split && split.revert(); } catch (_) { }
        try { tlReveal && tlReveal.kill(); } catch (_) { }
    });
})();

(function heroLeft() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', heroLeft);
        return;
    }

    const hero = document.querySelector('#intro.hero') || document.querySelector('#intro');
    
    if (!hero) return;

    const layers = [
        hero.querySelector('.hero-left img'),
    ].filter(Boolean);
    
    if (!layers.length) return;

    gsap.set(layers, { autoAlpha: 0, y: 0, scale: 0.9, force3D: true });

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .to(layers, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12 });

    whenPageReady(() => ScrollTrigger.create({
        trigger: hero,
        start: 'top 95%',
        end: 'bottom 80%',
        onToggle: self => self.isActive ? tl.play() : tl.reverse()
    }));

    gsap.timeline({
        scrollTrigger: {
            trigger: hero,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    }).to(layers[0], { yPercent: -10 }, 0)
})();


(function heroRight() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', heroRight);
        return;
    }

    const hero = document.querySelector('#intro.hero') || document.querySelector('#intro');
    
    if (!hero) return;

    const layers = [
        hero.querySelector('.hero-right'),
    ].filter(Boolean);
    
    if (!layers.length) return;

    gsap.set(layers, { autoAlpha: 0, force3D: true });

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .to(layers, { autoAlpha: 1, duration: 0.8, stagger: 0.12 });

    whenPageReady(() => ScrollTrigger.create({
        trigger: hero,
        start: 'top 95%',
        end: 'bottom 80%',
        onToggle: self => self.isActive ? tl.play() : tl.reverse()
    }));

    gsap.timeline({
        scrollTrigger: {
            trigger: hero,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });
})();

// Fundo decorativo do hero: ícones de componentes de UI (botão, toggle, checkbox...)
// à deriva atrás do conteúdo, em canvas 2D simples — nada de partículas pesadas.
// Fica pausado sempre que a seção sai da viewport, a aba perde foco, ou o usuário
// pede movimento reduzido (nesse caso desenha só um quadro estático, sem loop).
(function heroAtomsBackground() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', heroAtomsBackground);
        return;
    }

    const hero = document.querySelector('#intro.hero') || document.querySelector('#intro');
    const container = hero && hero.querySelector('.container');
    const canvas = hero && hero.querySelector('.hero-atoms');

    if (!hero || !container || !canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const TYPES = ['button', 'toggle', 'checkbox', 'radio', 'chevron', 'cursor', 'badge', 'slider', 'bell', 'search'];
    const COUNT = 240;
    const SCROLL_RANGE = 999; // deslocamento (px) do plano mais à frente entre o hero entrar e sair da tela

    let atoms = [];
    let W = 0, H = 0;
    let raf = null;
    let running = false;
    let inViewport = false;
    const mouse = { x: 0, y: 0 };
    const scrollState = { y: 0.5 }; // 0 = hero entrando por baixo, 1 = saindo por cima

    function roundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
    }

    // Vocabulário de UI (botão, toggle, checkbox...) em vez de sintaxe de código
    // ou pontos conectados — pra remeter a front-end sem cair nesses dois clichês.
    function drawShape(c, type, s) {
        switch (type) {
            case 'button':
                roundRect(c, -s, -s * 0.32, s * 2, s * 0.64, s * 0.32); c.stroke();
                break;
            case 'toggle':
                roundRect(c, -s * 0.9, -s * 0.4, s * 1.8, s * 0.8, s * 0.4); c.stroke();
                c.beginPath(); c.arc(s * 0.5, 0, s * 0.28, 0, Math.PI * 2); c.stroke();
                break;
            case 'checkbox':
                roundRect(c, -s * 0.5, -s * 0.5, s, s, s * 0.15); c.stroke();
                c.beginPath(); c.moveTo(-s * 0.22, 0); c.lineTo(-s * 0.05, s * 0.22); c.lineTo(s * 0.3, -s * 0.25); c.stroke();
                break;
            case 'radio':
                c.beginPath(); c.arc(0, 0, s * 0.5, 0, Math.PI * 2); c.stroke();
                c.beginPath(); c.arc(0, 0, s * 0.16, 0, Math.PI * 2); c.fill();
                break;
            case 'chevron':
                c.beginPath(); c.moveTo(-s * 0.4, -s * 0.2); c.lineTo(0, s * 0.25); c.lineTo(s * 0.4, -s * 0.2); c.stroke();
                break;
            case 'cursor':
                c.beginPath();
                c.moveTo(-s * 0.3, -s * 0.5); c.lineTo(s * 0.35, s * 0.05); c.lineTo(s * 0.02, s * 0.1);
                c.lineTo(s * 0.18, s * 0.5); c.lineTo(-s * 0.02, s * 0.58); c.lineTo(-s * 0.2, s * 0.15); c.lineTo(-s * 0.42, s * 0.22);
                c.closePath(); c.stroke();
                break;
            case 'badge':
                roundRect(c, -s * 0.6, -s * 0.32, s * 1.2, s * 0.64, s * 0.32); c.stroke();
                c.beginPath(); c.arc(-s * 0.3, 0, s * 0.08, 0, Math.PI * 2); c.fill();
                break;
            case 'slider':
                c.beginPath(); c.moveTo(-s * 0.7, 0); c.lineTo(s * 0.7, 0); c.stroke();
                c.beginPath(); c.arc(s * 0.1, 0, s * 0.18, 0, Math.PI * 2); c.stroke();
                break;
            case 'bell':
                c.beginPath(); c.arc(0, -s * 0.05, s * 0.35, Math.PI, 0); c.lineTo(s * 0.42, s * 0.28); c.lineTo(-s * 0.42, s * 0.28); c.closePath(); c.stroke();
                c.beginPath(); c.arc(0, s * 0.38, s * 0.08, 0, Math.PI * 2); c.stroke();
                break;
            case 'search':
                c.beginPath(); c.arc(-s * 0.05, -s * 0.05, s * 0.35, 0, Math.PI * 2); c.stroke();
                c.beginPath(); c.moveTo(s * 0.22, s * 0.22); c.lineTo(s * 0.5, s * 0.5); c.stroke();
                break;
        }
    }

    function resize() {
        const rect = container.getBoundingClientRect();
        W = rect.width; H = rect.height;
        canvas.width = W * DPR; canvas.height = H * DPR;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        // Sem isso, mouse.x/y ficam em (0,0) — bem à esquerda do centro — até o
        // primeiro mousemove dentro do hero, enviesando o paralaxe pra esquerda
        // (e cortando átomos nessa borda) assim que a página carrega.
        mouse.x = W / 2;
        mouse.y = H / 2;
    }

    function makeAtoms() {
        atoms = [];
        for (let i = 0; i < COUNT; i++) {
            // Profundidade contínua (0.2 longe .. 1.0 perto) — tamanho, opacidade,
            // espessura do traço e força do paralaxe derivam todos dela, em vez de
            // só dois grupos fixos. É o que vende a sensação de vários planos.
            const depth = 0.2 + Math.random() * 0.8;
            atoms.push({
                type: TYPES[i % TYPES.length],
                x: Math.random() * W,
                y: Math.random() * H,
                s: 10 + depth * 24,
                vx: (Math.random() - 0.5) * (0.04 + depth * 0.10),
                vy: (Math.random() - 0.5) * (0.04 + depth * 0.10),
                rot: Math.random() * Math.PI * 2,
                vr: (Math.random() - 0.5) * 0.0025,
                depth,
                opacity: 0.05 + depth * 0.11,
                lineWidth: 0.9 + depth * 0.8
            });
        }
    }

    function frame() {
        if (!W || !H) return;
        ctx.clearRect(0, 0, W, H);
        const px = (mouse.x - W / 2) * 0.03;
        const py = (mouse.y - H / 2) * 0.03;
        const scrollY = (scrollState.y - 0.5) * SCROLL_RANGE;
        atoms.forEach((a) => {
            ctx.save();
            ctx.translate(a.x + px * a.depth, a.y + py * a.depth + scrollY * a.depth);
            ctx.rotate(a.rot);
            ctx.strokeStyle = `rgba(95, 196, 255, ${a.opacity})`;
            ctx.fillStyle = ctx.strokeStyle;
            ctx.lineWidth = a.lineWidth;
            drawShape(ctx, a.type, a.s);
            ctx.restore();
        });
    }

    function tick() {
        // O wrap precisa considerar a posição RENDERIZADA (com paralaxe de mouse
        // e scroll), não só a lógica — senão um átomo "escondido" além da borda
        // pode reaparecer deslocado pelo paralaxe e ficar cortado pelo canvas.
        const px = (mouse.x - W / 2) * 0.03;
        const py = (mouse.y - H / 2) * 0.03;
        const scrollY = (scrollState.y - 0.5) * SCROLL_RANGE;
        const MARGIN = 40;

        atoms.forEach((a) => {
            a.x += a.vx; a.y += a.vy; a.rot += a.vr;

            const rx = a.x + px * a.depth;
            const ry = a.y + py * a.depth + scrollY * a.depth;

            if (rx < -MARGIN) a.x = W + MARGIN - px * a.depth;
            if (rx > W + MARGIN) a.x = -MARGIN - px * a.depth;
            if (ry < -MARGIN) a.y = H + MARGIN - py * a.depth - scrollY * a.depth;
            if (ry > H + MARGIN) a.y = -MARGIN - py * a.depth - scrollY * a.depth;
        });
        frame();
        raf = requestAnimationFrame(tick);
    }

    function start() {
        if (running) return;
        running = true;
        if (reduceMotion) { frame(); return; }
        tick();
    }

    function stop() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = null;
    }

    function shouldRun() {
        return inViewport && document.visibilityState === 'visible';
    }

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    // Paralaxe de scroll: mesma técnica scrub do heroLeft() (yPercent na ilustração),
    // só que aqui alimenta scrollState.y e é a própria tick() (já rodando) que lê o
    // valor a cada frame — não precisa de onUpdate redesenhando por conta própria.
    if (!reduceMotion && window.gsap && window.ScrollTrigger) {
        gsap.to(scrollState, {
            y: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    const onResize = () => {
        resize();
        makeAtoms();
        if (running) frame();
    };

    if (window.ResizeObserver) {
        new ResizeObserver(onResize).observe(container);
    } else {
        window.addEventListener('resize', onResize);
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.target !== hero) return;
            inViewport = entry.isIntersecting;
            if (shouldRun()) start(); else stop();
        });
    }, { threshold: 0 });

    document.addEventListener('visibilitychange', () => {
        if (shouldRun()) start(); else stop();
    });

    whenPageReady(() => {
        resize();
        makeAtoms();
        io.observe(hero);
    });

    window.addEventListener('pagehide', () => {
        stop();
        io.disconnect();
    });
})();

(function contentIsIn_andTitleAnim() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', contentIsIn_andTitleAnim);
        return;
    }
    if (!window.gsap) { console.error('[titles] GSAP não encontrado'); return; }

    const THRESHOLD = 0.55;
    const MODE = 'chars';
    const DURATION = 0.2;
    const STAGGER = 0.02;
    const EASE = 'power3.out';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SplitCtor = (window.SplitType && (window.SplitType.default || window.SplitType)) || null;

    const controls = new WeakMap();

    function makeSplit(title) {
        if (!SplitCtor || !MODE) return { split: null, targets: [title] };
        try {
            const split = new SplitCtor(title, { types: MODE });
            const targets =
                MODE === 'chars' ? split.chars :
                    MODE === 'words' ? split.words :
                        split.lines;
            return { split, targets: (targets && targets.length) ? targets : [title] };
        } catch {
            return { split: null, targets: [title] };
        }
    }

    function buildTimelineFor(content) {
        const title = content.querySelector('.main-title');
        if (!title) return null;

        const { split, targets } = makeSplit(title);
        if (split) gsap.set(title, { overflow: 'hidden' });

        const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } })
            .fromTo(targets,
                { yPercent: 120, color: (i, target) => titleCharColor(true, target) },
                { yPercent: 0, color: (i, target) => titleCharColor(false, target), duration: DURATION, stagger: STAGGER }
            );

        const ctrl = { content, title, split, targets, tl, lastWidth: title.clientWidth || 0 };
        controls.set(content, ctrl);
        return ctrl;
    }

    function ensureCtrl(content) {
        let ctrl = controls.get(content);
        if (ctrl) return ctrl;
        ctrl = buildTimelineFor(content);
        if (!ctrl) return null;

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => {
                const w = ctrl.title.clientWidth || 0;
                
                if (Math.abs(w - ctrl.lastWidth) < 1) return;
                
                ctrl.lastWidth = w;

                const prevProg = ctrl.tl.progress();
                const wasRev = ctrl.tl.reversed();

                try { ctrl.tl.kill(); } catch (_) { }
                try { ctrl.split && ctrl.split.revert(); } catch (_) { }

                const rebuilt = buildTimelineFor(content);
                if (!rebuilt) return;
                ctrl.split = rebuilt.split;
                ctrl.targets = rebuilt.targets;
                ctrl.tl = rebuilt.tl;

                if (reduceMotion) {
                    gsap.set(ctrl.title, { opacity: 1, y: 0 });
                } else {
                    if (prevProg === 0 || wasRev) {
                        gsap.set(ctrl.targets, { yPercent: 120, color: (i, target) => titleCharColor(true, target) });
                        ctrl.tl.progress(0).reverse(0);
                    } else if (prevProg === 1 && !wasRev) {
                        gsap.set(ctrl.targets, { yPercent: 0, color: (i, target) => titleCharColor(false, target) });
                        ctrl.tl.progress(1);
                    } else {
                        gsap.set(ctrl.targets, {
                            yPercent: 120 * (1 - prevProg),
                            color: (i, target) => gsap.utils.interpolate(titleCharColor(true, target), titleCharColor(false, target), prevProg)
                        });
                        ctrl.tl.progress(prevProg);
                        if (wasRev) ctrl.tl.reverse(0);
                    }
                }
            });
            ro.observe(ctrl.title);
            ctrl._ro = ro;
        }

        return ctrl;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const content = entry.target;
            const ctrl = ensureCtrl(content);
            if (!ctrl) return;

            if (reduceMotion) {
                content.classList.toggle('is-in', entry.isIntersecting);
                gsap.set(ctrl.title, { opacity: 1, y: 0 });
                return;
            }

            if (entry.isIntersecting) {
                content.classList.add('is-in');
                ctrl.tl.play();
            } else {
                content.classList.remove('is-in');
                ctrl.tl.reverse();
            }
        });
    }, { threshold: THRESHOLD });

    document.querySelectorAll('.content').forEach((c) => {
        if (c.querySelector('.main-title')) {
            ensureCtrl(c);
            io.observe(c);
        }
    });

    window.addEventListener('pagehide', () => {
        io.disconnect();
        document.querySelectorAll('.content').forEach((c) => {
            const ctrl = controls.get(c);
            if (!ctrl) return;
            try { ctrl.tl && ctrl.tl.kill(); } catch (_) { }
            try { ctrl.split && ctrl.split.revert(); } catch (_) { }
            try { ctrl._ro && ctrl._ro.disconnect(); } catch (_) { }
        });
    });
})();

(function statsSectionAnimate() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', statsSectionAnimate);
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.from('.stats-section', {
        scrollTrigger: {
            trigger: '.stats-section',
            start: 'top 75%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
    });
})();

(function statsCounterAnimate() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', statsCounterAnimate);
        return;
    }
    if (!window.gsap || !window.ScrollTrigger) return;

    const items = gsap.utils.toArray('.stats-section .stats-item');
    if (!items.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    items.forEach((item, i) => {
        const valueEl = item.querySelector('.stats-value');
        const raw = valueEl.textContent.trim();

        const match = raw.match(/^(\D*)([\d.,]+)(\D*)$/);
        if (!match) return;

        const [, prefix, numberStr, suffix] = match;
        const finalValue = Number(numberStr.replace(/[.,]/g, ''));

        if (reduceMotion) {
            valueEl.textContent = raw;
            return;
        }

        gsap.set(item, { autoAlpha: 0, y: 20 });
        valueEl.textContent = `${prefix}0${suffix}`;

        const counter = { value: 0 };

        gsap.to(item, {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            delay: i * 0.08,
            scrollTrigger: {
                trigger: '.stats-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        gsap.to(counter, {
            value: finalValue,
            duration: 1.4,
            ease: 'power2.out',
            delay: i * 0.08,
            onUpdate: () => {
                valueEl.textContent = `${prefix}${Math.round(counter.value)}${suffix}`;
            },
            scrollTrigger: {
                trigger: '.stats-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });
})();

(function aboutSectionAnimate() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aboutSectionAnimate);
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top center',
            toggleActions: 'play none none reverse'
        }
    }).from('.about-section .content:not(.content-skills)', {
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
    }, 0);

    const preTitleTl = preparePreTitleTyping(document.querySelector('.about-section .content:not(.content-skills) .pre-title > span'));
    if (preTitleTl) tl.add(preTitleTl, 0);
})();

(function contentSkillsAnimate() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', contentSkillsAnimate);
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.content-skills', { opacity: 1 });
        return;
    }

    gsap.set('.content-skills', { opacity: 0 });

    ScrollTrigger.create({
        trigger: '.content-skills',
        start: 'top center',
        toggleActions: 'play none none reverse',
        onEnter() {
            gsap.to('.content-skills', {
                opacity: 1,
                duration: 0.8,
                ease: 'power3.out'
            });
        },
        onEnterBack() {
            gsap.to('.content-skills', {
                opacity: 1,
                duration: 0.8,
                ease: 'power3.out'
            });
        },
        onLeaveBack() {
            gsap.to('.content-skills', {
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            });
        }
    });
})();

// Console de skills: digita o comando e revela cada linha de saída em stagger.
// Substitui as antigas barras de porcentagem por evidência real (contagem de
// projetos da seção Projetos) — ver .term no HTML e no CSS.
(function skillsConsoleAnimate() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', skillsConsoleAnimate);
        return;
    }
    if (!window.gsap || !window.ScrollTrigger) return;

    const term = document.getElementById('skillsTerm');
    if (!term) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // HTML já nasce 100% visível

    // Mesmo truque de preparePreTitleTyping(): revela um bloco monoespaçado via
    // largura, com ease em steps — generalizado aqui pra também "digitar" as
    // barras ASCII (1 step por bloco ■, não por caractere).
    function typeReveal(el, opts) {
        opts = opts || {};
        const charDuration = opts.charDuration || 0.035;
        const minDuration = opts.minDuration || 0.15;
        const steps = opts.steps || el.textContent.length;
        const full = el.scrollWidth;
        gsap.set(el, { width: 0 });
        return gsap.to(el, {
            width: full,
            duration: Math.max(steps * charDuration, minDuration),
            ease: `steps(${Math.max(steps, 1)})`
        });
    }

    const cmd = term.querySelector('.term-cmd');
    const techLines = term.querySelectorAll('.term-line-tech');
    const checkLines = term.querySelectorAll('.term-line-check');
    const blankLines = term.querySelectorAll('.term-line-blank');
    const finalLine = term.querySelector('.term-line-final');
    const bars = term.querySelectorAll('.term-bar');

    const toHide = term.querySelectorAll('.term-line-tech, .term-line-check, .term-line-blank, .term-line-final');
    gsap.set(toHide, { autoAlpha: 0, y: 6 });
    gsap.set(bars, { width: 0 });

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .add(typeReveal(cmd, { charDuration: 0.04 }), 0)
        .to(blankLines[0], { autoAlpha: 1, y: 0, duration: 0.2 }, '+=0.15');

    techLines.forEach((line) => {
        const bar = line.querySelector('.term-bar');
        const blocks = bar.textContent.length;
        tl.to(line, { autoAlpha: 1, y: 0, duration: 0.25 }, '>-0.05')
            .add(typeReveal(bar, { steps: blocks, charDuration: 0.09 }), '<');
    });

    tl.to(blankLines[1], { autoAlpha: 1, y: 0, duration: 0.2 }, '+=0.1')
        .to(checkLines, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.12 }, '>-0.05')
        .to(blankLines[2], { autoAlpha: 1, y: 0, duration: 0.2 }, '+=0.1')
        .to(finalLine, { autoAlpha: 1, y: 0, duration: 0.2 }, '<');

    ScrollTrigger.create({
        trigger: term,
        start: 'top 80%',
        end: 'bottom 20%',
        onToggle: self => self.isActive ? tl.play() : tl.reverse()
    });
})();

(function skillCardsAnimate() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', skillCardsAnimate);
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.cards-skills .card', { opacity: 1, y: 0 });
        return;
    }

    gsap.set('.cards-skills .card', { opacity: 0, y: 50 });

    ScrollTrigger.create({
        trigger: '.cards-skills',
        start: 'top 80%',
        end: 'bottom 10%',
        toggleActions: 'play none none reverse',
        onEnter() {
            gsap.to('.cards-skills .card', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        },
        onEnterBack() {
            gsap.to('.cards-skills .card', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        },
        onLeaveBack() {
            gsap.to('.cards-skills .card', {
                opacity: 0,
                y: 50,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }
    });
})();

(function recentWorksSectionAnimate() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', recentWorksSectionAnimate);
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.recent-works-section',
            start: 'top 25%',
            toggleActions: 'play none none reverse'
        }
    }).from('.recent-works-section', {
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
    }, 0);

    const preTitleTl = preparePreTitleTyping(document.querySelector('.recent-works-section .pre-title > span'));
    if (preTitleTl) tl.add(preTitleTl, 0);
})();

(function recentWorksCardsAnimate() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', recentWorksCardsAnimate);
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.recent-works-cards .card', { opacity: 1, y: 0 });
        return;
    }

    gsap.set('.recent-works-cards .card', { opacity: 0, y: 50 });

    ScrollTrigger.create({
        trigger: '.recent-works-cards',
        start: 'top 65%',
        toggleActions: 'play none none reverse',
        onEnter() {
            gsap.to('.recent-works-cards .card', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        },
        onEnterBack() {
            gsap.to('.recent-works-cards .card', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        },
        onLeaveBack() {
            gsap.to('.recent-works-cards .card', {
                opacity: 0,
                y: 50,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }
    });
})();

(function contactSectionAnimate() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', contactSectionAnimate);
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 50%',
            toggleActions: 'play none none reverse'
        }
    }).from('.contact-section', {
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
    }, 0);

    const preTitleTl = preparePreTitleTyping(document.querySelector('.contact-section .pre-title > span'));
    if (preTitleTl) tl.add(preTitleTl, 0);
})();

(function contactListAnimate() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', contactListAnimate);
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.contact-list li', { opacity: 1, y: 0 });
        return;
    }

    gsap.set('.contact-list li', { opacity: 0, y: 50 });

    ScrollTrigger.create({
        trigger: '.contact-list',
        start: 'top 100%',
        toggleActions: 'play none none reverse',
        onEnter() {
            gsap.to('.contact-list li', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        },
        onEnterBack() {
            gsap.to('.contact-list li', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        },
        onLeaveBack() {
            gsap.to('.contact-list li', {
                opacity: 0,
                y: 50,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }
    });
})();

(function contactBtnGroupAnimate() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', contactBtnGroupAnimate);
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.contact-btn-group .btn', { opacity: 1, scale: 1 });
        return;
    }

    gsap.set('.contact-btn-group .btn', { opacity: 0, scale: 0.95 });

    ScrollTrigger.create({
        trigger: '.contact-btn-group',
        start: 'top 100%',
        toggleActions: 'play none none reverse',
        onEnter() {
            gsap.to('.contact-btn-group .btn', {
                opacity: 1,
                scale: 1,
                duration: 0.1,
                stagger: 0.2,
                ease: 'power3.out'
            });
        },
        onEnterBack() {
            gsap.to('.contact-btn-group .btn', {
                opacity: 1,
                scale: 1,
                duration: 0.1,
                stagger: 0.2,
                ease: 'power3.out'
            });
        },
        onLeaveBack() {
            gsap.to('.contact-btn-group .btn', {
                opacity: 0,
                scale: 0.95,
                duration: 0.1,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }
    });
})();

// Caret azul no lugar do ponteiro do sistema (.has-custom-cursor esconde o
// cursor nativo via CSS). Sobre links, botões e cards ele vira um círculo em
// vez de sumir, pra manter o sinal de "isso é clicável" sem depender da mão
// do navegador. Só ativa com mouse de verdade (pointer: fine).
(function cursorCaret() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cursorCaret);
        return;
    }
    if (!window.matchMedia('(pointer: fine)').matches) return; // touch não tem cursor persistente

    const caret = document.createElement('div');
    caret.className = 'cursor-caret';
    caret.setAttribute('aria-hidden', 'true');
    caret.innerHTML = '<span class="cursor-caret-bar"></span>';
    document.body.appendChild(caret);

    let raf = null;
    function moveTo(x, y) {
        if (raf) return;
        raf = requestAnimationFrame(() => {
            caret.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            raf = null;
        });
    }

    document.addEventListener('mousemove', (e) => {
        // só esconde o cursor do sistema a partir do primeiro movimento real —
        // sem isso, o mouse fica sem nenhum indicador visível até a página notar
        document.documentElement.classList.add('has-custom-cursor');
        caret.classList.add('is-visible');
        moveTo(e.clientX, e.clientY);
    });

    document.documentElement.addEventListener('mouseleave', () => {
        caret.classList.remove('is-visible');
    });

    const INTERACTIVE = 'a, button, .btn, input, textarea, select, [role="button"], .card-wrapper, .jconfirm-closeIcon';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(INTERACTIVE)) caret.classList.add('is-interactive');
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(INTERACTIVE)) caret.classList.remove('is-interactive');
    });
})();

