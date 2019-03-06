const {
  connect,
} = require('./app/db');

require('./app/transformers/zeroX.transformer');
require('./app/queue');

connect().then(() => {
  console.log('Connected to mongo');
});

if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', () => {
    process.exit(1);
  });

  process.on('unhandledRejection', () => {
    process.exit(1);
  });
}
