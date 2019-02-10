const Seeder = require('mongoose-data-seed').Seeder;
const { User } = require('../models');

const data = require('../seeds/Users.json');

var UserSeeder = Seeder.extend({
  shouldRun: function () {
    return Model.countDocuments().exec().then(count => count === 0);
  },
  run: function () {
    return Model.create(data);
  }
});

module.exports = UserSeeder;
