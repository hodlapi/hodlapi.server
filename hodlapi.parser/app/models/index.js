const {
    Rate15m,
    Rate1h,
    Rate1m,
    Rate30m,
    Rate5m,
    getRateByInterval
} = require('./Rate');
const Currency = require('./Currency');
const CurrencyPair = require('./CurrencyPair');
const DataSource = require('./DataSource');

module.exports = {
    Rate15m,
    Rate1h,
    Rate1m,
    Rate30m,
    Rate5m,
    getRateByInterval,
    Currency,
    CurrencyPair,
    DataSource
};
