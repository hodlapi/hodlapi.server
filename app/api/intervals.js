const axios = require("axios");
const Router = require("koa-router");
const R = require("ramda");
const moment = require("moment");
const config = require("config");
const logger = require("../logger");

const queue = require("../queue");

const router = new Router();

const intervals = async ctx => {
  ctx.body = [
    {
      name: "1Hour",
      value: "1h"
    },
    {
      name: "30Minutes",
      value: "30m"
    },
    {
      name: "15Minutes",
      value: "15m"
    },
    {
      name: "5minutes",
      value: "5m"
    },
    {
      name: "1Minute",
      value: "1m"
    }
  ];
};

router.get("/intervals", intervals);

module.exports = router;
