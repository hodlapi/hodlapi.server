const R = require('ramda');

const composeFileName = R.curry((symbol, start, end, interval) => `${symbol}_${start}-${end}_${interval}`);

module.exports = {
    composeFileName
};
