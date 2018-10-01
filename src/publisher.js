'use strict';

var es = require('event-stream'),
	path = require('path'),
	s3 = require('gulp-s3');

var compressor = require('./compressor'),
	optionsValidator = require('./optionsValidator'),
	optionsProvider = require('./optionsProvider'),
	overwrite = require('./overwrite');

function helper(opts, initialPath) {
	opts.initialPath = initialPath;
	return {
		getStream: function() {
			var options = optionsValidator(opts);
			var s3BaseOptions = {
				headers: {
					'cache-control': 'public,max-age=31536000,immutable'
				},
				uploadPath: options.getUploadPath(),
				failOnError: true
			};

			var overwriteCheck = overwrite(options);

			var compressionStream = getCompressionStream();
			var htmlStream = getHtmlStream();
			var otherStream = getOtherStream();

			var splitter = es.map(function(file, cb) {
				if (path.extname(file.path).toLowerCase() === '.html') {
					htmlStream.write(file);
					return cb(null, file);
				}

				if (compressor._isCompressibleFile(file)) {
					compressionStream.write(file);
					return cb(null, file);
				}

				otherStream.write(file);
				cb(null, file);
			});

			overwriteCheck.pipe(splitter);

			splitter.once('end', function noMoreFiles() {
				htmlStream.end();
				compressionStream.end();
				otherStream.end();
			});

			return es.duplex(
				overwriteCheck,
				es.merge(compressionStream, htmlStream, otherStream)
			);

			function getCompressionStream() {
				var s3Options = JSON.parse(JSON.stringify(s3BaseOptions));
				s3Options.headers['content-encoding'] = 'gzip';

				var compress = compressor();
				var s3Stream = s3(options.getCreds(), s3Options);

				compress.pipe(s3Stream);

				return es.duplex(compress, s3Stream);
			}

			function getHtmlStream() {
				var useCompression = compressor._isCompressibleFile({ path: 'foo.html' });

				var s3Options = JSON.parse(JSON.stringify(s3BaseOptions));
				s3Options.encoding = 'utf-8';
				if (useCompression) {
					s3Options.headers['content-encoding'] = 'gzip';
				}

				var s3Stream = s3(options.getCreds(), s3Options);
				var stream = s3Stream;

				if (useCompression) {
					var compress = compressor();
					stream = es.duplex(compress, s3Stream);

					compress.pipe(s3Stream);
				}

				return stream;
			}

			function getOtherStream() {
				var s3Options = JSON.parse(JSON.stringify(s3BaseOptions));
				return s3(options.getCreds(), s3Options);
			}
		},
		getLocation: function() {
			var options = optionsValidator(opts);
			return 'https://s.brightspace.com/' + options.getUploadPath() + '/';
		}
	};
}

module.exports = {
	app: function(opts) {
		return helper(opts, 'apps/');
	},
	lib: function(opts) {
		return helper(opts, 'lib/');
	},
	optionsProvider: optionsProvider,
	_helper: helper
};
