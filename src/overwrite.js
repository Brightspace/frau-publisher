'use strict';

const AWS = require('aws-sdk');

module.exports = function overwriteCheckFactory(options) {
	let filesExistPromise;

	return function overwriteCheck() {
		filesExistPromise = filesExistPromise || checkFilesExist(options);

		return filesExistPromise;
	};
};

function checkFilesExist(options) {

	const creds = options.getCreds();
	const client = new AWS.S3(creds);

	const params = {
		Bucket: 'd2lprodcdn',
		MaxKeys: 1,
		Prefix: options.getUploadPath()
	};

	return client
		.listObjectsV2(params)
		.promise()
		.then(data => {
			if (data.Contents.length !== 0) {
				// files exist in s3 folder
				const errorMsg = `No files transferred because files already exists in ${options.getUploadPath()}`;
				throw new Error(errorMsg);
			}
		});
}
