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
const queue = require('../queue');

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
    job.save().on('complete', (files) => {
      resolve(files);
    }).on('failed', reject);
  })),
  R.flatten,
  R.map(pair => R.map(interval => queue.create('fwriter.write', {
    requestId,
    interval,
    pair,
  }))(intervals)),
)(pairs));

const create = async (ctx) => {
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

  const jobs = createFileJobs(R.prop('_id')(request), currencyPairs, intervals);

  Promise.all(jobs).then(
    (results) => {
      queue.create('fwriter.archiveResult', {
        files: R.flatten(results),
        requestId: R.prop('_id')(request),
      })
        .save()
        .on('complete', (result) => {
          request.resultUrl = `${config.get('filesStorageUrl')}/${result}`;
          request.status = RequestStatuses.ready;
          request.save();
          queue
            .create('core.sendFileEmail', {
              email: userObject.email,
              link: `${config.get('filesStorageUrl')}/${result}`,
            })
            .save();
        });
    },
    (err) => {
      ctx.throw(500, err);
    },
  );

  ctx.status = 200;
  ctx.body = {
    status: 200,
    message: 'Success',
  };
};

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
        job.save();
        job.on('complete', resolve);
      });
    })),
    R.flatten,
    R.map(pair => R.map(async interval => queue.create('parser.binance.rates', {
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
        queue.create('fwriter.archiveResult', {
          files: R.flatten(results),
          requestId: R.prop('_id')(request),
        })
          .save()
          .on('complete', (result) => {
            request.resultUrl = `${config.get('filesStorageUrl')}/${result}`;
            request.status = RequestStatuses.ready;
            request.save();
            queue
              .create('core.sendFileEmail', {
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
  ctx.body = {
    status: 200,
    message: 'Success',
  };
};

router.post('/request', requestValidator, create);
router.post('/request/parse', requestValidator, createParse);

module.exports = router;
