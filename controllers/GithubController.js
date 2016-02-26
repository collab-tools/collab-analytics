/**
 * Pulls commit entries from GitHub and update local logging
 * database as per requirement.
 * @param  {String} repoUUID UUID of the GitHub repo
 * @return {object}          boolean status and error message if any
 */
export function pullCommits(repoUUID) {

}

/**
 * Pulls issues activities from GitHub and update local logging
 * database as per requirement.
 * @param  {String} repoUUID UUID of the GitHub repo
 * @return {object}          boolean status and error message if any
 */
export function pullIssues(repoUUID) {

}

/**
 * Store the new commit information into logging database.
 * @param  {object} commitData (changes, date, userID, projectID)
 * @return {object}            boolean status and error message if any
 */
export function logNewCommit(commitData) {

}

/**
 * Logs the user who opened a new issue and the date he/she opened.
 * @param  {object} issueData (date, userID, projectID)
 * @return {object}           boolean status and error message if any
 */
export function logNewIssue(issueData) {

}

/**
 * Logs the user who closed a new issue and the date he/she opened.
 * @param  {object} issueData (date, userID, projectID)
 * @return {object}           bollean status and error message if any
 */
export function logCloseIssue(issueData) {

}