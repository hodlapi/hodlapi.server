const kue = require('kue');

const { parseBinance } = require('./app/services/parser.service');

const queue = kue.createQueue({
    redis: {
        host: 'redis',
        port: 6379
    }
});

queue.process('binance', ({ data }, done) => {
    console.log('queue handler', data);
    parseBinance(data).then(() => {
        done();
    });
});

module.exports = queue;