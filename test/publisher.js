/*jshint expr: true*/

var gulp  = require('gulp'),
	es    = require('event-stream'),
	publisher = require('../src/publisher');

var options = {
		id: 'myId',
		creds: { key: 'myKey', secret: 'mySecret' },
		devTag: 'myDevTag'
	};

describe('publisher', function () {

	['app','lib'].forEach( function( val ) {

		describe( val + '.getLocation', function () {

			it( 'should return the proper address', function () {
				var location = publisher[val]( options ).getLocation();
				var urlVal = ( val === 'app' ) ? 'apps' : val;
				expect( location ).to.equal(
						'https://s.brightspace.com/' + urlVal + '/myId/dev/myDevTag/'
					);

			});

		} );

		describe( val + '.getStream', function () {

			it( 'should return a valid stream', function () {
				var stream = publisher[val]( options ).getStream();
				expect( stream ).to.not.be.null;
			});

		} );

	} );

});
