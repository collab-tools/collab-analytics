/* eslint-disable import/no-unresolved */
import logging from 'collab-db-logging';
import app from 'collab-db-application';
/* eslint-enable import/no-unresolved */

let loggingInstance = null;
let appInstance = null;

export default {
  initLogging: (dbConfig) => {
    if (dbConfig !== undefined) {
      loggingInstance = logging(dbConfig);
    }
  },
  initApp: (dbConfig) => {
    if (dbConfig !== undefined) {
      appInstance = app(dbConfig);
    }
  },
  logging: loggingInstance,
  app: appInstance
};
