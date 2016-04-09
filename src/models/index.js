const Sequelize = require('sequelize');
const config = require('config');

// Setup Sequelize and Connection with Database
// ======================================================
const dbName = config.get('logging-database.name');
const dbUsername = config.get('logging-database.username');
const dbPassword = config.get('logging-database.password');
const dbOptions = config.get('logging-database.options');

const sequelize = new Sequelize(
    dbName,
    dbUsername,
    dbPassword,
    dbOptions
);

const modelFiles = [
  'admin',
  'commit-log',
  'release-log',
  'drive-log',
  'milestone-log',
  'revision-log',
  'task-log'
];

modelFiles.forEach(model => {
  module.exports[model] = sequelize.import(`${__dirname}/${model}`);
});

// Synchronize all the defined model into the actual mySQL database
// ========================================================================
sequelize.sync().then(() => {
}, error => console.error(error));

module.exports.sequelize = sequelize;
