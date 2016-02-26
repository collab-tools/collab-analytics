module.exports = function(sequelize, DataTypes) {
  return sequelize.define('CommitLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    loc: DataTypes.INTEGER,
    date: DataTypes.DATE,
    user_id: DataTypes.STRING,
    project_id: DataTypes.STRING
  }, {
    classMethods: {
    }
  });
};
