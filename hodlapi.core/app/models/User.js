const mongoose = require('mongoose');

const User = mongoose.Schema({
  email: mongoose.SchemaTypes.String,
  password: mongoose.SchemaTypes.String,
  name: mongoose.SchemaTypes.String,
  photo: mongoose.SchemaTypes.String,
  subscriptions: mongoose.SchemaTypes.Array,
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', User);
