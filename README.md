#gulp-frau-publisher
[![Build status][ci-image]][ci-url]
[![Coverage Status][coverage-image]][coverage-url]

Utility for publishing free-range apps and libraries to our CDN.

## Usage
**Before you start**: Make sure you have [NodeJS](http://nodejs.org) installed.

Install `gulp-frau-publisher` as a dependency from your cmd:

```shell
npm install --save-dev gulp-frau-publisher
```

Set your creds in a file at `./creds/keys.json` like this:

```javascript
{
	"key": "AKITHISISSOMEKEYASDF",
	"secret": "aCD233rDF232RANDOMSECRET12+32g"
}
```
Then in your `gulpfile.js`:

```javascript
var publisher = require('gulp-frau-publisher');

var options = {
	id: 'someID',
	creds: require('./creds/keys.json'),
	devTag: '4.2.0'
};

gulp.src('./dist/**')
	.pipe(publisher( options ));
```

Alternative, if you want to be more specific to apps, you can call:

```javascript
gulp.src('./dist/**')
	.pipe(publisher.apps( options ));
```

The publisher function takes in one object that has three properties:

| Property Name | Description |
| ------------- | ----------- |
| id            | Should be the name of your current module. |
| creds         | The credentials to log into the amazon-s3 server. |
| devTag        | The development version of the module. |

To get the location of your files, simple call

```javascript
var publisher = require('gulp-frau-publisher')(options);
// This is where file.txt was published.
publisher.location;
```

Here is how you would use this feature.

```javascript
var publisher = require('gulp-frau-publisher')(options);

gulp.src('file.txt')
	.pipe( publisher );

var fileTxtLocation = publisher.location + 'file.txt';
```

### Libraries Usage

With version 1.0.2, we added a way to upload libraries (e.g. jquery, VUI, etc.) to our CDN.

Follow the Usage instructions, however, instead of calling `publisher( options )` you will call `publisher.libs( options )` instead.

## FAQ

 How do I specify which file I want upload?

>`gulp.src()` takes in a glob that you can specify which folder and which type of file you want to upload.
Usually you want the files to be in the `dist` folder so our glob `./dist/**` will upload everything in that folder.

 What are the changes from version 1.0.1 to version 1.0.2?

>We added feature to upload libraries to our CDN while not distrupting the previous workflow. Now you can call `publisher.libs( options )` for library files, and similar manner for apps you can now call `publisher.apps( options )`.
Another Change `appID` is now `id`. However, you can still use `appID` in your code but you will recieve a `[DEPRECATED]` message letting you know future version will not support `appID`.


[ci-image]: https://travis-ci.org/Brightspace/gulp-frau-publisher.svg?branch=master
[ci-url]: https://travis-ci.org/Brightspace/gulp-frau-publisher
[coverage-image]: https://img.shields.io/coveralls/Brightspace/gulp-frau-publisher.svg
[coverage-url]: https://coveralls.io/r/Brightspace/gulp-frau-publisher?branch=master
