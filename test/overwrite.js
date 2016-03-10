'use strict';

var gulp = require('gulp'),
	proxyquire = require('proxyquire');

describe( 'overwrite', function() {

	var overwrite,
		createClient,
		optsValidator,
		client;

	it( 'should succeed when folder is empty', function( done ) {
		setUpEmptyFolder();

		gulp.src('./test/support/file.js')
			.pipe( overwrite( optsValidator ) )
			.on( 'data', function( data ) {
				try {
					expect( data )
						.to.have.deep.property('history[0]')
						.that.contain('file.js');

					done();
				} catch (e) {
					done(e);
				}
			} );
	} );

	it( 'should error when files exist in bucket', function( done ) {
		setUpNonEmptyFolder();

		optsValidator.getUploadPath.returns('some-folder');
		var expectedErrorMsg = 'No files transferred because files already exists in some-folder';

		gulp.src('./test/support/file.js')
			.pipe( overwrite( optsValidator ) )
			.on( 'data', function() {
				done('should be no data');
			} ).on( 'error', function( err ) {
				try {
					expect(err).to.deep.equal(new Error(expectedErrorMsg));

					done();
				} catch (e) {
					done(e);
				}
			} );
	} );

	it( 'should handle bad data.Code error from knox', function( done ) {
		setUpList(null, { Code: 'some-code', Message: 'some-message' } );

		gulp.src('./test/support/file.js')
			.pipe( overwrite( optsValidator ) )
			.on( 'data', function() {
				done('should be no data');
			}).on( 'error', function( err ) {
				try {
					expect(err).to.deep.equal(new Error('some-message'));

					done();
				} catch (e) {
					done(e);
				}
			} );
	} );

	it( 'should handle err from knox', function( done ) {
		var error = new Error('some-message');
		setUpList(error);

		gulp.src('./test/support/file.js')
			.pipe( overwrite( optsValidator ) )
			.on( 'data', function() {
				done('should be no data');
			}).on( 'error', function( err ) {
				try {
					expect(err).to.equal(error);

					done();
				} catch (e) {
					done(e);
				}
			} );
	} );

	it( 'should only get knox client once for multiple files', function( done ) {
		setUpEmptyFolder();

		gulp.src(['./test/support/file.js', './test/support/file.html'])
			.pipe( overwrite( optsValidator ) )
			.on( 'end', function() {
				try {
					expect( createClient ).to.have.been.calledOnce;

					done();
				} catch (e) {
					done(e);
				}
			} );
	} );

	it( 'should only call knox#list once for multiple files', function( done ) {
		setUpEmptyFolder();

		gulp.src(['./test/support/file.js', './test/support/file.html'])
			.pipe( overwrite( optsValidator ) )
			.on( 'end', function() {
				try {
					expect( client.list ).to.have.been.calledOnce;

					done();
				} catch (e) {
					done(e);
				}
			} );
	} );

	beforeEach( function() {
		client = {
			list: function() {}
		};

		createClient = sinon.spy(function() {
			return client;
		});

		overwrite = proxyquire('../src/overwrite', {
			knox: {
				createClient: createClient
			}
		} );

		optsValidator = {
			getCreds: sinon.stub().returns({}),
			getUploadPath: sinon.stub().returns({})
		};
	} );

	function setUpList(err, data) {
		sinon.stub(client, 'list', function(object, cb) {
			cb(err, data);
		});
	}

	function setUpEmptyFolder() {
		setUpList(null, { Contents: [] });
	}

	function setUpNonEmptyFolder() {
		setUpList(null, { Contents: [ 'file.js'] });
	}
} );
