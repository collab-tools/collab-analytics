export default function (storage) {
  // Identifier constants to mark different activities
  const constants = {
    ACTIVITY_CREATE: 'C',
    ACTIVITY_DONE: 'D',
    ACTIVITY_UPDATE: 'U',
    ACTIVITY_DELETE: 'X'
  };

  /**
   * Stores the datestamp of the user creating a new milestone in the project.
   * @param  {string} activity  activity representation defined by constants
   * @param  {string} date      date of the activity
   * @param  {string} userId    id of user performing activity
   * @param  {object} milestone (..projectId, id)
   * @return {object}           boolean status and error message if any
   */
  function logMilestoneActivity(activity, date, milestone) {
    const payloadFilter = {
      activity,
      date,
      projectId: milestone.projectId,
      milestoneId: milestone.id
    };

    const response = (log) => {
      if (!log) return { success: false, message: 'Error creating with the data given.' };
      return { success: true };
    };

    const errorHandler = (error) => {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.milestone_log.createLog(payloadFilter)
      .then(response)
      .catch(errorHandler);
  }

  return {
    logMilestoneActivity,
    constants
  };
}
