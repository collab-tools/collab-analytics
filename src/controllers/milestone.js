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
   * @param  {object} milestoneData (datestamp, projectID, userID, milestoneID)
   * @return {object}               boolean status and error message if any
   */
  function logMilestoneActivity(milestoneData) {
    const payloadFilter = {
      activity: milestoneData.activity,
      date: milestoneData.date,
      userId: milestoneData.userId,
      projectId: milestoneData.projectId,
      milestoneId: milestoneData.milestoneId
    };

    const response = (log) => {
      if (!log) return { success: false, message: 'Error creating with the data given.' };
      return { success: true };
    };

    return storage.log.milestone_log.createLog(payloadFilter).then(response);
  }

  return {
    logMilestoneActivity,
    constants
  };
}
