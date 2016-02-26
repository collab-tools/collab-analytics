import {DriveLog} from '../models'

/**
 * Stores the revision history into the logging database
 * @param  {object} reviseData (fileName, date, userID, projectID)
 * @return {object}            boolean status and error message if any
 */
export function logRevision(reviseData) {
  return DriveLog.create({
    file_name: reviseData.fileName,
    date: reviseData.date,
    user_id: reviseData.userID,
    project_id: reviseData.projectID
  }).then(function(revision, error) {
    if(error) return {status: false, message: error}
    else return {status: true, message: revision}
  })
}

/**
 * Pulls revision histories from Google Drive API and store
 * into logging database.
 * @param {object} driveUUID The identifier of the drive to pull from
 * @return {object}          boolean status and error message if any
 */
export function pullRevisions(driveUUID) {

}
