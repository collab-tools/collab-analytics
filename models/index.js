import * as Sequelize from 'sequelize'
import * as config from '../config'

var dbConfig = config.getConfig();
var sequelize = new Sequelize(
    dbConfig.dbName,
    dbConfig.dbUsername,
    dbConfig.dbPassword,
    dbConfig.dbOptions
)

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

sequelize.sync().then(function() {}, function(error) {
  console.log(error);
});


module.exports.sequelize = sequelize;
