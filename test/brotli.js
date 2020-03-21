'use strict';

var fs = require('fs'),
	path = require('path');

var through = require('through2'),
	vfs = require('vinyl-fs');

var brotli = require('../src/compression/brotli');

describe('brotli', function() {

	function compressionStream() {
		return through.obj(/* @this */function(file, _, cb) {
			brotli(file).then(file => {
				this.push(file);
				cb();
			}, cb);
		});
	}

	it('should compress a file', function(done) {

		var filename = './test/support/file.html';
		var originalSize = fs.statSync(filename).size;

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

		var filename = './test/support/file.gif';
		var originalSize = fs.statSync(filename).size;

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

});
