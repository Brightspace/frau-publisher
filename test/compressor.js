'use strict';

const fs = require('fs'),
	path = require('path');

const through = require('through2'),
	vfs = require('vinyl-fs');

const compressor = require('../src/compressor');

describe('compressor', function() {

	function compressionStream() {
		return through.obj(/* @this */function(file, _, cb) {
			compressor(file).then(file => {
				this.push(file);
				cb();
			}, cb);
		});
	}

	it('should compress a file', function(done) {

		const filename = './test/support/file.html';
		const originalSize = fs.statSync(filename).size;

		vfs.src(filename)
			.pipe(compressionStream())
			.on('data', function(file) {
				expect(file.contents.length).to.be.lessThan(
					originalSize / 2
				);
				done();
			});

	});

	it('should not compress GIFs', function(done) {

		const filename = './test/support/file.gif';
		const originalSize = fs.statSync(filename).size;

		vfs.src(filename)
			.pipe(compressionStream())
			.on('data', function(file) {
				expect(
					path.basename(file.path)
				).to.equal('file.gif');
				expect(file.contents.length).to.equal(originalSize);
				done();
			});

	});

	describe('mocked zlib', function() {

		const error = new Error('oh no');
		const zlib = require('zlib');

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
				.pipe(compressionStream())
				.on('error', function(err) {
					expect(err).to.equal(error);
					done();
				});
		});

	});

});
