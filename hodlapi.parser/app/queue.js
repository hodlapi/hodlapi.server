const Bull = require('bull');
const config = require('config');
const {
  binanceWorker,
  binanceCurrenciesWorker,
  zeroXWorker,
} = require('./workers');

const queue = new Bull('parser', {
  redis: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    password: config.get('redis.auth'),
  },
});

queue.process('binance.rates', binanceWorker);

queue.process('binance.currencies', (_, done) => {
  binanceCurrenciesWorker().then(
    result => done(null, result),
    error => done(error),
  );
});

queue.process('zeroX.transactions', (_, done) => {
  zeroXWorker().then(
    result => done(null, result),
    error => done(error),
  );
});

module.exports = queue;
