'use strict';

var es = require('event-stream'),
	path = require('path'),
	zlib = require('zlib');

var compressibles = [
	'.js',
	'.json',
	'.css',
	'.html',
	'.svg',
	'.ttf',
	'.ico'
];

function isCompressibleFile( file ) {
	var ext = path.extname( file.path ).toLowerCase();
	return ( compressibles.indexOf( ext ) > -1 );
}

module.exports = function() {

	return es.map( function( file, cb ) {

		if ( !isCompressibleFile( file ) ) {
			cb( null, file );
			return;
		}

		zlib.gzip( file.contents, function( err, result ) {
			if ( err ) {
				cb( err, null );
				return;
			}
			file.path += '.gz';
			file.contents = result;
			cb( null, file );
		} );

	} );
};

module.exports._isCompressibleFile = isCompressibleFile;
