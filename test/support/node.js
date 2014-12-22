'use strict';

var chai = require('chai');
var expect = chai.expect;

chai.should();
chai.use(require('sinon-chai'));

global.sinon = require('sinon');
global.expect = chai.expect;
