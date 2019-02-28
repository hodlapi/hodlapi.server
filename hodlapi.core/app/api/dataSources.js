const Router = require('koa-router');
const dataSourcesModel = require('../models/DataSource');

const router = new Router();

const dataSources = async (ctx) => {
  ctx.body = await dataSourcesModel
    .find();
};

router.get('/dataSources', dataSources);

module.exports = router;
