/* DB Storage */
var dbConfig = {};

/**
 * Set the database configuration information for internal usage.
 * @param {object} dbConfig (dbName, dbUsername, dbPassword, dbConfig)
 */
export function setConfig(dbConfig) {
  if(!_.isEmpty(dbConfig)) this.dbConfig = dbConfig;
}

/**
 * Returns the configuration currently stored in the config file.
 * @return {object} (dbName, dbUsername, dbPassword, dbConfig)
 */
export function getConfig() {
  return dbConfig;
}
