const kue = require('kue');
const fs = require('fs');
const zip = require('zip-dir');
const R = require('ramda');
const moment = require('moment');
const rimraf = require('rimraf');

const { binanceParser } = require('./app/services/parser.service');

const queue = kue.createQueue({
    redis: {
        host: 'redis',
        port: 6379
    }
});

queue.process('binance', ({ data }, done) => {
    const { symbol, intervals = [], startDate } = data;
    const folderName = `${moment().format('YYYY-MM-DD')}_${symbol}`;
    if (fs.existsSync(`./volumes/${folderName}`)) {
        rimraf.sync(`./volumes/${folderName}`)
    }
    if (fs.existsSync(`./volumes/${folderName}.zip`)) {
        fs.unlinkSync(`./volumes/${folderName}.zip`);
    }
    Promise.all(
        R.compose(
           R.map(interval => binanceParser({ symbol, interval, startDate: '2017-01-01' }))
        )(intervals)
    ).then(() => {
            console.log('Parsing completed');
            zip(`./volumes/${folderName}`, { saveTo: `./volumes/${folderName}.zip` }, err => {
                if (fs.existsSync(`./volumes/${folderName}`)) {
                    rimraf.sync(`./volumes/${folderName}`)
                }
                done();
            });
        })
        .catch(e => {
            throw new Error(e);
            done();
        });
    
        
});

module.exports = queue;