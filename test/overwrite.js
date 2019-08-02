'use strict';

const proxyquire = require('proxyquire');

describe('overwrite', function() {

	var overwrite,
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
		var expectedErrorMsg = 'No files transferred because files already exists in some-folder';

		return overwrite(optsValidator)().then(
			() => { throw new Error('Should reject'); },
			err => expect(err)
				.to.be.an.instanceof(Error)
				.and.to.have.a.property('message')
				.that.equals(expectedErrorMsg)
		);
	});

	it('should handle err from S3', function() {
		var error = new Error('some-message');
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

	it('should only call listObjectsV2 once for multiple files', function() {
		setUpEmptyFolder();

		const overwriteCheck = overwrite(optsValidator);

		return Promise
			.all([overwriteCheck(), overwriteCheck()])
			.then(() => {
				expect(client.listObjectsV2).to.have.been.calledOnce;
			});
	});

	beforeEach(function() {
		client = {
			listObjectsV2: function() {}
		};

		createClient = sinon.spy(function() {
			return client;
		});

		overwrite = proxyquire('../src/overwrite', {
			'aws-sdk': {
				S3: createClient
			}
		});

		optsValidator = {
			getCreds: sinon.stub().returns({}),
			getUploadPath: sinon.stub().returns({})
		};
	});

	function setUpList(err, data) {
		const p = err
			? Promise.reject(err)
			: Promise.resolve(data);
		sinon
			.stub(client, 'listObjectsV2')
			.returns({
				promise: () => p
			});
	}

	function setUpEmptyFolder() {
		setUpList(null, { Contents: [] });
	}

	function setUpNonEmptyFolder() {
		setUpList(null, { Contents: [ 'file.js'] });
	}
});
