const axios = require('axios').default;
const R = require('ramda');
const moment = require('moment');

const mapBinanceRateToDoc = R.curry((symbol, data) => ({
    currencyPair: symbol,
    openTime: data[0],
    open: data[1],
    hight: data[2],
    low: data[3],
    close: data[4],
    volume: data[5],
    closeTime: data[6],
    quoteAssetVol: data[7],
    numTrades: data[8],
    takerBuyBaseAssetVol: data[9],
    takerBuyQuoteAssetVol: data[10],
    ignore: data[11]
}));

const createParseRequest = params => axios.get('https://api.binance.com/api/v1/klines', {
    params
}).then(R.propOr([], 'data'));

const binanceParser = R.curry((storeCb, interval, pair, start, end) => new Promise(async (resolve, reject) => {
    let startTime = moment(start).unix() * 1000;
    const currentDate = moment(end).unix() * 1000;
    let parsedLength = 1;
    const symbol = `${R.pathOr('', ['fromId', 'symbol'])(pair)}${R.pathOr('', ['toId', 'symbol'])(pair)}`;
    const mapRateToDoc = mapBinanceRateToDoc(R.propOr(-1, '_id')(pair));

    while (startTime < currentDate && parsedLength > 0) {
        try {
            const data = await createParseRequest({
                symbol,
                interval,
                startTime
            }) || [];
            parsedLength = data.length;
            data.map(R.compose(storeCb, mapRateToDoc));
            startTime = R.compose(
                R.inc,
                R.nth(6),
                R.last
            )(data);
        } catch (e) {
            reject(e);
            return;
        }
    }
    resolve();
}));

module.exports = {
    binanceParser
};