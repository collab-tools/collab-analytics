module.exports = function(sequelize, DataTypes) {
  return sequelize.define('MilestoneLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    activity: DataTypes.INTEGER,
    date: DataTypes.DATE,
    user_id: DataTypes.STRING,
    project_id: DataTypes.STRING,
    milestone_id: DataTypes.STRING
  }, {
    classMethods: {}
  });
};
