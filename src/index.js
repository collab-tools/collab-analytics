import manager from './model-manager';
import drive from './controllers/drive';
import github from './controllers/github';
import milestone from './controllers/milestone';
import task from './controllers/task';
/**
 * Library initialization that requires sequelize mySQL information
 * and entry point for external references.
 * @param  {object} dbApp    object containing app database information
 * @param  {object} dbLog    object containing logging database information
 * @return {object}          object containing logging controllers
 */
export default function (dbApp, dbLog) {
  manager.initApp(dbApp);
  manager.initLogging(dbLog);
  return { drive, github, milestone, task };
}
