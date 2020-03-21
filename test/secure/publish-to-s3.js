'use strict';

var child_process = require('child_process'),
	fs = require('fs');

const throughConcurrent = require('through2-concurrent');

var frauPublisher = require('../../src/publisher'),
	request = require('request'),
	vfs = require('vinyl-fs'),
	gulp = require('gulp'),
	pump = require('pump');

describe('publisher', /* @this */ function() {
	this.timeout(180000);

	[{ name: 'vinyl-fs', fn: vfs.src }, { name: 'gulp3', fn: gulp.src }].forEach(function(testVariant) {
		it('should publish new file (' + testVariant.name + ')', function(cb) {
			const glob = './test/test-files/**';
			const devtag = Math.random().toString(16).slice(2);

			const publisher = createPublisher(devtag);

			testVariant.fn(glob)
				.pipe(publisher.getStream())
				.on('error', function(err) {
					cb(err);
				})
				.on('end', function() {
					Promise.all([
						assertUploaded(glob, devtag),
						new Promise(function(resolve, reject) {
							request.get(publisher.getLocation() + 'test.html', { gzip: true }, function(err, res, body) {
								if (err) return reject(err);
								if (res.statusCode !== 200) return reject(new Error(res.statusCode));
								if (body !== fs.readFileSync('./test/test-files/test.html', 'utf8')) return reject(new Error(body));

								if (res.headers['content-encoding'] !== 'gzip') return reject(new Error(res.headers['content-encoding']));
								if (res.headers['content-type'] !== 'text/html; charset=utf-8') return reject(new Error(res.headers['content-type']));
								if (res.headers['cache-control'] !== 'public,max-age=31536000,immutable') return reject(new Error(res.headers['cache-control']));

								resolve();
							});
						}),
						new Promise(function(resolve, reject) {
							request.get(publisher.getLocation() + 'test.html.br', function(err, res) {
								if (err) return reject(err);
								if (res.statusCode !== 200) return reject(new Error(res.statusCode));

								if (res.headers['content-encoding'] !== 'br') return reject(new Error(res.headers['content-encoding']));
								if (res.headers['content-type'] !== 'text/html; charset=utf-8') return reject(new Error(res.headers['content-type']));
								if (res.headers['cache-control'] !== 'public,max-age=31536000,immutable') return reject(new Error(res.headers['cache-control']));

								resolve();
							});
						}),
						new Promise(function(resolve, reject) {
							request.get(publisher.getLocation() + 'test.svg', { gzip: true }, function(err, res, body) {
								if (err) return reject(err);
								if (res.statusCode !== 200) return reject(new Error(res.statusCode));
								if (body !== fs.readFileSync('./test/test-files/test.svg', 'utf8')) return reject(new Error(body));

								if (res.headers['content-encoding'] !== 'gzip') return reject(new Error(res.headers['content-encoding']));
								if (res.headers['content-type'] !== 'image/svg+xml') return reject(new Error(res.headers['content-type']));
								if (res.headers['cache-control'] !== 'public,max-age=31536000,immutable') return reject(new Error(res.headers['cache-control']));

								resolve();
							});
						}),
						new Promise(function(resolve, reject) {
							request.get(publisher.getLocation() + 'test.svg.br', function(err, res) {
								if (err) return reject(err);
								if (res.statusCode !== 200) return reject(new Error(res.statusCode));

								if (res.headers['content-encoding'] !== 'br') return reject(new Error(res.headers['content-encoding']));
								if (res.headers['content-type'] !== 'image/svg+xml') return reject(new Error(res.headers['content-type']));
								if (res.headers['cache-control'] !== 'public,max-age=31536000,immutable') return reject(new Error(res.headers['cache-control']));

								resolve();
							});
						}),
						new Promise(function(resolve, reject) {
							request.get(publisher.getLocation() + 'test.woff', { gzip: true }, function(err, res, body) {
								if (err) return reject(err);
								if (res.statusCode !== 200) return reject(new Error(res.statusCode));
								if (body !== fs.readFileSync('./test/test-files/test.woff', 'utf8')) return reject(new Error(body));

								if (res.headers['content-encoding']) return reject(new Error(res.headers['content-encoding']));
								if (res.headers['content-type'] !== 'font/woff') return reject(new Error(res.headers['content-type']));
								if (res.headers['cache-control'] !== 'public,max-age=31536000,immutable') return reject(new Error(res.headers['cache-control']));
								resolve();
							});
						})
					])
						.then(function() { cb(); }, cb);
				});
		});
	});

	it('should not overwrite a file', function(cb) {
		// This test relies on files having already been published with this
		//  devTag.  We could remove this dependency by publishing a file and
		//  then trying again.  We should do this if necessary, but it didn't
		//  start that way because it seems unnecessarily wasteful.
		var publisher = createPublisher('overwrite-test');

		pump(vfs.src('./test/test-files/test.txt'), publisher.getStream(), err => {
			try {
				expect(err.message).to.match(/^No files transferred because files already exists in/);
				cb();
			} catch (err) {
				cb(err);
			}
		});
	});
});

describe('cli', /* @this */ function() {
	this.timeout(180000);

	it('should publish successfully', function(done) {
		const glob = './test/test-files/**';
		const devtag = Math.random().toString(16).slice(2);

		var p = child_process.execFile('./bin/publishercli', [
			'--moduletype', 'app',
			'--targetdir', 'frau-publisher-test',
			'--files', glob,
			'--key', process.env.CREDS_KEY,
			'--secretvar', 'CREDS_SECRET',
			'--devtag', devtag
		])
			.on('error', done)
			.on('exit', function(code) {
				if (code !== 0) {
					return done(new Error('Expected exit code 0, saw ' + code));
				}

				assertUploaded(glob, devtag)
					.then(() => done(), done);
			});

		p.stdout.pipe(process.stderr);
		p.stderr.pipe(process.stderr);
	});
});

function createPublisher(devTag) {
	return frauPublisher.app({
		targetDirectory: 'frau-publisher-test',
		creds: {
			key: process.env.CREDS_KEY,
			secret: process.env.CREDS_SECRET
		},
		devTag: devTag
	});
}

function assertUploaded(glob, tag) {
	const uploadBase = createPublisher(tag).getLocation();

	return new Promise((resolve, reject) => {
		pump(vfs.src(glob), throughConcurrent.obj(/* @this */ function(file, _, cb) {
			if (file.isDirectory()) { return cb(); }

			const location = file.path.replace(file.base + '/', uploadBase);

			request
				.get(location, (err, res) => {
					if (err) {
						return cb(err);
					}

					if (res.statusCode !== 200) {
						return cb(new Error(`${res.statusCode}: ${location}`));
					}

					cb();
				});
		}), err => {
			if (err) { return reject(err); }
			resolve();
		}).resume();
	});
}
