'use strict';

const zlib = require('zlib');

const promised = require('promised-method');

const isCompressibleFile = require('./is-compressible');

const COMPRESSION_LEVEL = (zlib.constants || zlib).Z_BEST_COMPRESSION;

module.exports = promised(function compressor(file) {
	if (!isCompressibleFile(file)) {
		return file;
	}

	return new Promise((resolve, reject) => {
		zlib.gzip(file.contents, {
			level: COMPRESSION_LEVEL
		}, (err, result) => {
			if (err) {
				return reject(err);
			}

			file.contents = result;
			resolve(file);
		});
	});
});
