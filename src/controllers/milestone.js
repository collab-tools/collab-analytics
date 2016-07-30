'use strict';

const models = require('../model-manager');

export const ACTIVITY_CREATE = 'C';
export const ACTIVITY_DONE = 'D';

/**
 * Stores the datestamp of the user creating a new milestone in the project.
 * @param  {object} milestoneData (datestamp, projectID, userID, milestoneID)
 * @return {object}               boolean status and error message if any
 */
export function logMilestoneActivity(milestoneData) {
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

  return models['milestone-log'].createLog(payloadFilter).then(response);
}
