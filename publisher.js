"use strict";

var s3 = require('gulp-s3');

module.exports = function( opts ) {
	
	var aws = checkValidity( opts );

	aws.bucket = 'gaudi-cdn-test';

	var options = {
			// Need the trailing slash, otherwise the SHA is prepended to the filename.
			uploadPath: 'apps/' + opts.appID + '/dev/' + opts.devTag + '/'
		};

	return s3( aws, options );
};

var checkValidity = function ( opts ) {
	var aws;

	if (!opts || !opts.creds ) {
		throw new Error('Invalid arguments');
	} else if (typeof opts.creds == 'string') {
		try {
			var tempAws = require(opts.creds);
			aws = {
				key: tempAws.key,
				secret: tempAws.secret
			}
		} catch (err) {
			throw new Error( 'Invalid creds location' );
		}
	} else if ( !opts.creds.key || !opts.creds.secret ) {
		throw new Error('Invalid arguments');
	} else {
		aws = {
			key: opts.creds.key,
			secret: opts.creds.secret
		};
	}

	if ( !opts.appID )
		throw new Error('Invalid arguments');

	return aws;
	
} 
