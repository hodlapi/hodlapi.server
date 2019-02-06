const R = require('ramda');
const Json2Csv = require('json2csv').Parser;

const json = e => JSON.stringify(e);

const csv = R.curry((colums, data) => {
    const fields = colums.map((label, value) => ({ label, value: `${value}` }));
    const parser = new Json2Csv({
        fields
    });
    return parser.parse(data);
});

const binanceModelToRate = (rate) => ([
    +R.propOr(null, 'openTime')(rate),
    +R.propOr(0, 'open')(rate),
    +R.propOr(0, 'high')(rate),
    +R.propOr(0, 'low')(rate),
    +R.propOr(null, 'close')(rate),
    +R.propOr(0, 'volume')(rate),
    +R.propOr(null, 'closeTime')(rate),
    +R.propOr(0, 'quoteAssetVol')(rate),
    +R.propOr(0, 'numTrades')(rate),
    +R.propOr(0, 'takerBuyBaseAssetVol')(rate),
    +R.propOr(0, 'takerBuyQuoteAssetVol')(rate),
    +R.propOr(0, 'ignore')(rate)
]);

module.exports = {
    json,
    csv,
    binanceModelToRate
};
