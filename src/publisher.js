'use strict';

const throughConcurrent = require('through2-concurrent');

const compress = require('./compressor');
const optionsProvider = require('./optionsProvider');
const optionsValidator = require('./optionsValidator');
const overwrite = require('./overwrite');
const s3 = require('./s3');

function helper(opts, initialPath) {
	opts.initialPath = initialPath;

	return {
		getStream: function() {
			const options = optionsValidator(opts);
			const s3BaseOptions = {
				headers: {
					'cache-control': 'public,max-age=31536000,immutable',
					'x-amz-acl': 'public-read'
				},
				uploadPath: options.getUploadPath()
			};

			const compressionTransform = getCompressionTransform();
			const otherTransform = getOtherTransform();

			const overwriteCheck = overwrite(options);
			return throughConcurrent.obj(/* @this */ function(file, _, cb) {
				overwriteCheck().then(() => {
					if (file.base[file.base.length - 1] === '/') {
						file.base = file.base.substring(0, file.base.length - 1);
					}

					const push = file => {
						this.push(file);
						cb();
					};

					if (compress._isCompressibleFile(file)) {
						return compressionTransform(file).then(push, cb);
					}

					otherTransform(file).then(push, cb);
				}, cb);
			});

			function getCompressionTransform() {
				const s3Options = JSON.parse(JSON.stringify(s3BaseOptions));
				s3Options.headers['content-encoding'] = 'gzip';

				const upload = s3(options.getCreds(), s3Options);

				return function compressionTransform(file) {
					return compress(file).then(upload);
				};
			}

			function getOtherTransform() {
				return s3(options.getCreds(), s3BaseOptions);
			}
		},
		getLocation: function() {
			const options = optionsValidator(opts);
			return 'https://s.brightspace.com/' + options.getUploadPath() + '/';
		}
	};
}

module.exports = {
	app: opts => helper(opts, 'apps/'),
	lib: opts => helper(opts, 'lib/'),
	optionsProvider: optionsProvider,
	_helper: helper
};
