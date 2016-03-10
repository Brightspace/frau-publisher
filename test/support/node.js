'use strict';

var chai = require('chai');

chai.should();
chai.use(require('sinon-chai'));

global.sinon = require('sinon');
global.expect = chai.expect;
