const mongoose = require('mongoose');

const Role = mongoose.Schema({
  name: mongoose.SchemaTypes.String
});

module.exports = mongoose.model('Role', Role);
