var optionsValidator = require('../src/optionsValidator');

var validOptions = optionsValidator(
	{
		id: 'myId',
		devTag: 'myDevTag',
		initialPath: 'path/',
		creds: { key: 'myKey', secret: 'mySecret' }
	}
);



describe( 'options validator', function() {

	describe( 'arguments', function() {

		it( 'should throw with undefined options', function() {
			var options = optionsValidator();
			expect( function() { options.getId(); } ).to.throw( 'Missing options' );
		} );

		it( 'should throw with null options', function() {
			var options = optionsValidator( null );
			expect( function() { options.getId(); } ).to.throw( 'Missing options' );
		} );

	} );

	describe( 'id', function() {

		it( 'should throw with no id', function() {
			var options = optionsValidator({});
			expect( function() { options.getId(); } ).to.throw( 'Missing id' );
		} );

		it( 'should return specified id', function() {
			expect( validOptions.getId() ).to.equal( 'myId' );
		} );

	} );

	describe( 'version', function() {

		it( 'should throw with no devTag and no version', function() {
			var options = optionsValidator( { id: 'id' } );
			expect( function() {
					options.getVersion();
				} ).to.throw( 'Missing version' );
		} );

		it( 'should throw with wrong semantic version', function() {
			var options = optionsValidator( { id: 'id', version: '1.2.3.4' } );
			expect( function() {
					options.getVersion();
				} ).to.throw( '"1.2.3.4" is not a valid version number. See semver.org for more details.' );
		} );

		it( 'should return specified devTag', function() {
			var releaseOptions = optionsValidator(
				{
					id: 'myId',
					devTag: 'some-tag',
					initialPath: 'path/',
					creds: { key: 'myKey', secret: 'mySecret' }
				}
			);
			expect( releaseOptions.getVersion() ).to.equal( 'some-tag' );
		} );

		it( 'should return specified version', function() {
			var releaseOptions = optionsValidator(
				{
					id: 'myId',
					version: '1.2.0',
					initialPath: 'path/',
					creds: { key: 'myKey', secret: 'mySecret' }
				}
			);
			expect( releaseOptions.getVersion() ).to.equal( '1.2.0' );
		} );

	});

	describe( 'creds', function() {

		it( 'should throw with no credentials', function() {
			var options = optionsValidator( { id: 'id', devTag: 'tag' } );
			expect( function() {
					options.getCreds();
				} ).to.throw( 'Missing credentials' );
		} );

		it( 'should throw with no credentials key', function() {
			var options = optionsValidator(
				{ id: 'id', devTag: 'tag', creds: {} }
			);
			expect( function() {
					options.getCreds();
				} ).to.throw( 'Missing credential key' );
		} );

		it( 'should throw with no credentials secret', function() {
			var options = optionsValidator(
				{ id: "id", devTag: "devTag", creds: { key: "key" } }
			);
			expect( function() {
					options.getCreds();
				} ).to.throw( 'Missing credential secret' );
		} );

		it( 'should set bucket to production cdn when none provided', function() {
			var options = optionsValidator(
				{ id: 'id', devTag: 'devTag', creds: { key: 'key', secret: 'mySecret' } }
			);
			expect(options.getCreds()).to.have.property('bucket', 'd2lprodcdn');
		} );

		it( 'should set bucket to provided bucket when one provided', function() {
			var options = optionsValidator(
				{ id: 'id', devTag: 'devTag', creds: { key: 'key', secret: 'mySecret', testBucket: 'test-bucket' } }
			);
			expect( options.getCreds() ).to.have.property('bucket', 'test-bucket');
		} );

		it( 'should return specified creds', function() {

			expect( validOptions.getCreds().key ).to.equal( 'myKey' );
			expect( validOptions.getCreds().secret ).to.equal( 'mySecret' );
		} );

	} );

	describe( 'getBaseLocation', function() {
		it( 'should return the production CDN when no bucket provided', function() {
			var options = optionsValidator(
				{ id: 'id', devTag: 'devTag', creds: { key: 'key', secret: 'mySecret' } }
			);
			expect( options.getBaseLocation() ).to.equal('https://s.brightspace.com/');
		} );

		it( 'should return the AWS bucket location when a bucket is provided', function() {
			var options = optionsValidator(
				{ id: 'id', devTag: 'devTag', creds: { key: 'key', secret: 'mySecret', testBucket: 'test-bucket' } }
			);
			expect( options.getBaseLocation() ).to.equal('https://s3.amazonaws.com/test-bucket/');
		} );

		it( 'should return the production CDN when the production bucket name is provided', function() {
			var options = optionsValidator(
				{ id: 'id', devTag: 'devTag', creds: { key: 'key', secret: 'mySecret', testBucket: 'd2lprodcdn' } }
			);
			expect( options.getBaseLocation() ).to.equal('https://s.brightspace.com/');
		} );

		it( 'should return the production CDN when an empty bucket name is provided', function() {
			var options = optionsValidator(
				{ id: 'id', devTag: 'devTag', creds: { key: 'key', secret: 'mySecret', testBucket: '' } }
			);
			expect( options.getBaseLocation() ).to.equal('https://s.brightspace.com/');
		} );
	} );

	describe( 'getUploadPath', function() {

		it( 'should return valid development upload path', function() {
			expect( validOptions.getUploadPath() )
				.to.equal( 'path/myId/dev/myDevTag/' );
		} );

		it( 'should return valid release upload path', function() {
			var releaseOptions = optionsValidator(
				{
					id: 'myId',
					version: '1.2.0',
					initialPath: 'path/',
					creds: { key: 'myKey', secret: 'mySecret' }
				}
			);
			expect( releaseOptions.getUploadPath() )
				.to.equal( 'path/myId/1.2.0/' );
		} );

		it( 'should prioritize release version over devTag', function() {
			var options = optionsValidator(
				{
					id: 'myId',
					devTag: 'tag',
					version: '2.2.0',
					initialPath: 'path/',
					creds: { key: 'myKey', secret: 'mySecret' }
				}
			);
			expect( options.getUploadPath() )
				.to.equal( 'path/myId/2.2.0/' );
		} );

	} );

} );
