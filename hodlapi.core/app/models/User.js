const mongoose = require('mongoose');

const User = mongoose.Schema({
  email: mongoose.SchemaTypes.String,
  username: mongoose.SchemaTypes.String,
  password: mongoose.SchemaTypes.String,
  name: mongoose.SchemaTypes.String,
  photo: mongoose.SchemaTypes.String,
  subscriptions: mongoose.SchemaTypes.Array,
  activated: mongoose.SchemaTypes.Boolean,
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', User);
