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
   * Pulls revision histories from Google Drive API and store
   * into logging database.
   * @pre   Files must be pulled first before running this function as it is dependent.
   * @param {object} googleConfig contains client_id, client_secret, redirect_URL
   * @param {String} projectId
   * @param {String} refreshToken
   */
  function pullRevisions(googleConfig, projectId, refreshToken) {
    var OAuth2 = _googleapis2.default.auth.OAuth2;
    var oauthClient = new OAuth2(googleConfig.client_id, googleConfig.client_secret);
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

    var processFilesIntoDB = function processFilesIntoDB() {
      var processFile = function processFile(fileIndex) {
        var fileId = payload.files[fileIndex].fileUUID;
        var name = payload.files[fileIndex].fileName;
        var mime = payload.files[fileIndex].fileMIME;

        if (payload.revisions[fileIndex]) {
          var kind = payload.revisions[fileIndex].kind;
          var revisions = payload.revisions[fileIndex].revisions;
          if (kind === 'drive#revisionList' && revisions.length > 0) {
            revisions.forEach(function (revision) {
              var revisionWrapper = {
                fileUUID: fileId,
                fileName: name,
                fileMIME: mime,
                revisionUUID: revision.id,
                date: revision.modifiedTime,
                email: revision.lastModifyingUser.emailAddress,
                projectId: projectId
              };
              storage.log.revision_log.createLog(revisionWrapper);
            });
          }
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

    var errorHandler = function errorHandler(error) {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.drive_log.getUniqueFiles(projectId).then(retrieveRevisions).then(processFilesIntoDB).then(response).catch(errorHandler);
  }

  /**
   * Pulls files creation and deletion logs from Google Drive API
   * and store into logging database.
   * @param {String} googleConfig contains client_id, client_secret, redirect_URL
   * @param {String} projectId
   * @param {String} rootFolder
   * @param {String} refreshToken
   */
  function pullDrive(googleConfig, projectId, rootFolder, refreshToken) {
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
        insertions.push(storage.log.drive_log.createLog(fileWrapper));
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
   * Logs the given revision related to a file to the logging database
   * @param fileUUID  {string} file id that the revision is linked to
   * @param projectId {string} project id that the revision is linked to
   * @param revision  {object} revision resource (refer to GAPIS)
   */
  function logRevision(fileUUID, projectId, revision) {
    var filteredRevision = {
      fileUUID: fileUUID,
      fileName: revision.originalFilename,
      fileMIME: revision.mimeType,
      revisionUUID: revision.id,
      date: revision.modifiedTime,
      email: revision.lastModifyingUser.emailAddress,
      projectId: projectId
    };

    var response = function response() {
      return { success: true };
    };

    var errorHandler = function errorHandler(error) {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.revision_log.createLog(filteredRevision).then(response).catch(errorHandler);
  }

  /**
   * Logs the given file related to a project to the logging database.
   * @param  {string} activity  activity representation defined by constants
   * @param projectId {string} project id that the file is linked to
   * @param file     {object} file resource (refer to GAPIS)
   */
  function logDrive(activity, projectId, file) {
    var filteredDrive = {
      activity: activity,
      fileUUID: file.id,
      fileName: file.name,
      fileMIME: file.mimeType,
      fileExtension: file.fileExtension,
      date: file.createdTime,
      email: file.owners[0].emailAddress,
      projectId: projectId
    };

    var response = function response() {
      return { success: true };
    };

    var errorHandler = function errorHandler(error) {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.drive_log.upsertLog(filteredDrive).then(response).catch(errorHandler);
  }

  return {
    pullRevisions: pullRevisions,
    pullDrive: pullDrive,
    logRevision: logRevision,
    logDrive: logDrive,
    constants: constants
  };
};

var _googleapis = require('googleapis');

var _googleapis2 = _interopRequireDefault(_googleapis);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];