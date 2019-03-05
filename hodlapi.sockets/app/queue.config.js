const kue = require('kue');
const config = require('config');

const queue = kue.createQueue({
  redis: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    auth: config.get('redis.auth'),
  },
});

module.exports = queue;
