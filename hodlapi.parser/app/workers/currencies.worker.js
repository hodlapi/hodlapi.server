const R = require('ramda');
const {
  Currency,
  CurrencyPair,
  DataSource,
} = require('../models');
const {
  binanceCurrenciesParser,
} = require('../parsers');

const saveCurrenciesAndPair = dataSourceName => async (left, right) => {
  const from = await Currency.findOne({
    symbol: left,
  }) || await new Currency({
    symbol: left,
  }).save();
  const to = await Currency.findOne({
    symbol: right,
  }) || await new Currency({
    symbol: right,
  }).save();

  return CurrencyPair.findOne({
    name: `${left}${right}`,
    fromId: R.prop('_id')(from),
    toId: R.prop('_id')(to),
  }).then(async (doc) => {
    if (!doc) {
      const pair = new CurrencyPair({
        name: `${left}${right}`,
        fromId: R.prop('_id')(from),
        toId: R.prop('_id')(to),
      }).save();

      const dataSource = await DataSource.findOne({
        name: dataSourceName,
      });
      dataSource.currencyPairs.push(await pair);
      return dataSource.save();
    }
    return doc;
  });
};

const binanceCurrenciesWorker = () => binanceCurrenciesParser(saveCurrenciesAndPair('Binance'));

module.exports = {
  binanceCurrenciesWorker,
};
