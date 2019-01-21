const kue = require('kue');
const fs = require('fs');
const R = require('ramda');

const { binanceParser } = require('./app/services/parser.service');

const queue = kue.createQueue({
    redis: {
        host: 'redis',
        port: 6379
    }
});

queue.process('binance', ({ data }, done) => {
    const { symbol, intervals = [], startDate } = data;
    // if (fs.existsSync())
    Promise.all(
        R.compose(
           R.map(interval => binanceParser({ symbol, interval, startDate: '2017-01-01' }))
        )(intervals)
    ).then(() => {
            console.log('Parsing completed');
            done();
        })
        .catch(e => {
            throw new Error(e);
            done();
        });
    
        
});

module.exports = queue;