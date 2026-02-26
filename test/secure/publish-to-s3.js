'use strict';

const child_process = require('child_process'),
	crypto = require('crypto'),
	fs = require('fs');

const throughConcurrent = require('through2-concurrent');

const frauPublisher = require('../../src/publisher'),
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
		const publisher = createPublisher('overwrite-test');

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

		const p = child_process.execFile('./bin/publishercli', [
			'--moduletype', 'app',
			'--targetdir', 'frau-publisher-test',
			'--files', glob,
			'--accesskeyvar', 'AWS_ACCESS_KEY_ID',
			'--secretvar', 'AWS_SECRET_ACCESS_KEY',
			'--sessiontokenvar', 'AWS_SESSION_TOKEN',
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
			key: process.env.AWS_ACCESS_KEY_ID,
			secret: process.env.AWS_SECRET_ACCESS_KEY,
			sessionToken: process.env.AWS_SESSION_TOKEN
		},
		devTag: devTag
	});
}

function assertUploaded(glob, tag) {
	const uploadBase = createPublisher(tag).getLocation();

	return new Promise((resolve, reject) => {

		const digestLocation = uploadBase + 'frau-publisher-digest.json';
		request.get(digestLocation, { gzip: true }, function(err, res, body) {
			if (err) return reject(err);
			if (res.statusCode !== 200) return reject(new Error(`failed to fetch digest: ${digestLocation}, ${{ statusCode: res.statusCode }}`));

			const digest = JSON.parse(body);

			pump(vfs.src(glob), throughConcurrent.obj(/* @this */ function(file, _, cb) {
				if (file.isDirectory()) { return cb(); }

				const location = file.path.replace(file.base + '/', uploadBase);

				request
					.get(location, { encoding: null }, (err, res, body) => {
						if (err) {
							return cb(err);
						}

						if (res.statusCode !== 200) {
							return cb(new Error(`${res.statusCode}: ${location}`));
						}

						const digestKey = file.path.replace(file.base + '/', '');
						const digestEntry = digest[digestKey];
						if (digestEntry === undefined) {
							return cb(new Error(`file missing from digest: ${digestKey}, ${{ digest }}`));
						}

						console.log('test', digestKey, body, body.toString());
						const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
						if (bodyHash !== digestEntry) {
							return cb(new Error(`file hash didnt match digest: ${digestKey}, ${bodyHash} !== ${digestEntry}`));
						}

						cb();
					});
			}), err => {
				if (err) { return reject(err); }
				resolve();
			}).resume();
		});
	});
}
