var Client = module.exports = function (config) {

	this.config = config;
};

Client.prototype.list = function (options, cb) {
	console.log('this list');
	if (this.config.key == 'wrong-key') {
		cb( null, { Code:'InvalidAccessKeyId', Contents : []});
	} else if ( this.config.secret == 'wrong-secret') {
		cb( null, { Code:'SignatureDoesNotMatch', Contents : []});		
	}

	// return different content value depending on the config.key
	if (this.config.key == 'key-a') {
		cb( null, { Contents: [ 'a.js', 'b.json']});
	} else {
		cb( null, { Contents: []});
	}
};

module.exports.createClient = function (config) {
	return new Client(config);
};
