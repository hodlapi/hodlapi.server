const kue = require('kue-scheduler');
const R = require('ramda');
const moment = require('moment');
const config = require('config');
const {
    CurrencyPair,
    getRateByInterval
} = require('./models');
const {
    intervals
} = require('./lib/constants');
const {
    sendEmail,
    sendSignUpEmail
} = require('./workers');

const queue = kue.createQueue({
    redis: {
        host: config.get('redis.host'),
        port: config.get('redis.port'),
        auth: config.get('redis.auth')
    }
});

queue.clear();

/******** Jobs createors block ********/

const currencyParsingJob = queue
    .createJob('parser.binance.currencies', null)
    .attempts(1)
    .priority('normal');

const rateParsingJobs = queue
    .createJob('core.rateParserStarter', null)
    .attempts(3)
    .priority('normal');

const zeroXParsingJob = queue.createJob('parser.zeroX.transactions', null);

/******** Jobs createors block end ********/

/******** Scheduler block ********/
queue.now(currencyParsingJob);
queue.now(zeroXParsingJob);
queue.now(rateParsingJobs);

queue.every('1 day', currencyParsingJob);
queue.every('3 hours', rateParsingJobs);
queue.every('2 days', zeroXParsingJob);

/******** Scheduler block end ********/

/******** Job processors *********/

queue.process('core.rateParserStarter', (_, done) => {
    intervals.map(({
        value
    }) => {
        CurrencyPair.find()
            .populate('toId')
            .populate('fromId')
            .then(
                R.map(pair => {
                    getRateByInterval(value)
                        .find({
                            currencyPair: pair._id
                        }, {}, {
                            sort: {
                                openTime: -1
                            }
                        })
                        .then(data => {
                            const start = R.pathOr('2017-01-01', [0, 'openTime'])(data);
                            return queue
                                .create('parser.binance.rates', {
                                    interval: value,
                                    pair,
                                    end: moment(),
                                    start
                                })
                                .save();
                        });
                })
            )
            .then(done());
    });
});

queue.process('core.sendFileEmail', sendEmail);
queue.process('core.sendSignUpEmail', sendSignUpEmail);
/******** Job processors end *********/

module.exports = queue;