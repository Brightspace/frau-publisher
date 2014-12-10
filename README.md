#gulp-frau-publisher
[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Coverage Status][coverage-image]][coverage-url]

Utility for publishing free-range applications and libraries to our CDN
using [Gulp](http://www.gulpjs.com).

## Usage

Install `gulp-frau-publisher` as a dependency:

```shell
npm install --save-dev gulp-frau-publisher
```

To publish a free-range application:

```javascript
var publisher = require('gulp-frau-publisher');

var options = {
	id: 'someID',
	creds: {
		"key": "AKITHISISSOMEKEYASDF",
		"secret": "aCD233rDF232RANDOMSECRET12+32g"
	},
	devTag: '4.2.0'
};

var appPublisher = publisher.app( options );

gulp.src('./dist/**')
	.pipe( appPublisher.getStream() );
```

Alternately, to publish a library (e.g. jQuery, Angular, etc.) to the CDN:

```javascript
var libPublisher = publisher.lib( options );

gulp.src('./lib/jquery/**')
	.pipe( libPublisher.getStream() );
```

To publish the release version of your app or library, simply change `devTag` property to `version`.

In your `options` variable:

```javascript
var options = {
	id: 'someID',
	creds: require('./creds/keys.json'),
	version: '4.2.1'
};
```

Make sure the version follows the guideline to [Semantic Versioning](http://semver.org) of a valid version number.

Both the `app()` and `lib()` publisher methods accept the following options:

| Property Name | Description |
| ------------- | ----------- |
| id            | Unique name of the application or library. |
| creds         | Credential key/secret. Do **not** commit the secret to source control. Either load it from a file (which is excluded from source control) or use an environment or command-line variable. |
| devTag        | The development version of the application or library. |
| version       | The release version of the application or library. Unlike devTag, this property must follow the guideline to Semantic Versioning. |

To get the final location on the CDN of your files:

```javascript
var appPublisher = require('gulp-frau-publisher').app( options );

var location = appPublisher.getLocation();
```

[npm-url]: https://npmjs.org/package/gulp-frau-publisher
[npm-image]: https://badge.fury.io/js/gulp-frau-publisher.png
[ci-image]: https://travis-ci.org/Brightspace/gulp-frau-publisher.svg?branch=master
[ci-url]: https://travis-ci.org/Brightspace/gulp-frau-publisher
[coverage-image]: https://img.shields.io/coveralls/Brightspace/gulp-frau-publisher.svg
[coverage-url]: https://coveralls.io/r/Brightspace/gulp-frau-publisher?branch=master
