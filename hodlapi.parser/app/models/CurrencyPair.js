const mongoose = require('mongoose');
const baseModel = require('./BaseModel');

const CurrencyPair = mongoose.Schema({
  ...baseModel,
  name: mongoose.SchemaTypes.String,
  fromId: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
  toId: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
});

module.exports = mongoose.model('CurrencyPair', CurrencyPair);
