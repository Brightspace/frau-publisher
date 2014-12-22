/*jshint expr: true*/

var es = require('event-stream'),
	gulp = require('gulp'),
	mox = require('./mock-knox'),
	optionsValidator = require('../src/optionsValidator'),
	proxyquire = require('proxyquire');

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
		overwrite = proxyquire('../src/overwrite', {
			knox: mox
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
		var opts = getOptions('key-a');
		gulp.src('./test/support/file.js')
			.pipe( overwrite( opts ) )
			.on( 'data', dataHandler )
			.on( 'error', function( err ) {
				var expectedErrorMsg = overwrite._getErrorMsg( opts );
				expect( dataHandler ).to.not.be.called;
				expect( err ).to.eql(new Error( expectedErrorMsg ) );
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
