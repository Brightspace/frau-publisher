#gulp-frau-publisher
[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Coverage Status][coverage-image]][coverage-url]

A utility for publishing free-range applications and libraries to our CDN
using [Gulp](http://www.gulpjs.com).

## Installation

Install `gulp-frau-publisher` as a dev dependency:

```shell
npm install --save-dev gulp-frau-publisher
```

## Publishing to the CDN

### Publish an app
To publish a free-range application to the CDN:

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

### Publish a library
To publish a library (e.g. jQuery, Angular, etc.) to the CDN:

```javascript
var libPublisher = publisher.lib( options );

gulp.src('./lib/jquery/**')
	.pipe( libPublisher.getStream() );
```

### Publish to production
To publish the released/production version of your app or library, you must change the `devTag` property to `version` and you must specify a valid version number that follows the guideline specified in [Semantic Versioning](http://semver.org).


In your `options` variable, set the `version` tag with a valid version:

```javascript
var options = {
	id: 'someID',
	creds: {
		"key": "AKITHISISSOMEKEYASDF",
		"secret": "aCD233rDF232RANDOMSECRET12+32g"
	},
	version: '4.2.1'
};
```

### Publishing options
Both the `app()` and `lib()` publisher methods accept the following options:

| Property | Description |
| ------------- | ----------- |
| id            | Unique name of the app or library. |
| creds         | Credentials key/secret for the specified app. Do **not** commit the secret to source control. Either load it from a file (which is excluded from source control) or use an environment or command-line variable. |
| devTag        | The development version of the app or library. |
| version       | The released/production version of the app or library. Unlike devTag, this property must follow the guidelines in [Semantic Versioning](http://semver.org). |

**Note**: Can also provide a `bucket` property in the creds object that is the name of an S3 bucket to upload to if you don't want to publish to the CDN.


### Get the app's location
To get the final location of where the files are on the CDN:

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
