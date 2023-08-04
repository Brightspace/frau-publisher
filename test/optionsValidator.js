'use strict';

const optionsValidator = require('../src/optionsValidator');

const validOptions = optionsValidator(
	{
		targetDirectory: 'myTargetDirectory',
		devTag: 'myDevTag',
		initialPath: 'path/',
		creds: { key: 'myKey', secret: 'mySecret' }
	}
);

const obsoleteValidOptions = optionsValidator(
	{
		id: 'myTargetDirectory',
		devTag: 'myDevTag',
		initialPath: 'path/',
		creds: { key: 'myKey', secret: 'mySecret' }
	}
);

describe('options validator', function() {

	describe('arguments', function() {

		it('should throw with undefined options', function() {
			const options = optionsValidator();
			expect(function() { options.getTargetDirectory(); }).to.throw('Missing options');
		});

		it('should throw with null options', function() {
			const options = optionsValidator(null);
			expect(function() { options.getTargetDirectory(); }).to.throw('Missing options');
		});

	});

	describe('targetDirectory', function() {

		it('should throw with no targetDirectory', function() {
			const options = optionsValidator({});
			expect(function() { options.getTargetDirectory(); }).to.throw('Missing targetDirectory');
		});

		it('should return specified targetDirectory', function() {
			expect(validOptions.getTargetDirectory()).to.equal('myTargetDirectory');
		});

		it('should return specified id as targetDirectory when targetDirectory not specified', function() {
			expect(obsoleteValidOptions.getTargetDirectory()).to.equal('myTargetDirectory');
		});

	});

	describe('version', function() {

		it('should throw with no devTag and no version', function() {
			const options = optionsValidator({ targetDirectory: 'myTargetDirectory' });
			expect(function() {
				options.getVersion();
			}).to.throw('Missing version');
		});

		it('should throw with wrong semantic version', function() {
			const options = optionsValidator({ targetDirectory: 'myTargetDirectory', version: '1.2.3.4' });
			expect(function() {
				options.getVersion();
			}).to.throw('"1.2.3.4" is not a valid version number. See semver.org for more details.');
		});

		it('should return specified devTag', function() {
			const releaseOptions = optionsValidator(
				{
					targetDirectory: 'myTargetDirectory',
					devTag: 'some-tag',
					initialPath: 'path/',
					creds: { key: 'myKey', secret: 'mySecret' }
				}
			);
			expect(releaseOptions.getVersion()).to.equal('some-tag');
		});

		it('should return specified version', function() {
			const releaseOptions = optionsValidator(
				{
					targetDirectory: 'myTargetDirectory',
					version: '1.2.0',
					initialPath: 'path/',
					creds: { key: 'myKey', secret: 'mySecret' }
				}
			);
			expect(releaseOptions.getVersion()).to.equal('1.2.0');
		});

	});

	describe('creds', function() {

		it('should return specified creds', function() {

			expect(validOptions.getCreds().accessKeyId).to.equal('myKey');
			expect(validOptions.getCreds().secretAccessKey).to.equal('mySecret');
		});

	});

	describe('getUploadPath', function() {

		it('should return valid development upload path', function() {
			expect(validOptions.getUploadPath())
				.to.equal('path/myTargetDirectory/dev/myDevTag');
		});

		it('should return valid release upload path', function() {
			const releaseOptions = optionsValidator(
				{
					targetDirectory: 'myTargetDirectory',
					version: '1.2.0',
					initialPath: 'path/',
					creds: { key: 'myKey', secret: 'mySecret' }
				}
			);
			expect(releaseOptions.getUploadPath())
				.to.equal('path/myTargetDirectory/1.2.0');
		});

		it('should prioritize release version over devTag', function() {
			const options = optionsValidator(
				{
					targetDirectory: 'myTargetDirectory',
					devTag: 'tag',
					version: '2.2.0',
					initialPath: 'path/',
					creds: { key: 'myKey', secret: 'mySecret' }
				}
			);
			expect(options.getUploadPath())
				.to.equal('path/myTargetDirectory/2.2.0');
		});

	});

});
