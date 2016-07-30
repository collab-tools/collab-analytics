'use strict';

const octoGenerator = require('octokat');
const models = require('../model-manager');

/**
 * Pulls commit entries from GitHub and update local logging
 * database as per requirement.
 * @param  {String} projectId   the id of the project linked to the repo
 * @param  {String} repoOwner   owner handle of the GitHub repo
 * @param  {String} repoName    name of the GitHub repo
 * @param  {String} accessToken (optional) used to access private repo
 * @return {object}             boolean status and error message if any
 */
export function pullCommits(projectId, repoOwner, repoName, accessToken) {
  // Access GitHub with user's token and retrieve relevant statistics
  // Setup GitHub wrapper to retrieve information from GitHub
  const octoConfig = { accessToken };
  const octo = octoGenerator(octoConfig);
  const repo = octo.repos(repoOwner, repoName);

  const logCommits = (commits) => {
    console.log(commits);
    commits.forEach((commit) => {
      const payload = {
        message: commit.commit.message,
        sha: commit.sha,
        date: commit.commit.committer.date,
        additions: commit.stats.additions,
        deletions: commit.stats.deletions,
        githubLogin: commit.committer.login,
        projectId
      };
      return models['commit-log'].createLog(payload);
    });
  };

  const response = () => {
    return { success: true };
  };

  const catchError = (error) => {
    console.error(error);
    return { success: false, error };
  };

  return repo.commits.fetch()
      .then(logCommits)
      .then(response)
      .catch(catchError);
}


/**
 * Pulls commit entries from GitHub and update local logging
 * database as per requirement.
 * @param  {String} projectId   the id of the project linked to the repo
 * @param  {String} repoOwner   owner handle of the GitHub repo
 * @param  {String} repoName    name of the GitHub repo
 * @param  {String} accessToken (optional) used to access private repo
 * @return {object}             boolean status and error message if any
 */
export function pullReleases(projectId, repoOwner, repoName, accessToken) {
  // Access GitHub with user's token and retrieve relevant statistics
  // Setup GitHub wrapper to retrieve information from GitHub
  const octoConfig = { accessToken };
  const octo = octoGenerator(octoConfig);
  const repo = octo.repos(repoOwner, repoName);

  const logReleases = (releases) => {
    console.log(releases);
    releases.forEach((release) => {
      const payload = {
        date: release.published_at,
        assets: release.assets,
        tagName: release.tag_name,
        body: release.body,
        projectId
      };
      return models['release-log'].createLog(payload);
    });
  };

  const catchError = (error) => {
    console.error(error);
    return { success: false, error };
  };

  return repo.releases.fetch()
      .then(logReleases)
      .catch(catchError);
}

/**
 * Logs the given commit related to a project/repo to the logging database.
 * @param projectId {String} project id that the commit is linked to
 * @param commit    {object} github commit object or same format
 */
export function logCommit(projectId, commit) {
  const filteredCommit = {
    message: commit.commit.message,
    sha: commit.sha,
    date: commit.commit.committer.date,
    additions: commit.stats.additions,
    deletions: commit.stats.deletions,
    githubLogin: commit.committer.login,
    projectId
  };

  const response = () => {
    return { success: true };
  };

  const catchError = (error) => {
    console.error(error);
    return { success: false, error };
  };

  return models['commit-log'].createLog(filteredCommit)
      .then(response)
      .then(catchError);
}

/**
 * Logs the given release related to a project/repo to the logging database.
 * @param projectId {String} project id that the release is linked to
 * @param release   {object} github release object or same format
 */
export function logRelease(projectId, release) {
  const filteredCommit = {
    date: release.published_at,
    assets: release.assets,
    tagName: release.tag_name,
    body: release.body,
    projectId
  };

  const response = () => {
    return { success: true };
  };

  const catchError = (error) => {
    console.error(error);
    return { success: false, error };
  };

  return models['release-log'].createLog(filteredCommit)
      .then(response)
      .then(catchError);
}
