# frau-publisher
[![NPM version][npm-image]][npm-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Dependency Status][dependencies-image]][dependencies-url]

A free-range-app utility for publishing to our CDN.

## Installation

Install `frau-publisher` as a dev dependency:

```shell
npm install frau-publisher
```

## Usage

### From CLI

The FRAU publisher can be run either directly on the console CLI (assuming dependencies are installed), or specified as a script in `package.json`.  Arguments may be passed directly on the CLI, or may be configured in `package.json`.  In addition, the publish key secret, dev tag, and version can either be explicitly specified, or can be read from the build environment.

To get credentials for your CI job, use [iam-build-tokens](https://github.com/Brightspace/iam-build-tokens/blob/master/README.md).

Typical configuration for running in [TRAVIS](https://magnum.travis-ci.com/):

```javascript
frau-publisher --moduletype|-m app|lib 
               --targetdir|-t 'cdn directory' 
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
    "moduleType": "app|lib",
    "targetDirectory": "cdn directory",
    "devTagVar": "TRAVIS_COMMIT",
    "versionVar": "TRAVIS_TAG"
  }
}
```

Explicitly specifying credentials, dev tag, and/or version:

**Note: never publish or commit unencrypted credentials.**

```javascript
frau-publisher --moduletype|-m app 
               --targetdir|-t 'cdn directory' 
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
    "moduleType": "app|lib",
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
var publisher = require('frau-publisher');

var options = {
	targetDirectory: 'cdn directory',
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
	version: '0.0.1'
};
```

### Publishing Options

| Property | Description |
| --------------- | ----------- |
| targetDirectory | Unique target directory where the app or library will be published. |
| creds           | Credentials key/secret for the specified app. Do **not** commit the secret to source control. Either load it from a file (which is excluded from source control) or use an environment or command-line variable. Prefer to get these from the standard environment variables. |
| devTag          | The development version of the app or library. |
| version         | The released/production version of the app or library. Unlike devTag, this property must follow the guidelines in [Semantic Versioning](http://semver.org). |


### Get Published Location

To get the final location of where the files are on the CDN:

```javascript
var appPublisher = require('frau-publisher').app(options);

var location = appPublisher.getLocation();
```

## Versioning & Releasing

> TL;DR: Commits prefixed with `fix:` and `feat:` will trigger patch and minor releases when merged to `master`. Read on for more details...

The [sematic-release GitHub Action](https://github.com/BrightspaceUI/actions/tree/master/semantic-release) is called from the `release.yml` GitHub Action workflow to handle version changes and releasing.

### Version Changes

All version changes should obey [semantic versioning](https://semver.org/) rules:
1. **MAJOR** version when you make incompatible API changes,
2. **MINOR** version when you add functionality in a backwards compatible manner, and
3. **PATCH** version when you make backwards compatible bug fixes.

The next version number will be determined from the commit messages since the previous release. Our semantic-release configuration uses the [Angular convention](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular) when analyzing commits:
* Commits which are prefixed with `fix:` or `perf:` will trigger a `patch` release. Example: `fix: validate input before using`
* Commits which are prefixed with `feat:` will trigger a `minor` release. Example: `feat: add toggle() method`
* To trigger a MAJOR release, include `BREAKING CHANGE:` with a space or two newlines in the footer of the commit message
* Other suggested prefixes which will **NOT** trigger a release: `build:`, `ci:`, `docs:`, `style:`, `refactor:` and `test:`. Example: `docs: adding README for new component`

To revert a change, add the `revert:` prefix to the original commit message. This will cause the reverted change to be omitted from the release notes. Example: `revert: fix: validate input before using`.

### Releases

When a release is triggered, it will:
* Update the version in `package.json`
* Tag the commit
* Create a GitHub release (including release notes)
* Deploy a new package to NPM

### Releasing from Maintenance Branches

Occasionally you'll want to backport a feature or bug fix to an older release. `semantic-release` refers to these as [maintenance branches](https://semantic-release.gitbook.io/semantic-release/usage/workflow-configuration#maintenance-branches).

Maintenance branch names should be of the form: `+([0-9])?(.{+([0-9]),x}).x`.

Regular expressions are complicated, but this essentially means branch names should look like:
* `1.15.x` for patch releases on top of the `1.15` release (after version `1.16` exists)
* `2.x` for feature releases on top of the `2` release (after version `3` exists)

## Contributing

Contributions are welcome, please submit a pull request!

### Code Style

This repository is configured with [EditorConfig](http://editorconfig.org) rules and contributions should make use of them.

[npm-url]: https://npmjs.org/package/frau-publisher
[npm-image]: https://img.shields.io/npm/v/frau-publisher.svg
[coverage-image]: https://img.shields.io/coveralls/Brightspace/frau-publisher.svg
[coverage-url]: https://coveralls.io/r/Brightspace/frau-publisher?branch=master
[dependencies-url]: https://david-dm.org/brightspace/frau-publisher
[dependencies-image]: https://img.shields.io/david/Brightspace/frau-publisher.svg
