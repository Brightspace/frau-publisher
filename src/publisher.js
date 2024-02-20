'use strict';

const throughConcurrent = require('through2-concurrent');
const Vinyl = require('vinyl');

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
				headers: {},
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
			}, /* @this */ function(cb) {
				const mergedDigest = Object.assign({}, compressionTransform.digest, otherTransform.digest);
				const digestJson = JSON.stringify(mergedDigest);

				const file = new Vinyl({
					base: '/some-dir',
					path: '/some-dir/frau-publisher-digest.json',
					contents: Buffer.from(digestJson, 'utf8')
				});

				const push = file => {
					this.push(file);
					cb();
				};

				if (compress._isCompressibleFile(file)) {
					return compressionTransform(file).then(push, cb);
				}

				otherTransform(file).then(push, cb);
			}).resume();

			function getCompressionTransform() {
				const s3Options = JSON.parse(JSON.stringify(s3BaseOptions));
				s3Options.headers['content-encoding'] = 'gzip';

				const upload = s3(options.getCreds(), s3Options);

				const compressor = function compressionTransform(file) {
					return compress(file).then(upload);
				};

				compressor.digest = upload.digest;

				return compressor;
			}

			function getOtherTransform() {
				return s3(options.getCreds(), s3BaseOptions);
			}
		},
		getLocation: function(shouldAppend = false) {
			const options = optionsValidator(opts);
			const appendAppconfigJson = (shouldAppend && opts.moduleType === 'app') ? 'appconfig.json' : '';
			return 'https://s.brightspace.com/' + options.getUploadPath() + '/' + appendAppconfigJson;
		}
	};
}

module.exports = {
	app: opts => helper(opts, 'apps/'),
	lib: opts => helper(opts, 'lib/'),
	optionsProvider: optionsProvider,
	_helper: helper
};
