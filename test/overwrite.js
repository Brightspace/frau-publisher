/*jshint expr: true*/

var es = require('event-stream'),
	gulp = require('gulp'),
	mox = require('./mock-knox'),
	optionsValidator = require('../src/optionsValidator'),
	gutil = require('gulp-util');

function getOptions( key ) {
	return optionsValidator( {
		id: 'some-ID',
		initialPath: 'apps/',
		devTag: 'some-tag',
		creds: {
			key: key,
			secret: 'secret'
		}
	} );
}

describe( 'overwrite', function() {

	var dataHandler, overwrite;

	beforeEach( function () {
		dataHandler = sinon.spy();
		overwrite = SandboxedModule.require('../src/overwrite', {
			requires: {
				'event-stream': es,
				'knox': mox,
				'gulp-util': gutil
			}
		} );
		sinon.spy( mox, 'createClient' );
	} );

	afterEach( function() {
		mox.createClient.restore();
	} );

	it( 'should succeed when bucket is empty', function( done ) {
		gulp.src('./test/support/file.js')
			.pipe( overwrite( getOptions('some-key') ) )
			.on( 'data', dataHandler )
			.on( 'end', function( err ) {
				expect( dataHandler ).to.be.called;
				done();
			} );
	} );

	it( 'should error when files exist in bucket', function( done ) {
		gulp.src('./test/support/file.js')
			.pipe( overwrite( getOptions('key-a') ) )
			.on( 'data', dataHandler )
			.on( 'error', function( err ) {
				expect( dataHandler ).to.not.be.called;
				done();
			} );
	} );

	it( 'should handle data.Code error from knox', function( done ) {
		gulp.src('./test/support/file.js')
			.pipe( overwrite( getOptions('wrong-key') ) )
			.on( 'data', dataHandler )
			.on( 'error', function( err ) {
				expect( dataHandler ).to.not.be.called;
				done();
			} );
	} );

	it( 'should ignore a non-buffer file', function( done ) {
		gulp.src('./test/support/file.js')
			.pipe( es.mapSync( function( file ) {
				file.isBuffer = function() { return false; };
				return file;
			} ) )
			.pipe( overwrite( getOptions('some-key') ) )
			.on( 'data', dataHandler )
			.on( 'end', function( err ) {
				expect( dataHandler ).to.not.be.called;
				done();
			} );
	} );

	it( 'should only get knox client once for multiple files', function( done ) {
		gulp.src(['./test/support/file.js','./test/support/file.html'])
			.pipe( overwrite( getOptions('some-key') ) )
			.on( 'end', function() {
				expect( mox.createClient ).to.have.been.calledOnce;
				done();
			} );

	} );

} );
