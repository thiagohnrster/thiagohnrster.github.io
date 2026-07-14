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
        $('.scroll-to').on('click', function (e) {

            var targetHref = $(this).attr('href'),
                headerHeight = $('header').outerHeight(),
                $target = $(targetHref);

            if (!$target.length) return;

            e.preventDefault();

            if (typeof lenis !== 'undefined' && lenis) {
                lenis.scrollTo($target[0], { offset: -headerHeight, duration: 1.2 });
            } else {
                $('html, body').animate({
                    scrollTop: $target.offset().top - headerHeight
                }, 1200);
            }
        });
    }


    stickyNavigation();
    scrollToNavigate();
});