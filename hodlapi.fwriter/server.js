const http = require('http');
const serveStatic = require('serve-static');
const contentDisposition = require('content-disposition');
const {
  connect,
} = require('./app/db');

require('./app/queue');

connect().then(() => {
  console.log('Connected to mongo');
});

function setHeaders(res, path) {
  res.setHeader('Content-Disposition', contentDisposition(path));
}

const serve = serveStatic('static', {
  index: false,
  setHeaders,
});

const server = http.createServer((req, res) => {
  serve(req, res);
});

server.listen(process.env.NODE_ENV === 'production' ? 8080 : 8090);

if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', () => {
    process.exit(1);
  });

  process.on('unhandledRejection', () => {
    process.exit(1);
  });
}
