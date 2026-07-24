(function () {
    let resolveReady;
    const readyPromise = new Promise((resolve) => { resolveReady = resolve; });
    window.__pageLoader = { ready: readyPromise };

    function imageReady(img) {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
        });
    }

    function windowLoaded() {
        if (document.readyState === 'complete') return Promise.resolve();
        return new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
    }

    function init() {
        const loader = document.getElementById('pageLoader');

        if (!loader) { resolveReady(); return; }

        const fill = document.getElementById('pageLoaderFill');
        const percentEl = document.getElementById('pageLoaderPercent');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const heroImg = document.querySelector('.hero .hero-left img');

        document.documentElement.classList.add('is-loading');

        // pesos refletem o que de fato falta pra a página estar pronta:
        // fontes self-hosted, ilustração do hero e o carregamento completo da página.
        const tasks = [
            { weight: 30, promise: (document.fonts && document.fonts.ready) || Promise.resolve() },
            { weight: 35, promise: heroImg ? imageReady(heroImg) : Promise.resolve() },
            { weight: 35, promise: windowLoaded() }
        ];
        const total = tasks.reduce((sum, t) => sum + t.weight, 0);

        let loaded = 0, displayed = 0, target = 0, raf = null, leaving = false;

        function tick() {
            displayed += (target - displayed) * (reduceMotion ? 1 : 0.14);
            if (Math.abs(target - displayed) < 0.15) displayed = target;
            if (fill) fill.style.width = displayed + '%';
            if (percentEl) percentEl.textContent = Math.round(displayed) + '%';

            if (displayed !== target) {
                raf = requestAnimationFrame(tick);
                return;
            }

            raf = null;

            if (target >= 100 && !leaving) {
                leaving = true;
                setTimeout(leave, reduceMotion ? 0 : 260);
            }
        }

        function setTarget(v) {
            target = Math.min(100, v);
            if (!raf) raf = requestAnimationFrame(tick);
        }

        function leave() {
            document.documentElement.classList.remove('is-loading');
            loader.classList.add('is-leaving');
            // resolve um pouco antes do loader sumir de vez, pra sobrepor com a entrada do hero
            setTimeout(resolveReady, reduceMotion ? 0 : 420);
            setTimeout(() => loader.remove(), reduceMotion ? 40 : 650);
        }

        tasks.forEach((task) => {
            task.promise.then(() => {
                loaded += task.weight;
                setTarget((loaded / total) * 100);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
