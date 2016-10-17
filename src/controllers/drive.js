import google from 'googleapis';
import Promise from 'bluebird';

export default function (storage) {
  // Identifier constants to mark different activities
  const constants = {
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
    const OAuth2 = google.auth.OAuth2;
    const oauthClient = new OAuth2(googleConfig.client_id, googleConfig.client_secret);
    oauthClient.setCredentials({ refresh_token: refreshToken });

    const payload = {};

    const retrieveRevisions = (files) => {
      payload.files = files;
      payload.revisions = [];
      const drive = google.drive({ version: 'v3', auth: oauthClient });

      const Continue = {};
      const again = () => Continue;
      /* eslint-disable no-mixed-operators */
      const repeat = fn => Promise.try(fn, again)
        .then(val => val === Continue && repeat(fn) || val);
      /* eslint-enable */
      let start = 0;
      const stop = payload.files.length;
      /* eslint-disable no-shadow, consistent-return */
      return repeat((again) => {
        /* eslint-enable */
        if (start < stop) {
          const options = {
            fileId: payload.files[start].fileUUID,
            fields: 'kind, revisions'
          };
          return Promise.promisify(drive.revisions.list)(options)
            .then((revs) => {
              payload.revisions = payload.revisions.concat(revs);
            }, () => {})
            .then(() => { start += 1; })
            .then(again);
        }
      });
    };

    const processFilesIntoDB = () => {
      const processFile = (fileIndex) => {
        const fileId = payload.files[fileIndex].fileUUID;
        const name = payload.files[fileIndex].fileName;
        const mime = payload.files[fileIndex].fileMIME;

        if (payload.revisions[fileIndex]) {
          const kind = payload.revisions[fileIndex].kind;
          const revisions = payload.revisions[fileIndex].revisions;
          if (kind === 'drive#revisionList' && revisions.length > 0) {
            revisions.forEach((revision) => {
              const revisionWrapper = {
                fileUUID: fileId,
                fileName: name,
                fileMIME: mime,
                revisionUUID: revision.id,
                date: revision.modifiedTime,
                email: revision.lastModifyingUser.emailAddress,
                projectId
              };
              storage.log.revision_log.createLog(revisionWrapper);
            });
          }
        }
      };

      const dbPromises = [];

      for (let fileIndex = 0; fileIndex < payload.files.length; fileIndex += 1) {
        dbPromises.push(processFile(fileIndex));
      }

      return Promise.all(dbPromises);
    };

    const response = () => {
      return { success: true };
    };

    const errorHandler = (error) => {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.drive_log.getUniqueFiles(projectId)
      .then(retrieveRevisions)
      .then(processFilesIntoDB)
      .then(response)
      .catch(errorHandler);
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
    const OAuth2 = google.auth.OAuth2;
    const oauthClient = new OAuth2(googleConfig.client_id, googleConfig.client_secret);
    oauthClient.setCredentials({ refresh_token: refreshToken });
    let files = [];

    const recTraverseFolder = (folder) => {
      const FOLDER_MIME = 'application/vnd.google-apps.folder';
      const drive = google.drive({ version: 'v3', auth: oauthClient });
      const options = {
        corpus: 'user',
        fields: 'nextPageToken, files(id, name, mimeType, createdTime, owners)',
        q: `'${folder}' in parents`
      };
      return Promise.promisify(drive.files.list)(options)
        .then((response) => {
          const children = [];
          response.files.forEach((file) => {
            if (file.mimeType === FOLDER_MIME) children.push(recTraverseFolder(file.id));
          });
          return Promise
            .all(children.map((promise) => {
              return promise.reflect();
            }))
            .then(() => {
              files = files.concat(response.files);
            });
        });
    };

    const processFilesIntoDB = () => {
      const insertions = [];
      files.forEach((file) => {
        const fileWrapper = {
          activity: constants.FILE_CREATED,
          fileUUID: file.id,
          fileName: file.name,
          fileMIME: file.mimeType,
          date: file.createdTime,
          email: file.owners[0].emailAddress,
          projectId
        };
        insertions.push(storage.log.drive_log.createLog(fileWrapper));
      });

      return Promise.all(insertions);
    };

    const response = () => {
      return { success: true };
    };

    const errorHandler = (error) => {
      console.error(error);
      return { success: false, message: error };
    };

    return recTraverseFolder(rootFolder)
      .then(processFilesIntoDB)
      .then(response)
      .catch(errorHandler);
  }

  /**
   * Logs the given revision related to a file to the logging database
   * @param fileUUID  {string} file id that the revision is linked to
   * @param projectId {string} project id that the revision is linked to
   * @param revision  {object} revision resource (refer to GAPIS)
   */
  function logRevision(fileUUID, projectId, revision) {
    const filteredRevision = {
      fileUUID,
      fileName: revision.originalFilename,
      fileMIME: revision.mimeType,
      revisionUUID: revision.id,
      date: revision.modifiedTime,
      email: revision.lastModifyingUser.emailAddress,
      projectId,
    };

    const response = () => {
      return { success: true };
    };

    const errorHandler = (error) => {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.revision_log.createLog(filteredRevision)
      .then(response)
      .catch(errorHandler);
  }

  /**
   * Logs the given file related to a project to the logging database.
   * @param  {string} activity  activity representation defined by constants
   * @param projectId {string} project id that the file is linked to
   * @param file     {object} file resource (refer to GAPIS)
   */
  function logDrive(activity, projectId, file) {
    const filteredDrive = {
      activity,
      fileUUID: file.id,
      fileName: file.name,
      fileMIME: file.mimeType,
      fileExtension: file.fileExtension,
      date: file.createdTime,
      email: file.owners[0].emailAddress,
      projectId
    };

    const response = () => {
      return { success: true };
    };

    const errorHandler = (error) => {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.drive_log.upsertLog(filteredDrive)
      .then(response)
      .catch(errorHandler);
  }

  return {
    pullRevisions,
    pullDrive,
    logRevision,
    logDrive,
    constants
  };
}
