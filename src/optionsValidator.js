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
	return {

		getId: function() {
			validateOpts( opts );
			if( !opts.id ) {
				throw new Error('Missing id');
			}
			return opts.id;
		},

		getDevTag: function() {
			validateOpts( opts );
			if( !opts.devTag ) {
				throw new Error('Missing devTag');
			}
			return opts.devTag;
		},

		getVersion: function() {
			validateOpts( opts );
			if( !opts.version ) {
				throw new Error('Missing version');
			}
			var validatedVersion = semver.valid( opts.version );
			if (validatedVersion === null) {
				throw new Error('Version number is not valid according to Semantic Versioning.');
			}
			return validatedVersion;
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
				bucket: 'd2lprodcdn'
			};
		},

		getUploadPath: function() {
			validateOpts( opts );
			var devPath = getDevPath( opts );
			// version gets priority over devTag
			return opts.initialPath + this.getId() + devPath +
				(opts.version ? this.getVersion() : this.getDevTag()) + '/';
		}

	};
};
