const {
  Seeder
} = require('mongoose-data-seed');
const {
  User,
  Role
} = require('../models');

const data = require('../seeds/Users.json') || [];
let mappedData = [];

class UserSeeder extends Seeder {
  async shouldRun() {
    return User.countDocuments()
      .exec()
      .then(count => count === 0);
  }

  async run() {
    const roles = await Role.find().exec();
    mappedData = data.map(e => (Object.assign(e, {
      role: roles.find(j => j.name === e.role)._id
    })));
    return User.create(mappedData);
  }
}

module.exports = UserSeeder;