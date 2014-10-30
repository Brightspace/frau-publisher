"use strict";

var s3 = require('gulp-s3');

module.exports = function( opts ) {
	
	var newOpts = sanitize_opts( opts );

	var options = {
			// Need the trailing slash, otherwise the SHA is prepended to the filename.
			uploadPath: 'apps/' + newOpts.appID + '/dev/' + newOpts.devTag + '/'
		};

	return s3( newOpts.creds , options );
};

// sanitize the parameter so that it has only the valid variables. Throw error if parameter is invalid.
var sanitize_opts = function ( opts ) {

	if ( !opts || !opts.appID || !opts.creds ) {
		throw new Error('Invalid arguments');
	}

	var aws = getCreds(opts.creds);

	return setOptions ( opts.appID, aws, opts.devTag );
};

// check if the credentials are valid and return it with only the valid properties.
var getCreds = function ( creds ) {

	if ( !creds.key || !creds.secret ) {
		throw new Error('Invalid arguments');
	} else {
		return setAws( creds.key, creds.secret );
	}
};

// return a valid aws object
var setAws = function ( key, secret ) {
	return {
		key: key,
		secret: secret,
		bucket: 'gaudi-cdn-test'
	};
};

// return a valid options object
var setOptions = function ( appID, creds, devTag ) {
	return {
		appID: appID,
		creds: creds,
		devTag: devTag
	};
};