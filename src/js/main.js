define([
    'get',
    'rvc!templates/appTemplate',
    'rvc!templates/navTemplate',
    'rvc!templates/podcastTemplate',
    'rvc!templates/playerTemplate',
    'iframe-messenger'
], function(
    get,
    AppTemplate,
    NavTemplate,
    PodcastTemplate,
    PlayerTemplate,
    iframeMessenger
) {
   'use strict';

    function init(el, context, config, mediator) {
        // DEBUG: What we get given on boot
      
        //renders the shell
        var base = new AppTemplate({
            el: el,
            components: {
                navTemplate: NavTemplate,
                podcastTemplate: PodcastTemplate,
                playerTemplate: PlayerTemplate
            },
            data: {
                nav: new Array(12)
            }
        })

        //get the data
        var SPREADSHEET_KEY = '19ftM9AI6WngBiZHQwKXxRcN9nFZUWx2Guq-UOuSd5yU';
        get('http://interactive.guim.co.uk/spreadsheetdata/'+SPREADSHEET_KEY+'.json')
            .then(JSON.parse)
            .then(function(json){
                console.log(json)
                //linkmap = json.sheets.cardmapping;
            });


        // Enable iframe resizing on the GU site
        iframeMessenger.enableAutoResize();
    }

    return {
        init: init
    };
});
