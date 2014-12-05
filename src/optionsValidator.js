'use strict';

function validateOpts( opts ) {
	if( !opts ) {
		throw new Error('Missing options');
	}
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
			return opts.initialPath + this.getId() + '/dev/' +
				this.getDevTag() + '/';
		}

	};
};
