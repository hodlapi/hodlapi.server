const {
    Rate1h,
    Rate30m,
    Rate15m,
    Rate5m,
    Rate1m,
    RateBase,
    getRateByInterval
} = require('./Rate');
const { Request, RequestStatuses } = require('./Request');
const Currency = require('./Currency');
const CurrencyPair = require('./CurrencyPair');
const DataSource = require('./DataSource');
const User = require('./User');
const Role = require('./Role');
const File = require('./File');

module.exports = {
    Rate1h,
    Rate30m,
    Rate15m,
    Rate5m,
    Rate1m,
    RateBase,
    Request,
    RequestStatuses,
    Currency,
    CurrencyPair,
    DataSource,
    getRateByInterval,
    User,
    Role,
    File
};