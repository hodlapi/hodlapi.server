const Router = require('koa-router');

const binance = require('./binance');

const api = new Router({
    prefix: '/api'
});

api.use('/binance', binance.routes());

module.exports = api;