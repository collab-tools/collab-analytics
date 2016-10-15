'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (dbApp, dbLog) {
  var storage = new _storage2.default({ dbApp: dbApp, dbLog: dbLog });
  return {
    drive: (0, _drive2.default)(storage),
    github: (0, _github2.default)(storage),
    milestone: (0, _milestone2.default)(storage),
    task: (0, _task2.default)(storage)
  };
};

var _storage = require('./storage');

var _storage2 = _interopRequireDefault(_storage);

var _drive = require('./controllers/drive');

var _drive2 = _interopRequireDefault(_drive);

var _github = require('./controllers/github');

var _github2 = _interopRequireDefault(_github);

var _milestone = require('./controllers/milestone');

var _milestone2 = _interopRequireDefault(_milestone);

var _task = require('./controllers/task');

var _task2 = _interopRequireDefault(_task);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];

/**
 * Library initialization that requires sequelize mySQL information
 * and entry point for external references.
 * @param  {object} dbApp    object containing app database information
 * @param  {object} dbLog    object containing logging database information
 * @return {object}          object containing logging controllers
 */