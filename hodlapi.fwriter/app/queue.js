const kue = require('kue');
const config = require('config');
const R = require('ramda');
const fs = require('fs');
const {
  store,
  archiveList,
} = require('./workers');
const {
  Request,
} = require('./models');
const {
  json,
  csv,
  constants,
} = require('./lib');

const formattersMap = {
  json: e => json(e),
  csv: e => csv(constants.binanseCsvFields, e),
};

const queue = kue.createQueue({
  redis: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    auth: config.get('redis.auth'),
  },
});

// eslint-disable-next-line max-len
kue.prototype.processAsync = (name, concurrency, handler) => queue.process(name, concurrency, (job, done) => handler(job)
  .then(() => done(null))
  .catch(done));

queue.processAsync('fwriter.archiveResult', async ({
  data,
}, done) => {
  try {
    const {
      requestId,
      files,
    } = data;
    const archiveName = requestId;

    if (fs.existsSync(`./static/${archiveName}.zip`)) {
      done(null, `${archiveName}.zip`);
    } else {
      // eslint-disable-next-line no-shadow
      archiveList(archiveName, files).then((data) => {
        done(null, data);
      });
    }
  } catch (ex) {
    console.log(ex);
  }
});

queue.processAsync('fwriter.write', async ({
  data,
}, done) => {
  const {
    requestId,
    interval,
    pair,
  } = data;
  const request = await Request.findById(requestId);

  Promise.all(
    R.map(ext => store(requestId, interval, pair, ext, formattersMap[ext]))(
      request.extensions,
    ),
  ).then(
    (files) => {
      done(null, files);
    },
    err => done(err),
  );
});

module.exports = queue;
