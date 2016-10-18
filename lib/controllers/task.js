'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (storage) {
  // Identifier constants to mark different activities
  var constants = {
    ACTIVITY_CREATE: 'C',
    ACTIVITY_DONE: 'D',
    ACTIVITY_UPDATE: 'U',
    ACTIVITY_ASSIGN: 'A',
    ACTIVITY_DELETE: 'X'
  };

  /**
   * Logs the datestamp of a status change made by a user to a task in a project.
   * @param  {string} activity  activity representation defined by constants
   * @param  {string} date      date of the activity
   * @param  {string} userId    id of user performing activity
   * @param  {object} task      (..milestoneId, projectId, id)
   * @return {object}           boolean status and error message if any
   */
  function logTaskActivity(activity, date, userId, task) {
    var payloadFilter = {
      activity: activity,
      date: date,
      userId: userId,
      milestoneId: task.milestoneId,
      projectId: task.projectId,
      taskId: task.id
    };

    var response = function response(log) {
      if (!log) return { success: false, message: 'Error creating with the data given.' };
      return { success: true };
    };

    var errorHandler = function errorHandler(error) {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.task_log.createLog(payloadFilter).then(response).catch(errorHandler);
  }

  return {
    logTaskActivity: logTaskActivity,
    constants: constants
  };
};

module.exports = exports['default'];