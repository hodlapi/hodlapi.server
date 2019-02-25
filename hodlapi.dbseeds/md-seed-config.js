const mongooseLib = require('mongoose');
const config = require('config');

mongooseLib.Promise = global.Promise;

// Export the mongoose lib
const mongoose = mongooseLib;

// Export the mongodb url
const mongoURL = `mongodb://${config.get('mongodb.host')}:${config.get('mongodb.port')}/${config.get('mongodb.dbName')}` || 'mongodb://localhost:27017/dbname';

const {
  RolesSeeder,
  UserSeeder,
  DataSource,
} = require('./seeders');

/*
  Seeders List
  ------
  order is important
*/
const seedersList = {
  RolesSeeder,
  UserSeeder,
  DataSource,
};

module.exports = {
  mongoose,
  mongoURL,
  seedersList,
};
