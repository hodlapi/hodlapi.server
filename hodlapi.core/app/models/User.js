const mongoose = require('mongoose');

const User = mongoose.Schema({
  login: mongoose.SchemaTypes.String,
  password: mongoose.SchemaTypes.String
}, {
  timestamps: true
});

module.exports = mongoose.model('User', User);
