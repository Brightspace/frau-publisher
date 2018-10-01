'use strict';

var fs = require('fs');

var frauPublisher = require('../../src/publisher'),
	request = require('request'),
	vfs = require('vinyl-fs');

describe('publisher', function() {
	it('should publish new file', function(cb) {
		var publisher = createPublisher(Math.random().toString(16).slice(2));

		vfs
			.src('./test/test-files/*')
			.pipe(publisher.getStream())
			.on('end', function() {
				Promise.all([
					new Promise(function(resolve, reject) {
						request.get(publisher.getLocation() + 'test.html', { gzip: true }, function(err, res, body) {
							if (err) return reject(err);
							if (res.statusCode !== 200) return reject(new Error(res.statusCode));
							if (body !== fs.readFileSync('./test/test-files/test.html', 'utf8')) return reject(new Error(body));

							if (res.headers['content-encoding'] !== 'gzip') return reject(new Error(res.headers['content-encoding']));
							if (res.headers['content-type'] !== 'text/html; charset=utf-8') return reject(new Error(res.headers['content-type']));

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

							resolve();
						});
					}),
					new Promise(function(resolve, reject) {
						request.get(publisher.getLocation() + 'test.woff', { gzip: true }, function(err, res, body) {
							if (err) return reject(err);
							if (res.statusCode !== 200) return reject(new Error(res.statusCode));
							if (body !== fs.readFileSync('./test/test-files/test.woff', 'utf8')) return reject(new Error(body));

							if (res.headers['content-encoding']) return reject(new Error(res.headers['content-encoding']));
							if (res.headers['content-type'] !== 'application/font-woff') return reject(new Error(res.headers['content-type']));
							resolve();
						});
					})
				])
					.then(function() { cb(); }, cb);
			});
	});

	it('should not overwrite a file', function(cb) {
		// This test relies on files having already been published with this
		//  devTag.  We could remove this dependency by publishing a file and
		//  then trying again.  We should do this if necessary, but it didn't
		//  start that way because it seems unnecessarily wasteful.
		var publisher = createPublisher('overwrite-test');

		vfs
			.src('./test/test-files/test.txt')
			.pipe(publisher.getStream())
			.on('error', function() {
				cb();
			}).on('end', function() {
				cb('should not have published');
			});
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
