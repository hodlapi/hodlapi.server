const Router = require("koa-router");
const dataSourcesModel = require('../models/DataSource')

const router = new Router();

const dataSources = async ctx => {
  await dataSourcesModel
    .find()
    .then((list = []) => ctx.body = list);
};

router.get("/dataSources", dataSources);

module.exports = router;
