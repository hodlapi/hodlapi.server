const Bull = require('bull');
const config = require('config');

const queue = new Bull('socket', {
  redis: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    password: config.get('redis.auth'),
  },
});

module.exports = queue;
