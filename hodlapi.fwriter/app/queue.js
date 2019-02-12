const kue = require('kue');
const config = require('config');
const R = require('ramda');
const {
    store
} = require('./workers');
const {
    json,
    csv,
    constants
} = require('./lib');

const formattersMap = {
    'json': e => json(e),
    'csv': e => csv(constants.binanseCsvFields, e)
};

const queue = kue.createQueue({
    redis: {
        host: config.get('redis.host'),
        port: config.get('redis.port'),
        auth: config.get('redis.auth')
    }
});

queue.process('fwriter.write', ({
    data
}, done) => {
    const {
        interval,
        pair,
        dataSource,
        range: {
            start,
            end
        },
        extensions = ['json', 'csv']
    } = data;
    Promise.all(R.map(e => store(interval, pair, start, end, e, formattersMap[e]))(extensions)).then(data => {
        done(null, data);
    }, err => done(err));
});

module.exports = queue;