# gulp-frau-publisher
[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Dependency Status][dependencies-image]][dependencies-url]

A free-range-app utility for publishing apps and libraries to our CDN.

## Installation

Install `gulp-frau-publisher` as a dev dependency:

```shell
npm install gulp-frau-publisher
```

## Usage

### From CLI

The FRAU publisher can be run either directly on the console CLI (assuming dependencies are installed), or specified as a script in `package.json`.  Arguments may be passed directly on the CLI, or may be configured in `package.json`.  In addition, the publish key secret, dev tag, and version can either be explicitly specified, or can be read from the build environmnt.

Typical configuration for running in [TRAVIS](https://magnum.travis-ci.com/):

```javascript
frau-publisher --moduletype|-m app 
               --targetdirectory|-t 'cdn directory' 
               --key|-k yourkey 
               --secretvar S3_SECRET 
               --devtagvar TRAVIS_COMMIT 
               --versionvar TRAVIS_TAG 
               --files|-f './dist/**'
```

```javascript
"scripts": {
  "publish-release": "frau-publisher"
},
"config": {
  "frauPublisher": {
    "files": "./dist/**",
    "moduleType": "app",
    "targetDirectory": "cdn directory",
    "creds": {
      "key": "your key",
      "secretVar": "S3_SECRET"
    },
    "devTagVar": "TRAVIS_COMMIT",
    "versionVar": "TRAVIS_TAG"
  }
}
```

Explicitly specifying credentials, dev tag, and/or version:

**Note: never publish or commit unencrypted credentials.**

```javascript
frau-publisher --moduletype|-m app 
               --targetdirectory|-t 'cdn directory' 
               --key|-k yourkey 
               --secret|-s yoursecret 
               --devtag yourtag 
               --version|-v yourversion ex. 0.0.1 
               --files|-f './dist/**'
```

```javascript
"scripts": {
  "publish-release": "frau-publisher"
},
"config": {
  "frauPublisher": {
    "files": "./dist/**",
    "moduleType": "app",
    "targetDirectory": "cdn directory",
    "creds": {
      "key": "your key",
      "secret": "your secret"
    },
    "devTag": "your tag",
    "version": "0.0.1"
  }
}
```

### From JavaScript/Gulp

To publish an **app** to the CDN:

```javascript
var publisher = require('gulp-frau-publisher');

var options = {
	targetDirectory: 'cdn directory',
	creds: {
		"key": "your key",
		"secret": "your secret"
	},
	devTag: 'your tag'
};

var appPublisher = publisher.app( options );

gulp.src('./dist/**')
	.pipe(appPublisher.getStream());
```


To publish a **library** (e.g. jQuery, Angular, etc.) to the CDN:

```javascript
var libPublisher = publisher.lib( options );

gulp.src('./lib/jquery/**')
	.pipe(libPublisher.getStream());
```

### Publish to Production

To publish the released/production version of your app or library, you must change the `devTag` property to `version` and you must specify a valid version number that follows the guideline specified in [Semantic Versioning](http://semver.org).

In your `options` variable, set the `version` tag with a valid version:

```javascript
var options = {
	targetDirectory: 'cdn directory',
	creds: {
		"key": "your key",
		"secret": "your secret"
	},
	version: '0.0.1'
};
```

### Publishing Options

| Property | Description |
| --------------- | ----------- |
| targetDirectory | Unique target directory where the app or library will be published. |
| creds           | Credentials key/secret for the specified app. Do **not** commit the secret to source control. Either load it from a file (which is excluded from source control) or use an environment or command-line variable. |
| devTag          | The development version of the app or library. |
| version         | The released/production version of the app or library. Unlike devTag, this property must follow the guidelines in [Semantic Versioning](http://semver.org). |


### Get Published Location

To get the final location of where the files are on the CDN:

```javascript
var appPublisher = require('gulp-frau-publisher').app(options);

var location = appPublisher.getLocation();
```

## Contributing

Contributions are welcome, please submit a pull request!

### Code Style

This repository is configured with [EditorConfig](http://editorconfig.org) rules and contributions should make use of them.

[npm-url]: https://npmjs.org/package/gulp-frau-publisher
[npm-image]: https://img.shields.io/npm/v/gulp-frau-publisher.svg
[ci-image]: https://travis-ci.org/Brightspace/gulp-frau-publisher.svg?branch=master
[ci-url]: https://travis-ci.org/Brightspace/gulp-frau-publisher
[coverage-image]: https://img.shields.io/coveralls/Brightspace/gulp-frau-publisher.svg
[coverage-url]: https://coveralls.io/r/Brightspace/gulp-frau-publisher?branch=master
[dependencies-url]: https://david-dm.org/brightspace/gulp-frau-publisher
[dependencies-image]: https://img.shields.io/david/Brightspace/gulp-frau-publisher.svg
