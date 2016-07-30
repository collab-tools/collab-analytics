'use strict';

import logging from 'collab-db-logging';
import app from 'collab-db-application';

let loggingInstance = null;
let appInstance = null;

export default {
  initLogging: (dbConfig) => {
    loggingInstance = logging(dbConfig);
  },
  initApp: (dbConfig) => {
    appInstance = app(dbConfig);
  },
  logging: loggingInstance,
  app: appInstance
};
