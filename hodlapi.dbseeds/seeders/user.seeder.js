/* eslint-disable class-methods-use-this */
const {
  Seeder,
} = require('mongoose-data-seed');
const {
  User,
  Role,
} = require('../models');
const data = require('../seeds/Users.json');

class UserSeeder extends Seeder {
  async shouldRun() {
    return User.countDocuments()
      .exec()
      .then(count => count === 0);
  }

  async run() {
    const roles = await Role.find().exec();
    const mappedData = (data || []).map(e => (Object.assign(e, {
      // eslint-disable-next-line no-underscore-dangle
      role: roles.find(j => j.name === e.role)._id,
    })));
    return User.create(mappedData);
  }
}

module.exports = UserSeeder;
