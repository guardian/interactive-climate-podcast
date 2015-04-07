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
    'rvc!templates/videoTemplate',
    'rvc!templates/shareTemplate',
    'iframe-messenger',
    'analytics'
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
    VideoTemplate,
    ShareTemplate,
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
                lexiconTemplate: LexiconTemplate,
                videoTemplate: VideoTemplate,
                shareTemplate: ShareTemplate
            },
            onrender: function(){
                this.on({
                    'navTemplate.changeEpisode': function(e, podcast){
           
                        if(podcast.published == 'TRUE'){
                            setSelected(podcast.episode, true);
                        }
                        
                    },
                    'podcastTemplate.showContent': function(e, episode){
             
                            
                            var podcasts = base.get('podcasts');

                            podcasts.forEach(function(d,i){
                                if(d.episode == episode){
                                    d.hasBeenViewed = true;
                                }
                            })
                            base.set('podcasts', podcasts);
                    }
                })

                this.observe( {
                    'podcasts.*.hasPlayed': function ( newValue, oldValue, keypath ) {
                        var index = /podcasts.(\d+).hasPlayed/.exec( keypath )[1];
                        var episodeNumber = this.get('podcasts[' + index +']');
                        if(newValue == true){
                            window.ga('send', {
                              'hitType': 'event',          // Required.
                              'eventCategory': 'episode ' + episodeNumber.episode,   // Required.
                              'eventAction': 'play'     // Required.

                            });
                        }
                    },
                    'podcasts.*.isPlaying': function ( newValue, oldValue, keypath ) {
                        var index = /podcasts.(\d+).isPlaying/.exec( keypath )[1];
                        if(newValue == true){
                            var index = /podcasts.(\d+).isPlaying/.exec( keypath )[1];

                            var podcasts = base.get('podcasts')

                            podcasts.forEach(function(d,i){
                                if(i!=index){
                                    d.isPlaying = false;
                                    d.selected = false;
                                } else {
                                    d.selected = true;
                                    d.hasBeenViewed = true;
                                }
                            })
                            base.set('podcasts', podcasts);
                        }

                    }

                    
                });
            }
        });

        //store url params
        var params = parseUrl();
        base.set('params', params)

        //set selected element
        var setSelected = function(episodeNumber, animate){
            var podcasts = base.get('podcasts')
            var curEl = undefined;

            podcasts.forEach(function(d,i){
                if(d.episode == episodeNumber){
                    d.selected = true;
                    d.hasBeenViewed = true;
                    if(animate && !params.embed){
                        curEl = document.getElementsByClassName('guPodcasts')[i];
  

                    }
                    
                }  else {
                    d.selected = false;
                }
            })
            base.set('podcasts', podcasts);

            if(curEl != undefined){
                curEl.scrollIntoView()
            }
    
        }


        //get the data
        var SPREADSHEET_KEY = '19ftM9AI6WngBiZHQwKXxRcN9nFZUWx2Guq-UOuSd5yU';
        get('http://interactive.guim.co.uk/spreadsheetdata/'+SPREADSHEET_KEY+'.json')
            .then(JSON.parse)
            .then(function(json){

                //header data from google spreadsheet
          
                base.set('config', json.sheets.config[0]);
        
                //list of default assets from google spreadsheet
                var assets = json.sheets.elements;

                //process the data
                var assetArray = [];
                assets.forEach(function(d){
                    if(!assetArray[d.episode]){
                        var storageObj = {
                            episode: d.episode,
                            podcast: {},
                            elementOrder: [],
                            elements: {},
                            hasPlayed: false,
                            isPlaying: false,
                            hasBeenViewed: false
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

                if(params.episode){
                    setSelected(params.episode, true);
                } else {
                    setSelected(1, false);
                }

                

                //linkmap = json.sheets.cardmapping;
            });



            
        


        // Enable iframe resizing on the GU site
        iframeMessenger.enableAutoResize();
    }

    return {
        init: init
    };
});
