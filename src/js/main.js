define([
    'rvc!templates/appTemplate',
    'rvc!templates/navTemplate',
    'rvc!templates/podcastTemplate',
    'iframe-messenger'
], function(
    AppTemplate,
    NavTemplate,
    PodcastTemplate,
    iframeMessenger
) {
   'use strict';

    function init(el, context, config, mediator) {
        // DEBUG: What we get given on boot
      

        var base = new AppTemplate({
            el: el,
            components: {
                navTemplate: NavTemplate,
                podcastTemplate: PodcastTemplate
            },
            data: {
                nav: new Array(12)
            }
        })



        // Enable iframe resizing on the GU site
        iframeMessenger.enableAutoResize();
    }

    return {
        init: init
    };
});
