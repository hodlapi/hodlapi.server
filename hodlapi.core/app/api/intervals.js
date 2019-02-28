const Router = require('koa-router');
const { intervals } = require('../lib/constants');

const router = new Router();

const list = async (ctx) => {
  ctx.body = [...intervals];
};

router.get('/intervals', list);

module.exports = router;
