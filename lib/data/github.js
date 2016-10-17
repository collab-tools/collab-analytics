'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _github = require('github');

var _github2 = _interopRequireDefault(_github);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var libConfig = {
  debug: true,
  protocol: 'https',
  Promise: _bluebird2.default
};

exports.default = new _github2.default(libConfig);
module.exports = exports['default'];