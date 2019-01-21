const axios = require('axios');
const R = require('ramda');
const trim = require('lodash/trim');
const moment = require('moment');
const { store } = require('./storage.service');

const parseBinance = params => axios.default.get('https://api.binance.com/api/v1/klines', { params })
    .then(R.propOr([], 'data'));

const binanceParser = ({ symbol, interval, startDate = '2017-01-01' }) => new Promise(async (resolve, reject) => {
    /**
     * loop conditions
     * startTime - unix time of the first date
     */
    let startTime = moment(startDate).unix();
    const currentDateInUnix = moment.unix(moment().unix());
    let parsedLength = 1;
    let cycleIterator = 0;
    let courses = [];
    while (startTime < currentDateInUnix && parsedLength > 0) {
        try {
            const data = await parseBinance({
                symbol,
                interval,
                startTime
            }) || [];
            parsedLength = data.length;
            // hack
            courses = [...courses, ...data];
            cycleIterator++;
            startTime = R.compose(
                R.inc,
                R.nth(6),
                R.last
            )(data);
            console.log(moment(startTime).toString());
        } catch (e) {
            reject(e);
            return;
        }
    }
    await store(
        `${moment().format('YYYY-MM-DD')}_${symbol}/${interval}`,
        courses
    );
    resolve();
});

module.exports = {
    binanceParser
};
