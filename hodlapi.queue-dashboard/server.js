const express = require('express');
const Arena = require('bull-arena');
const config = require('config');
const basicAuth = require('express-basic-auth');

const redis = {
  host: config.get('redis.host'),
  port: config.get('redis.port'),
  password: config.get('redis.auth'),
};

const app = express();
const arena = Arena({
  queues: config.get('queues').map(e => ({
    name: e,
    hostId: `${e[0].toUpperCase()}${e.substring(1)}`,
    redis,
  })),
}, {
  disableListen: true,
});

app.use(basicAuth({
  users: config.get('users'),
  challenge: true,
}));

app.use('/', arena);
app.listen(4567, () => {
  console.log('Dashboard is running on 4567 port');
});
