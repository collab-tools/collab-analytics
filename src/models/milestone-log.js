'use strict';
const uuid = require('node-uuid');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('milestone_log', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    activity: DataTypes.CHAR,
    date: DataTypes.DATE,
    userId: DataTypes.STRING,
    projectId: DataTypes.STRING,
    milestoneId: DataTypes.STRING
  }, {
    underscored: true,
    classMethods: {
      getByUserId(userId) {
        const where = { userId };
        return this.findAll({ where });
      },
      getByUserProject(userId, projectId, range) {
        const where = { userId, projectId };
        if (range) where.date = { $gt: range };
        return this.findAll({ where });
      },
      getByProject(projectId, range) {
        const where = { projectId };
        if (range) where.date = { $gt: range };
        return this.findAll({ where });
      },
      createLog(logInfo) {
        logInfo.id = uuid.v4();
        return this.create(logInfo);
      }
    },
    activityCode: {
      CREATE: 'C',
      DONE: 'D'
    }
  });
};