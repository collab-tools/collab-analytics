/**
 * Library initialization that requires sequelize mySQL information
 * and entry point for external references.
 * @param  {object} dbConfig (dbName, dbUsername, dbPassword, dbConfig)
 * @return {object}          object containing logging controllers
 */
export default function (dbConfig) {
  /* eslint-disable global-require */
  require('./model-manager')(dbConfig);
  return {
    drive: require('./controllers/drive'),
    github: require('./controllers/github'),
    milestone: require('./controllers/milestone'),
    task: require('./controllers/task')
  };
  /* eslint-enable global-require */
}
