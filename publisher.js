'use strict';

var s3    = require('gulp-s3'),
	es    = require('event-stream'),
	knox  = require('knox'),
	gutil = require('gulp-util');

var appsPublisher = function ( opts ) {
	var newOpts = sanitize_opts( opts, true );

	var options = {
			// Need the trailing slash, otherwise the SHA is prepended to the filename.
			uploadPath: 'apps/' + newOpts.appID + '/dev/' + newOpts.devTag + '/'
		};

	return createDuplexStream( newOpts.creds, options );
};

var libsPublisher = function ( opts ) {
	var newOpts = sanitize_opts( opts, false );

	var options = {
		uploadPath: 'libs/' + newOpts.libID + '/dev/' + newOpts.devTag + '/'
	};

	return createDuplexStream( newOpts.creds, options );
};

module.exports = appsPublisher;

module.exports.apps = appsPublisher;

module.exports.libs = libsPublisher;
	
// create a duplex stream of checkS3Repo and gulp-s3, and pipes checkS3Repo into gulp-s3.
// Also sets the location for the stream to where the file is located.
var createDuplexStream = function ( aws, options ) {

	var gulpS3 = s3( aws, options );
	var checkS3 = checkS3Repo( aws, options);
	var duplexStream = es.duplex( checkS3, gulpS3 );
	checkS3.pipe(gulpS3);
	duplexStream.location = 'https://s.brightspace.com/' + options.uploadPath;

	return duplexStream;
};

// check if the amazon-s3 already have files on it
var checkS3Repo = function ( aws, options ) {

	var client = knox.createClient(aws);

	return es.map( function (file, cb) {

		if (!file.isBuffer()) {
			cb();
			return;
		}
		
		client.list({ prefix: options.uploadPath }, function(err, data) {
			// for some reason, when you have an invalid key or secret
			// it is not registered in err but in data
			if(err || data.Code) {
				cb(new Error( 'Error accessing Amazon-S3' ));
				return;
			}

			if (data.Contents.length !== 0) {
				// file exist in s3 buckets
				cb();
				gutil.log(gutil.colors.red('[FAILED] Files already exists in this folder.'));
				return;
			}
			
			// no error, and the contents of data is empty
			cb(null, file);
		});
	});
	
};

// sanitize the parameter so that it has only the valid variables. Throw error if parameter is invalid.
var sanitize_opts = function ( opts, isApp ) {
	if ( !opts ) {
		throw new Error('Missing options');
	}
	if (isApp) {
		if ( !opts.appID ) {
			throw new Error('Missing app id');
		}
	} else { // Library
		if ( !opts.libID ) {
			throw new Error('Missing lib id');
		}
	}
	if ( !opts.devTag ) {
		throw new Error('Missing devTag');
	}

	var aws = getCreds(opts.creds);

	if (isApp) {
		return setOptions ( opts.appID, aws, opts.devTag, true );
	}

	return setOptions ( opts.libID, aws, opts.devTag, false );
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
		bucket: 'd2lprodcdn'
	};
};

// return a valid options object
var setOptions = function ( idTag, creds, devTag, isApp ) {

	if (isApp) {
		return {
			appID: idTag,
			creds: creds,
			devTag: devTag
		};
	}

	return {
		libID: idTag,
		creds: creds,
		devTag: devTag
	};
};