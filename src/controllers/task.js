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
   * @param  {string} activity  activity representation defined by constants
   * @param  {string} date      date of the activity
   * @param  {string} userId    id of user performing activity
   * @param  {object} task      (..milestoneId, projectId, id)
   * @return {object}           boolean status and error message if any
   */
  function logTaskActivity(activity, date, userId, task) {
    const payloadFilter = {
      activity,
      date,
      userId,
      milestoneId: task.milestoneId,
      projectId: task.projectId,
      taskId: task.id
    };

    const response = (log) => {
      if (!log) return { success: false, message: 'Error creating with the data given.' };
      return { success: true };
    };

    const errorHandler = (error) => {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.task_log.createLog(payloadFilter)
      .then(response)
      .catch(errorHandler);
  }

  return {
    logTaskActivity,
    constants
  };
}
