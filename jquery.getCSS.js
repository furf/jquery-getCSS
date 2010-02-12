/**
 * jQuery.getCSS plugin
 * http://github.com/furf/jquery-getcss
 *
 * Copyright 2010, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function ($) {

  var head = document.getElementsByTagName('head')[0],
      loadedCompleteRegExp = /loaded|complete/,
      callbacks = {},
      callbacksNb = 0,
      timer;

  $.getCSS = function (url, options, callback) {

    if ($.isFunction(options)) {
      callback = options;
      options  = {};
    }
    
    var link = document.createElement('link');
    
    link.rel   = 'stylesheet';
    link.type  = 'text/css';
    link.media = options.media || 'screen';
    link.href  = url;
    
    if (options.charset) {
      link.charset = options.charset;
    }
    
    if (options.title) {
      callback = (function (callback) {
        return function () {
          link.title = options.title;
          callback();
        };
      })(callback);
    }
            
    // onreadystatechange
    if (link.readyState) {

      link.onreadystatechange = function () {
        if (loadedCompleteRegExp.test(link.readyState)) {
          link.onreadystatechange = null;
          callback();
        }
      };

    // If onload is available, use it
    } else if (link.onload === null /* exclude Webkit => */ && link.all) {
      link.onload = function () {
        link.onload = null;
        callback();
      };

    // In any other browser, we poll
    } else {

      callbacks[link.href] = function () {
        callback();
      };

      if (!callbacksNb++) {
        // poll(cssPollFunction);

        timer = setInterval(function () {
          
          var callback,
              stylesheet,
              stylesheets = document.styleSheets,
              href,
              i = stylesheets.length;

          while (i--) {
            stylesheet = stylesheets[i];
            if ((href = stylesheet.href) && (callback = callbacks[href])) {
              try {
                // We store so that minifiers don't remove the code
                callback.r = stylesheet.cssRules;
                // Webkit:
                // Webkit browsers don't create the stylesheet object
                // before the link has been loaded.
                // When requesting rules for crossDomain links
                // they simply return nothing (no exception thrown)
                // Gecko:
                // NS_ERROR_DOM_INVALID_ACCESS_ERR thrown if the stylesheet is not loaded
                // If the stylesheet is loaded:
                //  * no error thrown for same-domain
                //  * NS_ERROR_DOM_SECURITY_ERR thrown for cross-domain
                throw 'SECURITY';
              } catch(e) {
                // Gecko: catch NS_ERROR_DOM_SECURITY_ERR
                // Webkit: catch SECURITY
                if (/SECURITY/.test(e)) {

                  // setTimeout(callback, 0);
                  callback();

                  delete callbacks[href];
                  
                  if (!--callbacksNb) {
                    timer = clearInterval(timer);
                  }
                  
                }
              }
            }
          }
        }, 13);
      }
    }
    
    head.appendChild(link);

  };

})(jQuery);
