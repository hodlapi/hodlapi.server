const R = require('ramda');
const moment = require('moment');

const composeFileName = R.curry((dataSource, currencyPair, start, end, interval) => `${dataSource}_${currencyPair}_${moment(start.toString()).format("MM-DD-YYYY")}-${moment(end.toString()).format("MM-DD-YYYY")}_${interval}`);

module.exports = {
    composeFileName
};