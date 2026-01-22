'use strict';

const chalk = require('chalk');
const semver = require('semver');

function validateOpts(opts) {
	if (!opts) {
		throw new Error('Missing options');
	}
}

// Check if it is a release version or a dev version and return the correct path for it
function getDevPath(opts) {
	validateOpts(opts);
	if (opts.version) {
		return '/';
	}
	return '/dev/';
}

module.exports = function(opts) {

	const options = {

		getTargetDirectory: function() {
			validateOpts(opts);
			if (!opts.targetDirectory && !opts.id) {
				throw new Error('Missing targetDirectory');
			}
			if (opts.id) {
				console.log(chalk.red('The targetDirectory should be specified on options rather than id.  Specifying targetDirectory via id will not be supported in a future release.'));
			}
			if (!opts.targetDirectory && opts.id) {
				opts.targetDirectory = opts.id;
			}
			return opts.targetDirectory;
		},

		getVersion: function() {
			validateOpts(opts);
			if (!opts.devTag && !opts.version) {
				throw new Error('Missing version or devTag');
			}
			if (opts.version) {
				const validatedVersion = semver.valid(opts.version);
				if (validatedVersion === null) {
					throw new Error('"' + opts.version + '" is not a valid version number. See semver.org for more details.');
				}
				return validatedVersion;
			} // if false, there has to be a devTag
			return opts.devTag;
		},

		getCreds: function() {
			const creds = {
				apiVersion: '2006-03-01',
				region: 'us-east-1'
			};
			if (!opts.creds) {
				return creds;
			}
			if (opts.creds.key) {
				creds.accessKeyId = opts.creds.key;
			}
			if (opts.creds.secret) {
				creds.secretAccessKey = opts.creds.secret;
			}
			if (opts.creds.sessionToken) {
				creds.sessionToken = opts.creds.sessionToken;
			}

			return creds;
		},

		getUploadPath: function() {
			validateOpts(opts);
			const devPath = getDevPath(opts);
			// version gets priority over devTag
			return opts.initialPath + this.getTargetDirectory() + devPath +
				this.getVersion();
		}

	};

	return options;
};
