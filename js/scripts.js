$(function () {
     setTimeout(function() {
        history.replaceState('', document.title, window.location.origin + window.location.pathname + window.location.search);
    }, 5);

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
                headerHeight = $('header').outerHeight();

            $('html, body').animate({
                scrollTop: $(targetHref).offset().top - headerHeight
            }, 1200);

            e.preventDefault();
        });
    }


    stickyNavigation();
    scrollToNavigate();
});