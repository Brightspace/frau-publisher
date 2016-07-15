'use strict';

var gulp = require('gulp'),
	proxyquire = require('proxyquire'),
	optionsValidator = require('../src/optionsValidator');

// We need to return a stream, but it doesn't matter what the stream is
var s3 = sinon.stub().returns(gulp.src(''));

var publisher = proxyquire('../src/publisher', {
	'gulp-s3': s3
} );

var options = {
	targetDirectory: 'myTargetDirectory',
	creds: { key: 'myKey', secret: 'mySecret' },
	devTag: 'myDevTag'
};

describe('publisher', function() {

	beforeEach( function() {
		s3.reset();
	} );

	['app', 'lib'].forEach( function( val ) {

		describe( val + '.getLocation', function() {

			it( 'should return the proper address', function() {
				var location = publisher[val]( options ).getLocation();
				var urlVal = ( val === 'app' ) ? 'apps' : val;
				expect( location ).to.equal(
						'https://s.brightspace.com/' + urlVal + '/myTargetDirectory/dev/myDevTag/'
					);

			});

		} );

		describe( val + '.getStream', function() {

			it( 'should return a valid stream', function() {
				var stream = publisher[val]( options ).getStream();
				expect( stream ).to.not.be.null;
			});

		} );
	} );

	describe('_helper', function() {

		it('should call s3 with correct options', function() {
			var expectedOptions = {
				headers: {
					'cache-control': 'public, max-age=31536000'
				},
				uploadPath: 'path/myTargetDirectory/dev/myDevTag/'
			};
			publisher._helper(options, 'path/').getStream();
			expect(s3).to.be.calledWith(sinon.match.any, expectedOptions);
		});

	} );

	describe('_getSemVerAppConfigs', function() {
		it('should return null for non-release builds', function() {
			var configs = publisher._getSemVerAppConfigs(optionsValidator(options).getVersion());
			expect(configs).to.be.null;
		});

		it('should return two things for release builds', function() {
			var options = {
				targetDirectory: 'foo',
				version: '1.2.3'
			};
			var configs = publisher._getSemVerAppConfigs(optionsValidator(options).getVersion());
			expect(configs).to.be.an('object');
			expect(configs.major).to.equal('appconfig.v1.json.gz');
			expect(configs.majorMinor).to.equal('appconfig.v1.2.json.gz');
		});

	} );

});
