const { binanceWorker } = require('./binance.worker');
const { binanceCurrenciesWorker } = require('./currencies.worker');
const { zeroXWorker } = require('./zeroX.worker')

module.exports = {
    binanceWorker,
    binanceCurrenciesWorker,
    zeroXWorker
};