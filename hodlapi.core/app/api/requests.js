const Router = require('koa-router');
const requestsModel = require('../models/Request');
const R = require('ramda');
const router = new Router();

const getRequests = async ctx => {
    const userId = R.pathOr(null, ['state', 'user', '_id'])(ctx);
    ctx.body = await requestsModel
        .find({ user: userId })
        .populate('currencyPairs')
        .populate('dataSource');
};

router.get('/requests', getRequests);

module.exports = router;