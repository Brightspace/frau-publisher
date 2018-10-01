'use strict';

var proxyquire = require('proxyquire'),
	through = require('through2');

var options = {
	targetDirectory: 'myTargetDirectory',
	creds: { key: 'myKey', secret: 'mySecret' },
	devTag: 'myDevTag'
};

describe('publisher', function() {
	var publisher, s3;

	beforeEach(function() {
		// We need to return a stream, but it doesn't matter what the stream is
		var emptyStream = through.obj();
		s3 = sinon.stub().returns(emptyStream);
		process.nextTick(emptyStream.end.bind(emptyStream));

		publisher = proxyquire('../src/publisher', {
			'gulp-s3': s3
		});
	});

	['app', 'lib'].forEach(function(val) {

		describe(val + '.getLocation', function() {

			it('should return the proper address', function() {
				var location = publisher[val](options).getLocation();
				var urlVal = (val === 'app') ? 'apps' : val;
				expect(location).to.equal(
					'https://s.brightspace.com/' + urlVal + '/myTargetDirectory/dev/myDevTag/'
				);

			});

		});

		describe(val + '.getStream', function() {

			it('should return a valid stream', function() {
				var stream = publisher[val](options).getStream();
				expect(stream).to.not.be.null;
			});

		});
	});

	describe('_helper', function() {

		it('should call s3 with correct options', function() {
			var expectedOptions = {
				headers: {
					'cache-control': 'public,max-age=31536000,immutable'
				},
				uploadPath: 'path/myTargetDirectory/dev/myDevTag/',
				failOnError: true
			};
			publisher._helper(options, 'path/').getStream();
			expect(s3).to.be.calledWith(sinon.match.any, expectedOptions);
		});

	});

});
