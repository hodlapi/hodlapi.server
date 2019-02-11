const Router = require("koa-router");
const { CurrencyPair, DataSource } = require('../models');
const R = require('ramda');

const router = new Router();

const currencyPairs = async ctx => {
  const {
    dataSourceId
  } = ctx.query;

  ctx.body = dataSourceId ? R.prop('currencyPairs')(await DataSource.findOne({ _id: dataSourceId }).populate('currencyPairs')) : await CurrencyPair
    .find();
};

router.get("/currencyPairs", currencyPairs);

module.exports = router;
