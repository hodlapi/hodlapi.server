const { binanceWorker } = require('./binance.worker');
const { binanceCurrenciesWorker } = require('./currencies.worker');

module.exports = {
    binanceWorker,
    binanceCurrenciesWorker
};