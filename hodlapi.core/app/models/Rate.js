const mongoose = require('mongoose');
const R = require('ramda');
const baseModel = require('./BaseModel');

const RateBase = {
  ...baseModel,
  openTime: mongoose.SchemaTypes.Date,
  open: mongoose.SchemaTypes.Mixed,
  high: mongoose.SchemaTypes.Mixed,
  low: mongoose.SchemaTypes.Mixed,
  close: mongoose.SchemaTypes.Mixed,
  volume: mongoose.SchemaTypes.Mixed,
  closeTime: mongoose.SchemaTypes.Date,
  quoteAssetVol: mongoose.SchemaTypes.Mixed,
  numTrades: mongoose.SchemaTypes.Mixed,
  takerBuyBaseAssetVol: mongoose.SchemaTypes.Mixed,
  takerBuyQuoteAssetVol: mongoose.SchemaTypes.Mixed,
  ignore: mongoose.SchemaTypes.Mixed,
  dataSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DataSource',
  },
  currencyPair: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CurrencyPair',
  },
};

const Rate1h = mongoose.model('Rate1h', mongoose.Schema({
  ...RateBase,
}));
const Rate30m = mongoose.model('Rate30m', mongoose.Schema({
  ...RateBase,
}));
const Rate15m = mongoose.model('Rate15m', mongoose.Schema({
  ...RateBase,
}));
const Rate5m = mongoose.model('Rate5m', mongoose.Schema({
  ...RateBase,
}));
const Rate1m = mongoose.model('Rate1m', mongoose.Schema({
  ...RateBase,
}));

const ratesMap = {
  '1h': Rate1h,
  '30m': Rate30m,
  '15m': Rate15m,
  '5m': Rate5m,
  '1m': Rate1m,
};

const getRateByInterval = R.curry((rates, interval) => R.propOr(R.tap, interval)(rates));

module.exports = {
  Rate1h,
  Rate30m,
  Rate15m,
  Rate5m,
  Rate1m,
  getRateByInterval: getRateByInterval(ratesMap),
};
