'use strict';

// Read configuration file
const config = require('./config');
const env = config.env || 'dev';
// Create sequelize
const dburl = `mysql://${config[env].dbuser}:${config[env].dbpassword}@${config[env].dbhost}/${config[env].dbname}`;
const Sequelize = require('sequelize');
const sequelize = new Sequelize(dburl, {
  logging: false,
});

module.exports = sequelize;