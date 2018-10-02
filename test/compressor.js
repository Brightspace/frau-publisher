'use strict';

var compressor = require('../src/compressor'),
	fs = require('fs'),
	vfs = require('vinyl-fs'),
	path = require('path');

describe('compressor', function() {

	it('should compress a file', function(done) {

		var filename = './test/support/file.html';
		var originalSize = fs.statSync(filename).size;

		vfs.src(filename)
			.pipe(compressor())
			.on('data', function(file) {
				expect(file.contents.length).to.be.lessThan(
					originalSize / 2
				);
				done();
			});

	});

	it('should not compress GIFs', function(done) {

		var filename = './test/support/file.gif';
		var originalSize = fs.statSync(filename).size;

		vfs.src(filename)
			.pipe(compressor())
			.on('data', function(file) {
				expect(
					path.basename(file.path)
				).to.equal('file.gif');
				expect(file.contents.length).to.equal(originalSize);
				done();
			});

	});

	describe('mocked zlib', function() {

		var error = new Error('oh no');
		var zlib = require('zlib');

		beforeEach(function() {
			zlib._gzip = zlib.gzip;
			zlib.gzip = function(contents, options, cb) {
				cb(error);
			};
		});

		afterEach(function() {
			zlib.gzip = zlib._gzip;
		});

		it('should pass along errors from zlib', function(done) {
			vfs.src('./test/support/file.js')
				.pipe(compressor())
				.on('error', function(err) {
					expect(err).to.equal(error);
					done();
				});
		});

	});

});
