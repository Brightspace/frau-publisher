'use strict';

const path = require('path');

const compressibles = [
	'.js',
	'.json',
	'.css',
	'.html',
	'.svg',
	'.ttf',
	'.ico'
];

module.exports = function isCompressibleFile(file) {
	const ext = path.extname(file.path).toLowerCase();
	return compressibles.indexOf(ext) > -1;
};
