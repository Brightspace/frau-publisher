var es = require('event-stream');
var gulp = require('gulp');
var mox = require('./mock-knox');

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
				'knox': mox
			}
		});
	});

	describe ('Parameter', function () {
		it('should throw with null options', function() {
			expect(publisher).to.throw( 'Missing options' );
		});

		it('should throw with empty options', function() {
			expect(function() {
				publisher({});
			}).to.throw( 'Missing app id' );
		});

		it('should throw with no credentials', function() {
			var options = { 
				appID: 'some-ID',            
				devTag: 'some-tag'
			}
			expect(function() {
				publisher(options);
			}).to.throw( 'Missing credentials' );
		});

		it('should throw with no key', function() {
			var options = { 
				appID: 'some-ID',            
				creds: {},
				devTag: 'some-tag'
			}
			expect(function() {
				publisher(options);
			}).to.throw( 'Missing credential key' );
		});

		it('should throw with no secret', function() {
			var options = {
				appID: 'some-ID',
				creds: {
					key: 'some-key'
				},
				devTag: 'some-tag'
			};

			expect(function() {
				publisher(options);
			}).to.throw( 'Missing credential secret' );
		});

		it('should throw with no devTag', function() {
			var options = {
				appID: 'some-ID',
				creds: {
					key: 'some-key',
					secret: 'some-secret'
				}
			};

			expect(function() {
				publisher(options);
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
				publisher(options);
			}).to.throw( 'Missing app id' );
		});

		it ('should not throw even if there is extra info in the creds', function() {
			var options = {
				appID: 'some-ID',
				creds: {
					key: 'some-key',
					secret: 'some-secret',
					useless: 'testetetse'
				},
				devTag: 'some-tag'
			};

			expect(function() {
				publisher(options);
			}).to.not.throw();
		});
	});

	describe('location', function () {
		it('should return the proper address', function () {
			var options = {
				appID: 'some-ID',
				creds: { key: 'some-key', secret: 'some-secret' },
				devTag: 'some-tag'
			};

			expect(publisher( options ).location).to.equal('https://d2660orkic02xl.cloudfront.net/apps/some-ID/dev/some-tag/');
		});
	});

	describe('stream', function () {
		

		it('should pipe stream into a s3 bucket with content but not change the file content', function (done) {
			var options = {
				appID: 'some-ID',
				creds: { key: 'key-a', secret: 'some-secret' },
				devTag: 'some-tag'
			};

			var passedData = false;
			gulp.src('./test/dist/**')
				.pipe( publisher(options) )
				.on('data', function (data) {	
					
					passedData = true;
										
				})
				.on('end', function (err) {

					expect(passedData).to.be.false;
					done();
				});
		});

		it('should pipe stream into an empty s3 bucket and change the file content', function (done) {
			var options = {
				appID: 'some-ID',
				creds: { key: 'some-key', secret: 'some-secret' },
				devTag: 'some-tag'
			};

			var passedData = false;
			gulp.src('./test/dist/**')
				.pipe( publisher(options) )
				.on('data', function (data) {			
					
					passedData = true;
										
				})
				.on('end', function (err) {
					expect(passedData).to.be.true;
					done();
				});
		});

		it('should expect an error when give a wrong key', function (done) {
			var options = {
				appID: 'some-ID',
				creds: { key: 'wrong-key', secret: 'some-secret' },
				devTag: 'some-tag'
			}; 
			
			var hasError;
			gulp.src('./test/dist/**')
				.pipe( publisher(options) )
				.on('error', function (err) {			

					hasError = true;
					expect(hasError).to.be.true;
					done();
										
				});

		});
	});

});
