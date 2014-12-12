/*jshint expr: true*/

var gulp = require('gulp'),
	es = require('event-stream');

var s3 = sinon.stub().returns(es.readArray([]));
var publisher = SandboxedModule.require('../src/publisher', {
	requires: {
		'gulp-s3': s3,
		'event-stream': es,
		'./compressor': require('../src/compressor'),
		'./optionsValidator': require('../src/optionsValidator'),
		'./overwrite': require('../src/overwrite')
	}
} );

var options = {
		id: 'myId',
		creds: { key: 'myKey', secret: 'mySecret' },
		devTag: 'myDevTag'
	};

describe('publisher', function () {

	beforeEach( function() {
		s3.reset();
	} );

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

	describe('_helper', function() {

		it ( 'should call s3 with correct options', function() {
			var stream = publisher._helper( options, 'path/' ).getStream();
			expect( s3 ).to.be.calledWith( sinon.match.any, { uploadPath: 'path/myId/dev/myDevTag/' } );
		} );

	} );

});
