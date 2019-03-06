const Router = require('koa-router');
const R = require('ramda');
const moment = require('moment');
const config = require('config');
const validator = require('koa-joi-validate');
const joi = require('joi');
const {
  CurrencyPair,
  Request,
  RequestStatuses,
} = require('../models');
const logger = require('../logger');
const {
  fwriterQueue,
  parserQueue,
  coreQueue,
  socketQueue,
} = require('../queue');

const router = new Router();

const requestValidator = validator({
  body: {
    dataSource: joi.string().required(),
    intervals: joi.array().required(),
    currencyPairs: joi.array().required(),
    range: joi.array(),
    extensions: joi.array(),
  },
});

const createFileJobs = R.curry((requestId, pairs, intervals) => R.compose(
  R.map(job => new Promise((resolve, reject) => {
    job.on('completed', (files) => {
      resolve(files);
    }).on('failed', reject);
  })),
  R.flatten,
  R.map(pair => R.map(interval => fwriterQueue.add('write', {
    requestId,
    interval,
    pair,
  }))(intervals)),
)(pairs));

const createParse = async (ctx) => {
  const {
    dataSource,
    intervals,
    currencyPairs,
    range = [],
    extensions = ['json', 'csv'],
  } = ctx.request.body;
  let [start, end] = range;

  logger.log({
    level: 'info',
    message: `Request created for ${R.path(['state', 'user', 'email'])(ctx)}`,
  });

  start = start || '2017-01-01';
  end = end || moment().format('YYYY-MM-DD');
  const userObject = R.pathOr(null, ['state', 'user'])(ctx);

  const request = await new Request({
    user: R.pathOr(null, ['id'])(userObject),
    dataSource,
    currencyPairs: [...currencyPairs],
    intervals,
    fromDate: start,
    toDate: end,
    extensions,
    status: RequestStatuses.created,
  }).save();

  const jobs = R.compose(
    R.map(e => new Promise((resolve) => {
      e.then((job) => {
        console.log(job);

        // job.on('complete', resolve);
      });
    })),
    R.flatten,
    R.map(pair => R.map(async interval => parserQueue.add('binance.rates', {
      pair: await CurrencyPair.findOne({
        _id: pair,
      }).exec(),
      interval,
      start,
      end,
    }))(intervals)),
  )(currencyPairs);

  Promise.all(jobs).then(() => {
    const fileJobs = createFileJobs(R.prop('_id')(request), currencyPairs, intervals);
    Promise.all(fileJobs)
      .then((results) => {
        fwriterQueue.add('archiveResult', {
          files: R.flatten(results),
          requestId: R.prop('_id')(request),
        })
          .save()
          .on('completed', (result) => {
            request.resultUrl = `${config.get('filesStorageUrl')}/${result}`;
            request.status = RequestStatuses.ready;
            request.save();
            socketQueue.add('updateRequest', request);
            coreQueue
              .create('sendFileEmail', {
                email: userObject.email,
                link: `${config.get('filesStorageUrl')}/${result}`,
              })
              .save();
          });
      },
      (err) => {
        ctx.throw(500, err);
      });
  });
  ctx.status = 200;
  ctx.body = request;
};

router.post('/request/parse', requestValidator, createParse);

module.exports = router;
