const {
  Seeder
} = require('mongoose-data-seed');
const {
  DataSource
} = require('../models');

const data = require('../seeds/DataSources.json');

class DataSourceSeeder extends Seeder {

  async shouldRun() {
    return DataSource.countDocuments()
      .exec()
      .then(count => count === 0);
  }

  run() {
    return DataSource.create(data);
  }
}

module.exports = DataSourceSeeder;