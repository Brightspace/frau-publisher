var Client = module.exports = function (config) {

	this.config = config;
};

Client.prototype.list = function (options, cb) {
	
	// simulate wrong key
	if (this.config.key == 'wrong-key') {
		cb( null, { Code:'InvalidAccessKeyId', Contents : []});
		return;
	} 

	// simulate wrong secret
	if ( this.config.secret == 'wrong-secret') {
		cb( null, { Code:'SignatureDoesNotMatch', Contents : []});
		return;
	}

	// simulate s3 with existing files
	if (this.config.key == 'key-a') {
		cb( null, { Contents: [ 'a.js', 'b.json']});
		return;
	} 
	
	// default: empty s3 server
	cb( null, {  test: 'deep', Contents: []});
};

module.exports.createClient = function (config) {
	return new Client(config);
};
