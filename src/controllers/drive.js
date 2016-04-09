'use strict';

const google = require('googleapis');
const models = require('../models');

const FOLDER_MIME = 'application/vnd.google-apps.folder';
/**
 * Pulls revision histories from Google Drive API and store
 * into logging database.
 * @param {object} googleConfig contains client_id, client_secret, redirect_URL
 * @param {String} projectId
 * @param {String} rootFolder
 * @param {String} refreshToken
 */
export function pullRevisions(googleConfig, projectId, rootFolder, refreshToken) {
  const retrieveRevisions = () => {
    const drive = google.drive({ version: 'v3', auth: oauthClient });
    const Continue = {};
    const again = () => Continue;
    const repeat = fn => Promise.try(fn, again)
        .then(val => val === Continue && repeat(fn) || val);

    let start = 0;
    const stop = payload.files.length;
    return repeat(again => {
      if (start < stop) {
        const options = {
          fileId: payload.files[start].id,
          fields: 'kind, revisions'
        };
        return Promise.promisify(drive.revisions.list)(options)
            .then((revisions) => {
              payload.revisions = payload.revisions.concat(revisions);
            }, () => {
            })
            .then(() => ++start)
            .then(again);
      }
    });
  };

}

/**
 * Pulls files creation and deletion logs from Google Drive API
 * and store into logging database.
 * @param {String} projectId
 * @param {String} rootFolder
 * @param {String} refreshToken
 */
export function pullDrive(googleConfig, projectId, rootFolder, refreshToken) {
  const OAuth2 = google.auth.OAuth2;
  const oauthClient = new OAuth2(...googleConfig);
  oauthClient.setCredentials({ refresh_token: refreshToken });

  let files = [];

  const recTraverseFolder = (folder) => {
    const drive = google.drive({ version: 'v3', auth: oauthClient });
    const options = {
      corpus: 'user',
      fields: 'nextPageToken, files(id, name, mimeType, createdTime)',
      q: `'${folder}' in parents`
    };

    return Promise.promisify(drive.files.list)(options)
        .then(response => {
          const children = [];
          response.files.forEach(file => {
            if (file.mimeType === FOLDER_MIME) children.push(recTraverseFolder(file.id));
          });
          return Promise
              .all(children.map(promise => {
                return promise.reflect();
              }))
              .then(() => {
                files = files.concat(response.files);
              });
        });
  };

  const processFilesIntoDB = () => {

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
