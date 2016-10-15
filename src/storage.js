/* eslint-disable import/no-unresolved */
import dbAppFactory from 'collab-db-application';
import dbLogFactory from 'collab-db-logging';
/* eslint-enable import/no-unresolved */

let storageInstance = null;

export default class storageHelper {
  constructor(dbConfig) {
    if (!storageInstance) {
      storageInstance = {
        app: dbAppFactory(dbConfig.dbApp),
        log: dbLogFactory(dbConfig.dbLog)
      };
    }
    return storageInstance;
  }
}
