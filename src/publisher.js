'use strict';

var path = require('path'),
	throughConcurrent = require('through2-concurrent');

var compress = require('./compressor'),
	optionsValidator = require('./optionsValidator'),
	optionsProvider = require('./optionsProvider'),
	overwrite = require('./overwrite'),
	s3 = require('./s3');

function helper(opts, initialPath) {
	opts.initialPath = initialPath;
	return {
		getStream: function() {
			var options = optionsValidator(opts);
			var s3BaseOptions = {
				headers: {
					'cache-control': 'public,max-age=31536000,immutable',
					'x-amz-acl': 'public-read'
				},
				uploadPath: options.getUploadPath()
			};

			var compressionTransform = getCompressionTransform();
			var htmlTransform = getHtmlTransform();
			var otherTransform = getOtherTransform();

			var overwriteCheck = overwrite(options);
			return throughConcurrent.obj(/* @this */ function(file, _, cb) {
				overwriteCheck().then(() => {
					if (file.base[file.base.length - 1] === '/') {
						file.base = file.base.substring(0, file.base.length - 1);
					}

					const push = file => {
						this.push(file);
						cb();
					};

					if (path.extname(file.path).toLowerCase() === '.html') {
						return htmlTransform(file).then(push, cb);
					}

					if (compress._isCompressibleFile(file)) {
						return compressionTransform(file).then(push, cb);
					}

					otherTransform(file).then(push, cb);
				}, cb);
			});

			function getCompressionTransform() {
				var s3Options = JSON.parse(JSON.stringify(s3BaseOptions));
				s3Options.headers['content-encoding'] = 'gzip';

				var upload = s3(options.getCreds(), s3Options);

				return function(file) {
					return compress(file).then(upload);
				};
			}

			function getHtmlTransform() {
				var useCompression = compress._isCompressibleFile({ path: 'foo.html' });

				var s3Options = JSON.parse(JSON.stringify(s3BaseOptions));
				s3Options.type = 'text/html';
				s3Options.charset = 'utf-8';
				if (useCompression) {
					s3Options.headers['content-encoding'] = 'gzip';
				}

				var transform = s3(options.getCreds(), s3Options);

				if (useCompression) {
					transform = function(orig, file) {
						return compress(file).then(orig);
					}.bind(null, transform);
				}

				return transform;
			}

			function getOtherTransform() {
				return s3(options.getCreds(), s3BaseOptions);
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
