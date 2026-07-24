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
        var SCROLL_GAP = 40;

        // Mesmo cálculo usado pelos links da navbar (site.js): o header assume
        // a classe "scrolled" (altura menor) assim que o scroll começa, então
        // o destino precisa ser calculado com a altura que o header terá em
        // repouso, não com a altura atual.
        function headerHAtRest() {
            var $header = $('header'),
                wasScrolled = $header.hasClass('scrolled'),
                h;

            if (!wasScrolled) $header.addClass('scrolled');
            h = $header.outerHeight() || 0;
            if (!wasScrolled) $header.removeClass('scrolled');

            return h;
        }

        $('.scroll-to').on('click', function (e) {

            var targetHref = $(this).attr('href'),
                $target = $(targetHref);

            if (!$target.length) return;

            e.preventDefault();

            var $anchor = $target.find('.content .pre-title').first(),
                $scrollTarget = $anchor.length ? $anchor : $target,
                targetY = $scrollTarget.offset().top - headerHAtRest() - SCROLL_GAP;

            window.scrollTo({ top: targetY, behavior: 'smooth' });

        });
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
});