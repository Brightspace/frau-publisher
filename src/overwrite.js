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
	const client = new AWS.S3({
		accessKeyId: creds.key,
		apiVersion: '2006-03-01',
		secretAccessKey: creds.secret
	});

	return new Promise((resolve, reject) => {
		const params = {
			Bucket: creds.bucket,
			MaxKeys: 1,
			Prefix: options.getUploadPath()
		};
		client.listObjects(params, function(err, data) {
			if (err) {
				return reject(err);
			}

			if (data.Contents.length !== 0) {
				// files exist in s3 folder
				const errorMsg = `No files transferred because files already exists in ${options.getUploadPath()}`;
				return reject(new Error(errorMsg));
			}

			// no files exist in s3 folder
			resolve();
		});
	});
}
