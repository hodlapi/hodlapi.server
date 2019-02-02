const axios = require("axios");
const Router = require("koa-router");
const currencyPairsModel = require('../models/CurrencyPair')
const R = require("ramda");
const moment = require("moment");
const config = require("config");
const logger = require("../logger");

const queue = require("../queue");

const router = new Router();

const currencyPairs = async ctx => {
  await currencyPairsModel
    .find()
    .then((list = []) => ctx.body = list);
};

router.get("/currencyPairs", currencyPairs);

module.exports = router;
