var Client = module.exports = function (config) {

	this.config = config;
};

Client.prototype.list = function (options, cb) {
	if (this.config.key == 'wrong-key') {
		return cb( null, { Code:'InvalidAccessKeyId', Contents : []});
	} else if ( this.config.secret == 'wrong-secret') {
		return cb( null, { Code:'SignatureDoesNotMatch', Contents : []});		
	}

	// return different content value depending on the config.key
	if (this.config.key == 'key-a') {
		return cb( null, { Contents: [ 'a.js', 'b.json']});
	} else {
		return cb( null, {  test: 'deep', Contents: []});
	}
};

module.exports.createClient = function (config) {
	return new Client(config);
};
