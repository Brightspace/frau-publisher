'use strict';

const child_process = require('child_process');

describe('cli', /* @this */ function() {
	this.timeout(3000);
	['app', 'lib'].forEach(function(moduleType) {
		it('should fail with exit code 1 when an error occurs', function(done) {
			const p = child_process.execFile('./bin/publishercli', [
				'-m', moduleType,
				'-t', '/frau-publisher-failing-test',
				'-f', './test/test-files/*',
				'-k', 'BAD_KEY',
				'-s', 'BAD_SECRET',
				'--devtag', 'fail'
			])
				.on('error', done)
				.on('exit', function(code) {
					if (code !== 1) {
						return done(new Error('Expected exit code of 1, saw ' + code));
					}

					done();
				});

			p.stdout.pipe(process.stderr);
			p.stderr.pipe(process.stderr);
		});
	});
});
