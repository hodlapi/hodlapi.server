const axios = require("axios");
const Router = require("koa-router");
const R = require("ramda");
const moment = require("moment");
const config = require("config");
const logger = require("../logger");

const queue = require("../queue");

const router = new Router();

const fileExtensions = async ctx => {
  ctx.body = [
    {
      name: "CSV",
      ext: ".csv"
    },
    {
      name: "JSON",
      ext: ".json"
    }
  ];
};

router.get("/fileExtensions", fileExtensions);

module.exports = router;
