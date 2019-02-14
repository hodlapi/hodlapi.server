const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const cors = require('@koa/cors');
const jwt = require('koa-jwt');
const config = require('config');
const { userMiddleware } = require('./middlewares');

const api = require('./api');

const app = new Koa();

app.use(bodyparser());
app.use(cors());
app.use(
    jwt({
        secret: config.get('jwt.secret'),
        debug: process.env.NODE_ENV !== 'production',
        getToken: (ctx, opts) => (ctx.query ? ctx.query.access_token : null)
    }).unless({
        path: [
            /^\/api\/auth/,
            /^\/api\/intervals/,
            /^\/api\/currencyPairs/,
            /^\/api\/dataSources/
        ]
    })
);
app.use(userMiddleware());
app.use(api.routes());

module.exports = app;