const queue = require('./app/queue');
const {
    connect
} = require('./app/db');
const http = require('http');
const serveStatic = require('serve-static');
const contentDisposition = require('content-disposition');

connect().then(e => {
    console.log('Connected to mongo');
});

const serve = serveStatic('static', {
    index: false,
    setHeaders
});

function setHeaders(res, path) {
    res.setHeader('Content-Disposition', contentDisposition(path));
}

const server = http.createServer(function onRequest(req, res) {
    serve(req, res);
});

server.listen(process.env.NODE_ENV === 'production' ? 8080 : 8090);

if (process.env.NODE_ENV === 'production') {
    process.on('uncaughtException', function(error) {
        process.exit(1);
    });

    process.on('unhandledRejection', function(error) {
        process.exit(1);
    });
}