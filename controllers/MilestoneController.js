import {MilestoneLog} from '../models'

/**
 * Stores the datestamp of the user creating a new milestone in the project.
 * @param  {object} milestoneData (datestamp, projectID, userID, milestoneID)
 * @return {object}               boolean status and error messsage if any
 */
export function logNewMilestone(milestoneData) {
  return MilestoneLog.create({
    activity: 0,
    date: milestoneData.datestamp,
    user_id: milestoneData.userID,
    project_id: milestoneData.projectID,
    milestone_id: milestoneData.milestoneID
  }).then(function(revision, error) {
    if(error) return {status: false, message: error}
    else return {status: true, message: revision}
  })
}

/**
 * Stores the datestamp of the user closing a milestone in the project.
 * @param  {object} milestoneData (datestamp, projectID, userID, milestoneID)
 * @return {object}               boolean status and error message if any
 */
export function logCloseMilestone(milestoneData) {
  return MilestoneLog.create({
    activity: 1,
    date: milestoneData.datestamp,
    user_id: milestoneData.userID,
    project_id: milestoneData.projectID,
    milestone_id: milestoneData.milestoneID
  }).then(function(revision, error) {
    if(error) return {status: false, message: error}
    else return {status: true, message: revision}
  })
}
