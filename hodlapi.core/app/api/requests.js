const Router = require('koa-router');
const requestsModel = require('../models/Request');
const R = require('ramda');
const router = new Router();
const { aclMiddleware } = require('../middlewares');

const getRequests = async ctx => {
    const userId = R.pathOr(null, ['state', 'user', '_id'])(ctx);
    requestsModel.find({ user: userId }).then((list = []) => (ctx.body = list));
};

router.get('/requests', getRequests);

module.exports = router;