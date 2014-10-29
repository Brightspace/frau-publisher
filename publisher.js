"use strict";

var s3 = require('gulp-s3');

module.exports = function( opts ) {
	var aws;
	if (!opts || !opts.creds ) {
		throw new Error('Invalid arguments');
	} else if (typeof opts.creds == 'string') {
		try {
			aws = require(opts.creds);
		} catch (err) {
			throw new Error( 'Invalid creds location' );
		}
	} else if ( !opts.creds.key || !opts.creds.secret ) {
		throw new Error('Invalid arguments');
	} else {
		aws = opts.creds;
	}

	aws.bucket = 'gaudi-cdn-test';

	var options = {
			// Need the trailing slash, otherwise the SHA is prepended to the filename.
			uploadPath: 'apps/simpleumdapp/dev/' + opts.devTag + '/'
		};

	return s3( aws, options );
};
