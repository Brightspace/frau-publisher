var es    = require('event-stream'),
	gulp  = require('gulp'),
	mox   = require('./mock-knox'),
	gutil = require('gulp-util');

describe('Library Publisher', function () {
	var publisher,
		gulpS3,
		mockedStream;

	// replace all the required module with either mocked module or 
	// the exact same module so that istanbul would not include them in the coverage
	beforeEach(function() {
		mockedStream = es.mapSync( function (file) { return file;});
		gulpS3 = sinon.stub().returns( mockedStream );
		publisher = SandboxedModule.require('../publisher', {
			requires: {
				'gulp-s3': gulpS3,
				'event-stream': es,
				'knox': mox,
				'gulp-util': gutil
			}
		});

	});
	describe('Parameter', function () {
		it('should throw with null options', function() {
			expect(publisher.libs).to.throw( 'Missing options' );
		});

		it('should throw with empty options', function() {
			expect(function() {
				publisher.libs({});
			}).to.throw( 'Missing lib id' );
		});

		it('should throw with no credentials', function() {
			var options = {
				libID: 'some-ID',
				devTag: 'some-tag'
			};
			expect(function() {
				publisher.libs(options);
			}).to.throw( 'Missing credentials' );
		});

		it('should throw with no key', function() {
			var options = {
				libID: 'some-ID',
				creds: {},
				devTag: 'some-tag'
			};
			expect(function() {
				publisher.libs(options);
			}).to.throw( 'Missing credential key' );
		});

		it('should throw with no secret', function() {
			var options = {
				libID: 'some-ID',
				creds: {
					key: 'some-key'
				},
				devTag: 'some-tag'
			};

			expect(function() {
				publisher.libs(options);
			}).to.throw( 'Missing credential secret' );
		});

		it('should throw with no devTag', function() {
			var options = {
				libID: 'some-ID',
				creds: {
					key: 'some-key',
					secret: 'some-secret'
				}
			};

			expect(function() {
				publisher.libs(options);
			}).to.throw( 'Missing devTag' );
		});

		it('should throw with no appID', function() {
			var options = {
				creds: {
					key: 'some-key',
					secret: 'some-secret'
				},
				devTag: 'some-tag'
			};
			expect(function() {
				publisher.libs(options);
			}).to.throw( 'Missing lib id' );
		});

		it ('should not throw even if there is extra info in the creds', function() {
			var options = {
				libID: 'some-ID',
				creds: {
					key: 'some-key',
					secret: 'some-secret',
					useless: 'testetetse'
				},
				devTag: 'some-tag'
			};

			expect(function() {
				publisher.libs(options);
			}).to.not.throw();
		});
	});

	describe('location', function () {
		it('should return the proper address', function () {
			var options = {
				libID: 'some-ID',
				creds: { key: 'some-key', secret: 'some-secret' },
				devTag: 'some-tag'
			};

			expect(publisher.libs( options ).location).to.equal('https://s.brightspace.com/libs/some-ID/dev/some-tag/');
		});
	});

	describe('stream', function () {

		it('should pipe files into a s3-amazon bucket with existing contents but not overwrite contents', function (done) {
			var options = {
				libID: 'some-ID',
				creds: { key: 'key-a', secret: 'some-secret' },
				devTag: 'some-tag'
			};

			var dataHandler = sinon.spy();
			gulp.src('./test/dist/**')
				.pipe( publisher.libs(options) )
				.on('data', dataHandler)
				.on('end', function (err) {

					expect(dataHandler).to.not.be.called;
					done();
				});
		});

		it('should pipe files into an empty s3-amazon bucket successfully', function (done) {
			var options = {
				libID: 'some-ID',
				creds: { key: 'some-key', secret: 'some-secret' },
				devTag: 'some-tag'
			};

			var dataHandler = sinon.spy();
			gulp.src('./test/dist/**')
				.pipe( publisher.libs(options) )
				.on('data', dataHandler)
				.on('end', function (err) {
					expect(dataHandler).to.be.called;
					done();
				});
		});

		it('should expect an error when give a wrong key', function (done) {
			var options = {
				libID: 'some-ID',
				creds: { key: 'wrong-key', secret: 'some-secret' },
				devTag: 'some-tag'
			};
			
			gulp.src('./test/dist/**')
				.pipe( publisher.libs(options) )
				.on('error', function (err) {

					done();
				});
		});
	});
});