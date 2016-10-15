import google from 'googleapis';
import Promise from 'bluebird';

export default function (storage) {
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
    const oauthClient = new OAuth2(...googleConfig);
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
            fileId: payload.files[start].id,
            fields: 'kind, revisions'
          };
          return Promise.promisify(drive.revisions.list)(options)
            .then((revs) => {
              payload.revisions = payload.revisions.concat(revs);
            }, () => {})
            .then(() => start += 1)
            .then(again);
        }
      });
    };

    const processFilesIntoDB = () => {
      const processFile = (fileIndex) => {
        const fileId = payload.files[fileIndex].id;
        const name = payload.files[fileIndex].name;
        const mime = payload.files[fileIndex].mimeType;
        const revisions = payload.revisions[fileIndex];
        if (revisions && revisions.length > 0) {
          revisions.forEach((revision) => {
            const revisionWrapper = {
              fileUUID: fileId,
              fileName: name,
              fileMIME: mime,
              date: revision.modifiedTime,
              googleId: revision.lastModifyingUser.permissionId,
              projectId
            };
            storage.log.revision_log.createLog(revisionWrapper);
          });
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

    const errorHandler = (err) => {
      console.error(err);
      return { success: false, message: err };
    };

    return storage.log.revision_log.getUniqueFiles(projectId)
      .then(retrieveRevisions)
      .then(processFilesIntoDB)
      .then(response)
      .catch(errorHandler);
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
    const OAuth2 = google.auth.OAuth2;
    const oauthClient = new OAuth2(...googleConfig);
    oauthClient.setCredentials({ refresh_token: refreshToken });

    let files = [];

    const recTraverseFolder = (folder) => {
      const FOLDER_MIME = 'application/vnd.google-apps.folder';
      const drive = google.drive({ version: 'v3', auth: oauthClient });
      const options = {
        corpus: 'user',
        fields: 'nextPageToken, files(id, name, mimeType, createdTime)',
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
      files.forEach((file) => {
        const fileWrapper = {
          activity: storage.log.drive_log.activityCode.CREATE,
          fileUUID: file.id,
          fileName: file.name,
          fileMIME: file.mimeType,
          date: file.createdTime,
          googleId: file.owners[0],
          projectId
        };
        storage.log.drive_log.createLog(fileWrapper);
      });
    };

    const response = () => {
      return { success: true };
    };

    const errorHandler = (err) => {
      console.error(err);
      return { success: false, message: err };
    };

    return recTraverseFolder(rootFolder)
      .then(processFilesIntoDB)
      .then(response)
      .catch(errorHandler);
  }

  return {
    pullRevisions,
    pullDrive
  };
}
