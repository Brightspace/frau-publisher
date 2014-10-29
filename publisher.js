"use strict";

var s3 = require('gulp-s3');

module.exports = function( opts ) {
	if( !opts || !opts.creds || !opts.creds.key || !opts.creds.secret ) {
		throw new Error('Invalid arguments');
	}

	var aws = opts.creds;
	aws.bucket = 'gaudi-cdn-test';

	var options = {
			// Need the trailing slash, otherwise the SHA is prepended to the filename.
			uploadPath: 'apps/simpleumdapp/dev/' + opts.devTag + '/'
		};

	return s3( aws, options );
};
