var frauPublisher = require('../../src/publisher'),
	request = require('request'),
	eventStream = require('event-stream'),
	gUtil = require('gulp-util');

var content = 'some data';
var filename = 'test.txt';
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
	it('should publish new file', function(cb) {
		var publisher = createPublisher( Math.random().toString(16).slice(2) );

		eventStream.readArray( [file] )
			.pipe( publisher.getStream() )
			.on('end', function() {
				// gulp-s3 sends the end event before it's actually done, so we need to introduce an artificial wait.
				setTimeout(function() {
					request.get( publisher.getLocation() + filename, function(error, result, body) {
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

	it('should not overwrite a file', function(cb) {
		// This test relies on files having already been published with this
		//  devTag.  We could remove this dependency by publishing a file and
		//  then trying again.  We should do this if necessary, but it didn't
		//  start that way because it seems unnecessarily wasteful.
		var publisher = createPublisher( 'overwrite-test' );

		eventStream.readArray( [file] )
			.pipe( publisher.getStream() )
			.on('error', function() {
				cb();
			}).on('end', function() {
				cb('should not have published');
			});
	});
});

function createPublisher(devTag) {
	return frauPublisher.app({
		id: 'frau-publisher-test',
		creds: {
			key: process.env.CREDS_KEY,
			secret: process.env.CREDS_SECRET
		},
		devTag: devTag
	});
}
