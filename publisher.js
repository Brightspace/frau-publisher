"use strict";

var s3 = require('gulp-s3');
var es = require('event-stream');
var knox = require('knox');

module.exports = function( opts ) {
	
	var newOpts = sanitize_opts( opts );

	var options = {
			// Need the trailing slash, otherwise the SHA is prepended to the filename.
			uploadPath: 'apps/' + newOpts.appID + '/dev/' + newOpts.devTag + '/'
		};

 	var gulpS3 = s3( newOpts.creds , options );
	var checkRep = checkS3Repo( newOpts.creds, options);

	var duplexStream = es.duplex(checkRep, gulpS3);
	checkRep.pipe(gulpS3);
	duplexStream.location = 'https://d2660orkic02xl.cloudfront.net/' + options.uploadPath;

	return duplexStream;
};

var checkS3Repo = function ( aws, options ) {

	var client = knox.createClient(aws);

	return es.map( function (file, cb) {
		client.list({ prefix: options.uploadPath }, function(err, data) {

			if (data.Contents.length != 0) {
				//console.log('file already exist in folder');
				cb();
			} else {
				cb(null, file);
			}
		});
	});
	
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