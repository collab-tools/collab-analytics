import Storage from './storage';
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
  const storage = new Storage({ dbApp, dbLog });
  return {
    drive: drive(storage),
    github: github(storage),
    milestone: milestone(storage),
    task: task(storage)
  };
}
