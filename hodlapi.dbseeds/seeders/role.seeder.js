const {
    Seeder
} = require('mongoose-data-seed');
const {
    Role
} = require('../models');

const roles = require('../seeds/Roles.json');

class RolesSeeder extends Seeder {
    async shouldRun() {
        return Role.countDocuments()
            .exec()
            .then(count => count === 0);
    }

    async run() {
        return Role.create(roles);
    }
}

module.exports = RolesSeeder;