'use strict';

var s3         = require('gulp-s3'),
	es         = require('event-stream'),
	knox       = require('knox'),
	deprecate  = require('depd')('gulp-frau-publisher'),
	compressor = require('./src/compressor');

var publisher = function ( opts, initialPath ) {

	var newOpts = sanitize_opts( opts );

	var options = {
		uploadPath: initialPath + newOpts.id + '/dev/' + newOpts.devTag + '/'
	};

	return createDuplexStream( newOpts.creds, options );
};

module.exports = function ( opts ) {
	deprecate('Please use "publisher.app(opts)" instead.');
	return publisher( opts, 'apps/');
};

module.exports.app = function ( opts ) {
	return publisher( opts, 'apps/');
};

module.exports.lib = function ( opts ) {
	return publisher( opts, 'libs/' );
};
	
// create a duplex stream of checkS3Repo and gulp-s3, and pipes checkS3Repo into gulp-s3.
// Also sets the location for the stream to where the file is located.
var createDuplexStream = function ( aws, options ) {

	var checkS3 = checkS3Repo( aws, options );
	var compressorStream = compressor();
	var gulpS3 = s3( aws, options );

	// duplex between overwrite and S3
	var duplexStream = es.duplex( checkS3, gulpS3 );
	duplexStream.location = 'https://s.brightspace.com/' + options.uploadPath;

	// pipe overwrite -> compressor -> S3
	checkS3.pipe( compressorStream )
		.pipe( gulpS3 );

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
				cb( new Error('No files transferred.') );				
				return;
			}
			// no error, and the contents of data is empty
			cb(null, file);
		});
	});
};

// sanitize the parameter so that it has only the valid variables.
// Throw error if parameter is invalid.
var sanitize_opts = function ( opts ) {
	if ( !opts ) {
		throw new Error('Missing options');
	}
	if ( !opts.appID && !opts.id ) {
		throw new Error('Missing id');
	} else if ( !opts.id ) {
		deprecate('Please use "id" instead of "appID", future version will not support "appID".');
		opts.id = opts.appID;
	} else if ( opts.appID ) {
		deprecate('Please use "id" instead of "appID", future version will not support "appID".');
	} // else id is true and appID is false
	if ( !opts.devTag ) {
		throw new Error('Missing devTag');
	}

	var aws = getCreds(opts.creds);

	return setOptions ( opts.id, aws, opts.devTag );
};

// check if the credentials are valid and return it with only the valid
// properties.
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
var setOptions = function ( id, creds, devTag ) {
	return {
		id: id,
		creds: creds,
		devTag: devTag
	};
};
