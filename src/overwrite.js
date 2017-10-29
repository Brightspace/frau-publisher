'use strict';

var es = require('event-stream'),
	knox = require('knox'),
	gutil = require('gulp-util'),
	Q = require('q');

module.exports = function(options) {
	var filesExistPromise;

	return es.map(function(file, cb) {
		if (!filesExistPromise) {
			filesExistPromise = checkFilesExist(options);
		}

		filesExistPromise.then(
			function() {
				cb(null, file);
			},
			function(err) {
				cb(err);
			}
		);
	});
};

function checkFilesExist(options) {
	var client = knox.createClient(options.getCreds());

	var deferred = Q.defer();

	client.list({
		prefix: options.getUploadPath()
	},
	function(err, data) {
		if (err) {
			deferred.reject(err);
			return;
		}

		// AWS errors like invalid key or secret are specified in the data
		// For more see http://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html
		if (data.Code) {
			deferred.reject(new Error(data.Message));
			return;
		}

		if (data.Contents.length !== 0) {
			// files exist in s3 folder
			var errorMsg = 'No files transferred because files already exists in ' + options.getUploadPath();
			gutil.log(gutil.colors.red(errorMsg));
			deferred.reject(new Error(errorMsg));
			return;
		}

		// no files exist in s3 folder
		deferred.resolve();
	}
	);

	return deferred.promise;
}
