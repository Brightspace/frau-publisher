var es    = require('event-stream'),
	gulp  = require('gulp'),
	mox   = require('./mock-knox'),
	gutil = require('gulp-util');

describe('publisher', function () {
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

	describe ('Parameter', function () {
		it('should throw with null options', function() {
			expect(publisher).to.throw( 'Missing options' );
		});

		it('should throw with empty options', function() {
			expect(function() {
				publisher.app({});
			}).to.throw( 'Missing id' );
		});

		it('should throw with no credentials', function() {
			var options = {
				id: 'some-ID',
				devTag: 'some-tag'
			};
			expect(function() {
				publisher.app(options);
			}).to.throw( 'Missing credentials' );
		});

		it('should throw with no key', function() {
			var options = {
				id: 'some-ID',
				creds: {},
				devTag: 'some-tag'
			};
			expect(function() {
				publisher.app(options);
			}).to.throw( 'Missing credential key' );
		});

		it('should throw with no secret', function() {
			var options = {
				id: 'some-ID',
				creds: {
					key: 'some-key'
				},
				devTag: 'some-tag'
			};

			expect(function() {
				publisher.app(options);
			}).to.throw( 'Missing credential secret' );
		});

		it('should throw with no devTag', function() {
			var options = {
				id: 'some-ID',
				creds: {
					key: 'some-key',
					secret: 'some-secret'
				}
			};

			expect(function() {
				publisher.app(options);
			}).to.throw( 'Missing devTag' );
		});

		it('should throw with no id', function() {
			var options = {
				creds: {
					key: 'some-key',
					secret: 'some-secret'
				},
				devTag: 'some-tag'
			};
			expect(function() {
				publisher.app(options);
			}).to.throw( 'Missing id' );
		});

		it ('should not throw even if there is extra info in the creds', function() {
			var options = {
				id: 'some-ID',
				creds: {
					key: 'some-key',
					secret: 'some-secret',
					useless: 'testetetse'
				},
				devTag: 'some-tag'
			};

			expect(function() {
				publisher.app(options);
			}).to.not.throw();
		});

		it ('should not throw when using app publisher', function() {
			var options = {
				id: 'some-ID',
				creds: {
					key: 'some-key',
					secret: 'some-secret',
				},
				devTag: 'some-tag'
			};

			expect(function() {
				publisher.app(options);
			}).to.not.throw();
		});

		it ('should not throw when using library publisher', function() {
			var options = {
				id: 'some-ID',
				creds: {
					key: 'some-key',
					secret: 'some-secret',
				},
				devTag: 'some-tag'
			};

			expect(function() {
				publisher.lib(options);
			}).to.not.throw();
		});

		it('should still work with deprecated "appID"', function() {
			var options = {
				appID: 'some-ID',
				creds: {
					key: 'some-key',
					secret: 'some-secret',
				},
				devTag: 'some-tag'
			};

			expect(function() {
				publisher.lib(options);
			}).to.not.throw();
		});
	});

	describe('location', function () {
		it('should return the proper address', function () {
			var options = {
				id: 'some-ID',
				creds: { key: 'some-key', secret: 'some-secret' },
				devTag: 'some-tag'
			};

			expect(publisher.app( options ).location).to.equal('https://s.brightspace.com/apps/some-ID/dev/some-tag/');
		});

		it('should return the proper address for libraries', function () {
			var options = {
				id: 'some-ID',
				creds: { key: 'some-key', secret: 'some-secret' },
				devTag: 'some-tag'
			};

			expect(publisher.lib( options ).location).to.equal('https://s.brightspace.com/libs/some-ID/dev/some-tag/');
		});

		it('should give precedence to "id" rather than "appID"', function() {
			var options = {
				appID: 'wrong-ID',
				id: 'correct-ID',
				creds: {
					key: 'some-key',
					secret: 'some-secret',
				},
				devTag: 'some-tag'
			};

			expect(publisher.app( options ).location).to.equal('https://s.brightspace.com/apps/correct-ID/dev/some-tag/');
		});
	});

	describe('stream', function () {

		it('should pipe files into a s3-amazon bucket with existing contents but not overwrite contents', function (done) {
			var options = {
				id: 'some-ID',
				creds: { key: 'key-a', secret: 'some-secret' },
				devTag: 'some-tag'
			};

			var dataHandler = sinon.spy();
			gulp.src('./test/dist/**')
				.pipe( publisher.app(options) )
				.on('data', dataHandler)
				.on('end', function (err) {

					expect(dataHandler).to.not.be.called;
					done();
				});
		});

		it('should pipe files into an empty s3-amazon bucket successfully', function (done) {
			var options = {
				id: 'some-ID',
				creds: { key: 'some-key', secret: 'some-secret' },
				devTag: 'some-tag'
			};

			var dataHandler = sinon.spy();
			gulp.src('./test/dist/**')
				.pipe( publisher.app(options) )
				.on('data', dataHandler)
				.on('end', function (err) {
					expect(dataHandler).to.be.called;
					done();
				});
		});

		it('should expect an error when give a wrong key', function (done) {
			var options = {
				id: 'some-ID',
				creds: { key: 'wrong-key', secret: 'some-secret' },
				devTag: 'some-tag'
			};
			
			gulp.src('./test/dist/**')
				.pipe( publisher.app(options) )
				.on('error', function (err) {

					done();
				});

		});
	});

});
