'use strict';

const proxyquire = require('proxyquire');

describe('overwrite', function() {

	let overwrite,
		createClient,
		optsValidator,
		client;

	it('should succeed when folder is empty', function() {
		setUpEmptyFolder();

		return overwrite(optsValidator)();
	});

	it('should error when files exist in bucket', function() {
		setUpNonEmptyFolder();

		optsValidator.getUploadPath.returns('some-folder');
		const expectedErrorMsg = 'No files transferred because files already exists in some-folder';

		return overwrite(optsValidator)().then(
			() => { throw new Error('Should reject'); },
			err => expect(err)
				.to.be.an.instanceof(Error)
				.and.to.have.a.property('message')
				.that.equals(expectedErrorMsg)
		);
	});

	it('should handle err from S3', function() {
		const error = new Error('some-message');
		setUpList(error);

		return overwrite(optsValidator)().then(
			() => { throw new Error('Should reject'); },
			err => expect(err).to.equal(error)
		);
	});

	it('should only get S3 client once for multiple files', function() {
		setUpEmptyFolder();

		const overwriteCheck = overwrite(optsValidator);

		return Promise
			.all([overwriteCheck(), overwriteCheck()])
			.then(() => {
				expect(createClient).to.have.been.calledOnce;
			});
	});

	it('should only call send once for multiple files', function() {
		setUpEmptyFolder();

		const overwriteCheck = overwrite(optsValidator);

		return Promise
			.all([overwriteCheck(), overwriteCheck()])
			.then(() => {
				expect(client.send).to.have.been.calledOnce;
			});
	});

	beforeEach(function() {
		client = {
			send: function() {}
		};

		createClient = sinon.spy(function() {
			return client;
		});

		overwrite = proxyquire('../src/overwrite', {
			'@aws-sdk/client-s3': {
				S3Client: createClient,
				ListObjectsV2Command: function(params) {
					this.input = params;
				}
			}
		});

		optsValidator = {
			getCreds: sinon.stub().returns({ region: 'us-east-1' }),
			getUploadPath: sinon.stub().returns({})
		};
	});

	function setUpList(err, data) {
		const p = err
			? Promise.reject(err)
			: Promise.resolve(data);
		sinon
			.stub(client, 'send')
			.returns(p);
	}

	function setUpEmptyFolder() {
		setUpList(null, { Contents: [] });
	}

	function setUpNonEmptyFolder() {
		setUpList(null, { Contents: [ 'file.js'] });
	}
});
