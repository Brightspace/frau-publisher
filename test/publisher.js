var SandboxedModule = require('sandboxed-module');

var gulpS3 = sinon.spy();

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
			creds: {
				key: 'some-key'
			}
		};

		expect(function() {
			publisher(options);
		}).to.throw( 'Invalid arguments' );
  });

    it('should call gulp-s3', function() {
      var options = {
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
        uploadPath: 'apps/simpleumdapp/dev/some-tag/'
      };

      gulpS3.should.have.been.calledWith( aws, s3Options );
    });
});
