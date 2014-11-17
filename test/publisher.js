var es = require('event-stream');
var ReadableStream = es.map( function ( file, cb) {console.log(file);cb()});
var gulpS3 = sinon.stub().returns( ReadableStream );

var gulp = require('gulp');
var mocha = require('gulp-mocha');

var rmdir = require('rmdir');

var mox = require('./mock-knox');

// var publisher = require('../publisher');
var publisher = SandboxedModule.require('../publisher', {
	requires: { 
		'gulp-s3': gulpS3,
		'event-stream': es,
		'knox': mox
	}
});

describe('publisher', function () {

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

			var publisher_test = publisher( options );
			expect(publisher_test.location).to.equal('https://d2660orkic02xl.cloudfront.net/apps/some-ID/dev/some-tag/');
		});
	});

	describe('stream', function () {
		it('should pipe stream into s3 but not change the file content', function (done) {
			var options = {
				appID: 'some-ID',
				creds: { key: 'key-a', secret: 'some-secret' },
				devTag: 'some-tag'
			};

			gulp.src('./test/dist/**')
				.pipe( publisher(options) )
				.on('end', function() {
					
					console.log('done end');
					done();
				});

			gulpS3.should.have.been.called;
		});

		it('should expect an error when give a wrong key', function (done) {
			var options = {
				appID: 'some-ID',
				creds: { key: 'wrong-key', secret: 'some-secret' },
				devTag: 'some-tag'
			}; 
			
			gulp.src('./test/dist/**')
				.pipe( publisher(options) )
				.on('error', function(err) {				
					done();
					expect(err).to.be.not.undefined;					
			});

		});

		it('should pipe gulp.src into s3', function (done) {
			var options = {
				appID: 'some-ID',
				creds: { key: 'some-key', secret: 'some-secret' },
				devTag: 'some-empty-tag'
			}; 
			
			gulp.src('./test/dist/**')
				.pipe( publisher(options) )
				.on('end', function() {				

					console.log('done end');
					done();					
			});


			gulpS3.should.have.been.called;

		});

		after(function (done) {
			console.log('after');
			rmdir('./test/amazon/apps/some-ID/dev/some-empty-tag', function() {
				done();
			})
		});
	});

});
