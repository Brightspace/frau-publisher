'use strict';

var path = require('path'),
	zlib = require('zlib');

const promised = require('promised-method');

var compressibles = [
	'.js',
	'.json',
	'.css',
	'.html',
	'.svg',
	'.ttf',
	'.ico'
];

var COMPRESSION_LEVEL = (zlib.constants || zlib).Z_BEST_COMPRESSION;

function isCompressibleFile(file) {
	var ext = path.extname(file.path).toLowerCase();
	return (compressibles.indexOf(ext) > -1);
}

module.exports = promised(function compressor(file) {
	if (!isCompressibleFile(file)) {
		return file;
	}

	return new Promise((resolve, reject) => {
		zlib.gzip(file.contents, {
			level: COMPRESSION_LEVEL
		}, function(err, result) {
			if (err) {
				return reject(err);
			}

			file.contents = result;
			resolve(file);
		});
	});
});

module.exports._isCompressibleFile = isCompressibleFile;
