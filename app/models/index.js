const {
    Rate1h,
    Rate30m,
    Rate15m,
    Rate5m,
    Rate1m,
    RateBase,
    getRateByInterval
} = require("./Rate");
const Request = require("./Request");
const Currency = require("./Currency");
const CurrencyPair = require("./CurrencyPair");
const DataSource = require("./DataSource");

module.exports = {
    Rate1h,
    Rate30m,
    Rate15m,
    Rate5m,
    Rate1m,
    RateBase,
    Request,
    Currency,
    CurrencyPair,
    DataSource,
    getRateByInterval
};
