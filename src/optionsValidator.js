'use strict';
var semver = require('semver');

function validateOpts ( opts ) {
	if( !opts ) {
		throw new Error('Missing options');
	}
}

// Check if it is a release version or a dev version and return the correct path for it
function getDevPath ( opts ) {
	validateOpts( opts );
	if ( opts.version ) {
		return '/';
	}
	return '/dev/';
}

module.exports = function( opts ) {

	var options = {

		getId: function() {
			validateOpts( opts );
			if( !opts.id ) {
				throw new Error('Missing id');
			}
			return opts.id;
		},

		getVersion: function () {
			validateOpts( opts );
			if( !opts.devTag && !opts.version ) {
				throw new Error('Missing version or devTag');
			}
			if ( opts.version ) {
				var validatedVersion = semver.valid( opts.version );
				if (validatedVersion === null) {
					throw new Error('"' + opts.version + '" is not a valid version number. See semver.org for more details.');
				}
				return validatedVersion;
			} // if false, there has to be a devTag
			return opts.devTag;
		},

		getCreds: function() {
			validateOpts( opts );
			if( !opts.creds ) {
				throw new Error('Missing credentials');
			}
			if( !opts.creds.key ) {
				throw new Error('Missing credential key');
			}
			if( !opts.creds.secret ) {
				throw new Error('Missing credential secret');
			}
			return {
				key: opts.creds.key,
				secret: opts.creds.secret,
				bucket: opts.creds.testBucket || 'd2lprodcdn'
			};
		},

		getBaseLocation: function() {
			validateOpts( opts );
			var testBucket = opts.creds.testBucket;
			if (testBucket && testBucket !== 'd2lprodcdn') {
				return 'https://s3.amazonaws.com/' + testBucket + '/';
			} else {
				return 'https://s.brightspace.com/';
			}
		},

		getUploadPath: function() {
			validateOpts( opts );
			var devPath = getDevPath( opts );
			// version gets priority over devTag
			return opts.initialPath + this.getId() + devPath +
				this.getVersion() + '/';
		}

	};

	return options;
};
