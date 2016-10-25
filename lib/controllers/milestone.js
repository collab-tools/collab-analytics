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
    ACTIVITY_DELETE: 'X',
    ACTIVITY_TASK_ASSIGNED: 'A'
  };

  /**
   * Stores the datestamp of the user creating a new milestone in the project.
   * @param  {string} activity  activity representation defined by constants
   * @param  {string} date      date of the activity
   * @param  {string} userId    id of user performing activity
   * @param  {object} milestone (..projectId, id)
   * @return {object}           boolean status and error message if any
   */
  function logMilestoneActivity(activity, date, userId, milestone) {
    var payloadFilter = {
      activity: activity,
      date: date,
      userId: userId,
      projectId: milestone.projectId,
      milestoneId: milestone.id
    };

    var response = function response(log) {
      if (!log) return { success: false, message: 'Error creating with the data given.' };
      return { success: true };
    };

    var errorHandler = function errorHandler(error) {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.milestone_log.createLog(payloadFilter).then(response).catch(errorHandler);
  }

  return {
    logMilestoneActivity: logMilestoneActivity,
    constants: constants
  };
};

module.exports = exports['default'];