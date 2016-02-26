import * as Sequelize from 'sequelize'
import * as config from '../config'

var dbConfig = config.getConfig();

var modelFiles = [
  'CommitLog',
  'DriveLog',
  'IssueLog',
  'MilestoneLog',
  'TaskLog'
]

_.each(modelFiles, function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
})

var sequelize = new Sequelize(
    dbConfig.dbName,
    dbConfig.dbUsername,
    dbConfig.dbPassword,
    dbConfig.dbOptions
)

sequelize.sync().then(function() {}, function(error) {
  console.log(error);
});


module.exports.sequelize = sequelize;
