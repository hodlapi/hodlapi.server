const axios = require('axios');
const Router = require('koa-router');
const R = require('ramda');
const moment = require('moment');

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
        let { symbols = [], intervals, startDate, endDate, email } = ctx.request.body;
        startDate = startDate || '2017-01-01';
        endDate = endDate || moment().format('YYYY-MM-DD');
        R.map(symbol => queue.create('binance', { symbol, intervals, startDate, endDate, email }).save())(symbols);
        ctx.status = 200;
        ctx.body = {
            status: 200,
            message: 'Success'
        };
    } catch (e) {
        ctx.status = 403;
        ctx.body = 'Error';
    }
};

router.get('/symbols', symbols);
router.post('/parse', createJob);

module.exports = router;
