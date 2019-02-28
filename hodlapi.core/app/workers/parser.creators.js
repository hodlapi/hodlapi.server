const R = require('ramda');
const moment = require('moment');
const {
  CurrencyPair,
  getRateByInterval,
} = require('../models');
const {
  intervals,
} = require('../lib/constants');

const parseHistoricalData = () => R.compose(
  R.then(R.flatten),
  e => Promise.all(e),
  R.map(async ({
    value,
  }) => {
    const pairs = await CurrencyPair.find().populate('toId').populate('fromId');
    return R.compose(
      R.defaultTo([]),
      R.map(async (pair) => {
        const rates = await getRateByInterval(value).find({
          currencyPair: R.prop('_id')(pair),
        }, {}, {
          sort: {
            openTime: -1,
          },
        });
        return {
          id: `${R.prop('name')(pair)}${value}`,
          start: R.pathOr('2017-01-01', [0, 'openTime'])(rates),
          interval: value,
          pair,
          end: moment().subtract(1, 'day').format('YYYY-MM-DD'),
        };
      }),
    )(pairs);
  }),
)(intervals);

module.exports = {
  parseHistoricalData,
};
