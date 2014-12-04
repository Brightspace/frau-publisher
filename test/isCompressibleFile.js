var fs = require('fs'),
	isCompressibleFile = require('../src/compressor')
	._isCompressibleFile,
	path = require('path');

function isCompressibleHelper( filename ) {
	var filePath = path.join( './test/support', filename );
	var stream = fs.createReadStream( filePath );
	var isCompressible = isCompressibleFile( stream );
	return isCompressible;
}

describe( 'compressor', function() {

	describe( 'isCompressibleFile', function() {

		it( 'should compress JS files', function() {
			var isCompressible = isCompressibleHelper( 'file.js' );
			expect( isCompressible ).to.equal( true );
		} );

		it( 'should compress CSS files', function() {
			var isCompressible = isCompressibleHelper( 'file.css' );
			expect( isCompressible ).to.equal( true );
		} );

		it( 'should compress HTML files', function() {
			var isCompressible = isCompressibleHelper( 'file.html' );
			expect( isCompressible ).to.equal( true );
		} );

		it( 'should be case insensitive', function() {
			var isCompressible = isCompressibleHelper( 'uppercase.HTML' );
			expect( isCompressible ).to.equal( true );
		} );

		it( 'should not compress GIF files', function() {
			var isCompressible = isCompressibleHelper( 'file.gif' );
			expect( isCompressible ).to.equal( false );
		} );

	} );

} );
