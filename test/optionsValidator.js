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

	describe( 'devTag', function() {

		it( 'should throw with no devTag', function() {
			var options = optionsValidator( { id: 'id' } );
			expect( function() {
					options.getDevTag();
				} ).to.throw( 'Missing devTag' );
		} );

		it( 'should return specified devTag', function() {
			expect( validOptions.getDevTag() ).to.equal( 'myDevTag' );
		} );

	} );

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

		it( 'should return specified creds', function() {

			expect( validOptions.getCreds().key ).to.equal( 'myKey' );
			expect( validOptions.getCreds().secret ).to.equal( 'mySecret' );
		} );

	} );

	describe( 'getUploadPath', function() {

		it( 'should return valid upload path', function() {
			expect( validOptions.getUploadPath() )
				.to.equal( 'path/myId/dev/myDevTag/' );
		} );

	} );

} );
