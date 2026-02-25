'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai').default;

chai.should();
chai.use(sinonChai);

global.sinon = sinon;
global.expect = chai.expect;
