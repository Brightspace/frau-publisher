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

// check if the object that was passed in is valid or not
var checkValidity = function ( opts ) {
	var aws;

	if (!opts || !opts.creds ) {
		throw new Error('Invalid arguments');
	} 
	else if ( !opts.creds.key || !opts.creds.secret ) {
		throw new Error('Invalid arguments');
	} else {
		aws = setAws( opts.creds.key, opts.creds.secret );
	}

	if ( !opts.appID )
		throw new Error('Invalid arguments');

	return aws;
	
};

// set the aws with only the key and secret
var setAws = function ( key, secret ) {
	return {
		key: key,
		secret: secret
	};
} 