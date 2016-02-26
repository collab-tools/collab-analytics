module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DriveLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    file_name: DataTypes.INTEGER,
    date: DataTypes.DATE,
    user_id: DataTypes.STRING,
    project_id: DataTypes.STRING
  }, {
    classMethods: {}
  });
};
