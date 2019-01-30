const kue = require('kue');
const app = require('./app/app');
const db = require('./app/db');
const serve = require('koa-static');

db.connect();

app.use(serve(`${__dirname}/static`));

app.listen(3000);
kue.app.listen(3020);
