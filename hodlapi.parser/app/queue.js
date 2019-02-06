const kue = require('kue');
const config = require('config');
const {
  binanceWorker,
  binanceCurrenciesWorker,
  zeroXWorker
} = require('./workers');

const queue = kue.createQueue({
  redis: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    auth: config.get('redis.auth')
  }
});

queue.process('parser.binance.rates', binanceWorker);

queue.process('parser.binance.currencies', (_, done) => {
  binanceCurrenciesWorker().then(
    result => done(null, result),
    error => done(error)
  );
});

queue.process('parser.zeroX.transactions', (_ , done) => {
  zeroXWorker().then(
    result => done(null, result),
    error => done(error)
  )
})

module.exports = queue;