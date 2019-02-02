const axios = require("axios");
const Router = require("koa-router");
const dataSourcesModel = require('../models/DataSource')
const R = require("ramda");
const moment = require("moment");
const config = require("config");
const logger = require("../logger");

const queue = require("../queue");

const router = new Router();

const dataSources = async ctx => {
  await dataSourcesModel
    .find()
    .then((list = []) => ctx.body = list);
};

router.get("/dataSources", dataSources);

module.exports = router;
