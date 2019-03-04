const Router = require('koa-router');

const currencyPairs = require('./currencyPairs');
const dataSources = require('./dataSources');
const fileExtensions = require('./fileExtensions');
const intervals = require('./intervals');
const request = require('./request');
const auth = require('./auth');
const requests = require('./requests');
const users = require('./users');

const api = new Router({
  prefix: '/api',
});

api.use(currencyPairs.routes());
api.use(dataSources.routes());
api.use(fileExtensions.routes());
api.use(intervals.routes());
api.use(request.routes());
api.use(requests.routes());
api.use('/auth', auth.routes());
api.use('/users', users.routes());

module.exports = api;
