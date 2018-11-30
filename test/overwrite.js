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

	it('should handle bad data.Code error from knox', function() {
		setUpList(null, { Code: 'some-code', Message: 'some-message' });

		return overwrite(optsValidator)().then(
			() => { throw new Error('Should reject'); },
			err => expect(err)
				.to.be.an.instanceof(Error)
				.and.to.have.a.property('message')
				.that.equals('some-message')
		);
	});

	it('should handle err from knox', function() {
		var error = new Error('some-message');
		setUpList(error);

		return overwrite(optsValidator)().then(
			() => { throw new Error('Should reject'); },
			err => expect(err).to.equal(error)
		);
	});

	it('should only get knox client once for multiple files', function() {
		setUpEmptyFolder();

		const overwriteCheck = overwrite(optsValidator);

		return Promise
			.all([overwriteCheck(), overwriteCheck()])
			.then(() => {
				expect(createClient).to.have.been.calledOnce;
			});
	});

	it('should only call knox#list once for multiple files', function() {
		setUpEmptyFolder();

		const overwriteCheck = overwrite(optsValidator);

		return Promise
			.all([overwriteCheck(), overwriteCheck()])
			.then(() => {
				expect(client.list).to.have.been.calledOnce;
			});
	});

	beforeEach(function() {
		client = {
			list: function() {}
		};

		createClient = sinon.spy(function() {
			return client;
		});

		overwrite = proxyquire('../src/overwrite', {
			knox: {
				createClient: createClient
			}
		});

		optsValidator = {
			getCreds: sinon.stub().returns({}),
			getUploadPath: sinon.stub().returns({})
		};
	});

	function setUpList(err, data) {
		sinon.stub(client, 'list').callsFake(function(object, cb) {
			cb(err, data);
		});
	}

	function setUpEmptyFolder() {
		setUpList(null, { Contents: [] });
	}

	function setUpNonEmptyFolder() {
		setUpList(null, { Contents: [ 'file.js'] });
	}
});
