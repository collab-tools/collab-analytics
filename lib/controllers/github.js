'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (storage) {
  /**
   * Pulls commit entries from GitHub and update local logging
   * database as per requirement.
   * @param  {string} projectId   the id of the project linked to the repo
   * @param  {string} repoOwner   owner handle of the GitHub repo
   * @param  {string} repoName    name of the GitHub repo
   * @param  {string} accessToken (optional) used to access private repo
   * @return {object}             boolean status and error message if any
   */
  function pullCommits(projectId, repoOwner, repoName, accessToken) {
    // Access GitHub with user's token and retrieve relevant statistics
    // Setup GitHub wrapper to retrieve information from GitHub
    _github2.default.authenticate({
      type: 'token',
      token: accessToken
    });
    var logCommits = function logCommits(commits) {
      var insertions = [];
      commits.forEach(function (commit) {
        var payload = {
          message: commit.commit.message.replace(/[\u0250-\ue007]/g, ''),
          sha: commit.sha,
          date: commit.commit.author.date,
          githubLogin: commit.author != null ? commit.author.login : '',
          projectId: projectId
        };
        insertions.push(storage.log.commit_log.createLog(payload));
      });
      return Promise.all(insertions);
    };

    var response = function response() {
      return { success: true };
    };

    var catchError = function catchError(error) {
      console.error(error);
      return { success: false, message: error };
    };

    return _github2.default.repos.getCommits({ owner: repoOwner, repo: repoName }).then(logCommits).then(response).catch(catchError);
  }

  /**
   * Pulls commit entries from GitHub and update local logging
   * database as per requirement.
   * @param  {string} projectId   the id of the project linked to the repo
   * @param  {string} repoOwner   owner handle of the GitHub repo
   * @param  {string} repoName    name of the GitHub repo
   * @param  {string} accessToken (optional) used to access private repo
   * @return {object}             boolean status and error message if any
   */
  function pullReleases(projectId, repoOwner, repoName, accessToken) {
    // Access GitHub with user's token and retrieve relevant statistics
    // Setup GitHub wrapper to retrieve information from GitHub
    _github2.default.authenticate({
      type: 'token',
      token: accessToken
    });

    var logReleases = function logReleases(releases) {
      var insertions = [];
      releases.forEach(function (release) {
        var payload = {
          date: release.published_at,
          assets: JSON.stringify(release.assets),
          tagName: release.tag_name,
          body: release.body,
          projectId: projectId
        };
        insertions.push(storage.log.release_log.upsertLog(payload));
      });
      return Promise.all(insertions);
    };

    var response = function response() {
      return { success: true };
    };

    var errorHandler = function errorHandler(error) {
      console.error(error);
      return { success: false, message: error };
    };

    return _github2.default.repos.getReleases({ owner: repoOwner, repo: repoName }).then(logReleases).then(response).catch(errorHandler);
  }

  /**
   * Logs the given commit related to a project/repo to the logging database.
   * @param {string} projectId  project id that the commit is linked to
   * @param {object} commit     github commit object or same format
   */
  function logCommit(projectId, commit) {
    var filteredCommit = {
      message: commit.commit.message,
      sha: commit.sha,
      date: commit.commit.author.date,
      githubLogin: commit.author.login,
      projectId: projectId
    };

    var response = function response() {
      return { success: true };
    };

    var errorHandler = function errorHandler(error) {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.commit_log.createLog(filteredCommit).then(response).catch(errorHandler);
  }

  /**
   * Logs the given release related to a project/repo to the logging database.
   * @param {string} projectId  project id that the release is linked to
   * @param {object} release    github release object or same format
   */
  function logRelease(projectId, release) {
    var filteredCommit = {
      date: release.published_at,
      assets: JSON.stringify(release.assets),
      tagName: release.tag_name,
      body: release.body,
      projectId: projectId
    };

    var response = function response() {
      return { success: true };
    };

    var errorHandler = function errorHandler(error) {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.release_log.createLog(filteredCommit).then(response).catch(errorHandler);
  }

  return {
    pullCommits: pullCommits,
    pullReleases: pullReleases,
    logCommit: logCommit,
    logRelease: logRelease
  };
};

var _github = require('./../data/github');

var _github2 = _interopRequireDefault(_github);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];