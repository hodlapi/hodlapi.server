const axios = require('axios');
const Router = require('koa-router');
const R = require('ramda');

const queue = require('../../queue');

const router = new Router();

const symbols = async (ctx) => {
    const exchange = await axios.default.get('https://api.binance.com/api/v1/exchangeInfo');

    ctx.body = R.compose(
        R.filter(e => e.length > 0),
        R.map(R.propOr('', 'symbol')),
        R.propOr([], 'symbols'),
        R.propOr({}, 'data')
    )(exchange);
};

const createJob = async (ctx) => {
    try {
        queue.create('binance', ctx.request.body).save();
        ctx.status = 200;
        ctx.body = ctx.request.body;
    } catch (e) {
        ctx.status = 403;
        ctx.body = 'Error';
    }
};

router.get('/symbols', symbols);
router.post('/parse', createJob);

module.exports = router;
