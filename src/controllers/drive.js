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
   * Pulls file changes from Google Drive API and store into logging database.
   * @pre   Files must be pulled first before running this function as it is dependent.
   * @param {object} googleConfig   contains client_id, client_secret, redirect_URL
   * @param {string} projectId      id of the project related to the folder
   * @param {string} refreshToken   refresh token for accessing drive
   */
  function pullChanges(googleConfig, projectId, refreshToken) {
    const OAuth2 = google.auth.OAuth2;
    const oauthClient = new OAuth2(googleConfig.client_id, googleConfig.client_secret);
    oauthClient.setCredentials({ refresh_token: refreshToken });

    const payload = {};

    // Pull file revisions and process them as changes
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

    const processChanges = () => {
      const processFile = (fileIndex) => {
        const fileId = payload.files[fileIndex].fileUUID;
        const name = payload.files[fileIndex].fileName;
        const mime = payload.files[fileIndex].fileMIME;
        const insertion = [];
        if (payload.revisions[fileIndex]) {
          const kind = payload.revisions[fileIndex].kind;
          const revisions = payload.revisions[fileIndex].revisions;

          if (kind === 'drive#revisionList' && revisions.length > 0) {
            revisions.forEach((revision) => {
              const changeWrapper = {
                activity: constants.FILE_MODIFIED,
                fileUUID: fileId,
                fileName: name,
                fileMIME: mime,
                date: revision.modifiedTime,
                email: revision.lastModifyingUser.emailAddress,
                projectId
              };
              insertion.push(storage.log.file_log.createLog(changeWrapper));
            });
          }
        }
        return Promise.all(insertion);
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

    return storage.log.file_log.getFiles(null, projectId)
      .then(retrieveRevisions)
      .then(processChanges)
      .then(response)
      .catch(errorHandler);
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
        insertions.push(storage.log.file_log.createLog(fileWrapper));
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
   * Logs the given file related to a project to the logging database.
   * @param {string} activity   activity representation defined by constants
   * @param {string} date       date of the activity
   * @param {string} email      email of activity creator
   * @param {string} projectId  project id that the file is linked to
   * @param {object} file       object that contains file metadata
   */
  function logFileActivity(activity, date, email, projectId, file) {
    const fetchProjectIdentifier = () => {
      if (projectId === null) {
        return storage.log.file_log.getFile(file.id)
          .then((instance) => {
            projectId = instance.projectId;
            return Promise.resolve();
          });
      }
      return Promise.resolve();
    };

    const preparePayload = () => {
      return {
        activity,
        fileUUID: file.id,
        fileName: file.name,
        fileMIME: file.mimeType,
        fileExtension: file.fileExtension,
        date,
        email,
        projectId
      };
    };

    const response = () => {
      return { success: true };
    };

    const errorHandler = (error) => {
      console.error(error);
      return { success: false, message: error };
    };

    return fetchProjectIdentifier()
      .then(preparePayload)
      .then(storage.log.file_log.upsertLog)
      .then(response)
      .catch(errorHandler);
  }

  return {
    pullChanges,
    pullFiles,
    logFileActivity,
    constants
  };
}
