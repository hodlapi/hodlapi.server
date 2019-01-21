const kue = require('kue');
const app = require('./app');
const serve = require('koa-static');

app.use(serve(`${__dirname}/static`));

app.listen(3000);
kue.app.listen(3020);
