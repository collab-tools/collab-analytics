import * as config from './config.js';
import * as controllers from './controllers';

/**
 * Library initialization that requires sequelize mySQL information
 * and entry point for external references.
 * @param  {object} dbConfig (dbName, dbUsername, dbPassword, dbConfig)
 * @return {object}          object containing logging interfaces
 */
export default function (dbConfig) {
  config.setConfig(dbConfig);
  return controllers;
}
