const R = require('ramda');
const {
  getRateByInterval,
} = require('../models');
const {
  binanceParser,
} = require('../parsers');

const saveRateDocument = R.curry((interval, document) => {
  const rateModel = getRateByInterval(interval);
  // eslint-disable-next-line new-cap
  rateModel.findOne(document, (_, doc) => !doc && new rateModel(document).save());
});


const binanceWorker = ({
  data
}, done) => {
  const {
    interval,
    pair,
    start,
    end,
  } = data;

  const saveRate = saveRateDocument(interval);
  binanceParser(saveRate)(interval, pair, start, end).then(
    result => done(null, result),
    error => done(error, data),
  );
};

module.exports = {
  binanceWorker,
};