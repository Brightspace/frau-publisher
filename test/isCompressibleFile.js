'use strict';

var fs = require('fs'),
	isCompressibleFile = require('../src/compression/is-compressible'),
	path = require('path');

var compressibleFiles = [
	'file.js',
	'file.css',
	'file.html',
	'uppercase.HTML'
];

describe('compressor', function() {

	describe('isCompressibleFile', function() {

		compressibleFiles.forEach(function(filename) {

			it('should compress ' + filename, function() {
				var filePath = path.join('./test/support', filename);
				var stream = fs.createReadStream(filePath);
				var isCompressible = isCompressibleFile(stream);
				expect(isCompressible).to.equal(true);
			});

		});

		it('should not compress GIF files', function() {
			var stream = fs.createReadStream('./test/support/file.gif');
			var isCompressible = isCompressibleFile(stream);
			expect(isCompressible).to.equal(false);
		});

	});

});
