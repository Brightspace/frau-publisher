#gulp-frau-publisher
[![Build status][ci-image]][ci-url]
[![Coverage Status][coverage-image]][coverage-url]

Utility for publishing free-range apps to our CDN.

## Usage

Install `gulp-frau-publisher` as a dependency from your cmd:

```shell
npm install --save-dev gulp-frau-publisher
```

The publisher function takes in one object that has three properties:

| Property Name | Description |
| ------------- | ----------- |
| appID         | Should be the name of your current module. |
| creds         | The credentials to log into the amazon-s3 server. |
| devTag        | The development version of the module. |

Set your creds in a file at `./creds/keys.json` like this:

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
	devTag: '4.2.0'
};

gulp.src('./dist/**')
	.pipe(publisher( options ));
```

## FAQ

 How do I specify which file I want upload?

>`gulp.src()` takes in a glob that you can specify which folder and which type of file you want to upload. 
Usually you want the files to be in the `dist` folder so our glob `./dist/**` will upload everything in that folder.


[ci-image]: https://travis-ci.org/Desire2Learn-Valence/gulp-frau-publisher.svg?branch=master
[ci-url]: https://travis-ci.org/Desire2Learn-Valence/gulp-frau-publisher
[coverage-image]: https://img.shields.io/coveralls/Desire2Learn-Valence/gulp-frau-publisher.svg
[coverage-url]: https://coveralls.io/r/Desire2Learn-Valence/gulp-frau-publisher?branch=master
