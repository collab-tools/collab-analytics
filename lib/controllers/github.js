'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (storage) {
  /**
   * Pulls commit entries from GitHub and update local logging
   * database as per requirement.
   * @param  {String} projectId   the id of the project linked to the repo
   * @param  {String} repoOwner   owner handle of the GitHub repo
   * @param  {String} repoName    name of the GitHub repo
   * @param  {String} accessToken (optional) used to access private repo
   * @return {object}             boolean status and error message if any
   */
  function pullCommits(projectId, repoOwner, repoName, accessToken) {
    // Access GitHub with user's token and retrieve relevant statistics
    // Setup GitHub wrapper to retrieve information from GitHub
    var octoConfig = { accessToken: accessToken };
    var octo = (0, _octokat2.default)(octoConfig);
    var repo = octo.repos(repoOwner, repoName);

    var logCommits = function logCommits(commits) {
      console.log(commits);
      commits.forEach(function (commit) {
        var payload = {
          message: commit.commit.message,
          sha: commit.sha,
          date: commit.commit.committer.date,
          additions: commit.stats.additions,
          deletions: commit.stats.deletions,
          githubLogin: commit.committer.login,
          projectId: projectId
        };
        return storage.log.commit_log.createLog(payload);
      });
    };

    var response = function response() {
      return { success: true };
    };

    var catchError = function catchError(error) {
      console.error(error);
      return { success: false, error: error };
    };

    return repo.commits.fetch().then(logCommits).then(response).catch(catchError);
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
  function pullReleases(projectId, repoOwner, repoName, accessToken) {
    // Access GitHub with user's token and retrieve relevant statistics
    // Setup GitHub wrapper to retrieve information from GitHub
    var octoConfig = { accessToken: accessToken };
    var octo = (0, _octokat2.default)(octoConfig);
    var repo = octo.repos(repoOwner, repoName);

    var logReleases = function logReleases(releases) {
      console.log(releases);
      releases.forEach(function (release) {
        var payload = {
          date: release.published_at,
          assets: release.assets,
          tagName: release.tag_name,
          body: release.body,
          projectId: projectId
        };
        return storage.log.release_log.createLog(payload);
      });
    };

    var catchError = function catchError(error) {
      console.error(error);
      return { success: false, error: error };
    };

    return repo.releases.fetch().then(logReleases).catch(catchError);
  }

  /**
   * Logs the given commit related to a project/repo to the logging database.
   * @param projectId {String} project id that the commit is linked to
   * @param commit    {object} github commit object or same format
   */
  function logCommit(projectId, commit) {
    var filteredCommit = {
      message: commit.commit.message,
      sha: commit.sha,
      date: commit.commit.committer.date,
      additions: commit.stats.additions,
      deletions: commit.stats.deletions,
      githubLogin: commit.committer.login,
      projectId: projectId
    };

    var response = function response() {
      return { success: true };
    };

    var catchError = function catchError(error) {
      console.error(error);
      return { success: false, error: error };
    };

    return storage.log.commit_log.createLog(filteredCommit).then(response).then(catchError);
  }

  /**
   * Logs the given release related to a project/repo to the logging database.
   * @param projectId {String} project id that the release is linked to
   * @param release   {object} github release object or same format
   */
  function logRelease(projectId, release) {
    var filteredCommit = {
      date: release.published_at,
      assets: release.assets,
      tagName: release.tag_name,
      body: release.body,
      projectId: projectId
    };

    var response = function response() {
      return { success: true };
    };

    var catchError = function catchError(error) {
      console.error(error);
      return { success: false, error: error };
    };

    return storage.log.release_log.createLog(filteredCommit).then(response).then(catchError);
  }

  return {
    pullCommits: pullCommits,
    pullReleases: pullReleases,
    logCommit: logCommit,
    logRelease: logRelease
  };
};

var _octokat = require('octokat');

var _octokat2 = _interopRequireDefault(_octokat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];