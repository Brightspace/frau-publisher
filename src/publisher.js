'use strict';

var compressor = require('./compressor'),
	es = require('event-stream'),
	optionsValidator = require('./optionsValidator'),
	overwrite = require('./overwrite'),
	s3 = require('gulp-s3');

function helper( opts, initialPath ) {
	opts.initialPath = initialPath;
	return {
		getStream: function() {

			var options = optionsValidator( opts );

			var overwriteCheck = overwrite( options );
			var compressorStream = compressor();
			var gulpS3 = s3( options.getCreds(), { uploadPath: options.getUploadPath() } );

			var duplexStream = es.duplex( overwriteCheck, gulpS3 );

			// pipe overwrite -> compressor -> S3
			overwriteCheck.pipe( compressorStream )
				.pipe( gulpS3 );

			return duplexStream;

		},
		getLocation: function() {
            var options = optionsValidator( opts );
            var bucket = options.getCreds().bucket;
            var base = bucket === 'd2lprodcdn' ? 'https://s.brightspace.com/' : 'https://s3.amazonaws.com/' + bucket + '/';
            return base + options.getUploadPath();
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
	_helper: helper
};
