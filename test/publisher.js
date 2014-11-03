var gulpS3 = sinon.stub().returns({});

var publisher = SandboxedModule.require('../publisher', {
    requires: { 'gulp-s3': gulpS3 }
});

describe('publisher', function() {
    it('should throw with null options', function() {
		    expect(publisher).to.throw( 'Invalid arguments' );
  	});

  	it('should throw with no creds', function() {
		    expect(function() {
			       publisher({});
		    }).to.throw( 'Invalid arguments' );
  	});

  	it('should throw with no key', function() {
		    expect(function() {
			       publisher({ creds: {} });
        }).to.throw( 'Invalid arguments' );
  	});

  	it('should throw with no secret', function() {
  		var options = {
        appID: 'some-ID',
  			creds: {
  				key: 'some-key'
  			}
  		};

  		expect(function() {
  			publisher(options);
  		}).to.throw( 'Invalid arguments' );
    });

  	it('should throw with no appID', function() {
      var options = {
        creds: {
          key: 'some-key',
          secret: 'some-secret'
        }
      };
      expect(function() {
        publisher(options);
      }).to.throw( 'Invalid arguments' );
    });

    it ('should not throw even if there is extra info in the creds', function() {
      var options = {
        appID: 'some-ID',
        creds: {
          key: 'some-key',
          secret: 'some-secret',
          useless: 'testetetse'
        }
      };

      expect(function() {
        publisher(options);
      }).to.not.throw();
    });

    it('should call gulp-s3', function() {
      var options = {
        appID: 'some-ID',
        creds: { key: 'some-key', secret: 'some-secret' },
        devTag: 'some-tag'
      };

      publisher(options); // Ignore result

      var aws = {
        key: 'some-key',
        secret: 'some-secret',
        bucket: 'gaudi-cdn-test'
      };

      var s3Options = {
        uploadPath: 'apps/some-ID/dev/some-tag/'
      };

      gulpS3.should.have.been.calledWith( aws, s3Options );
    });

    it('should return proper address', function() {
      var options = {
        appID: 'some-ID',
        creds: { key: 'some-key', secret: 'some-secret' },
        devTag: 'some-tag'
      };
      var publisher_test = publisher( options );
      expect(publisher_test.location).to.equal('https://d2660orkic02xl.cloudfront.net/apps/some-ID/dev/some-tag/');
    });
});
