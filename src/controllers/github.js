import github from './../data/github';

export default function (storage) {
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
    github.authenticate({
      type: 'token',
      token: accessToken
    });
    const logCommits = (commits) => {
      const insertions = [];
      commits.forEach((commit) => {
        const payload = {
          message: commit.commit.message,
          sha: commit.sha,
          date: commit.commit.committer.date,
          githubLogin: commit.committer.login,
          projectId
        };
        insertions.push(storage.log.commit_log.createLog(payload));
      });
      return Promise.all(insertions);
    };

    const response = () => {
      return { success: true };
    };

    const catchError = (error) => {
      console.error(error);
      return { success: false, message: error };
    };

    return github.repos.getCommits({ owner: repoOwner, repo: repoName })
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
  function pullReleases(projectId, repoOwner, repoName, accessToken) {
    // Access GitHub with user's token and retrieve relevant statistics
    // Setup GitHub wrapper to retrieve information from GitHub
    github.authenticate({
      type: 'token',
      token: accessToken
    });

    const logReleases = (releases) => {
      const insertions = [];
      releases.forEach((release) => {
        const payload = {
          date: release.published_at,
          assets: JSON.stringify(release.assets),
          tagName: release.tag_name,
          body: release.body,
          projectId
        };
        insertions.push(storage.log.release_log.upsertLog(payload));
      });
      return Promise.all(insertions);
    };

    const response = () => {
      return { success: true };
    };

    const errorHandler = (error) => {
      console.error(error);
      return { success: false, message: error };
    };

    return github.repos.getReleases({ owner: repoOwner, repo: repoName })
      .then(logReleases)
      .then(response)
      .catch(errorHandler);
  }

  /**
   * Logs the given commit related to a project/repo to the logging database.
   * @param projectId {String} project id that the commit is linked to
   * @param commit    {object} github commit object or same format
   */
  function logCommit(projectId, commit) {
    const filteredCommit = {
      message: commit.commit.message,
      sha: commit.sha,
      date: commit.commit.committer.date,
      githubLogin: commit.committer.login,
      projectId
    };

    const response = () => {
      return { success: true };
    };

    const errorHandler = (error) => {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.commit_log.createLog(filteredCommit)
      .then(response)
      .catch(errorHandler);
  }

  /**
   * Logs the given release related to a project/repo to the logging database.
   * @param projectId {String} project id that the release is linked to
   * @param release   {object} github release object or same format
   */
  function logRelease(projectId, release) {
    const filteredCommit = {
      date: release.published_at,
      assets: JSON.stringify(release.assets),
      tagName: release.tag_name,
      body: release.body,
      projectId
    };

    const response = () => {
      return { success: true };
    };

    const errorHandler = (error) => {
      console.error(error);
      return { success: false, message: error };
    };

    return storage.log.release_log.createLog(filteredCommit)
      .then(response)
      .catch(errorHandler);
  }

  return {
    pullCommits,
    pullReleases,
    logCommit,
    logRelease
  };
}
