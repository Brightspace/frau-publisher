'use strict';

var compressor = require('./compressor'),
	es = require('event-stream'),
	filter = require('gulp-filter'),
	mirror = require('gulp-mirror'),
	optionsValidator = require('./optionsValidator'),
	optionsProvider = require('./optionsProvider'),
	overwrite = require('./overwrite'),
	pipe = require('multipipe'),
	rename = require('gulp-rename'),
	s3 = require('gulp-s3'),
	semver = require('semver'),
	util = require('gulp-util');

function helper( opts, initialPath ) {
	opts.initialPath = initialPath;
	return {
		getStream: function() {

			var options = optionsValidator( opts );

			var overwriteCheck = overwrite( options );
			var compressorStream = compressor();
			var s3Options = {
				headers: {
					'cache-control': 'public, max-age=31536000'
				},
				uploadPath: options.getUploadPath()
			};
			var gulpS3 = s3( options.getCreds(), s3Options );

			var duplexStream = es.duplex( overwriteCheck, gulpS3 );

			overwriteCheck
				.pipe( compressorStream )
				.pipe( mirror(
					uploadBundle( options ),
					uploadSemVerAppConfigs( options )
				) );

			return duplexStream;

		},

		getLocation: function() {
			var options = optionsValidator( opts );
			return 'https://s.brightspace.com/' + options.getUploadPath();
		}
	};
}

function uploadBundle( options ) {
	var s3Options = {
		headers: {
			'cache-control': 'public, max-age=31536000'
		},
		uploadPath: options.getUploadPath()
	};

	var gulpS3 = s3( options.getCreds(), s3Options );

	return gulpS3;
}

function getSemVerAppConfigs( version ) {
	if ( !semver.valid( version ) ) {
		return null;
	}

	var major = semver.major( version );
	var minor = semver.minor( version );

	return {
		major: 'appconfig.v' + major + '.json.gz',
		majorMinor: 'appconfig.v' + major + '.' + minor + '.json.gz'
	};
}

function uploadSemVerAppConfigs( options ) {
	var version = options.getVersion();

	var semVerAppConfigs = getSemVerAppConfigs( version );

	if ( semVerAppConfigs === null ) {
		return util.noop();
	}

	var s3Options = {
		headers: {
			'cache-control': 'public, max-age=600'
		},
		uploadPath: options.getBasePath()
	};

	var gulpS3 = s3( options.getCreds(), s3Options );

	return pipe(
		filter(f => f.path.endsWith('appconfig.json.gz')),
		mirror(
			rename(semVerAppConfigs.major),
			rename(semVerAppConfigs.majorMinor)
		),
		gulpS3
	);
}

module.exports = {
	app: function( opts ) {
		return helper( opts, 'apps/' );
	},
	lib: function( opts ) {
		return helper( opts, 'lib/' );
	},
	optionsProvider: optionsProvider,
	_helper: helper,
	_getSemVerAppConfigs: getSemVerAppConfigs
};
