const File = require('./File');
const { Request, RequestStatuses } = require('./Request');
const DataSource = require('./DataSource');
const CurrencyPair = require('./CurrencyPair');
const {
  Rate15m,
  Rate1h,
  Rate1m,
  Rate30m,
  Rate5m,
  getRateByInterval,
} = require('./Rate');

module.exports = {
  File,
  Rate15m,
  Rate1h,
  Rate1m,
  Rate30m,
  Rate5m,
  getRateByInterval,
  Request,
  RequestStatuses,
  DataSource,
  CurrencyPair,
};
