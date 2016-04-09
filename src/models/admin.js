'use strict';

const _ = require('lodash');
const bcrypt = require('bcrypt');
const uuid = require('node-uuid');
const saltRound = 8;

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('admin', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: DataTypes.STRING,
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z0-9\_\-]+$/i
      }
    },
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    underscored: true,
    instanceMethods: {
      comparePassword(password) {
        return bcrypt.compareSync(password, this.password);
      },
      updatePassword(password) {
        this.password = bcrypt.hashSync(password, saltRound);
      }
    },
    hooks: {
      beforeCreate(user) {
        user.id = uuid.v4();
        user.password = bcrypt.hashSync(user.password, saltRound);
      }
    },
    classMethods: {
      findByName(name) {
        const where = { name };
        return this.findOne({ where });
      },
      findByRole(role) {
        const where = { role };
        return this.findAll({ where });
      },
      addUser(payload) {
        const actualLoad = {
          username: payload.username,
          password: payload.password,
          role: payload.role,
          name: payload.name
        };
        return this.create(actualLoad);
      }
    }
  });
};
