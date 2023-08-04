'use strict';

const fs = require('fs'),
	isCompressibleFile = require('../src/compressor')
		._isCompressibleFile,
	path = require('path');

	const compressibleFiles = [
	'file.js',
	'file.css',
	'file.html',
	'uppercase.HTML'
];

describe('compressor', function() {

	describe('isCompressibleFile', function() {

		compressibleFiles.forEach(function(filename) {

			it('should compress ' + filename, function() {
				const filePath = path.join('./test/support', filename);
				const stream = fs.createReadStream(filePath);
				const isCompressible = isCompressibleFile(stream);
				expect(isCompressible).to.equal(true);
			});

		});

		it('should not compress GIF files', function() {
			const stream = fs.createReadStream('./test/support/file.gif');
			const isCompressible = isCompressibleFile(stream);
			expect(isCompressible).to.equal(false);
		});

	});

});
