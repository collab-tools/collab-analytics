import {TaskLog} from '../models'

/**
 * Logs the datestamp of a status change made by a user to a task in a project.
 * @param  {object} taskData (activity, datestamp, projectID, userID, taskID)
 * @return {object}          boolean status and error messsage if any
 */
export function logTaskActivity(taskData) {
  return TaskLog.create({
    activity: taskData.activity,
    date: taskData.datestamp,
    user_id: taskData.userID,
    project_id: taskData.projectID,
    task_id: taskData.taskID
  }).then(function(revision, error) {
    if(error) return {status: false, message: error}
    else return {status: true, message: revision}
  })
}
