'use strict';

const proxyquire = require('proxyquire');
const vfs = require('vinyl-fs');

const options = {
	targetDirectory: 'myTargetDirectory',
	creds: { key: 'myKey', secret: 'mySecret' },
	devTag: 'myDevTag'
};

describe('publisher', function() {
	let publisher, s3Factory, s3;

	beforeEach(function() {
		s3 = sinon.stub().returns(Promise.resolve());
		s3Factory = sinon.stub().returns(s3);

		publisher = proxyquire('../src/publisher', {
			'./s3': s3Factory,
			'./overwrite': () => () => Promise.resolve()
		});
	});

	['app', 'lib'].forEach(function(val) {

		describe(val + '.getLocation', function() {

			it('should return the proper address', function() {
				const location = publisher[val](options).getLocation();
				const urlVal = (val === 'app') ? 'apps' : val;
				expect(location).to.equal(
					'https://s.brightspace.com/' + urlVal + '/myTargetDirectory/dev/myDevTag/'
				);

			});

		});

		describe(val + '.getStream', function() {

			it('should return a valid stream', function() {
				const stream = publisher[val](options).getStream();
				expect(stream).to.not.be.null;
			});

		});
	});

	describe('_helper', function() {

		it('should call s3Factory with correct options', function() {
			const expectedOptions = {
				headers: {},
				uploadPath: 'path/myTargetDirectory/dev/myDevTag'
			};
			publisher._helper(options, 'path/').getStream();
			expect(s3Factory).to.be.calledWith(sinon.match.any, expectedOptions);
		});

		it('should stream files to s3', function(done) {
			const options = {
				targetDirectory: 'myTargetDirectory',
				devTag: 'myDevTag',
				creds: {
					key: 'key',
					secret: 'secret'
				}
			};
			const stream = publisher._helper(options, 'path/').getStream();

			vfs.src('./test/support/file.html')
				.pipe(stream)
				.on('end', () => {
					try {
						expect(s3).to.be.calledWith(sinon.match({ _isVinyl: true }));
						done();
					} catch (e) {
						done(e);
					}
				})
				.on('error', done);

		});

		it('should stream files to s3 with session token', function(done) {
			const options = {
				targetDirectory: 'myTargetDirectory',
				devTag: 'myDevTag',
				creds: {
					key: 'key',
					secret: 'secret',
					sessionToken: 'sessionToken'
				}
			};
			const stream = publisher._helper(options, 'path/').getStream();

			vfs.src('./test/support/file.html')
				.pipe(stream)
				.on('end', () => {
					try {
						expect(s3).to.be.calledWith(sinon.match({ _isVinyl: true }));
						done();
					} catch (e) {
						done(e);
					}
				})
				.on('error', done);

		});

		it('should stream files to s3 with no credentials', function(done) {
			const options = {
				targetDirectory: 'myTargetDirectory',
				devTag: 'myDevTag'
			};
			const stream = publisher._helper(options, 'path/').getStream();

			vfs.src('./test/support/file.html')
				.pipe(stream)
				.on('end', () => {
					try {
						expect(s3).to.be.calledWith(sinon.match({ _isVinyl: true }));
						done();
					} catch (e) {
						done(e);
					}
				})
				.on('error', done);

		});

	});

});
