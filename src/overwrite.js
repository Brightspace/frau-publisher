'use strict';

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

module.exports = function overwriteCheckFactory(options) {
	let filesExistPromise;

	return function overwriteCheck() {
		filesExistPromise = filesExistPromise || checkFilesExist(options);

		return filesExistPromise;
	};
};

function checkFilesExist(options) {

	const creds = options.getCreds();
	const client = new S3Client(creds);

	const params = {
		Bucket: 'd2lprodcdn',
		MaxKeys: 1,
		Prefix: options.getUploadPath()
	};

	const command = new ListObjectsV2Command(params);
	return client
		.send(command)
		.then(data => {
			if (data.Contents.length !== 0) {
				// files exist in s3 folder
				const errorMsg = `No files transferred because files already exists in ${options.getUploadPath()}`;
				throw new Error(errorMsg);
			}
		});
}
