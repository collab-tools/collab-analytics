'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _collabDbApplication = require('collab-db-application');

var _collabDbApplication2 = _interopRequireDefault(_collabDbApplication);

var _collabDbLogging = require('collab-db-logging');

var _collabDbLogging2 = _interopRequireDefault(_collabDbLogging);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /* eslint-disable import/no-unresolved */


/* eslint-enable import/no-unresolved */

var storageInstance = null;

var storageHelper = function storageHelper(dbConfig) {
  _classCallCheck(this, storageHelper);

  if (!storageInstance) {
    storageInstance = {
      app: (0, _collabDbApplication2.default)(dbConfig.dbApp),
      log: (0, _collabDbLogging2.default)(dbConfig.dbLog)
    };
  }
  return storageInstance;
};

exports.default = storageHelper;
module.exports = exports['default'];