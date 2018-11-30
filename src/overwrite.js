'use strict';

const knox = require('knox');

module.exports = function overwriteCheckFactory(options) {
	let filesExistPromise;

	return function overwriteCheck() {
		filesExistPromise = filesExistPromise || checkFilesExist(options);

		return filesExistPromise;
	};
};

function checkFilesExist(options) {
	const client = knox.createClient(options.getCreds());

	return new Promise((resolve, reject) => {
		client.list({
			prefix: options.getUploadPath()
		}, (err, data) => {
			if (err) {
				return reject(err);
			}

			// AWS errors like invalid key or secret are specified in the data
			// For more see http://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html
			if (data.Code) {
				return reject(new Error(data.Message));
			}

			if (data.Contents.length !== 0) {
				// files exist in s3 folder
				var errorMsg = 'No files transferred because files already exists in ' + options.getUploadPath();
				return reject(new Error(errorMsg));
			}

			// no files exist in s3 folder
			resolve();
		});
	});
}
