const Router = require('koa-router');
const requestsModel = require('../models/Request');
const router = new Router();
const { aclMiddleware } = require('../middlewares');

const getRequests = async (ctx) => {
  requestsModel
    .find()
    .then((list = []) => ctx.body = list);
};

router.get('/requests', aclMiddleware('ADMIN'), getRequests);

module.exports = router;
