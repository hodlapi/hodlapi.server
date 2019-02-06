const Router = require('koa-router');
const requestsModel = require('../models/Request');
const router = new Router();

const getRequests = async () => {
    await requestsModel
        .find()
        .then((list = []) => ctx.body = list);
};

router.get('/requests', getRequests);

module.exports = router;