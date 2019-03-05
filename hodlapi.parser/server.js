const {
  connect,
} = require('./app/db');
const queue = require('./app/queue');

require('./app/transformers/zeroX.transformer');

connect().then((e) => {
  console.log('Connected to mongo');
});

if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', (error) => {
        process.exit(1);
    });

  process.on('unhandledRejection', (error) => {
        process.exit(1);
    });
}
