'use strict';
const uuid = require('node-uuid');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('release_log', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    date: DataTypes.DATE,
    assets: DataTypes.JSON,
    tagName: DataTypes.STRING,
    body: DataTypes.STRING,
    projectId: DataTypes.STRING
  }, {
    underscored: true,
    classMethods: {
      getReleases(range) {
        const where = {};
        if (range) where.date = { $gt: range };
        return this.findAll({ where });
      },
      getReleasesCount(range) {
        const where = {};
        if (range) where.date = { $gt: range };
        return this.count({ where });
      },
      getProjectReleases(projectId, range) {
        const where = { projectId };
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
