'use strict';

var proxyquire = require('proxyquire');

var options = {
	targetDirectory: 'myTargetDirectory',
	creds: { key: 'myKey', secret: 'mySecret' },
	devTag: 'myDevTag'
};

describe('publisher', function() {
	var publisher, s3;

	beforeEach(function() {
		s3 = sinon.stub().returns(Promise.resolve());

		publisher = proxyquire('../src/publisher', {
			'./s3': s3
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
				headers: {},
				uploadPath: 'path/myTargetDirectory/dev/myDevTag'
			};
			publisher._helper(options, 'path/').getStream();
			expect(s3).to.be.calledWith(sinon.match.any, expectedOptions);
		});

	});

});
