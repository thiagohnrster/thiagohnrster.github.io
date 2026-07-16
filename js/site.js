// Cores usadas nas animações de reveal dos títulos (apagada -> acesa)
const TITLE_COLOR_DIM = '#0e253f';
const TITLE_COLOR_LIT = '#7c90a6';
const TITLE_ACCENT_DIM = '#09375c';
const TITLE_ACCENT_LIT = '#2cb4ff';
const titleCharColor = (isDim, target) => target.closest('.accent')
    ? (isDim ? TITLE_ACCENT_DIM : TITLE_ACCENT_LIT)
    : (isDim ? TITLE_COLOR_DIM : TITLE_COLOR_LIT);

gsap.registerPlugin(ScrollTrigger);

(function navActiveBySectionRange() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', navActiveBySectionRange);
        return;
    }

    const $nav = $('.navigation');
    const $header = $('header');
    const headerH = () => ($header.outerHeight() || 0);

    // Respiro extra entre o header e o conteúdo ao navegar por âncora.
    // Ajuste esse valor para dar mais ou menos "ar" acima do título.
    const SCROLL_GAP = 40;

    // Ao navegar para outra seção, pageYOffset > 0 e o header assume a classe
    // "scrolled" (altura menor) assim que o scroll começa. Por isso o destino
    // precisa ser calculado com a altura que o header terá em repouso, não com
    // a altura atual — senão a seção anterior fica "vazando" alguns pixels
    // abaixo do header quando as duas alturas divergem.
    const headerHAtRest = () => {
        const wasScrolled = $header.hasClass('scrolled');
        if (!wasScrolled) $header.addClass('scrolled');
        const h = $header.outerHeight() || 0;
        if (!wasScrolled) $header.removeClass('scrolled');
        return h;
    };

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

        // Seções como #sobre e #projetos têm 180px de padding-top no .content
        // (respiro usado pela animação de entrada do título). Ancorar no topo
        // da própria <section> para o scroll bem antes desse respiro, deixando
        // um vão vazio entre o header e a tag "//". Por isso ancoramos na tag
        // visível quando ela existir; a Home não tem esse wrapper e continua
        // indo para o topo da página normalmente.
        const $anchor = $target.find('.content .pre-title').first();
        const $scrollTarget = $anchor.length ? $anchor : $target;

        const targetY = $scrollTarget[0].getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - headerHAtRest() - SCROLL_GAP;

        window.scrollTo({ top: targetY, behavior: 'smooth' });
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
    
    io.observe(hero);

    window.addEventListener('unload', () => {
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

    ScrollTrigger.create({
        trigger: hero,
        start: 'top 95%',
        end: 'bottom 80%',
        onToggle: self => self.isActive ? tl.play() : tl.reverse()
    });

    gsap.timeline({
        scrollTrigger: {
            trigger: hero,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    }).to(layers[0], { yPercent: -10 }, 0)
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

    window.addEventListener('unload', () => {
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

    gsap.from('.about-section .content:not(.content-skills)', {
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
    });
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

(function skillBarsFillAnimate () {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', skillBarsFillAnimate);
        return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = gsap.utils.toArray(".stats li");

    items.forEach((li, i) => {
        const item = li;
        const bar = li.querySelector(".progress-bar");
        const pct = li.querySelector(".progress-number");
        const finalValue = Number(bar.value);

        if (reduceMotion) {
            pct.textContent = `${finalValue}%`;
            return;
        }

        gsap.set(item, { opacity: 0 });

        bar.value = 0;
        pct.textContent = "0%";

        gsap.to(item, {
            opacity: 1,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: {
                trigger: li,      // anima cada linha quando entrar
                start: "top 95%",
                end: "bottom 10%",
                toggleActions: 'play none none reverse'
            }
        });

        gsap.to(bar, {
            value: finalValue,
            duration: 1.4,
            ease: "power3.out",
            delay: i * 0.08, // “stagger” simples por item
            onUpdate: () => {
                const v = Math.round(bar.value);
                pct.textContent = `${v}%`;
            },
            scrollTrigger: {
                trigger: li,      // anima cada linha quando entrar
                start: "top 95%",
                end: "bottom 10%",
                toggleActions: 'play none none reverse'
            }
        });
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

    gsap.from('.recent-works-section', {
        scrollTrigger: {
            trigger: '.recent-works-section',
            start: 'top 25%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
    });
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

    gsap.from('.contact-section', {
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 50%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
    });
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

