'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (storage) {
  /**
   * Pulls revision histories from Google Drive API and store
   * into logging database.
   * @pre   Files must be pulled first before running this function as it is dependent.
   * @param {object} googleConfig contains client_id, client_secret, redirect_URL
   * @param {String} projectId
   * @param {String} refreshToken
   */
  function pullRevisions(googleConfig, projectId, refreshToken) {
    var OAuth2 = _googleapis2.default.auth.OAuth2;
    var oauthClient = new (Function.prototype.bind.apply(OAuth2, [null].concat(_toConsumableArray(googleConfig))))();
    oauthClient.setCredentials({ refresh_token: refreshToken });

    var payload = {};

    var retrieveRevisions = function retrieveRevisions(files) {
      payload.files = files;
      payload.revisions = [];

      var drive = _googleapis2.default.drive({ version: 'v3', auth: oauthClient });
      var Continue = {};
      var again = function again() {
        return Continue;
      };

      /* eslint-disable no-mixed-operators */
      var repeat = function repeat(fn) {
        return _bluebird2.default.try(fn, again).then(function (val) {
          return val === Continue && repeat(fn) || val;
        });
      };
      /* eslint-enable */

      var start = 0;
      var stop = payload.files.length;

      /* eslint-disable no-shadow, consistent-return */
      return repeat(function (again) {
        /* eslint-enable */
        if (start < stop) {
          var options = {
            fileId: payload.files[start].id,
            fields: 'kind, revisions'
          };
          return _bluebird2.default.promisify(drive.revisions.list)(options).then(function (revs) {
            payload.revisions = payload.revisions.concat(revs);
          }, function () {}).then(function () {
            return start += 1;
          }).then(again);
        }
      });
    };

    var processFilesIntoDB = function processFilesIntoDB() {
      var processFile = function processFile(fileIndex) {
        var fileId = payload.files[fileIndex].id;
        var name = payload.files[fileIndex].name;
        var mime = payload.files[fileIndex].mimeType;
        var revisions = payload.revisions[fileIndex];
        if (revisions && revisions.length > 0) {
          revisions.forEach(function (revision) {
            var revisionWrapper = {
              fileUUID: fileId,
              fileName: name,
              fileMIME: mime,
              date: revision.modifiedTime,
              googleId: revision.lastModifyingUser.permissionId,
              projectId: projectId
            };
            storage.log.revision_log.createLog(revisionWrapper);
          });
        }
      };

      var dbPromises = [];

      for (var fileIndex = 0; fileIndex < payload.files.length; fileIndex += 1) {
        dbPromises.push(processFile(fileIndex));
      }

      return _bluebird2.default.all(dbPromises);
    };

    var response = function response() {
      return { success: true };
    };

    var errorHandler = function errorHandler(err) {
      console.error(err);
      return { success: false, message: err };
    };

    return storage.log.revision_log.getUniqueFiles(projectId).then(retrieveRevisions).then(processFilesIntoDB).then(response).catch(errorHandler);
  }

  /**
   * Pulls files creation and deletion logs from Google Drive API
   * and store into logging database.
   * @param {String} googleConfig
   * @param {String} projectId
   * @param {String} rootFolder
   * @param {String} refreshToken
   */
  function pullDrive(googleConfig, projectId, rootFolder, refreshToken) {
    var OAuth2 = _googleapis2.default.auth.OAuth2;
    var oauthClient = new (Function.prototype.bind.apply(OAuth2, [null].concat(_toConsumableArray(googleConfig))))();
    oauthClient.setCredentials({ refresh_token: refreshToken });

    var files = [];

    var recTraverseFolder = function recTraverseFolder(folder) {
      var FOLDER_MIME = 'application/vnd.google-apps.folder';
      var drive = _googleapis2.default.drive({ version: 'v3', auth: oauthClient });
      var options = {
        corpus: 'user',
        fields: 'nextPageToken, files(id, name, mimeType, createdTime)',
        q: '\'' + folder + '\' in parents'
      };

      return _bluebird2.default.promisify(drive.files.list)(options).then(function (response) {
        var children = [];
        response.files.forEach(function (file) {
          if (file.mimeType === FOLDER_MIME) children.push(recTraverseFolder(file.id));
        });
        return _bluebird2.default.all(children.map(function (promise) {
          return promise.reflect();
        })).then(function () {
          files = files.concat(response.files);
        });
      });
    };

    var processFilesIntoDB = function processFilesIntoDB() {
      files.forEach(function (file) {
        var fileWrapper = {
          activity: storage.log.drive_log.activityCode.CREATE,
          fileUUID: file.id,
          fileName: file.name,
          fileMIME: file.mimeType,
          date: file.createdTime,
          googleId: file.owners[0],
          projectId: projectId
        };
        storage.log.drive_log.createLog(fileWrapper);
      });
    };

    var response = function response() {
      return { success: true };
    };

    var errorHandler = function errorHandler(err) {
      console.error(err);
      return { success: false, message: err };
    };

    return recTraverseFolder(rootFolder).then(processFilesIntoDB).then(response).catch(errorHandler);
  }

  return {
    pullRevisions: pullRevisions,
    pullDrive: pullDrive
  };
};

var _googleapis = require('googleapis');

var _googleapis2 = _interopRequireDefault(_googleapis);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

module.exports = exports['default'];