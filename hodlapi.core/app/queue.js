const Bull = require('bull');
const config = require('config');
const R = require('ramda');

const {
  sendEmail,
  sendSignUpEmail,
  sendRestorePasswordEmail,
  parseHistoricalData,
} = require('./workers');

const queueConfig = {
  redis: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    password: config.get('redis.auth'),
  },
};

const parserQueue = new Bull('parser', queueConfig);
const fwriterQueue = new Bull('fwriter', queueConfig);
const socketQueue = new Bull('socket', queueConfig);
const coreQueue = new Bull('core', queueConfig);

// coreQueue.removeRepeatable();

/** ****** Jobs createors block ******* */

parserQueue.add('binance.currencies', null, {
  repeat: {
    every: 24 * 60 * 60 * 1000,
  },
});

coreQueue.add('rateParserStarter', null, {
  repeat: {
    every: 3 * 60 * 60 * 1000,
  },
});

/** ****** Job processors ******** */

coreQueue.process('rateParserStarter', (_, done) => Promise.resolve(
  R.compose(
    R.then(
      R.map(R.then(payload => parserQueue.add('binance.rates', {
        ...payload,
      }))),
    ),
  )(
    parseHistoricalData(),
  ),
).then(() => done()));

coreQueue.process('sendFileEmail', sendEmail);
coreQueue.process('sendSignUpEmail', sendSignUpEmail);
coreQueue.process('sendRestorePasswordEmail', sendRestorePasswordEmail);

module.exports = {
  parserQueue,
  fwriterQueue,
  socketQueue,
  coreQueue,
};
