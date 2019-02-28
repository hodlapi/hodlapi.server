const Router = require('koa-router');
const R = require('ramda');
const {
  CurrencyPair,
  DataSource,
} = require('../models');

const router = new Router();

const currencyPairs = async (ctx) => {
  const {
    dataSourceId,
  } = ctx.query;

  ctx.body = dataSourceId ? R.prop('currencyPairs')(await DataSource.findOne({
    _id: dataSourceId,
  }).populate('currencyPairs')) : await CurrencyPair
    .find();
};

router.get('/currencyPairs', currencyPairs);

module.exports = router;
