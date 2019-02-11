const Router = require('koa-router');
const requestsModel = require('../models/Request');
const router = new Router();
const { aclMiddleware } = require('../middlewares');

const getRequests = async (ctx) => {
  console.log(ctx.state.user);

  requestsModel
    .find()
    .then((list = []) => ctx.body = list);
};

router.get('/requests', aclMiddleware('ADMIN'), getRequests);

module.exports = router;
