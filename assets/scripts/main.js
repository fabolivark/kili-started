(function ($) {
  var NameSpace = {
    // All pages
    'common': {
      init: function () {

      },
      finalize: function () {
        let url = window.location;
        let urlPath = url.href.replace(url.hash, '');
        $('.js-menu-item').removeClass('active');
        if ($('.js-menu-item a[href="' + urlPath + '"]').length > 0) {
          $('.js-menu-item a[href="' + urlPath + '"]').parent().addClass('active');
        } else {
          $('.js-menu-item a[href="' + url.pathname + '"]').parent().addClass('active');
        }
      }
    },
    // Home page
    'home': {
      init: function () {
        // JavaScript to be fired on the home page
      },
      finalize: function () {
        // JavaScript to be fired on the home page, after the init JS
      }
    }
  };

  // The routing fires all common scripts, followed by the page specific scripts.
  // Add additional events for more control over timing e.g. a finalize event
  var UTIL = {
    fire: function (func, funcname, args) {
      var fire;
      var namespace = NameSpace;
      funcname = (funcname === undefined) ? 'init' : funcname;
      fire = func !== '';
      fire = fire && namespace[func];
      fire = fire && typeof namespace[func][funcname] === 'function';

      if (fire) {
        namespace[func][funcname](args);
      }
    },
    loadEvents: function () {
      // Fire common init JS
      UTIL.fire('common');

      // Fire page-specific init JS, and then finalize JS
      $.each(document.body.className.replace(/-/g, '_').split(/\s+/), function (i, classnm) {
        UTIL.fire(classnm);
        UTIL.fire(classnm, 'finalize');
      });

      // Fire common finalize JS
      UTIL.fire('common', 'finalize');
    }
  };

  // Load Events
  $(document).ready(UTIL.loadEvents);

})(jQuery); // Fully reference jQuery after this point.