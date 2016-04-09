'use strict';

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('drive_log', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    activity: DataTypes.CHAR,
    fileUUID: DataTypes.STRING,
    fileName: DataTypes.STRING,
    fileMIME: DataTypes.STRING,
    date: DataTypes.DATE,
    googleId: DataTypes.STRING,
    projectId: DataTypes.STRING
  }, {
    underscored: true,
    classMethods: {
      getUniqueFiles(projectId, range) {
        const where = {};
        if (projectId) where.projectId = projectId;
        if (range) where.date = { $gt: range };
        return this.findAll({
          where,
          attributes: [
            [sequelize.literal('DISTINCT `fileUUID`'), 'fileUUID'], 'fileName', 'fileMIME',
            'date', 'userId', 'projectId', 'id'
          ]
        });
      },
      getFile(fileUUID) {
        const where = { fileUUID };
        return this.findOne({
          where,
          attributes: ['fileUUID', 'fileName', 'fileMIME', 'date', 'userId', 'projectId', 'id']
        });
      }
    }
  });
};
