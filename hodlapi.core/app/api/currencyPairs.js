const Router = require("koa-router");
const currencyPairsModel = require('../models/CurrencyPair')

const router = new Router();

const currencyPairs = async ctx => {
  await currencyPairsModel
    .find()
    .then((list = []) => ctx.body = list);
};

router.get("/currencyPairs", currencyPairs);

module.exports = router;
