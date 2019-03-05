const app = require('./app/app');
const db = require('./app/db');

db.connect().then(() => {
  console.log('Connected to mongo');
});

app.listen(3000);

if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', () => {
    process.exit(1);
  });

  process.on('unhandledRejection', () => {
    process.exit(1);
  });
}
