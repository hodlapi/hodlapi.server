const mongoose = require('mongoose');

const RateBase = {
    openTime: mongoose.SchemaTypes.Date,
    open: mongoose.SchemaTypes.Mixed,
    hight: mongoose.SchemaTypes.Mixed,
    low: mongoose.SchemaTypes.Mixed,
    close: mongoose.SchemaTypes.Mixed,
    volume: mongoose.SchemaTypes.Mixed,
    closeTime: mongoose.SchemaTypes.Date,
    quoteAssetVol: mongoose.SchemaTypes.Mixed,
    numTrades: mongoose.SchemaTypes.Mixed,
    takerBuyBaseAssetVol:  mongoose.SchemaTypes.Mixed,
    takerBuyQuoteAssetVol:  mongoose.SchemaTypes.Mixed,
    ignore:  mongoose.SchemaTypes.Mixed,
    symbol: mongoose.SchemaTypes.String
};

const Rate1h = mongoose.Schema({
    ...RateBase
});
const Rate30m = mongoose.Schema({
    ...RateBase
});
const Rate15m = mongoose.Schema({
    ...RateBase
});
const Rate5m = mongoose.Schema({
    ...RateBase
});
const Rate1m = mongoose.Schema({
    ...RateBase
});

module.exports = {
    Rate1h: mongoose.model('Rate1h', Rate1h),
    Rate30m: mongoose.model('Rate30m', Rate30m),
    Rate15m: mongoose.model('Rate15m', Rate15m),
    Rate5m: mongoose.model('Rate5m', Rate5m),
    Rate1m: mongoose.model('Rate1m', Rate1m),
    RateBase
};