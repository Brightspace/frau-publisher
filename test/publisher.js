var expect = require('chai').expect;
var publisher = require('../publisher');

describe('publisher', function() {
    it('should throw with null options', function() {
		expect(publisher).to.throw( 'Invalid arguments' );
  	})

  	it('should throw with no creds', function() {
		expect(function() {
			publisher({})
		}).to.throw( 'Invalid arguments' );
  	})

  	it('should throw with no key', function() {
		expect(function() {
			publisher({ creds: {} })
		}).to.throw( 'Invalid arguments' );
  	})

  	it('should throw with no secret', function() {
		var options = {
			creds: {
				key: 'some-key'
			}
		};

		expect(function() {
			publisher(options)
		}).to.throw( 'Invalid arguments' );
  	})

  	it('should throw with invalid location of creds', function() {
  		var options = {
  			creds: './creds.json'
  		}
  		expect(function() {
  			publisher(options)
  		}).to.throw( 'Invalid creds location' );
  	})

  	it('should throw with no appID', function() {
      var options = {
        creds: {
          key: 'some-key',
          secret: 'some-secret'
        }
      };
      expect(function() {
        publisher(options)
      }).to.throw( 'Invalid arguments' );
    })
});