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

	 	var object = s3( newOpts.creds , options );

		object.location = 'https://d2660orkic02xl.cloudfront.net/' + options.uploadPath;

		var xab = fileExistCheckStream( newOpts.creds, options);

		var output = es.duplex( xab, object );
		xab.pipe(object);
		return output;
};

var fileExistCheckStream = function ( aws, options ) {

	var client = knox.createClient(aws);
	console.log('calling fileExistCheckStream');
	
	// return es.map(function (file) {
	return es.map(function (file, cb) {

		if (!file.isBuffer()) {
			cb();
			return;
		}

		var uploadPath = file.path.replace(file.base, options.uploadPath || '');
		uploadPath = uploadPath.replace(new RegExp('\\\\', 'g'), '/');
		
		client.get(uploadPath).on('response', function(res) {
			var fileExist = false;
			if (res.statusCode == 200) {
				fileExist = true;
			} else {
				fileExist = false;
			}
			console.log(file.path + ': ' + fileExist);
			if (fileExist) {
				try {
					cb(null, null);
				} catch(e) {
					console.log('error!');
				}
			} else {
				cb(null, file);
			}

		}).end();
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