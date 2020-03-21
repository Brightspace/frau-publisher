'use strict';

const throughConcurrent = require('through2-concurrent');

const brotli = require('./compression/brotli');
const gzip = require('./compression/gzip');
const isCompressibleFile = require('./compression/is-compressible');
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
				headers: {},
				uploadPath: options.getUploadPath()
			};

			const brotliTransform = getBrotliTransform();
			const gzipTransform = getGzipTransform();
			const otherTransform = getOtherTransform();

			const overwriteCheck = overwrite(options);
			return throughConcurrent.obj(/* @this */ async function(file, _, cb) {
				try {
					await overwriteCheck();

					if (file.base[file.base.length - 1] === '/') {
						file.base = file.base.substring(0, file.base.length - 1);
					}

					if (isCompressibleFile(file)) {
						this.push(await brotliTransform(file));
						this.push(await gzipTransform(file));
					} else {
						this.push(await otherTransform(file));
					}

					cb();
				} catch (err) {
					cb(err);
				}
			}).resume();

			function getBrotliTransform() {
				const s3Options = JSON.parse(JSON.stringify(s3BaseOptions));
				s3Options.headers['content-encoding'] = 'br';

				const upload = s3(options.getCreds(), s3Options);

				return async function brotliTransform(file) {
					return upload(await brotli(file));
				};
			}

			function getGzipTransform() {
				const s3Options = JSON.parse(JSON.stringify(s3BaseOptions));
				s3Options.headers['content-encoding'] = 'gzip';

				const upload = s3(options.getCreds(), s3Options);

				return function gzipTransform(file) {
					return gzip(file).then(upload);
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
