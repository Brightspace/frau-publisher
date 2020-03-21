'use strict';

const AWS = require('aws-sdk');
const chalk = require('chalk');
const mime = require('mime-types');
const promised = require('promised-method');

const WINDOWS_SLASH_REGEX = /\\/g;
function replaceWindowsSlash(path) {
	return path.replace(WINDOWS_SLASH_REGEX, '/');
}

module.exports = function s3UploadFactory(knoxOpt, opt) {
	if (!opt) {
		throw new TypeError(`Expected "opt" to be a non-null Object". Saw "${typeof opt}"`);
	}

	if (typeof opt.uploadPath !== 'string') {
		throw new TypeError(`Expected "opt.uploadPath" to be a String. Saw "${typeof opt.uploadPath}"`);
	}

	if (opt.headers && typeof opt.headers !== 'object') {
		throw new TypeError(`Expected "opt.headers" to be an Object, if provided. Saw "${typeof opt.headers}"`);
	}

	opt.headers = opt.headers || {};

	const client = new AWS.S3(knoxOpt);

	return promised(function s3Uploader(file) {
		if (!file.isBuffer()) {
			return Promise.resolve(file);
		}

		const base = replaceWindowsSlash(file.base);
		const path = replaceWindowsSlash(file.path);
		let uploadPath = path.replace(base, opt.uploadPath);

		const headers = JSON.parse(JSON.stringify(opt.headers));

		if (!headers['Content-Type']) {
			const contentType = opt.type || mime.lookup(uploadPath) || 'text/plain';
			const charset = opt.charset || mime.charset(contentType);

			headers['Content-Type'] = contentType;

			if (charset) {
				headers['Content-Type'] += `; charset=${charset.toLowerCase()}`;
			}
		}

		if (headers['content-encoding'] === 'br') {
			uploadPath += '.br';
		}

		const params = {
			ACL: 'public-read',
			Body: file.contents,
			Bucket: 'd2lprodcdn',
			CacheControl: 'public,max-age=31536000,immutable',
			ContentEncoding: headers['content-encoding'],
			ContentLength: file.contents.length,
			ContentType: headers['Content-Type'],
			Key: uploadPath
		};

		return client
			.upload(params)
			.promise()
			.then(() => {
				console.error(chalk.green(`[SUCCESS] ${file.path} -> ${uploadPath}`)); // eslint-disable-line no-console
				return file;
			}, err => {
				let message = chalk.red(`[FAILED] ${file.path} -> ${uploadPath}`);
				message += `\n\t${err.message}`;
				throw new Error(message);
			});
	});
};
