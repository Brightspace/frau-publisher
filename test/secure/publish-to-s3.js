var frauPublisher = require('../../publisher'),
	request = require('request'),
	eventStream = require('event-stream'),
	gUtil = require('gulp-util');

var publisher = frauPublisher({
	appID: 'frau-publisher-test',
	creds: {
		key: 'AKIAJKN55MNZIZXKVCHQ',
		secret: process.env.CREDS_SECRET
	},
	devTag: 'test'
});

var content = 'some data';
var filename = 'test' + Math.random().toString(16).slice(2) + '.txt';
var file = new gUtil.File({
	cwd: '/',
	base: '/',
	path: '/' + filename,
	contents: new Buffer(content),
	stat: {
		size: content.length
	}
});

describe('publisher', function() {
	it.skip('should publish new file', function(cb) {
		console.log('file: ' + filename);

		eventStream.readArray( [file] )
			.pipe( publisher )
			.on('end', function() {
				// gulp-s3 sends the end event before it's actually done, so we need to introduce an artificial wait.
				setTimeout(function() {
					request.get( publisher.location + filename, function(error, result, body) {
						if (error) {
							cb(error);
						} else if (result.statusCode != 200 ) {
							cb(result.statusCode);
						} else if ( body !== content ){
							cb(body);
						} else {
							cb();
						}
					});
				}, 500);
			});
	});
});
