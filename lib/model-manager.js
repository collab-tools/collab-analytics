'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _collabDbLogging = require('collab-db-logging');

var _collabDbLogging2 = _interopRequireDefault(_collabDbLogging);

var _collabDbApplication = require('collab-db-application');

var _collabDbApplication2 = _interopRequireDefault(_collabDbApplication);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-enable import/no-unresolved */

/* eslint-disable import/no-unresolved */
var loggingInstance = null;
var appInstance = null;

exports.default = {
  initLogging: function initLogging(dbConfig) {
    if (dbConfig !== undefined) {
      loggingInstance = (0, _collabDbLogging2.default)(dbConfig);
    }
  },
  initApp: function initApp(dbConfig) {
    if (dbConfig !== undefined) {
      appInstance = (0, _collabDbApplication2.default)(dbConfig);
    }
  },
  logging: loggingInstance,
  app: appInstance
};
module.exports = exports['default'];