#gulp-frau-publisher
[![Build status][ci-image]][ci-url]
[![Coverage Status][coverage-image]][coverage-url]

Utility for publishing free-range apps to our CDN.

## Usage

Install `gulp-frau-publisher` as a dependency from your cmd:

```shell
npm install --save-dev gulp-frau-publisher
```

For your aws, you can either set it up in a file at `./creds/keys.json` 

`Method 1`
```javascript
{
	key: 'AKITHISISSOMEKEYASDF',
	secret: 'aCD233rDF232RANDOMSECRET12+32g'
}
```
Then in your `gulpfile.js`:

```javascript
var s3 = require('gulp-frau-publisher');

var options = {
	appID: 'someID',
	creds: require('./creds/keys.json'),
	devTag: process.env.COMMIT_SHA
};

gulp.src('./dist/**')
	.pipe(publisher( options ));
```

OR you can put it into your code directly.

`Method 2`
```javascript
var aws = {
	key: 'AKITHISISSOMEKEYASDF',
	secret: 'aCD233rDF232RANDOMSECRET12+32g'
}

var options = {
	appID: 'someID',
	creds: aws,
	devTag: process.env.COMMIT_SHA
}

gulp.src('./dist/**')
	.pipe(publisher( options ));
```

## FAQ

> What are the values in the options variable?

The three values are:

| Value Name | Description |
| ---------- | ----------- |
| appID      | Should be the name of your current project. |
| creds      | The credentials to log into the amazon-s3 server. |
| devTag     | The development version of the project. |

> How do I specify which file I want upload?

`gulp.src()` takes in a glob that you can specify which folder and which type of file you want to upload.
Usually you want the files to be in the `dist` folder so our glob `./dist/**` will upload everything in that folder.

> Why isn't `process.env.COMMIT_SHA` working?

If you copied the above file word by word of course it would not work.
process.env.COMMIT_SHA is only a local environment variable we set to hide the devTag from you ~~because we don't like you~~.
You usually set your dev version of your project as that variable, so you can have '4.2.0' depending on your project.

If you want to set your own process.env.COMMIT_SHA then you can use this command in your cmd:

```shell
SET COMMIT_SHA=4.2.0
```
~~We're joking. of course, we love you~~.


[ci-image]: https://travis-ci.org/Desire2Learn-Valence/gulp-frau-publisher.svg?branch=master
[ci-url]: https://travis-ci.org/Desire2Learn-Valence/gulp-frau-publisher
[coverage-image]: https://img.shields.io/coveralls/Desire2Learn-Valence/gulp-frau-publisher.svg
[coverage-url]: https://coveralls.io/r/Desire2Learn-Valence/gulp-frau-publisher?branch=master
