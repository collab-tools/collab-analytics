'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (storage) {
  // Identifier constants to mark different activities
  var constants = {
    FILE_CREATED: 'C',
    FILE_DELETED: 'D',
    FILE_MODIFIED: 'U'
  };

  /**
   * Pulls file changes from Google Drive API and store into logging database.
   * @pre   Files must be pulled first before running this function as it is dependent.
   * @param {object} googleConfig   contains client_id, client_secret, redirect_URL
   * @param {string} projectId      id of the project related to the folder
   * @param {string} refreshToken   refresh token for accessing drive
   */
  function pullChanges(googleConfig, projectId, refreshToken) {
    var OAuth2 = _googleapis2.default.auth.OAuth2;
    var oauthClient = new OAuth2(googleConfig.client_id, googleConfig.client_secret);
    oauthClient.setCredentials({ refresh_token: refreshToken });

    var payload = {};

    // Pull file revisions and process them as changes
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
            fileId: payload.files[start].fileUUID,
            fields: 'kind, revisions'
          };
          return _bluebird2.default.promisify(drive.revisions.list)(options).then(function (revs) {
            payload.revisions = payload.revisions.concat(revs);
          }, function () {}).then(function () {
            start += 1;
          }).then(again);
        }
      });
    };

    var processChanges = function processChanges() {
      var processFile = function processFile(fileIndex) {
        var fileId = payload.files[fileIndex].fileUUID;
        var name = payload.files[fileIndex].fileName;
        var mime = payload.files[fileIndex].fileMIME;
        var insertion = [];
        if (payload.revisions[fileIndex]) {
          var kind = payload.revisions[fileIndex].kind;
          var revisions = payload.revisions[fileIndex].revisions;

          if (kind === 'drive#revisionList' && revisions.length > 0) {
            revisions.forEach(function (revision) {
              var changeWrapper = {
                activity: constants.FILE_MODIFIED,
                fileUUID: fileId,
                fileName: name,
                fileMIME: mime,
                date: revision.modifiedTime,
                email: revision.lastModifyingUser.emailAddress,
                projectId: projectId
              };
              insertion.push(storage.log.file_log.createLog(changeWrapper));
            });
          }
        }
        return _bluebird2.default.all(insertion);
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

    var errorHandler = function errorHandler(error) {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.file_log.getFiles(projectId).then(retrieveRevisions).then(processChanges).then(response).catch(errorHandler);
  }

  /**
   * Pulls files creation and deletion logs from Google Drive API
   * and store into logging database.
   * @param {string} googleConfig   contains client_id, client_secret, redirect_URL
   * @param {string} projectId      id of the project related to the folder
   * @param {string} rootFolder     folder id that serves as the root
   * @param {string} refreshToken   refresh token for accessing drive
   */
  function pullFiles(googleConfig, projectId, rootFolder, refreshToken) {
    var OAuth2 = _googleapis2.default.auth.OAuth2;
    var oauthClient = new OAuth2(googleConfig.client_id, googleConfig.client_secret);
    oauthClient.setCredentials({ refresh_token: refreshToken });
    var files = [];

    var recTraverseFolder = function recTraverseFolder(folder) {
      var FOLDER_MIME = 'application/vnd.google-apps.folder';
      var drive = _googleapis2.default.drive({ version: 'v3', auth: oauthClient });
      var options = {
        corpus: 'user',
        fields: 'nextPageToken, files(id, name, mimeType, createdTime, owners)',
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
      var insertions = [];
      files.forEach(function (file) {
        var fileWrapper = {
          activity: constants.FILE_CREATED,
          fileUUID: file.id,
          fileName: file.name,
          fileMIME: file.mimeType,
          date: file.createdTime,
          email: file.owners[0].emailAddress,
          projectId: projectId
        };
        insertions.push(storage.log.file_log.createLog(fileWrapper));
      });

      return _bluebird2.default.all(insertions);
    };

    var response = function response() {
      return { success: true };
    };

    var errorHandler = function errorHandler(error) {
      console.error(error);
      return { success: false, message: error };
    };

    return recTraverseFolder(rootFolder).then(processFilesIntoDB).then(response).catch(errorHandler);
  }

  /**
   * Logs the given file related to a project to the logging database.
   * @param {string} activity   activity representation defined by constants
   * @param {string} date       date of the activity
   * @param {string} email      email of activity creator
   * @param {string} projectId  project id that the file is linked to
   * @param {object} file       object that contains file metadata
   */
  function logFileActivity(activity, date, email, projectId, file) {
    var fetchProjectIdentifier = function fetchProjectIdentifier() {
      if (projectId === null) {
        return storage.log.file_log.getFile(file.id).then(function (instance) {
          projectId = instance.projectId;
          return _bluebird2.default.resolve();
        });
      }
      return _bluebird2.default.resolve();
    };

    var preparePayload = function preparePayload() {
      return {
        activity: activity,
        fileUUID: file.id,
        fileName: file.name,
        fileMIME: file.mimeType,
        fileExtension: file.fileExtension,
        date: date,
        email: email,
        projectId: projectId
      };
    };

    var response = function response() {
      return { success: true };
    };

    var errorHandler = function errorHandler(error) {
      console.error(error);
      return { success: false, message: error };
    };

    return fetchProjectIdentifier().then(preparePayload).then(storage.log.file_log.upsertLog).then(response).catch(errorHandler);
  }

  return {
    pullChanges: pullChanges,
    pullFiles: pullFiles,
    logFileActivity: logFileActivity,
    constants: constants
  };
};

var _googleapis = require('googleapis');

var _googleapis2 = _interopRequireDefault(_googleapis);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];