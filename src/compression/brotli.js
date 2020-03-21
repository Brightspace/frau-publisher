'use strict';

const { brotliCompress, constants } = require('zlib');

const promised = require('promised-method');

const isCompressibleFile = require('./is-compressible');

module.exports = promised(function compressor(file) {
	if (!isCompressibleFile(file)) {
		return file;
	}

	return new Promise((resolve, reject) => {
		brotliCompress(file.contents, {
			params: {
				[constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
				[constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
				[constants.BROTLI_PARAM_SIZE_HINT]: Buffer.byteLength(file.contents),
			},
		}, (err, result) => {
			if (err) {
				return reject(err);
			}

			const cloned = file.clone({
				contents: false,
			});
			cloned.contents = result;
			resolve(cloned);
		});
	});
});
