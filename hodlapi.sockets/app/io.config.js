const R = require('ramda');
const socketIO = require('socket.io');
const queue = require('./queue.config');

const init = (server) => {
  const io = socketIO(server);

  io.on('connection', () => {
    console.log('socket connected');
    queue.process('updateRequest', ({ data }, done) => {
      io.emit(R.prop('_id')(data), data);
      done();
    });
  });
};

module.exports = {
  init,
};
