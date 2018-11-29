'use strict';

const chalk = require('chalk');
const knox = require('knox');
const mime = require('mime-types');
const promised = require('promised-method');

const WINDOWS_SLASH_REGEX = /\//g;
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

	const client = knox.createClient(knoxOpt);

	return promised(function s3Uploader(file) {
		if (!file.isBuffer()) {
			return Promise.resolve(file);
		}

		const base = replaceWindowsSlash(file.base);
		const path = replaceWindowsSlash(file.path);
		const uploadPath = path.replace(base, opt.uploadPath);

		const headers = JSON.parse(JSON.stringify(opt.headers));

		if (!headers['Content-Type']) {
			const contentType = opt.type || mime.lookup(uploadPath) || 'text/plain';
			const charset = opt.charset || mime.charset(contentType);

			headers['Content-Type'] = contentType;

			if (charset) {
				headers['Content-Type'] += `; charset=${charset.toLowerCase()}`;
			}
		}

		headers['Content-Length'] = file.contents.length;

		return new Promise((resolve, reject) => {
			client
				.put(uploadPath, headers)
				.on('response', res => {
					res.resume();

					if (res.statusCode !== 200) {
						let message = chalk.red(`[FAILED] ${file.path} -> ${uploadPath}`);
						message += `\n\tHTTP Status Code: ${res.statusCode}`;

						return reject(new Error(message));
					}

					console.error(chalk.green(`[SUCCESS] ${file.path} -> ${uploadPath}`)); // eslint-disable-line no-console
					resolve(file);
				})
				.on('error', err => {
					let message = chalk.red(`[FAILED] ${file.path} -> ${uploadPath}`);
					message += `\n\t${err.message}`;

					reject(new Error(message));
				})
				.end(file.contents);
		});
	});
};
