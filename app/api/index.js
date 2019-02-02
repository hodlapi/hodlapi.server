const Router = require('koa-router');

const currencyPairs = require('./currencyPairs');
const dataSources = require('./dataSources');
const fileExtensions = require('./fileExtensions');
const intervals = require('./intervals');
const request = require('./request');

const api = new Router({
    prefix: '/api'
});

api.use(currencyPairs.routes());
api.use(dataSources.routes());
api.use(fileExtensions.routes());
api.use(intervals.routes());
api.use(request.routes());

module.exports = api;