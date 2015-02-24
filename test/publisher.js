/*jshint expr: true*/

var gulp = require('gulp'),
	proxyquire = require('proxyquire');

// We need to return a stream, but it doesn't matter what the stream is
var s3 = sinon.stub().returns(gulp.src(''));

var publisher = proxyquire('../src/publisher', {
	'gulp-s3': s3
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

			it( 'should return the proper address when no bucket name provided', function () {
				var location = publisher[val]( options ).getLocation();
				var urlVal = ( val === 'app' ) ? 'apps' : val;
				expect( location ).to.equal(
						'https://s.brightspace.com/' + urlVal + '/myId/dev/myDevTag/'
					);

			});

            it( 'should return the proper address when a bucket name is provided', function () {
                var bucketOptions = JSON.parse(JSON.stringify(options)); // to clone the object
                bucketOptions.creds.bucket = 'test-bucket';
                var location = publisher[val]( bucketOptions ).getLocation();
                var urlVal = ( val === 'app' ) ? 'apps' : val;
                expect( location ).to.equal(
                    'https://s3.amazonaws.com/test-bucket/' + urlVal + '/myId/dev/myDevTag/'
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
