const Bull = require('bull');
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

const queue = new Bull('fwriter', {
  redis: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    password: config.get('redis.auth'),
  },
});

queue.process('archiveResult', async ({
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

queue.process('fwriter.write', async ({
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
    async (files) => {
      done(null, files);
    },
    err => done(err),
  );
});

module.exports = queue;
