const http = require('http');
const config = require('config');
const app = require('./app/app.config');
const io = require('./app/io.config');

const server = http.Server(app);

io.init(server);

server.listen(config.get('socketPort'));

if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', () => {
    process.exit(1);
  });

  process.on('unhandledRejection', () => {
    process.exit(1);
  });
}
