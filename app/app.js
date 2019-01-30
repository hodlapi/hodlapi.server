const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const cors = require('@koa/cors');

const api = require('./api');

const app = new Koa();

app.use(bodyparser());
app.use(cors());
app.use(api.routes());

module.exports = app;