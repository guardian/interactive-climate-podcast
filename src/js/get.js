define([ 'promise' ], function ( Promise ) {

	'use strict';
	var options = {};

	return function ( url, onsuccess, onerror ) {
			
		return new Promise( function ( fulfil, reject ) {
			var xhr = new XMLHttpRequest();

			xhr.open( 'GET', url );
			if ( options.responseType ) {
				xhr.responseType = options.responseType;
			}

			xhr.onload = function () {
				fulfil( options.responseType ? xhr.response : xhr.responseText );
			};

			xhr.onerror = reject;

			xhr.send();
		});

	
	}

});
