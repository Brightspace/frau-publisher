'use strict';

var compressor = require('./compressor'),
	es = require('event-stream'),
	optionsValidator = require('./optionsValidator'),
	optionsProvider = require('./optionsProvider'),
	overwrite = require('./overwrite'),
	s3 = require('gulp-s3');

function helper( opts, initialPath ) {
	opts.initialPath = initialPath;
	return {
		getStream: function() {

			var options = optionsValidator( opts );

			var overwriteCheck = overwrite( options );
			var compressorStream = compressor();
			var s3Options = {
				headers: {
					'cache-control': 'public,max-age=31536000,immutable'
				},
				uploadPath: options.getUploadPath(),
				failOnError: true
			};
			var gulpS3 = s3( options.getCreds(), s3Options );

			var duplexStream = es.duplex( overwriteCheck, gulpS3 );

			// pipe overwrite -> compressor -> S3
			overwriteCheck.pipe( compressorStream )
				.pipe( gulpS3 );

			return duplexStream;

		},
		getLocation: function() {
			var options = optionsValidator( opts );
			return 'https://s.brightspace.com/' + options.getUploadPath();
		}
	};
}

module.exports = {
	app: function( opts ) {
		return helper( opts, 'apps/' );
	},
	lib: function( opts ) {
		return helper( opts, 'lib/' );
	},
	optionsProvider: optionsProvider,
	_helper: helper
};
