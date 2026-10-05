// ==========================================================================
// Portfólio TC — tudo que é decorativo/scroll (modais de projeto continuam em
// js/scripts.js). Espelha o protótipo aprovado; ver CLAUDE.md → "Redesign".
// ==========================================================================
(function () {
  // Hash de entrada (ex.: /#sobre vindo de uma página de case) — lido antes de limpar a URL.
  var initialHash = location.hash;
  if (initialHash) setTimeout(function () { history.replaceState('', document.title, location.pathname + location.search); }, 5);
  var isCase = document.body.classList.contains('page-case');
  // Idioma da página (pt-BR na raiz, en em /en/). T(pt, en) escolhe o texto dos avisos do JS.
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  function T(pt, en) { return EN ? en : pt; }
  // Troca de idioma (PT/EN): guarda a escolha — o redirecionamento automático do <head>
  // nunca mais muda o idioma de quem já escolheu um.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-lang]');
    if (a) { try { localStorage.setItem('tc:lang', a.getAttribute('data-lang')); } catch (err) {} }
  }, true);

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Relógio de São Paulo */
  function tick() {
    try {
      var t = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
      $$('.clock').forEach(function (c) { c.textContent = t; });
    } catch (e) {}
  }
  tick(); setInterval(tick, 20000);

  /* Copiar e-mail */
  var toastTl;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg;
    if (window.gsap) {
      if (toastTl) toastTl.kill();
      toastTl = gsap.timeline().to(t, { yPercent: 0, y: 0, xPercent: -50, duration: .5, ease: 'expo.out' }).to(t, { yPercent: 160, duration: .4, ease: 'power2.in' }, '+=1.6');
    }
  }
  var copyBtn = $('#copyBtn');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var addr = $('#addr').textContent.trim();
    var fallback = function () {
      var r = document.createRange(); r.selectNodeContents($('#addr'));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      toast(T('Selecionado — use Ctrl+C', 'Selected — press Ctrl+C'));
    };
    try {
      navigator.clipboard.writeText(addr).then(function () { toast(T('E-mail copiado', 'E-mail copied')); }, fallback);
    } catch (e) { fallback(); }
  });

  /* As thumbs dos cards no mobile (.thumb) já vêm no HTML: precisam existir no primeiro
     render para a transição de volta do case (script inline no <head> do index.html). */

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  // Adia a entrada do hero até o loader (js/loader.js, progresso real) liberar a página.
  function whenPageReady(cb) {
    var l = window.__pageLoader;
    if (l && l.ready && typeof l.ready.then === 'function') l.ready.then(cb); else cb();
  }

  // Scroll suave para âncoras (menu, logo, "Entre em contato", "Voltar ao topo").
  // Marca o scroll como automático até terminar: o cursor/hover dos projetos ignora
  // o que passa sob o ponteiro nesse meio tempo e relê o estado ao final.
  var autoScrolling = false, onScrollDone = function () {};
  function endAutoScroll() {
    if (!autoScrolling) return;
    autoScrolling = false;
    window.removeEventListener('scrollend', endAutoScroll);
    onScrollDone();
  }
  window.smoothScrollTo = function (target) {
    var el = typeof target === 'string' ? $(target) : (target && target.jquery ? target[0] : target);
    if (!el) return;
    var y = el.id === 'top' ? 0 : el.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0);
    autoScrolling = true; onScrollDone();
    clearTimeout(window.__tcScrollT);
    window.addEventListener('scrollend', endAutoScroll, { once: true });
    window.__tcScrollT = setTimeout(endAutoScroll, 1600); // fallback: sem scrollend ou já no destino
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
  };

  /* Menu mobile */
  var menu = $('#menu'), burger = $('#burger'), menuOpen = false, menuTl = null;
  var bars = $$('#burger i'), lockedY = 0;
  if (hasGsap && !reduce) {
    menuTl = gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
      .set(menu, { visibility: 'visible' })
      .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: .8 })
      .to(bars[0], { top: 23, rotate: 45, duration: .5 }, 0)
      .to(bars[1], { top: 23, right: 14, rotate: -45, duration: .5 }, 0)
      .from('#menu li a', { yPercent: 110, duration: .9, stagger: .06, ease: 'expo.out' }, .35)
      .from('#menu .m-foot > *', { autoAlpha: 0, y: 20, duration: .6, stagger: .06, ease: 'power3.out' }, .55);
  }
  function setMenu(open) {
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? T('Fechar menu', 'Close menu') : T('Abrir menu', 'Open menu'));
    menu.setAttribute('aria-hidden', String(!open));
    // Trava o scroll preservando a posição: overflow:hidden sozinho faz o mobile
    // voltar pro topo. Fixa o body no scrollY atual e restaura ao fechar.
    if (open) {
      lockedY = window.pageYOffset || document.documentElement.scrollTop || 0;
      document.documentElement.classList.add('nav-open');
      document.body.style.top = (-lockedY) + 'px';
    } else if (document.documentElement.classList.contains('nav-open')) {
      document.documentElement.classList.remove('nav-open');
      document.body.style.top = '';
      window.scrollTo(0, lockedY);
    }
    if (menuTl) { open ? menuTl.timeScale(1).play() : menuTl.timeScale(1.6).reverse(); }
    else { menu.style.visibility = open ? 'visible' : 'hidden'; menu.style.clipPath = open ? 'inset(0 0 0% 0)' : ''; }
    if (open) { var first = $('#menu a'); if (first) first.focus({ preventScroll: true }); }
  }
  burger.addEventListener('click', function () { setMenu(!menuOpen); });
  menu.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); burger.focus(); } });
  $$('[data-menu-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      setMenu(false);
      if (href.charAt(0) !== '#') return; // link para outra página (ex.: /#sobre a partir de um case)
      e.preventDefault();
      var target = $(href);
      setTimeout(function () { window.smoothScrollTo(target); }, reduce ? 0 : 350);
    });
  });

  // Chegando com hash (ex.: /#projetos a partir de um case): posiciona assim que o loader liberar.
  if (initialHash && initialHash.length > 1) {
    whenPageReady(function () {
      if (window.__tcRevealRow) return; // voltando de um case: o <head> já centralizou a linha do projeto
      var t = document.getElementById(initialHash.slice(1));
      if (t) window.scrollTo(0, t.getBoundingClientRect().top + window.pageYOffset);
    });
  }

  /* Transição para o case (View Transitions entre documentos).
     Os nomes são dados no instante em que o navegador tira o "retrato" da página
     antiga (evento pageswap) — e, como reforço, no clique. A prévia flutuante
     (desktop) é forçada a ficar visível e parada na hora do clique: se ela ainda
     estivesse aparecendo/sumindo (ou escondida porque o mouse não se mexeu desde
     que a página voltou do case), o navegador não achava um elemento visível
     com o nome e a transição saía "seca". */
  var leavingTo = null; // linha clicada; congela o hover até a página trocar
  function clearVT() { $$('[style*="view-transition-name"]').forEach(function (el) { if (!el.classList.contains('case-frame') && !el.classList.contains('case-title')) el.style.viewTransitionName = ''; }); }
  function nameFor(a) {
    clearVT();
    var pv = $('#preview');
    var desktop = pv && window.matchMedia('(min-width: 761px)').matches; // abaixo disso a .thumb do card está visível
    var shot = null;
    if (desktop) {
      gsap.killTweensOf(pv, 'scale,rotate');
      gsap.killTweensOf('#slides');
      gsap.set('#slides', { yPercent: -100 * +a.dataset.index });
      // sem posição do mouse (tablet/touch, ou mouse parado desde o load): centraliza na linha
      if (!gsap.getProperty(pv, 'x') && !gsap.getProperty(pv, 'y')) {
        var r = a.getBoundingClientRect();
        gsap.set(pv, { x: r.left + r.width * 0.6, y: r.top + r.height / 2 });
      }
      gsap.set(pv, { scale: 1, rotate: 0 });
      shot = pv;
    } else {
      shot = $('.thumb', a);
    }
    if (shot) shot.style.viewTransitionName = 'case-hero';
    var title = $('.name strong', a);
    if (title) title.style.viewTransitionName = 'case-title';
  }
  function rowForUrl(href) {
    var path;
    try { path = new URL(href, location.href).pathname; } catch (e) { return null; }
    return $$('.row a[href]').filter(function (a) { return a.pathname === path; })[0] || null;
  }
  function releaseLeave() { leavingTo = null; clearVT(); }
  window.addEventListener('pageshow', releaseLeave); // voltou (bfcache): libera o hover e remove os nomes
  window.addEventListener('pageswap', function (e) {
    if (!e.viewTransition) return;
    // Saindo de um case para a home: avisa a home de qual projeto veio (ela nomeia a linha).
    if (isCase) {
      var to = e.activation && e.activation.entry && e.activation.entry.url;
      var toHome = false;
      try { var p = new URL(to, location.href).pathname; toHome = /^\/(en\/)?(index\.html)?$/.test(p); } catch (err) {}
      if (toHome) { try { sessionStorage.setItem('tc:fromCase', location.pathname); } catch (err) {} }
      return;
    }
    var url = e.activation && e.activation.entry && e.activation.entry.url;
    var a = (url && rowForUrl(url)) || leavingTo;
    if (a) nameFor(a); else clearVT();
  });
  $$('.row a[href]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // nova aba: comportamento padrão
      leavingTo = a;
      nameFor(a);
    });
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', function (m) { if (m.matches && menuOpen) setMenu(false); });

  /* Âncoras [data-scroll] (menu desktop, logo, CTA, voltar ao topo) */
  $$('[data-scroll]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.smoothScrollTo(target);
    });
  });

  if (!hasGsap) return;
  gsap.registerPlugin(ScrollTrigger);

  /* Transição própria entre páginas — só onde não há View Transitions entre documentos
     (Firefox, Safari < 18.2). Imita a do Chrome:
     • projeto → case: a imagem da prévia/thumb cresce até cobrir a tela; a página nova nasce
       com essa mesma imagem em tela cheia e ela encolhe até o frame do topo do case;
     • demais links internos: o conteúdo sobe e some; a página nova entra de baixo.
     O tipo e a imagem passam de uma página pra outra por sessionStorage['tc:pt']. */
  (function pageMorph() {
    if (('onpagereveal' in window) && !window.__tcNoVT) return;
    var html = document.documentElement;
    var content = function () { return $$('body > header, body > main'); };
    function mkClone(src, r) {
      var el = document.createElement('div');
      el.className = 'tc-morph';
      el.innerHTML = '<img alt="" src="' + src + '"><span></span>';
      gsap.set(el, { top: r.top, left: r.left, width: r.width, height: r.height, borderRadius: r.radius || 0 });
      document.body.appendChild(el);
      return el;
    }
    function reveal() {
      var data = null;
      try { data = JSON.parse(sessionStorage.getItem('tc:pt') || 'null'); sessionStorage.removeItem('tc:pt'); } catch (e) {}
      if (!html.classList.contains('tc-pt-in')) return;
      html.classList.remove('tc-pt-in');
      var els = content();
      if (reduce || !data) { gsap.set(els, { clearProps: 'opacity' }); return; }
      var frame = $('.case-frame');
      if (data.type === 'morph' && frame && data.src) {
        var fr = frame.getBoundingClientRect();
        // usa a imagem grande do próprio case se já estiver carregada (a da lista é a de 720px)
        var caseImg = $('.case-art img');
        var clone = mkClone(caseImg && caseImg.complete && caseImg.currentSrc ? caseImg.currentSrc : data.src, { top: 0, left: 0, width: innerWidth, height: innerHeight });
        if (caseImg && !caseImg.complete) caseImg.addEventListener('load', function () { var ci = clone.querySelector('img'); if (ci) ci.src = caseImg.currentSrc; }, { once: true });
        gsap.set(frame, { opacity: 0 });
        gsap.fromTo(els, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: .7, ease: 'expo.out', delay: .35, clearProps: 'opacity,transform' });
        gsap.to(clone, { top: fr.top, left: fr.left, width: fr.width, height: fr.height, borderRadius: 15, duration: .9, ease: 'expo.inOut',
          onComplete: function () { gsap.set(frame, { clearProps: 'opacity' }); gsap.to(clone, { opacity: 0, duration: .25, onComplete: function () { clone.remove(); } }); } });
      } else {
        gsap.fromTo(els, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out', clearProps: 'opacity,transform' });
      }
    }
    // home: espera o loader (se houver); case: imediato
    whenPageReady(reveal);
    // voltou pelo bfcache no meio de uma saída: restaura tudo
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      $$('.tc-morph').forEach(function (m) { m.remove(); });
      gsap.set(content(), { clearProps: 'opacity,transform' });
      if ($('#preview')) gsap.set('#preview', { clearProps: 'opacity' });
      leaving = false;
    });
    var leaving = false;
    document.addEventListener('click', function (e) {
      if (leaving || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      if (menuOpen) setMenu(false);
      leaving = true;
      var go = function () { location.href = url.href; };
      if (reduce) return go();
      var els = content();
      // projeto → case: pega a imagem visível (prévia no desktop, thumb no mobile)
      var row = a.closest('.row') && /\/projetos\//.test(url.pathname) ? a : null;
      var src = null, box = null;
      if (row) {
        var pv = $('#preview');
        var desktop = pv && matchMedia('(min-width: 761px)').matches;
        var img = desktop ? $('#slides .slide:nth-child(' + (+row.dataset.index + 1) + ') img') : $('.thumb img', row);
        var host = desktop ? pv : $('.thumb', row);
        if (img && host) { src = img.currentSrc || img.src; box = host.getBoundingClientRect(); }
      }
      if (src && box && box.width > 0) {
        try { sessionStorage.setItem('tc:pt', JSON.stringify({ type: 'morph', src: src })); } catch (err) {}
        var clone = mkClone(src, { top: box.top, left: box.left, width: box.width, height: box.height, radius: 15 });
        // enquanto cresce, troca pela versão grande (mesma que o case vai usar) assim que ela carregar
        var big = src.replace(/-720\.webp$/, row.dataset.index === '0' ? '-1600.webp' : '-1280.webp');
        if (big !== src) { var pre = new Image(); pre.onload = function () { var ci = clone.querySelector('img'); if (ci) ci.src = big; }; pre.src = big; }
        if ($('#preview')) gsap.set('#preview', { opacity: 0 });
        gsap.to(els, { opacity: 0, y: -24, duration: .45, ease: 'power2.in' });
        gsap.to(clone, { top: 0, left: 0, width: innerWidth, height: innerHeight, borderRadius: 0, duration: .8, ease: 'expo.inOut', onComplete: go });
      } else {
        try { sessionStorage.setItem('tc:pt', JSON.stringify({ type: 'fade' })); } catch (err) {}
        gsap.to(els, { opacity: 0, y: -24, duration: .45, ease: 'power2.in', onComplete: go });
      }
    });
  })();
  /* ASSINATURA: o site "sendo programado" ao vivo.
     Na primeira vez que uma seção entra na tela ela aparece como esqueleto de
     código (caixas tracejadas com a tag real de cada bloco) e o cursor azul em
     bloco — o mesmo do hero — passa por cada caixa, revelando o visual final.
     Tudo dura ~1s. Voltando de um case (tc-return) a lista de projetos já nasce
     pronta, para não brigar com a transição de volta. */
  if (!isCase && $('#rows')) liveBuild();
  function liveBuild() {
    var groups = [
      ['#projetos', ['.sec-head > span', '#projTitle', '#rows .row']],
      ['#sobre', ['.label', '#manifesto', '.stat']],
      ['#servicos', ['.left > span', '.services h2', '.svc li', '#term']],
      ['#contato', ['.top > span', '#talk', '.mail', '.links', '.sig']]
    ];
    function tagOf(el) {
      var t = el.tagName.toLowerCase();
      if (el.id) return '<' + t + ' #' + el.id + '>';
      var c = Array.prototype.filter.call(el.classList, function (n) { return n.indexOf('lb-') !== 0; })[0];
      return c ? '<' + t + ' .' + c + '>' : '<' + t + '>';
    }
    function esc(str) { return str.replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function bars(h) {
      var n = Math.max(1, Math.min(4, Math.floor(h / 44))), out = '';
      for (var i = 0; i < n; i++) out += '<i style="width:' + Math.round(i === n - 1 && n > 1 ? 38 + Math.random() * 20 : 62 + Math.random() * 30) + '%"></i>';
      return out;
    }
    function reveal(targets) { targets.forEach(function (t) { t.classList.remove('lb-hide'); t.style.removeProperty('--lbp'); }); }
    groups.forEach(function (g) {
      var sec = $(g[0]); if (!sec) return;
      if (g[0] === '#projetos' && returningFromCase) return;
      var targets = [];
      g[1].forEach(function (sel) { targets = targets.concat($$(sel, sec)); });
      if (!targets.length) return;
      targets.forEach(function (t) { t.classList.add('lb-hide'); });
      sec.classList.add('lb-host');
      var done = false;
      function run() {
        if (done) return; done = true;
        var r = sec.getBoundingClientRect();
        // Passou direto (link do menu, âncora, scroll muito rápido): só mostra.
        if (r.bottom < 0 || r.top > innerHeight) return reveal(targets);
        build(sec, targets, g[0]);
      }
      ScrollTrigger.create({ trigger: sec, start: 'top 70%', end: 'bottom top', onEnter: run, onEnterBack: run, onLeave: run });
    });

    function build(sec, targets, name) {
      var sr = sec.getBoundingClientRect();
      var layer = document.createElement('div'); layer.className = 'lb-layer'; layer.setAttribute('aria-hidden', 'true');
      var log = document.createElement('span'); log.className = 'lb-log'; log.textContent = 'render ' + name + ' …';
      var cur = document.createElement('i'); cur.className = 'lb-cur';
      var sks = targets.map(function (t) {
        var r = t.getBoundingClientRect();
        var b = { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
        var d = document.createElement('div'); d.className = 'lb-sk';
        d.style.cssText = 'left:' + b.x + 'px;top:' + b.y + 'px;width:' + b.w + 'px;height:' + b.h + 'px';
        d.innerHTML = '<span class="lb-tag">' + esc(tagOf(t)) + '</span>' + bars(b.h);
        layer.appendChild(d);
        return { d: d, b: b, t: t };
      });
      layer.appendChild(log); layer.appendChild(cur); sec.appendChild(layer);

      // Revelação com borda suave: a máscara (--lbp) avança da esquerda p/ direita
      // com um degradê de 14%, em vez do corte seco do clip-path.
      var t0 = performance.now(), per = gsap.utils.clamp(.15, .24, 1.15 / sks.length);
      var mv = per * .32, sw = per * .68, start = .34;
      var tl = gsap.timeline({
        onComplete: function () {
          reveal(targets);
          var secs = ((performance.now() - t0) / 1000).toFixed(2);
          log.textContent = T('✓ compilado em ' + secs.replace('.', ',') + 's', '✓ compiled in ' + secs + 's');
          gsap.to(layer, { autoAlpha: 0, duration: .7, delay: .8, ease: 'power2.out', onComplete: function () { layer.remove(); } });
        }
      });
      // 1. o esqueleto aparece
      tl.from(sks.map(function (s) { return s.d; }), { autoAlpha: 0, y: 12, duration: .4, stagger: .04, ease: 'power3.out' }, 0);
      tl.from(log, { autoAlpha: 0, y: -6, duration: .3, ease: 'power2.out' }, 0);
      var f = sks[0].b, fh = gsap.utils.clamp(16, 64, Math.min(f.h, 120) * .5);
      tl.set(cur, { x: f.x, y: f.y + Math.min(f.h, 120) / 2 - fh / 2, height: fh }, 0);
      tl.to(cur, { autoAlpha: 1, duration: .2, ease: 'power1.out' }, .1);
      // 2. o cursor desliza até cada bloco e o "escreve"; o visual vem logo atrás
      sks.forEach(function (s, i) {
        var b = s.b, at = start + i * per;
        var ch = gsap.utils.clamp(16, 64, Math.min(b.h, 120) * .5);
        if (i) tl.to(cur, { x: b.x, y: b.y + Math.min(b.h, 120) / 2 - ch / 2, height: ch, duration: mv, ease: 'power3.inOut' }, at - mv);
        tl.set(cur, { className: 'lb-cur is-typing' }, at);
        tl.to(cur, { x: b.x + b.w, duration: sw, ease: 'power2.inOut' }, at);
        tl.fromTo(s.t, { '--lbp': '0%' }, { '--lbp': '114%', duration: sw * 1.35, ease: 'power2.inOut' }, at);
        tl.fromTo(s.d, { '--lbp': '0%' }, { '--lbp': '114%', duration: sw * 1.35, ease: 'power2.inOut' }, at);
      });
      tl.to(cur, { autoAlpha: 0, duration: .25, ease: 'power1.in' }, '-=.1');
    }
  }

  gsap.set('#toast', { xPercent: -50, yPercent: 160, x: 0 });

  // Enquanto o loader está na tela (html.is-loading) o scroll máximo é 0 — todo
  // ScrollTrigger medido nessa hora nasce errado. Recalcula quando a página libera.
  whenPageReady(function () { ScrollTrigger.refresh(); });

  if (reduce) return;

  /* Split em palavras/caracteres (equivalente leve ao SplitType do site) */
  function split(el, mode) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.textContent = '';
    var out = [];
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          if (mode === 'chars') {
            part.split('').forEach(function (ch) { var c = document.createElement('span'); c.className = 'c'; c.textContent = ch; w.appendChild(c); out.push(c); });
          } else {
            var c = document.createElement('span'); c.className = 'c'; c.textContent = part; w.appendChild(c); out.push(c);
          }
          el.appendChild(w);
        });
      } else {
        var sub = split(n, mode); el.appendChild(n); out = out.concat(sub);
      }
    });
    return out;
  }
  var heroChars = [];
  $$('.hero [data-split]').forEach(function (el) { heroChars = heroChars.concat(split(el, 'chars')); });
  var leadEl = $('[data-intro="lines"]'), leadWords = leadEl ? split(leadEl, 'words') : [];
  var manifestoEl = $('#manifesto'), manifestoWords = manifestoEl ? split(manifestoEl, 'words') : [];

  /* LOADER → INTRO */
  var intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  intro
    .from(heroChars, { yPercent: 115, rotate: 6, duration: 1.3, stagger: .035 })
    .from('.caret', { scaleY: 0, transformOrigin: 'bottom', duration: .6 }, '-=.9')
    .from(leadWords, { yPercent: 110, duration: 1, stagger: .03 }, '-=1')
    .from('[data-intro="fade"]', { autoAlpha: 0, y: 24, duration: 1, stagger: .08 }, '-=.9')
    .from('.fl', { autoAlpha: 0, scale: .4, duration: 1.2, stagger: .08 }, '-=1')
    .from('#nav', { yPercent: -100, duration: 1 }, '-=1.2');

  // A animação de saída do loader é CSS (.page-loader.is-leaving); o hero entra junto.
  whenPageReady(function () { intro.play(); });

  /* Barra de progresso */
  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  /* Nav: some ao descer, volta ao subir; logo encolhe de 72 → 54 como no site atual */
  var nav = $('#nav'), navHidden = false;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      var hide = !menuOpen && self.direction === 1 && self.scroll() > 300;
      if (hide !== navHidden) { navHidden = hide; gsap.to(nav, { yPercent: hide ? -110 : 0, duration: .5, ease: 'power3.out' }); }
    }
  });
  var mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', function () {
    gsap.to('.nav .logo', { width: 54, height: 54, ease: 'none', scrollTrigger: { start: 0, end: 200, scrub: true } });
  });
  var isMobile = window.matchMedia('(max-width: 760px)');

  /* Floaters: parallax com mouse e scroll */
  var fls = $$('.fl').map(function (el) {
    var d = parseFloat(el.dataset.depth);
    gsap.to(el, { yPercent: -120 * d, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    return { d: d, x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3' }) };
  });
  gsap.to('.hero h1 .l1', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero h1 .l2', { xPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Marquee reativo à velocidade/direção do scroll */
  var track = $('#track'), pos = 0, dir = 1, boost = 1;
  var wrapX = gsap.utils.wrap(-50, 0);
  gsap.ticker.add(function (t, dt) {
    boost += (1 - boost) * .06;
    pos = wrapX(pos - .0022 * dt * dir * boost);
    gsap.set(track, { xPercent: pos });
  });
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (self) { dir = self.direction; boost = Math.min(1 + Math.abs(self.getVelocity()) / 250, 7); } });
  gsap.fromTo('.band', { rotate: -3 }, { rotate: 0, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* Título de projetos desliza com o scroll */
  gsap.fromTo('#projTitle', { xPercent: 6 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '#projetos', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* Linhas de projeto: entrada + preenchimento direcional + preview seguindo o cursor */
  var returningFromCase = document.documentElement.classList.contains('tc-return');
  // A entrada das linhas agora é a "compilação" da seção (ver liveBuild, mais abaixo).
  var preview = $('#preview') || document.createElement('div'), slides = $('#slides') || document.createElement('div');
  var pvX = gsap.quickTo(preview, 'x', { duration: .6, ease: 'power3' });
  var pvY = gsap.quickTo(preview, 'y', { duration: .6, ease: 'power3' });
  var lastX = 0;
  /* Hover dos projetos: controlado pelo estado do ponteiro (ver syncHover), não por mouseenter/leave,
     para não "grudar" quando a página rola sem o mouse se mexer (scroll programático pela navegação). */
  var curRow = null;
  function rowFill(a, on, fromTop) {
    gsap.to($('.fill', a), { scaleY: on ? 1 : 0, transformOrigin: fromTop ? 'top' : 'bottom', duration: on ? .5 : .45, ease: 'expo.out', overwrite: true });
  }
  function setRow(a, py) {
    if (a === curRow) return;
    if (curRow) {
      var r0 = curRow.getBoundingClientRect();
      rowFill(curRow, false, py < r0.top + r0.height / 2);
    }
    curRow = a;
    if (a) {
      var r = a.getBoundingClientRect();
      gsap.set($('.fill', a), { scaleY: 0 });
      rowFill(a, true, py < r.top + r.height / 2);
      gsap.to(slides, { yPercent: -100 * +a.dataset.index, duration: .7, ease: 'expo.inOut', overwrite: true });
      gsap.to(preview, { scale: 1, duration: .5, ease: 'expo.out', overwrite: 'auto' });
    } else {
      gsap.to(preview, { scale: 0, duration: .35, ease: 'power3.in', overwrite: 'auto' });
    }
  }
  $$('.row a').forEach(function (a) {
    a.addEventListener('focus', function () { if (a.matches(':focus-visible')) rowFill(a, true, false); });
    a.addEventListener('blur', function () { if (a !== curRow) rowFill(a, false, false); });
  });

  /* Mobile: o card no centro da tela ganha o "hover" (preenchimento azul) e a thumb faz parallax */
  mm.add('(max-width: 760px)', function () {
    $$('.row').forEach(function (row) {
      var fill = $('.fill', row), slide = $('.thumb .slide img', row);
      ScrollTrigger.create({
        trigger: row, start: 'top 55%', end: 'bottom 45%',
        onToggle: function (self) {
          row.classList.toggle('is-active', self.isActive);
          gsap.to(fill, { scaleY: self.isActive ? 1 : 0, transformOrigin: self.direction === 1 ? (self.isActive ? 'top' : 'bottom') : (self.isActive ? 'bottom' : 'top'), duration: .5, ease: 'expo.out', overwrite: true });
        }
      });
      // parallax só na imagem, dentro da área recortada: escala 1.08 deixa ~4% de folga em cima e embaixo, o deslocamento fica em ±3% (corta pouco das laterais)
      if (slide) gsap.fromTo(slide, { yPercent: -3, scale: 1.08 }, { yPercent: 3, scale: 1.08, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    return function () {
      $$('.row').forEach(function (row) { row.classList.remove('is-active'); gsap.set($('.fill', row), { scaleY: 0 }); });
    };
  });

  /* Manifesto: palavras acendem conforme o scroll */
  gsap.fromTo(manifestoWords, { opacity: .62 }, /* .62 mantém o texto legível (contraste ≥ 3:1) mesmo antes de 'acender' */ { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '#manifesto', start: 'top 80%', end: 'bottom 45%', scrub: true } });

  /* Contadores */
  $$('[data-count]').forEach(function (el) {
    var target = +el.dataset.count, pad = +(el.dataset.pad || 0), k = el.hasAttribute('data-k');
    var o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function () {
        gsap.to(o, { v: target, duration: 1.8, ease: 'power3.out', onUpdate: function () {
          var n = Math.round(o.v);
          el.textContent = k ? (n >= 1000 ? '1K' : String(n)) : String(n).padStart(pad, '0');
        } });
      }
    });
  });

  /* Serviços + terminal digitando */
  gsap.fromTo('#term', { rotate: 8, y: 80 }, { rotate: 2, y: 0, ease: 'none', scrollTrigger: { trigger: '#servicos', start: 'top bottom', end: 'center center', scrub: true } });
  ScrollTrigger.create({
    trigger: '#term', start: 'top 80%', once: true,
    onEnter: function () {
      var lines = $$('#term .ln');
      gsap.set(lines, { autoAlpha: 0 });
      gsap.to(lines, { autoAlpha: 1, duration: .01, stagger: .14, ease: 'none' });
    }
  });

  /* Contato */
  gsap.fromTo('#ghost', { yPercent: 60 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.sig', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  gsap.fromTo('#footLogo', { rotate: -20, scale: .7 }, { rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.sig', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  /* Cursor-caret + botões magnéticos (só com mouse) */
  if (window.matchMedia('(pointer: fine)').matches) {
    document.body.classList.add('has-cursor');
    var cur = $('#cursor'), label = $('#cursorLabel');
    var cx = gsap.quickTo(cur, 'x', { duration: .25, ease: 'power3' });
    var cy = gsap.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
    var ptr = { x: -1, y: -1, inside: false }, curEl = null, rafId = 0;
    function cursorTo(el) {
      if (el === curEl) return;
      curEl = el;
      var txt = el && el.dataset.cursor;
      if (txt) {
        label.textContent = txt;
        gsap.to(cur, { width: 96, height: 96, marginLeft: -48, marginTop: -48, borderRadius: 999, opacity: 1, duration: .45, ease: 'expo.out', overwrite: 'auto' });
        gsap.to(label, { opacity: 1, duration: .2, delay: .1, overwrite: true });
      } else if (el) {
        gsap.to(label, { opacity: 0, duration: .1, overwrite: true });
        gsap.to(cur, { width: 36, height: 36, marginLeft: -18, marginTop: -18, borderRadius: 999, opacity: .35, duration: .35, ease: 'expo.out', overwrite: 'auto' });
      } else {
        gsap.to(label, { opacity: 0, duration: .1, overwrite: true });
        gsap.to(cur, { width: 12, height: 22, marginLeft: -6, marginTop: -11, borderRadius: 2, opacity: 1, duration: .35, ease: 'expo.out', overwrite: 'auto' });
      }
    }
    /* Relê o que está sob o ponteiro: chamado no mousemove, em qualquer scroll e ao fim do scroll da navegação */
    function syncHover() {
      rafId = 0;
      var el = ptr.inside ? document.elementFromPoint(ptr.x, ptr.y) : null;
      if (leavingTo) return; // já navegando para um case: não mexe na prévia
      var busy = autoScrolling || menuOpen;
      cursorTo(el ? el.closest('a, button, .jconfirm-closeIcon') : null);
      setRow(!busy && !isMobile.matches && el ? el.closest('.row a') : null, ptr.y);
    }
    function queueSync() { if (!rafId) rafId = requestAnimationFrame(syncHover); }
    window.addEventListener('mousemove', function (e) {
      ptr.x = e.clientX; ptr.y = e.clientY; ptr.inside = true;
      cx(e.clientX); cy(e.clientY); pvX(e.clientX); pvY(e.clientY);
      var dx = e.clientX - lastX; lastX = e.clientX;
      gsap.to(preview, { rotate: gsap.utils.clamp(-12, 12, dx * .8), duration: .6, ease: 'power3' });
      var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      fls.forEach(function (f) { f.x(nx * 60 * f.d); f.y(ny * 60 * f.d); });
      queueSync();
    });
    window.addEventListener('scroll', queueSync, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { ptr.inside = false; queueSync(); gsap.to(cur, { opacity: 0, duration: .2 }); });
    document.documentElement.addEventListener('mouseenter', function () { gsap.to(cur, { opacity: 1, duration: .2 }); });
    window.addEventListener('blur', function () { ptr.inside = false; queueSync(); });
    onScrollDone = queueSync;
    document.addEventListener('click', function () { setTimeout(queueSync, 260); });
    $$('[data-magnetic]').forEach(function (el) {
      var mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' });
      var my = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .35); my((e.clientY - r.top - r.height / 2) * .35);
      });
      el.addEventListener('mouseleave', function () { mx(0); my(0); });
      window.addEventListener('scroll', function () { if (curEl !== el) { mx(0); my(0); } }, { passive: true });
    });
  }

  /* Página 404: mostra o endereço que não existe, dígitos sobem e inclinam seguindo o mouse */
  if (document.body.classList.contains('page-404')) {
    var pathEl = $('.e404-path');
    if (pathEl) pathEl.textContent = '[ ' + decodeURIComponent(location.pathname) + ' ]';
    gsap.from('.e404-big .d', { yPercent: 110, rotate: 8, autoAlpha: 0, duration: 1.2, stagger: .08, ease: 'expo.out', delay: .1 });
    gsap.from('.e404 .meta, .e404-phrase, .e404-actions', { y: 28, autoAlpha: 0, duration: 1, stagger: .08, delay: .45, ease: 'expo.out' });
    if (matchMedia('(pointer: fine)').matches) {
      var eDigits = $$('.e404-big .d').map(function (d) {
        return { rx: gsap.quickTo(d, 'rotationX', { duration: .8, ease: 'power3' }), ry: gsap.quickTo(d, 'rotationY', { duration: .8, ease: 'power3' }), x: gsap.quickTo(d, 'x', { duration: .8, ease: 'power3' }) };
      });
      window.addEventListener('mousemove', function (e) {
        var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
        eDigits.forEach(function (s, i) { var k = 1 + (i % 3) * .35; s.ry(nx * 28 * k); s.rx(-ny * 22 * k); s.x(nx * 18 * k); });
      });
    }
  }

  /* Página de case: entrada do conteúdo + duotone que se desfaz revelando a cor real */
  if (isCase) {
    // Com prerender (speculation rules na home) a página roda escondida antes do clique:
    // a entrada só começa quando ela é de fato exibida (prerenderingchange).
    var caseIntro = gsap.timeline({ paused: true })
      .from('.case-meta, .case-lead', { y: 24, autoAlpha: 0, duration: 1, stagger: .08, ease: 'expo.out' }, .2)
      .to('.case-art .duo', { opacity: 0, duration: 1.4, ease: 'power2.inOut' }, .9)
      .to('.case-art img', { filter: 'grayscale(0)', duration: 1.4, ease: 'power2.inOut' }, .9);
    if (document.prerendering) document.addEventListener('prerenderingchange', function () { caseIntro.play(); }, { once: true });
    else caseIntro.play();
    gsap.from('.case-info > div', { y: 40, autoAlpha: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.case-info', start: 'top 90%', once: true } });
    gsap.from('.case-text p, .case-stack li, .case-note', { y: 40, autoAlpha: 0, duration: 1, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: '.case-body', start: 'top 80%', once: true } });
    $$('.gal-item').forEach(function (fig) {
      gsap.from(fig, { y: 70, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 90%', once: true } });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  window.tcToast = toast;
})();
