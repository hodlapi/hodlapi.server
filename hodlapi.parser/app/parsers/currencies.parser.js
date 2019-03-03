const axios = require('axios').default;
const R = require('ramda');

const createBinanceCurrenciesRequest = () => axios.get('https://api.binance.com/api/v1/exchangeInfo').then(R.propOr({}, 'data'));

const mapBinanceResult = R.map(({
  baseAsset,
  quoteAsset,
}) => ({
  left: baseAsset,
  right: quoteAsset,
}));

const binanceCurrenciesParser = storeCb => createBinanceCurrenciesRequest()
  .then(R.propOr([], 'symbols'))
  .then(mapBinanceResult)
  .then(R.map(({ left, right }) => storeCb(left, right)));

module.exports = {
  binanceCurrenciesParser,
};
