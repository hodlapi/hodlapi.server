const { Seeder } = require('mongoose-data-seed');
const { DataSource } = require('../models');

const data = require('../seeds/DataSources.json');

class DataSourceSeeder extends Seeder {
  
  run () {
    return DataSource.create(data);
  }
}

module.exports = DataSourceSeeder;
