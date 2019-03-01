const axios = require('axios').default;
const R = require('ramda');
const moment = require('moment');
const {
  DataSource,
} = require('../models');

const mapBinanceRateToDoc = R.curry((currencyPairId, dataSourceId, data) => ({
  currencyPair: currencyPairId,
  dataSource: dataSourceId,
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
  ignore: data[11],
}));

const createParseRequest = params => axios
  .get('https://api.binance.com/api/v1/klines', {
    params,
  })
  .then(R.propOr([], 'data'));

const binanceParser = R.curry(
  (storeCb, interval, pair, start, end) => new Promise(async (resolve, reject) => {
    let startTime = moment(start).unix() * 1000;
    const currentDate = (moment(end).unix() + 1000) * 1000;
    let parsedLength = 1;
    const dataSource = await DataSource.findOne({
      name: 'Binance',
    });
    const symbol = R.prop('name')(pair);
    const mapRateToDoc = mapBinanceRateToDoc(R.propOr(-1, '_id')(pair), R.propOr(-1, '_id')(dataSource));

    while (startTime < currentDate && parsedLength > 0) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const data = (await createParseRequest({
          symbol,
          interval,
          startTime,
        })) || [];

        parsedLength = data.length;
        data.map(
          R.compose(
            storeCb,
            mapRateToDoc,
          ),
        );
        startTime = R.compose(
          R.inc,
          R.nth(6),
          R.last,
        )(data);
      } catch (e) {
        reject(e);
        return;
      }
    }
    resolve();
  }),
);

module.exports = {
  binanceParser,
};
