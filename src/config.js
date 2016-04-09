const _ = require('lodash');

/* DB Storage */
let dbConfig = {};

/**
 * Set the database configuration information for internal usage.
 * @param {object} config (dbName, dbUsername, dbPassword, dbConfig)
 */
export function setConfig(config) {
  if (!_.isEmpty(config)) dbConfig = config;
}

/**
 * Returns the configuration currently stored in the config file.
 * @return {object} (dbName, dbUsername, dbPassword, dbConfig)
 */
export function getConfig() {
  return dbConfig;
}
