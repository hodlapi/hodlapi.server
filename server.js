const kue = require('kue');
const app = require('./app/app');
const db = require('./app/db');
const serve = require('koa-static');

db.connect().then(e => {
  console.log('Connected to mongo');
});

app.use(serve(`${__dirname}/static`));

app.listen(3000);
kue.app.listen(3020);

if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', function (error) {
    process.exit(1);
  });

  process.on('unhandledRejection', function (error) {
    process.exit(1);
  });
}
