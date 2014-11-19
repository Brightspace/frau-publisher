'use strict';

var s3 = require('gulp-s3');
var es = require('event-stream');
var knox = require('knox');

module.exports = function( opts ) {
	
	var newOpts = sanitize_opts( opts );

	var options = {
			// Need the trailing slash, otherwise the SHA is prepended to the filename.
			uploadPath: 'apps/' + newOpts.appID + '/dev/' + newOpts.devTag + '/'
		};

	return createDuplexStream( newOpts.creds, options );
};

// create a duplex stream of checkS3Repo and gulp-s3, and pipes checkS3Repo into gulp-s3.
// Also sets the location for the stream to where the file is located.
var createDuplexStream = function ( aws, options ) {

	var gulpS3 = s3( aws, options );
	var checkRep = checkS3Repo( aws, options);
	var duplexStream = es.duplex( checkRep, gulpS3 );
	checkRep.pipe(gulpS3);
	duplexStream.location = 'https://d2660orkic02xl.cloudfront.net/' + options.uploadPath;

	return duplexStream;
};

// check if the amazon-s3 already have files on it
var checkS3Repo = function ( aws, options ) {

	var client = knox.createClient(aws);

	return es.map( function (file, cb) {

		if (!file.isBuffer()) {
			return cb();
		}
		
		client.list({ prefix: options.uploadPath }, function(err, data) {
			// for some reason, when you have an invalid key or secret
			// it is not registered in err but in data
			if(err || data.Code) {
				return cb(new Error( 'Error accessing Amazon-S3' ));
			}

			if (data.Contents.length != 0) {
				// file exist in s3 buckets
				return cb();
			} else {
				return cb(null, file);
			}
		});
	});
	
};

// sanitize the parameter so that it has only the valid variables. Throw error if parameter is invalid.
var sanitize_opts = function ( opts ) {
	if ( !opts ) {
		throw new Error('Missing options');
	}
	if ( !opts.appID ) {
		throw new Error('Missing app id');
	}
	if ( !opts.devTag ) {
		throw new Error('Missing devTag');
	}

	var aws = getCreds(opts.creds);

	return setOptions ( opts.appID, aws, opts.devTag );
};

// check if the credentials are valid and return it with only the valid properties.
var getCreds = function ( creds ) {
	if ( !creds ) {
		throw new Error('Missing credentials');
	}
	if ( !creds.key ) {
		throw new Error('Missing credential key');
	}
	if( !creds.secret ) {
		throw new Error('Missing credential secret');
	}
	
	return setAws( creds.key, creds.secret );
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