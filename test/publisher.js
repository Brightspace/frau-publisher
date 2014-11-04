var gulpS3 = sinon.stub().returns({});

var publisher = SandboxedModule.require('../publisher', {
    requires: { 'gulp-s3': gulpS3 }
});

describe('publisher', function() {
    it('should throw with null options', function() {
		    expect(publisher).to.throw( 'Missing options' );
  	});

  	it('should throw with no creds', function() {
        var options = {
            appID: 'some-ID',
            devTag: 'tag'
        };

	    expect(function() {
	       publisher(options);
	    }).to.throw( 'Missing credentials' );
  	});

  	it('should throw with no key', function() {
        var options = {
            appID: 'some-ID',
            creds: {
                secret: 'some-secret'
            },
            devTag: 'tag'
        };

        expect(function() {
            publisher(options);
        }).to.throw( 'Missing credential key' );
  	});

  	it('should throw with no secret', function() {
  		var options = {
            appID: 'some-ID',
  			creds: {
  				key: 'some-key'
  			},
            devTag: 'tag'
  		};

  		expect(function() {
  			publisher(options);
  		}).to.throw( 'Missing credential secret' );
    });

    it('should throw with no appID', function() {
        var options = {
            creds: {
                key: 'some-key',
                secret: 'some-secret'
            },
            devTag: 'tag'
        };

        expect(function() {
            publisher(options);
        }).to.throw( 'Missing app id' );
    });

    it('should throw with no devTag', function() {
        var options = {
            appID: 'some-id',
            creds: {
                key: 'some-key',
                secret: 'some-secret'
            }
        };

        expect(function() {
            publisher(options);
        }).to.throw( 'Missing devTag' );
    });

    it ('should not throw even if there is extra info in the creds', function() {
        var options = {
            appID: 'some-ID',
            creds: {
                key: 'some-key',
                secret: 'some-secret',
                useless: 'testetetse'
            },
            devTag: 'tag'
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
        bucket: 'd2lprodcdn'
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
  });''
});
