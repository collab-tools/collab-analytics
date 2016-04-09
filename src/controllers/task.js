'use strict';

const models = require('../models');

export const ACTIVITY_CREATE = 'C';
export const ACTIVITY_DONE = 'D';

/**
 * Logs the datestamp of a status change made by a user to a task in a project.
 * @param  {object} taskData (activity [C|D], datestamp, projectID, userID, taskID)
 * @return {object}          boolean status and error message if any
 */
export function logTaskActivity(taskData) {
  const payloadFilter = {
    activity: taskData.activity,
    date: taskData.date,
    userId: taskData.userID,
    projectId: taskData.projectID,
    taskId: taskData.taskID
  };

  const response = (log) => {
    if (!log) return { success: false, message: 'Error creating with the data given.' };
    return { success: true };
  };

  return models['task-log'].createLog(payloadFilter).then(response);
}
