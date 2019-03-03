const mongoose = require('mongoose');

const BaseModel = {
  createdAt: mongoose.SchemaTypes.Date,
  createdBy: mongoose.SchemaTypes.ObjectId,
  updatedAt: mongoose.SchemaTypes.Date,
  updatedBy: mongoose.SchemaTypes.ObjectId,
  deleted: mongoose.SchemaTypes.Boolean,
};

module.exports = {
  BaseModel,
};
