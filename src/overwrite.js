'use strict';

var es = require('event-stream'),
	knox = require('knox'),
	gutil = require('gulp-util');

var client = null;
function getClient( options ) {
	if( client === null ) {
		client = knox.createClient( options.getCreds() );
	}
	return client;
}

module.exports = function( options ) {
	return es.map( function( file, cb ) {

		if( !file.isBuffer() ) {
			cb();
			return;
		}

		getClient( options ).list(
			{ prefix: options.getUploadPath() },
			function( err, data ) {

				// for some reason, when you have an invalid key or secret
				// it is not registered in err but in data
				if( err || data.Code ) {
					cb( new Error('Error accessing Amazon-S3') );
					return;
				}

				if( data.Contents.length !== 0 ) {
					// file exist in s3 buckets
					gutil.log(gutil.colors.red('[FAILED]', 'No files transferred because files already exists in ', options.getUploadPath() ));
					cb( new Error('No files transferred because files already exists in', options.getUploadPath()) );
					return;
				}

				// no error, and the contents of data is empty
				cb( null, file );

		} );

	});
};

module.exports._getClient = getClient;
