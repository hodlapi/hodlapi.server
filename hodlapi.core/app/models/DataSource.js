const mongoose = require('mongoose');
const baseModel = require('./BaseModel');

const DataSource = mongoose.Schema({
  ...baseModel,
  name: mongoose.SchemaTypes.String,
  lastUpdated: mongoose.SchemaTypes.Date,
  currencyPairs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CurrencyPair' }],
  url: mongoose.SchemaTypes.String,
  logo: mongoose.SchemaTypes.String,
});

module.exports = mongoose.model('DataSource', DataSource);
