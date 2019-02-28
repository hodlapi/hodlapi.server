const Router = require('koa-router');
const R = require('ramda');
const { Request } = require('../models');

const router = new Router();

const getRequests = async (ctx) => {
  const userId = R.pathOr(null, ['state', 'user', 'id'])(ctx);

  ctx.body = await Request.find({ user: userId })
    .sort({ $natural: -1 })
    .populate('currencyPairs')
    .populate('dataSource')
    .populate('files');
};

router.get('/requests', getRequests);

module.exports = router;
