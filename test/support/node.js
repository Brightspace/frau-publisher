'use strict';

var chai = require('chai');
var expect = chai.expect;
var SandboxedModule = require('sandboxed-module');
SandboxedModule.registerBuiltInSourceTransformer('istanbul');

chai.should();
chai.use(require('sinon-chai'));

global.sinon = require('sinon');
global.expect = chai.expect;
global.SandboxedModule = SandboxedModule;
