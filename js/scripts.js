$(function () {
     setTimeout(function() {
        history.replaceState('', document.title, window.location.origin + window.location.pathname + window.location.search);
    }, 5);

    $('.recent-works-cards #card_1').on('click', function () {
        $.dialog({
            title: '',
            content: 'url:/modals/hdc-eventos.html',
            closeIconClass: 'bx bx-x',
            animateFromElement: false,
            animationSpeed: 200
        });
    });

    $('.recent-works-cards #card_2').on('click', function () {
        $.dialog({
            title: '',
            content: 'url:/modals/rubrum-site-v2.html',
            closeIconClass: 'bx bx-x',
            animateFromElement: false,
            animationSpeed: 200
        });
    });

    $('.recent-works-cards #card_3').on('click', function () {
        $.dialog({
            title: '',
            content: 'url:/modals/rubrum-site-v1.html',
            closeIconClass: 'bx bx-x',
            animateFromElement: false,
            animationSpeed: 200
        });
    });

    $('.recent-works-cards #card_4').on('click', function () {
        $.dialog({
            title: '',
            content: 'url:/modals/rubrum.html',
            closeIconClass: 'bx bx-x',
            animateFromElement: false,
            animationSpeed: 200
        });
    });

    function stickyNavigation() {
        var offset = $('.header').offset(),
            navParent = $('.header'),
            nav = navParent.find('div');

        function handleScroll() {
            if (window.pageYOffset > 0 || window.pageYOffset > offset.top) {
                navParent.addClass('scrolled');
                nav.addClass('header-fixed');
            } else {
                navParent.removeClass('scrolled');
                nav.removeClass('header-fixed');
            }
        }

        $(window).on('scroll', handleScroll);

        handleScroll();
    }

    function scrollToNavigate() {
        // Cálculo de destino/offset compartilhado com os links do menu — ver
        // window.smoothScrollTo em js/site.js.
        $('.scroll-to').on('click', function (e) {

            var targetHref = $(this).attr('href'),
                $target = $(targetHref);

            if (!$target.length) return;

            e.preventDefault();

            window.smoothScrollTo($target);

        });
    }

    // Painel do menu mobile (ver .nav-toggle e header.nav-is-open em style.css).
    // Fecha ao clicar num link, no Esc, ou se a tela voltar a ficar larga com o
    // painel ainda aberto — pra nunca sobrar um overlay travado escondido atrás.
    function mobileNavToggle() {
        var $header = $('.header'),
            $toggle = $('#navToggle'),
            $nav = $('#mainNav');

        if (!$toggle.length || !$nav.length) return;

        // overflow:hidden sozinho no html/body faz o navegador (principalmente
        // mobile) descartar o scroll atual e voltar pro topo quando o painel
        // abre no meio da página. Guardamos o scrollY de antes de travar e
        // fixamos o body nessa posição (top negativo) — ver html.nav-open no
        // style.css — restaurando com scrollTo ao fechar.
        var lockedScrollY = 0;

        function closeMenu() {
            $header.removeClass('nav-is-open');
            $toggle.attr('aria-expanded', 'false');
            document.documentElement.classList.remove('nav-open');
            document.body.style.top = '';
            window.scrollTo(0, lockedScrollY);
        }

        function openMenu() {
            lockedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
            $header.addClass('nav-is-open');
            $toggle.attr('aria-expanded', 'true');
            document.documentElement.classList.add('nav-open');
            document.body.style.top = (-lockedScrollY) + 'px';
        }

        $toggle.on('click', function () {
            if ($header.hasClass('nav-is-open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // O scroll suave em si é disparado pelo handler de click de site.js,
        // ligado direto no <a> (fase de bubble). Se a gente também fechasse o
        // painel só na fase de bubble, a ordem entre os dois handlers dependeria
        // de qual script rodou primeiro — e como fechar o menu tira o
        // "html.nav-open" (overflow:hidden que trava o scroll da página), se
        // esse handler rodasse DEPOIS do de site.js, o window.scrollTo já teria
        // sido chamado com a página ainda travada e não ia rolar nada. Ouvindo
        // na fase de CAPTURA a partir do <nav> (ancestral do link) garante que
        // o painel fecha e o scroll é liberado antes do clique chegar no <a>.
        //
        // Só faz sentido chamar closeMenu() se o painel estiver de fato aberto
        // (mobile) — sem esse "if", o handler disparava em QUALQUER clique num
        // link do menu, inclusive no desktop, onde lockedScrollY nunca é
        // atualizado (fica 0 pra sempre, já que openMenu() só roda no toggle
        // mobile) e o window.scrollTo(0, 0) do closeMenu() jogava a página pro
        // topo antes do smoothScrollTo de site.js calcular o destino certo.
        $nav[0].addEventListener('click', function (e) {
            if ($header.hasClass('nav-is-open') && e.target.closest('a.nav-link')) closeMenu();
        }, true);

        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && $header.hasClass('nav-is-open')) closeMenu();
        });

        var deskMq = window.matchMedia('(min-width: 901px)');
        function handleDeskMq(e) {
            if (e.matches) closeMenu();
        }
        if (deskMq.addEventListener) {
            deskMq.addEventListener('change', handleDeskMq);
        } else if (deskMq.addListener) {
            deskMq.addListener(handleDeskMq);
        }
    }

    function copyEmailButton() {
        var $btn = $('#btn-copy-email');

        if (!$btn.length) return;

        $btn.on('click', function (e) {
            e.preventDefault();

            var email = $btn.data('email'),
                $label = $btn.find('.label'),
                originalLabel = $label.text();

            function showFeedback(text) {
                $label.text(text);
                setTimeout(function () {
                    $label.text(originalLabel);
                }, 2000);
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(function () {
                    showFeedback('E-mail copiado!');
                }).catch(function () {
                    window.location.href = 'mailto:' + email;
                });
            } else {
                window.location.href = 'mailto:' + email;
            }
        });
    }


    stickyNavigation();
    scrollToNavigate();
    copyEmailButton();
    mobileNavToggle();
});