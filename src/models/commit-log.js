'use strict';
const uuid = require('node-uuid');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('commit_log', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    date: DataTypes.DATE,
    sha: DataTypes.STRING,
    message: DataTypes.STRING,
    additions: DataTypes.INTEGER,
    deletions: DataTypes.INTEGER,
    githubLogin: DataTypes.STRING,
    projectId: DataTypes.STRING
  }, {
    underscored: true,
    classMethods: {
      getProjectCommits(projectId, range) {
        const where = { projectId };
        if (range) where.date = { $gt: range };
        return this.findAll({ where });
      },
      getUserCommits(userId, projectId, range) {
        const where = { userId };
        if (projectId) where.projectId = projectId;
        if (range) where.date = { $gt: range };
        return this.findAll({ where });
      },
      getCommitsCount(range) {
        const where = {};
        if (range) where.date = { $gt: range };
        return this.count({ where });
      },
      getCommit(commitUUID) {
        const where = { commitUUID };
        return this.findOne({ where });
      },
      getCommits(range) {
        const where = {};
        if (range) where.date = { $gt: range };
        return this.findAll({ where });
      },
      createLog(logInfo) {
        logInfo.id = uuid.v4();
        return this.create(logInfo);
      }
    }
  });
};
