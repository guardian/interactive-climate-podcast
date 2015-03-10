define([
    'get',
    'ractive-transitions-slide',
    'rvc!templates/appTemplate',
    'rvc!templates/navTemplate',
    'rvc!templates/podcastTemplate',
    'rvc!templates/playerTemplate',
    'rvc!templates/visualTemplate',
    'rvc!templates/quoteTemplate',
    'rvc!templates/referencesTemplate',
    'rvc!templates/lexiconTemplate',
    'iframe-messenger'
], function(
    get,
    ractiveTransition,
    AppTemplate,
    NavTemplate,
    PodcastTemplate,
    PlayerTemplate,
    VisualTemplate,
    QuoteTemplate,
    ReferencesTemplate,
    LexiconTemplate,
    iframeMessenger
) {
   'use strict';

    var parseUrl = function(){
        var urlParams = window.location.hash.substring(1).split('&');
        var params = {};
        urlParams.forEach(function(param){
            var pair = param.split('=');
            params[ pair[0] ] = pair[1];
        })
        
        return params;
    }

    function init(el, context, config, mediator) {
        // DEBUG: What we get given on boot
      
        //renders the shell
        var base = new AppTemplate({
            el: el,
            components: {
                navTemplate: NavTemplate,
                podcastTemplate: PodcastTemplate,
                playerTemplate: PlayerTemplate,
                visualTemplate: VisualTemplate,
                quoteTemplate: QuoteTemplate,
                referencesTemplate: ReferencesTemplate,
                lexiconTemplate: LexiconTemplate
            },
            onrender: function(){
                this.on({
                    'navTemplate.changeEpisode': function(e, episodeNumber){
                        setSelected(episodeNumber);
                    }
                })
            }
        });

        //store url params
        var params = parseUrl();
        base.set('params', params)

        //set selected element
        var setSelected = function(episodeNumber){
            var podcasts = base.get('podcasts')
            podcasts.forEach(function(d){
                if(d.episode == episodeNumber){
                    d.selected = true;
                }  else {
                    d.selected = false;
                }
            })
            base.set('podcasts', podcasts);
        }


        //get the data
        var SPREADSHEET_KEY = '19ftM9AI6WngBiZHQwKXxRcN9nFZUWx2Guq-UOuSd5yU';
        get('http://interactive.guim.co.uk/spreadsheetdata/'+SPREADSHEET_KEY+'.json')
            .then(JSON.parse)
            .then(function(json){
                var assets = json.sheets.elements;

                //process the data

                var assetArray = [];
                assets.forEach(function(d){
                    if(!assetArray[d.episode]){
                        var storageObj = {
                            episode: d.episode,
                            podcast: {},
                            elementOrder: [],
                            elements: {}
                        }
                        assetArray[d.episode] = storageObj;
                    }

                    // assetArray[d.episode]
                    if(d.elementtype == 'podcast'){
                        assetArray[d.episode].podcast = d;
                    } else {
                        //check of elementtype exists
                        if( !assetArray[d.episode]['elements'][d.elementtype] ){
                            //display elements by order from spreadsheet
                            assetArray[d.episode]['elements'][d.elementtype] = [];
                            //store elements by order from spreadsheet
                            assetArray[d.episode]['elementOrder'].push( d.elementtype )
                        }
                         assetArray[d.episode]['elements'][d.elementtype].push( d );


                    }
                })
                
         
                base.set('podcasts', assetArray.slice(1, assetArray.length))

                setSelected(1);

                //linkmap = json.sheets.cardmapping;
            });



            
        


        // Enable iframe resizing on the GU site
        iframeMessenger.enableAutoResize();
    }

    return {
        init: init
    };
});
