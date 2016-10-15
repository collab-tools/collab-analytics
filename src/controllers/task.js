export default function (storage) {
  // Identifier constants to mark different activities
  const constants = {
    ACTIVITY_CREATE: 'C',
    ACTIVITY_DONE: 'D',
    ACTIVITY_UPDATE: 'U',
    ACTIVITY_ASSIGN: 'A',
    ACTIVITY_DELETE: 'X'
  };

  /**
   * Logs the datestamp of a status change made by a user to a task in a project.
   * @param  {object} taskData (activity [C|D|U|A], datestamp, projectID, userID, taskID)
   * @return {object}          boolean status and error message if any
   */
  function logTaskActivity(taskData) {
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

    return storage.log.task_log.createLog(payloadFilter).then(response);
  }

  return {
    logTaskActivity,
    constants
  };
}
