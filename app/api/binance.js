const axios = require('axios');
const Router = require('koa-router');
const R = require('ramda');

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

const createJob = async (ctx) => {};

router.get('/symbols', symbols);
router.post('/parse', createJob);

module.exports = router;
